import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="font-headline text-display-sm text-primary mb-6">Terms of Service</h1>
          <p className="text-on-surface-variant mb-6 text-label-lg">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-on-surface text-body-lg">
            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using RightsQuest, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">2. User Accounts</h2>
              <p>Parent accounts are responsible for all activity that occurs under their account, including actions taken by child profiles created under their account. You must provide accurate and complete information when creating an account.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">3. Educational Content</h2>
              <p>The content provided on RightsQuest is for educational purposes only. While we strive to ensure the accuracy of legal information presented in our games and scenarios, it does not constitute formal legal advice.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">4. Community Guidelines</h2>
              <p>Users must maintain a respectful and safe environment. Any form of harassment, hate speech, or inappropriate behavior in multiplayer modes or community features will result in immediate account termination.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">5. Intellectual Property</h2>
              <p>All content, graphics, game mechanics, and code on RightsQuest are the intellectual property of RightsQuest and are protected by applicable copyright and trademark laws.</p>
            </section>

            <section>
              <h2 className="font-headline text-title-lg text-primary mb-3">6. Modifications to Service</h2>
              <p>We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice at any time.</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsOfService;
