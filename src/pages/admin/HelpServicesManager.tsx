import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { getHelpServices, addHelpService, updateHelpService, deleteHelpService } from '../../firebase/firestore';
import toast from 'react-hot-toast';
import type { HelpService } from '../../types';

export const HelpServicesManager = () => {
  const [services, setServices] = useState<HelpService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<HelpService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<Omit<HelpService, 'id' | 'createdAt'>>();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getHelpServices();
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service?: HelpService) => {
    if (service) {
      setEditingService(service);
      reset(service);
    } else {
      setEditingService(null);
      reset({
        organizationName: '',
        category: 'NGO',
        state: 'Gujarat',
        district: 'Ahmedabad',
        city: 'Ahmedabad',
        address: '',
        phone: '',
        website: '',
        latitude: 23.0225,
        longitude: 72.5714,
        source: 'Admin',
        verificationStatus: 'Verified',
        lastVerifiedAt: null
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    reset();
  };

  const onSubmit = async (data: Omit<HelpService, 'id' | 'createdAt'>) => {
    try {
      // Convert lat/lng to numbers just in case
      data.latitude = Number(data.latitude);
      data.longitude = Number(data.longitude);
      
      if (editingService?.id) {
        await updateHelpService(editingService.id, data);
        toast.success('Service updated');
      } else {
        await addHelpService(data);
        toast.success('Service added');
      }
      closeModal();
      fetchServices();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteHelpService(id);
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const toggleVerification = async (service: HelpService) => {
    if (!service.id) return;
    const newStatus = service.verificationStatus === 'Verified' ? 'Needs Verification' : 'Verified';
    try {
      await updateHelpService(service.id, { verificationStatus: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchServices();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-headline-sm text-on-surface">Help Services Manager</h1>
          <p className="font-body text-body-md text-on-surface-variant">Manage verified support services for children</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-headline text-label-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Service
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading services...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body">
              <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {services.map(service => (
                  <tr key={service.id} className="hover:bg-surface-container-lowest/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-on-surface">{service.organizationName}</p>
                      <p className="text-body-sm text-on-surface-variant">Src: {service.source}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded text-label-sm">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body-md text-on-surface">{service.city}, {service.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body-md text-on-surface">{service.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleVerification(service)}
                        className={`px-3 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 w-max ${
                          service.verificationStatus === 'Verified' || service.verificationStatus === 'Official'
                            ? 'bg-secondary-container text-on-secondary-container' 
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {service.verificationStatus === 'Needs Verification' ? 'warning' : 'verified'}
                        </span>
                        {service.verificationStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(service)} className="text-primary hover:bg-primary-container p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(service.id!)} className="text-error hover:bg-error-container p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      No services found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant p-6 flex justify-between items-center z-10">
              <h2 className="font-headline text-title-lg text-on-surface">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={closeModal} className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Organization Name *</label>
                  <input {...register('organizationName', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Category *</label>
                  <select {...register('category', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none">
                    <option value="NGO">NGO</option>
                    <option value="Police">Police</option>
                    <option value="Child Welfare">Child Welfare</option>
                    <option value="Legal Aid">Legal Aid</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Cyber Police">Cyber Police</option>
                    <option value="Helpline">Helpline</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Phone *</label>
                  <input {...register('phone', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Website (Optional)</label>
                  <input {...register('website')} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">State *</label>
                  <input {...register('state', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">District *</label>
                  <input {...register('district', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">City *</label>
                  <input {...register('city', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Source (e.g. DCPU) *</label>
                  <input {...register('source', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-label-md text-on-surface-variant mb-1">Full Address *</label>
                  <textarea {...register('address', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none h-20" />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Latitude *</label>
                  <input type="number" step="any" {...register('latitude', { required: true, valueAsNumber: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Longitude *</label>
                  <input type="number" step="any" {...register('longitude', { required: true, valueAsNumber: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Verification Status *</label>
                  <select {...register('verificationStatus', { required: true })} className="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 focus:border-primary focus:outline-none">
                    <option value="Official">Official</option>
                    <option value="Verified">Verified</option>
                    <option value="Needs Verification">Needs Verification</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg font-headline text-label-lg text-on-surface-variant hover:bg-surface-container">
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-headline text-label-lg hover:bg-primary/90">
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HelpServicesManager;
