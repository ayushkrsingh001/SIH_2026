import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';
import { MASCOT_URL } from '../constants';

const Home = () => {
  return (
    <div className="min-h-screen bg-cream font-body text-on-surface overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="hidden md:flex justify-between items-center w-full px-gutter py-4 w-full bg-cream sticky top-0 z-50">
        <div className="font-headline text-headline-md font-extrabold text-primary tracking-tight">RightsQuest</div>
        <ul className="flex space-x-8">
          <li><a className="font-body text-label-md text-on-surface-variant hover:text-primary transition-colors pb-1" href="#how-it-works">How it Works</a></li>
          <li><a className="font-body text-label-md text-on-surface-variant hover:text-primary transition-colors pb-1" href="#features">Features</a></li>
          <li><a className="font-body text-label-md text-on-surface-variant hover:text-primary transition-colors pb-1" href="#safety">Safety</a></li>
        </ul>
        <div className="flex space-x-4">
          <Link to="/login" className="font-body text-label-md text-primary hover:bg-primary-container/20 px-6 py-2 rounded-full transition-colors">Log In</Link>
          <Link to="/signup" className="font-body text-label-md bg-primary-container text-on-primary-container px-6 py-2 rounded-full btn-tactile-primary">Sign Up Free</Link>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center w-full px-4 py-4 bg-cream sticky top-0 z-50 shadow-card">
        <div className="font-headline text-headline-md-mobile font-extrabold text-primary tracking-tight">RightsQuest</div>
        <Link to="/login" className="font-body text-label-md bg-primary-container text-on-primary-container px-4 py-2 rounded-full btn-tactile-primary">Log In</Link>
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="w-full px-4 md:px-gutter pt-12 md:pt-24 pb-xl relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              className="order-2 md:order-1 flex flex-col space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={staggerItem} className="inline-flex items-center space-x-2 bg-secondary-container/30 px-4 py-2 rounded-full w-fit">
                <span className="material-symbols-outlined text-secondary text-sm filled">verified</span>
                <span className="font-body text-label-md text-secondary">Trusted by 10,000+ Parents</span>
              </motion.div>

              <motion.h1 variants={staggerItem} className="font-headline text-display-lg-mobile md:text-display-lg text-on-surface">
                Empower your child with{' '}
                <span className="text-primary relative inline-block">
                  legal literacy
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-tertiary-fixed" preserveAspectRatio="none" viewBox="0 0 100 10">
                    <path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p variants={staggerItem} className="font-body text-body-lg text-on-surface-variant max-w-lg">
                RightsQuest transforms complex legal concepts into fun, engaging quests for kids aged 8-16. Build their confidence and understanding of their rights in a safe, gamified environment.
              </motion.p>

              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Link to="/signup" className="btn-tactile-primary bg-primary-container text-on-primary-container font-headline text-title-lg px-8 py-4 rounded-full flex items-center justify-center space-x-2 w-full sm:w-auto shadow-card hover:shadow-card-hover transition-shadow">
                  <span>Get Started Free</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a href="#how-it-works" className="bg-surface border-2 border-outline-variant text-on-surface font-headline text-title-lg px-8 py-4 rounded-full flex items-center justify-center w-full sm:w-auto hover:bg-surface-container-high transition-colors">
                  How it works
                </a>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center space-x-4 pt-6 opacity-70">
                <span className="font-body text-caption text-on-surface-variant uppercase tracking-wider">Backed by</span>
                <div className="h-8 w-auto px-3 bg-surface-variant rounded-md flex items-center justify-center">
                  <span className="font-body text-caption text-outline">Ministry of Law & Justice</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Mascot / Hero Graphic */}
            <motion.div
              className="order-1 md:order-2 relative flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-tertiary-fixed opacity-20 rounded-full blur-3xl transform scale-110" />
              <div className="absolute top-10 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="material-symbols-outlined text-4xl text-secondary filled">star</span>
              </div>
              <div className="absolute bottom-10 right-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <span className="material-symbols-outlined text-5xl text-tertiary filled">shield</span>
              </div>
              <div className="relative z-10 w-full max-w-md mx-auto drop-shadow-xl">
                <img alt="RightsQuest Mascot Owl wearing a graduation cap" className="w-full h-auto object-contain" src={MASCOT_URL} />
              </div>
              <motion.div
                className="absolute -right-4 top-1/4 bg-surface text-on-surface font-body text-label-md px-4 py-2 rounded-[24px] shadow-card speech-bubble z-20"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ready for an adventure?
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="w-full px-4 md:px-gutter py-xl">
          <motion.div className="text-center mb-12" variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <h2 className="font-headline text-display-lg-mobile md:text-headline-md text-on-surface mb-4">Learning that feels like playing</h2>
            <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mx-auto">We've broken down essential legal concepts into three simple, engaging steps.</p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {[
              { icon: 'menu_book', title: '1. Bite-Sized Lessons', desc: 'Complex topics like privacy, contracts, and digital rights are translated into simple, kid-friendly stories.', color: 'primary-fixed', iconColor: 'primary' },
              { icon: 'videogame_asset', title: '2. Interactive Quests', desc: 'Apply knowledge immediately through scenario-based games. Make choices and see the consequences in a safe space.', color: 'secondary-container', iconColor: 'secondary' },
              { icon: 'military_tech', title: '3. Earn Rewards', desc: 'Collect badges, level up, and unlock new customizations for their personal avatar as they master new topics.', color: 'tertiary-fixed', iconColor: 'tertiary' },
            ].map(step => (
              <motion.div
                key={step.title}
                variants={staggerItem}
                className="bg-surface rounded-[24px] p-6 shadow-card hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full border border-surface-container"
              >
                <div className={`w-16 h-16 rounded-full bg-${step.color} flex items-center justify-center mb-6`}>
                  <span className={`material-symbols-outlined text-${step.iconColor} text-3xl filled`}>{step.icon}</span>
                </div>
                <h3 className="font-headline text-title-lg text-on-surface mb-3">{step.title}</h3>
                <p className="font-body text-body-md text-on-surface-variant flex-grow">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Safety Section */}
        <section id="safety" className="w-full px-4 md:px-gutter py-xl">
          <motion.div
            className="bg-secondary-container/20 rounded-[24px] p-8 md:p-12 text-center"
            variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-secondary text-3xl filled">verified_user</span>
            </div>
            <h2 className="font-headline text-headline-md text-on-surface mb-4">Safety by Design</h2>
            <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
              No direct messaging between users. All content is moderated. Children's personal data is never collected. Every support request goes through structured, safe channels.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {['Zero unmoderated channels', 'Data minimization', 'Parental oversight'].map(item => (
                <div key={item} className="flex items-center gap-2 justify-center bg-surface rounded-full px-4 py-2">
                  <span className="material-symbols-outlined text-secondary text-sm filled">check_circle</span>
                  <span className="font-body text-label-md text-on-surface">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-4 md:px-gutter py-xl text-center">
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <h2 className="font-headline text-display-lg-mobile md:text-headline-md text-on-surface mb-4">
              Start your child's rights journey today
            </h2>
            <p className="font-body text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">
              Join thousands of parents who trust RightsQuest to educate and empower their children.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container font-headline text-title-lg px-10 py-4 rounded-full btn-tactile-primary shadow-card hover:shadow-card-hover transition-shadow">
              Create Free Account
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container py-8 px-4 md:px-gutter mt-xl">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-headline text-title-lg font-bold text-primary">RightsQuest</div>
          <p className="font-body text-caption text-on-surface-variant">© 2026 RightsQuest — SIH 2026. Built for children's rights awareness.</p>
          <div className="flex gap-6">
            <a href="#" className="font-body text-caption text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="font-body text-caption text-on-surface-variant hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
