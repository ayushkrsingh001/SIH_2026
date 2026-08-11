import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHelpServices, getHelpServicesByState } from '../firebase/firestore';
import { groqService } from '../services/groqService';
import { MASCOT_SMALL_URL } from '../constants';
import toast from 'react-hot-toast';
import type { HelpService } from '../types';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  { id: 'unsafe', label: 'I Feel Unsafe', icon: 'shield_locked', color: 'text-error', bgColor: 'bg-error-container' },
  { id: 'legal', label: 'I Need Legal Help', icon: 'gavel', color: 'text-primary', bgColor: 'bg-primary-container' },
  { id: 'school', label: 'School Problem', icon: 'school', color: 'text-secondary', bgColor: 'bg-secondary-container' },
  { id: 'child_labour', label: 'Child Labour', icon: 'work_off', color: 'text-tertiary', bgColor: 'bg-tertiary-container' },
  { id: 'child_marriage', label: 'Child Marriage', icon: 'not_accessible', color: 'text-error', bgColor: 'bg-error-container' },
  { id: 'online', label: 'Online Safety', icon: 'security', color: 'text-primary', bgColor: 'bg-primary-container' },
  { id: 'family', label: 'Family Problem', icon: 'family_restroom', color: 'text-secondary', bgColor: 'bg-secondary-container' },
  { id: 'medical', label: 'Medical Help', icon: 'local_hospital', color: 'text-error', bgColor: 'bg-error-container' },
  { id: 'emergency', label: 'Emergency Help', icon: 'emergency', color: 'text-error', bgColor: 'bg-error', isEmergency: true },
  { id: 'all', label: 'Find All Help', icon: 'search', color: 'text-on-surface-variant', bgColor: 'bg-surface-container-high' },
];

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency', number: '112', icon: 'emergency' },
  { name: 'Child Helpline', number: '1098', icon: 'child_care' },
  { name: 'Police', number: '100', icon: 'local_police' },
  { name: 'Cyber Crime', number: '1930', icon: 'local_police' },
];

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Haversine formula to calculate distance between two coordinates
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const NeedHelp = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  
  // Location State
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  
  // Manual Location State
  const [manualState, setManualState] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [showManual, setShowManual] = useState(false);

  // Services State
  const [services, setServices] = useState<(HelpService & { distance?: number })[]>([]);
  const [loading, setLoading] = useState(false);

  // AI State
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleCategorySelect = (category: typeof CATEGORIES[0]) => {
    setSelectedCategory(category);
    if (category.isEmergency) {
      // Don't change step, emergency shows inline
    } else {
      setStep(2);
    }
  };

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setShowManual(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        // Reverse Geocode using Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`, {
            headers: {
              'User-Agent': 'RightsQuest/1.0'
            }
          });
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.county || '';
          const state = data.address?.state || '';
          setLocationName(`${city ? city + ', ' : ''}${state}`);
          
          await fetchNearbyServices(latitude, longitude, state, selectedCategory?.id);
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('Could not determine exact location name.');
          // Still fetch services if we have lat/long
          await fetchNearbyServices(latitude, longitude, '', selectedCategory?.id);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Location access denied or failed.');
        setShowManual(true);
        setLoading(false);
      }
    );
  };

  const handleManualLocationSubmit = async () => {
    if (!manualState) {
      toast.error('Please select a state');
      return;
    }
    setLoading(true);
    const locString = `${manualCity ? manualCity + ', ' : ''}${manualState}`;
    setLocationName(locString);
    
    try {
      // Get lat/lng for manual location using Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locString)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'RightsQuest/1.0' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        await fetchNearbyServices(lat, lon, manualState, selectedCategory?.id);
      } else {
        toast.error('Could not find this location. Trying fallback database...');
        await fetchNearbyServices(null, null, manualState, selectedCategory?.id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Location search failed.');
      setLoading(false);
    }
  };

  const fetchNearbyServices = async (searchLat: number | null, searchLng: number | null, state: string, categoryId?: string) => {
    try {
      let fetched: (HelpService & { distance?: number })[] = [];
      
      if (searchLat && searchLng) {
        // Build Overpass API query based on category
        let amenityRegex = "police|hospital|clinic|courthouse"; // Default all
        
        if (categoryId && categoryId !== 'all') {
          const mapping: Record<string, string> = {
            'unsafe': 'police',
            'legal': 'courthouse',
            'school': 'police|hospital',
            'child_labour': 'police',
            'child_marriage': 'police',
            'online': 'police',
            'family': 'police',
            'medical': 'hospital|clinic',
          };
          amenityRegex = mapping[categoryId] || amenityRegex;
        }

        const radius = 25000; // 25km radius
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"~"${amenityRegex}"](around:${radius},${searchLat},${searchLng});
            way["amenity"~"${amenityRegex}"](around:${radius},${searchLat},${searchLng});
            relation["amenity"~"${amenityRegex}"](around:${radius},${searchLat},${searchLng});
          );
          out center;
        `;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        const data = await res.json();
        
        if (data && data.elements) {
          fetched = data.elements.map((el: any) => {
            const elLat = el.lat || el.center?.lat;
            const elLon = el.lon || el.center?.lon;
            const name = el.tags?.name || (el.tags?.amenity ? el.tags.amenity.charAt(0).toUpperCase() + el.tags.amenity.slice(1) : 'Support Center');
            const phone = el.tags?.phone || el.tags?.['contact:phone'] || '112 (Emergency)';
            const website = el.tags?.website || el.tags?.['contact:website'] || '';
            const category = el.tags?.amenity === 'hospital' || el.tags?.amenity === 'clinic' ? 'Medical' 
                           : el.tags?.amenity === 'courthouse' ? 'Legal' 
                           : 'Police/Emergency';
                           
            let distance = 9999;
            if (elLat && elLon) {
               distance = getDistance(searchLat, searchLng, elLat, elLon);
            }

            return {
              id: el.id.toString(),
              organizationName: name,
              category,
              state: state || 'Unknown',
              district: '',
              city: el.tags?.['addr:city'] || '',
              address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || 'Address not listed in OSM',
              phone,
              website,
              latitude: elLat,
              longitude: elLon,
              source: 'OpenStreetMap',
              verificationStatus: 'Verified', // Treat OSM data as verified for this context
              lastVerifiedAt: null,
              createdAt: null as any,
              distance
            } as HelpService & { distance?: number };
          });
        }
      }

      // If OSM returns nothing or we didn't have coordinates, fallback to Firestore
      if (fetched.length === 0) {
        let dbServices = state ? await getHelpServicesByState(state) : await getHelpServices();
        if (categoryId && categoryId !== 'all') {
          const mapping: Record<string, string[]> = {
            'unsafe': ['NGO', 'Police', 'Child Welfare'],
            'legal': ['Legal Aid', 'NGO'],
            'school': ['Child Welfare', 'NGO'],
            'child_labour': ['NGO', 'Police', 'Child Welfare'],
            'child_marriage': ['NGO', 'Police', 'Child Welfare'],
            'online': ['Cyber Police', 'NGO'],
            'family': ['NGO', 'Child Welfare'],
            'medical': ['Hospital', 'Clinic'],
          };
          const allowedTypes = mapping[categoryId] || [];
          if (allowedTypes.length > 0) {
             dbServices = dbServices.filter(s => allowedTypes.includes(s.category) || s.category.toLowerCase().includes(categoryId.split('_')[0]));
          }
        }
        
        fetched = dbServices.map(s => {
          if (searchLat && searchLng && s.latitude && s.longitude) {
            return { ...s, distance: getDistance(searchLat, searchLng, s.latitude, s.longitude) };
          }
          return { ...s };
        });
      }

      // Sort by distance
      if (searchLat && searchLng) {
        fetched.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
      }

      // Limit results to top 15 to avoid overwhelming UI
      setServices(fetched.slice(0, 15));
      setStep(3);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load dynamic services. Using fallback.');
      
      // Ultimate Fallback to Firestore if Overpass API completely fails
      try {
        let dbServices = state ? await getHelpServicesByState(state) : await getHelpServices();
        setServices(dbServices);
        setStep(3);
      } catch (e) {
        toast.error('No services found.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalyze = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const response = await groqService.generateChildHelpSuggestion('other', aiInput);
      setAiResponse(response.suggestion);
    } catch (e) {
      toast.error('Could not analyze right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="font-headline text-display-sm md:text-display-md text-on-surface mb-2">{t('needHelp.needHelpHeader')}</h1>
        <p className="font-body text-body-lg text-on-surface-variant">{t('needHelp.needHelpDesc')}</p>
      </div>

      {selectedCategory?.isEmergency ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-error-container border-2 border-error rounded-3xl p-6 md:p-8 mb-8 text-center">
          <span className="material-symbols-outlined text-[64px] text-error mb-4">warning</span>
          <h2 className="font-headline text-headline-md text-on-error-container mb-2">{t('needHelp.youMayBeInDanger')}</h2>
          <p className="font-body text-body-lg text-on-error-container mb-6">{t('needHelp.inDangerDesc')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {EMERGENCY_CONTACTS.map(contact => (
              <a key={contact.name} href={`tel:${contact.number}`} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-3xl">{contact.icon}</span>
                  <div className="text-left">
                    <p className="font-headline text-title-md text-on-surface">{contact.name}</p>
                    <p className="font-headline text-headline-sm text-error">{contact.number}</p>
                  </div>
                </div>
                <div className="bg-error text-on-error px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">call</span> {t('needHelp.callNow')}
                </div>
              </a>
            ))}
          </div>
          <button onClick={() => setSelectedCategory(null)} className="mt-8 text-on-error-container underline font-body">
            {t('needHelp.goBack')}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                cat.isEmergency 
                  ? 'border-error bg-error text-on-error shadow-[0_4px_12px_rgba(186,26,26,0.3)]' 
                  : 'border-surface-dim bg-surface-container-lowest hover:border-primary'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${cat.isEmergency ? 'bg-white/20' : cat.bgColor}`}>
                <span className={`material-symbols-outlined text-[28px] ${cat.isEmergency ? 'text-white' : cat.color}`}>{cat.icon}</span>
              </div>
              <span className={`font-headline text-title-sm text-center ${cat.isEmergency ? 'text-white font-bold' : 'text-on-surface'}`}>
                {t(`needHelp.categories.${cat.id}`)}
              </span>
            </button>
          ))}
        </div>
      )}

      {!selectedCategory?.isEmergency && (
        <div className="bg-surface-container-low rounded-3xl p-6 shadow-sm border border-outline-variant max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <img src={MASCOT_SMALL_URL} alt="Mascot" className="w-12 h-12 rounded-full bg-primary-container p-1 shrink-0" />
            <div className="flex-grow">
              <h3 className="font-headline text-title-md text-primary flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                {t('needHelp.understandMySituation')}
              </h3>
              <p className="font-body text-body-md text-on-surface-variant mb-4">
                {t('needHelp.notSureCategory')}
              </p>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={t('needHelp.aiInputPlaceholder')}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-body text-body-md resize-none h-24 mb-3 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAIAnalyze}
                disabled={aiLoading || !aiInput.trim()}
                className="bg-secondary-container text-on-secondary-container font-headline text-label-lg px-6 py-2 rounded-full flex items-center gap-2 hover:bg-secondary/20 transition-colors disabled:opacity-50"
              >
                {aiLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">magic_button</span>}
                {t('needHelp.analyzeSituation')}
              </button>
              
              {aiResponse && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-primary-container/20 rounded-xl border border-primary-container">
                  <p className="font-body text-body-md text-on-surface whitespace-pre-wrap">{aiResponse}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md mx-auto text-center pt-8"
    >
      <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-primary text-[40px]">location_on</span>
      </div>
      <h2 className="font-headline text-headline-sm text-on-surface mb-4">{t('needHelp.findHelpNearYou')}</h2>
      <p className="font-body text-body-lg text-on-surface-variant mb-8">
        {t('needHelp.allowLocationDesc')}
      </p>

      {!showManual ? (
        <div className="space-y-4">
          <button
            onClick={requestLocation}
            disabled={loading}
            className="w-full bg-primary text-on-primary font-headline text-title-md py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">my_location</span>}
            {t('needHelp.allowLocation')}
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="w-full text-primary font-headline text-title-md py-4 rounded-xl hover:bg-primary/5 transition-colors"
          >
            {t('needHelp.chooseLocationManually')}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant text-left">
          <p className="font-body text-body-md text-on-surface-variant mb-4">{t('needHelp.manualLocationDesc')}</p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-1">{t('needHelp.state')}</label>
              <select
                value={manualState}
                onChange={(e) => setManualState(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 font-body text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">{t('needHelp.selectState')}</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-1">{t('needHelp.cityAreaOptional')}</label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder={t('needHelp.cityAreaPlaceholder')}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 font-body text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleManualLocationSubmit}
            disabled={loading || !manualState}
            className="w-full bg-primary text-on-primary font-headline text-title-md py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">search</span>}
            {t('needHelp.findServices')}
          </button>
        </motion.div>
      )}
      
      <button onClick={() => setStep(1)} className="mt-8 text-on-surface-variant flex items-center gap-1 mx-auto hover:text-primary">
        <span className="material-symbols-outlined text-sm">arrow_back</span> {t('needHelp.back')}
      </button>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-headline text-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            {t('needHelp.helpNearYou')}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            {t('needHelp.showingServicesNear')} <span className="font-bold text-on-surface">{locationName}</span>
          </p>
        </div>
        <button onClick={() => setStep(2)} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center gap-1 font-headline text-label-md">
          <span className="material-symbols-outlined text-sm">edit_location</span> {t('needHelp.change')}
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant border-dashed">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">search_off</span>
          <h3 className="font-headline text-title-lg text-on-surface mb-2">{t('needHelp.noServicesFound')}</h3>
          <p className="font-body text-body-md text-on-surface-variant mb-6">{t('needHelp.noServicesFoundDesc')}</p>
          <div className="flex gap-4 justify-center">
             <button onClick={() => fetchNearbyServices(lat, lng, manualState || (locationName.split(', ')[1] || locationName), 'all')} className="bg-primary text-on-primary px-6 py-2 rounded-full font-headline text-label-lg hover:bg-primary/90">{t('needHelp.searchAllCategories')}</button>
             <button onClick={() => { setSelectedCategory(CATEGORIES.find(c => c.id === 'emergency') || null); setStep(1); }} className="bg-error text-on-error px-6 py-2 rounded-full font-headline text-label-lg hover:bg-error/90">{t('needHelp.showEmergencyContacts')}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div key={service.id} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex-grow">
                <div className="flex items-start justify-between md:justify-start md:gap-3 mb-1">
                  <h3 className="font-headline text-title-lg text-on-surface">{service.organizationName}</h3>
                  {service.verificationStatus === 'Official' && (
                    <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[12px]">verified</span> {t('needHelp.official')}
                    </span>
                  )}
                  {service.verificationStatus === 'Verified' && (
                    <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span> {t('needHelp.verified')}
                    </span>
                  )}
                </div>
                
                <p className="font-body text-body-sm text-primary mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">category</span>
                  {service.category}
                </p>
                
                <p className="font-body text-body-sm text-on-surface-variant flex items-start gap-1 mb-1">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">place</span>
                  <span>{service.address}<br/>{service.city}, {service.state}</span>
                </p>

                {service.distance !== undefined && (
                  <p className="font-body text-label-sm text-secondary flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[16px]">routing</span>
                    {t('needHelp.kmAway', { distance: service.distance.toFixed(1) })}
                  </p>
                )}
              </div>
              
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                <a
                  href={`tel:${service.phone}`}
                  className="flex-1 md:flex-none bg-primary text-on-primary px-4 py-2.5 rounded-xl font-headline text-label-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">call</span>
                  {t('needHelp.call')}
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none bg-surface-container-high text-on-surface px-4 py-2.5 rounded-xl font-headline text-label-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">directions</span>
                  {t('needHelp.directions')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
         <button onClick={() => setStep(1)} className="text-on-surface-variant font-body hover:text-primary underline">{t('needHelp.backToCategories')}</button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-140px)] pb-32 md:pb-8">
      <AnimatePresence mode="wait">
        {step === 1 && <motion.div key="step1">{renderStep1()}</motion.div>}
        {step === 2 && <motion.div key="step2">{renderStep2()}</motion.div>}
        {step === 3 && <motion.div key="step3">{renderStep3()}</motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default NeedHelp;
