import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { addSupportRequest, getOrganizations } from '../firebase/firestore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { groqService } from '../services/groqService';
import { HELP_CATEGORIES, MASCOT_SMALL_URL } from '../constants';
import { fadeInUp } from '../animations/variants';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import type { Organization } from '../types';
import { useTranslation } from 'react-i18next';

interface HelpForm {
  category: 'bullying' | 'safety' | 'rights_question' | 'other';
  message: string;
  anonymous: boolean;
}

const GetHelp = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { childId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ suggestion: string; actionableSteps: string[] } | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<HelpForm>();

  useEffect(() => {
    getOrganizations().then(setOrganizations);
  }, []);

  const onSubmit = async (data: HelpForm) => {
    setLoading(true);
    try {
      const refId = await addSupportRequest({
        childRefPath: data.anonymous ? null : `parents/${user?.uid}/children/${childId}`,
        category: data.category,
        message: data.message,
        status: 'new',
        assignedOrgId: null,
      });

      if (!data.anonymous && user?.uid && activeChild) {
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          actorId: activeChild.id || childId || '',
          actorName: activeChild.displayName,
          actorPhoto: activeChild.avatarId,
          type: 'help_request',
          postId: refId,
          read: false,
          createdAt: serverTimestamp()
        });
      }

      const aiResult = await groqService.generateChildHelpSuggestion(data.category, data.message);
      setAiResponse(aiResult);

      setSubmitted(true);
      toast.success(t('help.successSubmittedSafely'));
    } catch (err) {
      console.error(err);
      toast.error(t('help.errorSomethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="max-w-lg mx-auto text-center py-16"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-secondary text-4xl filled">check_circle</span>
        </div>
        <h1 className="font-headline text-headline-md text-on-surface mb-4">{t('help.helpIsOnTheWay')}</h1>
        <p className="font-body text-body-lg text-on-surface-variant mb-8">
          {t('help.helpReceivedDesc')}
        </p>

        {aiResponse && (
          <div className="bg-primary-container/20 border-2 border-primary-container rounded-[24px] p-6 text-left mb-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={MASCOT_SMALL_URL} alt="Mascot" className="w-12 h-12 rounded-full" />
              <h3 className="font-headline text-title-lg text-primary">{t('help.aMessageForYou')}</h3>
            </div>
            <p className="font-body text-body-md text-on-surface whitespace-pre-wrap">
              {aiResponse.suggestion}
            </p>
            {aiResponse.actionableSteps && aiResponse.actionableSteps.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="font-headline text-label-lg text-primary">{t('help.whatYouCanDo')}</p>
                <ul className="space-y-2">
                  {aiResponse.actionableSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">asterisk</span>
                      <span className="font-body text-body-sm text-on-surface">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {organizations.length > 0 && (
          <div className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 text-left mb-8">
            <h3 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">call</span>
              {t('help.contactAlso')}
            </h3>
            <div className="space-y-3">
              {organizations.slice(0, 3).map(org => (
                <div key={org.id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-[12px]">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">support_agent</span>
                  </div>
                  <div>
                    <p className="font-body text-label-md text-on-surface">{org.name}</p>
                    <p className="font-body text-caption text-on-surface-variant">{org.contactInfo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(`/play/${childId}/map`)}
          className="bg-primary-container text-on-primary-container font-headline text-title-lg px-8 py-4 rounded-full btn-tactile-primary"
        >
          {t('help.backToQuestMap')}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <img src={MASCOT_SMALL_URL} alt="Mascot" className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="font-headline text-headline-md-mobile text-on-surface">{t('help.needHelpTitle')}</h1>
            <p className="font-body text-body-md text-on-surface-variant">{t('help.needHelpSubtitle')}</p>
          </div>
        </div>

        <div className="bg-secondary-container/20 rounded-[16px] p-4 mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary filled">shield</span>
          <p className="font-body text-caption text-on-secondary-container">
            {t('help.safeMessageDesc')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-2">{t('help.whatsThisAbout')}</label>
            <div className="grid grid-cols-2 gap-3">
              {HELP_CATEGORIES.map(cat => (
                <label
                  key={cat.value}
                  className="flex items-center gap-2 p-3 rounded-[12px] border-2 border-surface-dim cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/10"
                >
                  <input {...register('category', { required: t('help.errorSelectCategory') })} type="radio" value={cat.value} className="hidden" />
                  <span className="material-symbols-outlined text-sm text-primary">
                    {cat.value === 'bullying' ? 'person_off' : cat.value === 'safety' ? 'health_and_safety' : cat.value === 'rights_question' ? 'gavel' : 'help'}
                  </span>
                  <span className="font-body text-label-md text-on-surface">{t(`help.categories.${cat.value}`)}</span>
                </label>
              ))}
            </div>
            {errors.category && <p className="text-caption text-error mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="helpMessage">{t('help.tellUsMore')}</label>
            <textarea
              {...register('message', { required: t('help.errorDescribeWhatHappened'), minLength: { value: 10, message: t('help.errorWriteMore') } })}
              className="w-full p-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright resize-none h-32"
              id="helpMessage"
              placeholder={t('help.messagePlaceholder')}
            />
            {errors.message && <p className="text-caption text-error mt-1">{errors.message.message as string}</p>}
          </div>

          <label className="flex items-center gap-3 p-3 rounded-[12px] bg-surface-container-low cursor-pointer">
            <input {...register('anonymous')} type="checkbox" className="w-5 h-5 rounded accent-primary" />
            <div>
              <span className="font-body text-label-md text-on-surface">{t('help.submitAnonymously')}</span>
              <p className="font-body text-caption text-on-surface-variant">{t('help.submitAnonymouslyDesc')}</p>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-error text-on-error font-headline text-title-lg rounded-full btn-tactile border-b-4 border-on-error-container flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                {t('help.sendHelpRequest')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default GetHelp;
