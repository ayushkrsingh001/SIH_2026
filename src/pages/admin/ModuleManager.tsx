import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getModules, addModule, updateModule, deleteModule } from '../../firebase/firestore';
import { Modal } from '../../components/ui/Modal';
import { staggerContainer, staggerItem } from '../../animations/variants';
import toast from 'react-hot-toast';
import type { Module } from '../../types';

const ModuleManager = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'General', difficulty: 'Easy' as Module['difficulty'],
    estimatedMinutes: 5, ageRange: 'all' as Module['ageRange'], order: 0,
    xpReward: 100, coinReward: 10, coverImageUrl: '', prerequisiteModuleId: ''
  });

  const loadModules = async () => {
    const mods = await getModules();
    setModules(mods);
    setLoading(false);
  };

  useEffect(() => { loadModules(); }, []);

  const handleOpenCreate = () => {
    setEditingModule(null);
    setForm({
      title: '', description: '', category: 'General', difficulty: 'Easy',
      estimatedMinutes: 5, ageRange: 'all', order: modules.length + 1,
      xpReward: 100, coinReward: 10, coverImageUrl: '', prerequisiteModuleId: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (mod: Module) => {
    setEditingModule(mod);
    setForm({
      title: mod.title,
      description: mod.description,
      category: mod.category || 'General',
      difficulty: mod.difficulty || 'Easy',
      estimatedMinutes: mod.estimatedMinutes || 5,
      ageRange: mod.ageRange,
      order: mod.order,
      xpReward: mod.xpReward,
      coinReward: mod.coinReward || 10,
      coverImageUrl: mod.coverImageUrl || '',
      prerequisiteModuleId: mod.prerequisiteModuleId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      const moduleData: Omit<Module, 'id'> = {
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        estimatedMinutes: form.estimatedMinutes,
        ageRange: form.ageRange,
        order: form.order,
        xpReward: form.xpReward,
        coinReward: form.coinReward,
        coverImageUrl: form.coverImageUrl,
        prerequisiteModuleId: form.prerequisiteModuleId || null,
      };
      if (editingModule) {
        await updateModule(editingModule.id!, moduleData);
        toast.success('Module updated');
      } else {
        await addModule(moduleData);
        toast.success('Module created');
      }
      setShowModal(false);
      loadModules();
    } catch {
      toast.error('Failed to save module');
    }
  };

  const handleDelete = async (modId: string) => {
    if (!confirm('Delete this module? This cannot be undone.')) return;
    try {
      await deleteModule(modId);
      toast.success('Module deleted');
      loadModules();
    } catch {
      toast.error('Failed to delete module');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline text-headline-md text-on-surface">Module Manager</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">Create and manage learning modules.</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-primary text-on-primary px-5 py-3 rounded-full font-body text-label-md btn-tactile border-b-4 border-on-primary-fixed-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          New Module
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-container-high rounded-[24px] animate-pulse" />)}
        </div>
      ) : (
        <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
          {modules.map(mod => (
            <motion.div
              key={mod.id}
              variants={staggerItem}
              className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-[16px] bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl filled">menu_book</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-secondary-container/30 text-secondary rounded-full font-body text-caption">{mod.category}</span>
                  <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-full font-body text-caption">{mod.difficulty}</span>
                </div>
                <h3 className="font-headline text-title-lg text-on-surface">{mod.title}</h3>
                <p className="font-body text-caption text-on-surface-variant truncate">{mod.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-body text-caption text-primary">+{mod.xpReward} XP</span>
                  <span className="font-body text-caption text-tertiary">+{mod.coinReward || 10} Coins</span>
                  <span className="font-body text-caption text-on-surface-variant">·</span>
                  <span className="font-body text-caption text-on-surface-variant">{mod.estimatedMinutes} mins</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleOpenEdit(mod)} className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-variant flex items-center justify-center transition-colors" aria-label="Edit">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">edit</span>
                </button>
                <button onClick={() => handleDelete(mod.id!)} className="w-10 h-10 rounded-full bg-error-container/30 hover:bg-error-container flex items-center justify-center transition-colors" aria-label="Delete">
                  <span className="material-symbols-outlined text-error text-sm">delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingModule ? 'Edit Module' : 'Create Module'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-2">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full h-12 px-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright" placeholder="Module title" />
          </div>
          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright resize-none h-20" placeholder="Module description" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright" placeholder="e.g. Safety" />
            </div>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value as Module['difficulty'] })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">XP Reward</label>
              <input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: Number(e.target.value) })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright" />
            </div>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">Coin Reward</label>
              <input type="number" value={form.coinReward} onChange={e => setForm({ ...form, coinReward: Number(e.target.value) })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">Est. Mins</label>
              <input type="number" value={form.estimatedMinutes} onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright" />
            </div>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">Age Range</label>
              <select value={form.ageRange} onChange={e => setForm({ ...form, ageRange: e.target.value as Module['ageRange'] })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright">
                <option value="all">All</option>
                <option value="8-11">8-11</option>
                <option value="12-16">12-16</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2">Order</label>
              <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="w-full h-12 px-3 rounded-lg border-2 border-surface-dim font-body text-body-md bg-surface-bright" />
            </div>
          </div>
          
          <div className="flex gap-4 pt-4 mt-4 border-t border-surface-container">
            <button onClick={() => setShowModal(false)} className="flex-1 h-12 border-2 border-outline-variant rounded-full font-body text-label-md text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 h-12 bg-primary-container text-on-primary-container rounded-full font-body text-label-md btn-tactile-primary">Save Module</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModuleManager;
