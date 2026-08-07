import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { geminiService } from '../../services/geminiService';
import { createParentPost } from '../../firebase/firestore';
import { uploadMedia } from '../../firebase/storage';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PostCat = 'Child Rights' | 'Cyber Safety' | 'Girls Safety' | 'Self Defence' | 'Bullying' | 'Good Touch Bad Touch' | 'Mental Health' | 'Education' | 'Emergency' | 'Road Safety' | 'Consumer Rights' | 'Environmental Awareness' | 'Legal Awareness' | 'Other';

interface PostForm {
  title: string;
  description: string;
  category: PostCat;
  isAnonymous: boolean;
  tags: string;
}

const CATEGORIES: PostCat[] = [
  'Child Rights', 'Cyber Safety', 'Girls Safety', 'Self Defence',
  'Bullying', 'Good Touch Bad Touch', 'Mental Health', 'Education',
  'Emergency', 'Road Safety', 'Consumer Rights', 'Environmental Awareness',
  'Legal Awareness', 'Other'
];

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PostForm>({
    defaultValues: { isAnonymous: false, category: 'Child Rights' }
  });

  const descriptionLength = watch('description')?.length || 0;

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files).slice(0, 3)); // Max 3 files
    }
  };

  const onSubmit = async (data: PostForm) => {
    if (!user) return;
    setSubmitting(true);

    try {
      const tagsArray = (data.tags || '').split(',').map(t => t.trim()).filter(t => t);
      
      // 1. Moderate Content using Gemini
      const moderation = await geminiService.moderateCommunityPost(data.title, data.description, tagsArray);
      
      if (!moderation.isSafe) {
        toast.error(`Post blocked: ${moderation.reason || 'Violates community guidelines.'}`);
        setSubmitting(false);
        return;
      }

      const finalTags = [...new Set([...tagsArray, ...(moderation.suggestedTags || [])])].slice(0, 5);

      // 2. Upload Media
      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file, `community/${user.uid}`);
        uploadedUrls.push(url);
      }

      // 3. Save to Firestore
      await createParentPost({
        authorId: user.uid,
        authorName: data.isAnonymous ? 'Anonymous Parent' : user.displayName || 'Parent',
        isAnonymous: data.isAnonymous,
        title: data.title,
        description: data.description,
        category: data.category,
        mediaUrls: uploadedUrls,
        tags: finalTags,
        visibility: 'public'
      });

      toast.success('Post shared successfully!');
      reset();
      setMediaFiles([]);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!submitting ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface-container-lowest w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-elevation-3 p-6 md:p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-headline-sm text-on-surface">Share with Community</h2>
              <button onClick={onClose} disabled={submitting} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[28px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-headline text-title-md text-on-surface">{user?.displayName || 'Parent'}</p>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input type="checkbox" {...register('isAnonymous')} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                    <span className="font-body text-label-md text-on-surface-variant">Post Anonymously</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-body text-label-md text-on-surface mb-2">Title</label>
                <input
                  {...register('title', { required: 'Title is required', maxLength: 100 })}
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Summarize your post..."
                />
                {errors.title && <p className="text-error text-caption mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block font-body text-label-md text-on-surface mb-2">Category</label>
                <select
                  {...register('category')}
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-lg text-on-surface focus:border-primary outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-body text-label-md text-on-surface">Details</label>
                  <span className="font-body text-label-sm text-on-surface-variant">{descriptionLength}/1000</span>
                </div>
                <textarea
                  {...register('description', { required: 'Description is required', maxLength: 1000 })}
                  rows={5}
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl p-4 font-body text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Share your experience, ask a question, or provide a tip..."
                />
                {errors.description && <p className="text-error text-caption mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block font-body text-label-md text-on-surface mb-2">Add Media (Up to 3 images/videos)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 bg-surface-container-high border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">add_photo_alternate</span>
                    <span className="font-body text-label-md text-on-surface-variant">Click to upload</span>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
                  </label>
                  {mediaFiles.length > 0 && (
                    <div className="flex-1">
                      <p className="font-body text-label-sm text-on-surface-variant mb-2">{mediaFiles.length} files selected</p>
                      <ul className="list-disc pl-4 text-caption text-on-surface">
                        {mediaFiles.map((f, i) => <li key={i} className="truncate">{f.name}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-body text-label-md text-on-surface mb-2">Tags (Comma separated)</label>
                <input
                  {...register('tags')}
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-lg text-on-surface focus:border-primary outline-none"
                  placeholder="e.g. cyberbullying, help, advice"
                />
              </div>

              <div className="pt-4 border-t border-surface-container flex justify-end gap-3">
                <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-3 rounded-full font-headline text-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-full font-headline text-label-lg bg-primary text-on-primary btn-tactile-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
