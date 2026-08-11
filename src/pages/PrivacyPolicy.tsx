import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body flex flex-col">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-4 md:px-gutter py-3 max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container-high rounded-full p-2" aria-label="Go Back">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="font-headline text-title-lg font-bold text-primary hidden sm:block">RightsQuest</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-outline-variant"
        >
          <h1 className="font-headline text-display-sm text-primary mb-6">Privacy Policy</h1>
          <p className="text-on-surface-variant mb-6 text-label-lg">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-on-surface text-body-lg">
            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">1. Information We Collect</h2>
              <p>At RightsQuest, we take your privacy and your child's safety very seriously. We collect basic account information (such as email and display names) during registration. For children's accounts, we only collect a nickname and age group to tailor the educational content appropriately.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">2. How We Use Information</h2>
              <p>We use the collected information solely to provide and improve the RightsQuest educational experience. This includes tracking progress, customizing AI-generated scenarios to be age-appropriate, and ensuring a safe multiplayer environment.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">3. COPPA & Child Safety</h2>
              <p>We strictly comply with the Children's Online Privacy Protection Act (COPPA). We do not collect personally identifiable information from children under 13 without verifiable parental consent. Parents have full access to view and delete their child's data via the Parent Dashboard.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">4. AI and Third-Party Services</h2>
              <p>We use trusted AI partners (like Groq) to generate educational scenarios. We never send any personally identifiable information to these third-party AI models. All data sent is strictly contextual (e.g., age group and topic) to generate the game content.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">5. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest using Firebase's secure infrastructure.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">6. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact our Data Protection Officer at privacy@rightsquest.example.com.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
