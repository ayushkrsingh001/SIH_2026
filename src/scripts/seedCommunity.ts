/**
 * Seed script for Community Platform
 * Run this to populate Firestore with initial data for all community features.
 * Usage: Import and call seedCommunityData() from browser console or a temp page.
 */

import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CommunityCategoryId } from '../types';

const now = new Date();
const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
const threeWeeksFromNow = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

const campaigns = [
  {
    title: 'Cyber Safety Week',
    description: 'Learn to protect your children from online threats. Complete quizzes, read resources, and earn XP!',
    bannerUrl: '',
    imageUrl: '',
    categoryId: 'cyber_safety' as CommunityCategoryId,
    rewardXP: 200,
    rewardCoins: 100,
    rewardBadge: 'Cyber Guardian',
    startDate: Timestamp.fromDate(now),
    endDate: Timestamp.fromDate(weekFromNow),
    totalTasks: 5,
    quizQuestions: [
      { question: 'What should you do if your child receives a message from a stranger online?', options: ['Ignore it', 'Block and report the account', 'Reply to find out who they are', 'Delete the message only'], correctAnswer: 'Block and report the account', explanation: 'Always block unknown contacts and report them to the platform to protect your child.' },
      { question: 'Which is the safest password practice?', options: ['Using your birthday', 'Using "password123"', 'A mix of letters, numbers, and symbols', 'Same password everywhere'], correctAnswer: 'A mix of letters, numbers, and symbols', explanation: 'Strong passwords combine uppercase, lowercase, numbers, and special characters.' },
      { question: 'What is phishing?', options: ['A type of fishing sport', 'Fraudulent attempts to steal personal information', 'A new social media platform', 'A computer game'], correctAnswer: 'Fraudulent attempts to steal personal information', explanation: 'Phishing uses fake emails/websites to trick people into revealing passwords and personal data.' },
    ],
    learningResources: [
      { title: 'CERT-In Cyber Safety Tips', type: 'article' as const, url: 'https://www.cert-in.org.in/', description: 'Official Indian cybersecurity advisory' },
      { title: 'Parental Controls Guide', type: 'article' as const, url: '#', description: 'How to set up parental controls on devices' },
    ],
    participantCount: 47,
    status: 'active' as const,
    createdAt: serverTimestamp(),
  },
  {
    title: 'Girls Safety Awareness Month',
    description: 'Empower your daughter with knowledge about safety, legal rights, and self-defence. Join thousands of parents!',
    bannerUrl: '',
    imageUrl: '',
    categoryId: 'girls_safety' as CommunityCategoryId,
    rewardXP: 300,
    rewardCoins: 150,
    rewardBadge: 'Girls Safety Champion',
    startDate: Timestamp.fromDate(now),
    endDate: Timestamp.fromDate(threeWeeksFromNow),
    totalTasks: 8,
    quizQuestions: [
      { question: 'Under which law can you file a complaint for sexual harassment of a minor?', options: ['POCSO Act, 2012', 'Consumer Protection Act', 'RTI Act', 'Motor Vehicles Act'], correctAnswer: 'POCSO Act, 2012', explanation: 'The Protection of Children from Sexual Offences (POCSO) Act, 2012 provides legal protection to children.' },
      { question: 'What is the helpline number for women in distress?', options: ['100', '108', '1091', '1098'], correctAnswer: '1091', explanation: 'Women can call 1091 for immediate help. 1098 is Childline and 100 is Police.' },
    ],
    learningResources: [
      { title: 'POCSO Act Explained', type: 'article' as const, url: '#', description: 'Understanding the Protection of Children from Sexual Offences Act' },
    ],
    participantCount: 123,
    status: 'active' as const,
    createdAt: serverTimestamp(),
  },
  {
    title: 'Child Rights Week',
    description: 'Every child has rights! Learn about constitutional rights, education rights, and how to protect them.',
    bannerUrl: '',
    imageUrl: '',
    categoryId: 'child_rights' as CommunityCategoryId,
    rewardXP: 250,
    rewardCoins: 120,
    rewardBadge: 'Rights Advocate',
    startDate: Timestamp.fromDate(weekFromNow),
    endDate: Timestamp.fromDate(twoWeeksFromNow),
    totalTasks: 6,
    quizQuestions: [
      { question: 'Which article of the Indian Constitution guarantees the right to education?', options: ['Article 14', 'Article 19', 'Article 21A', 'Article 32'], correctAnswer: 'Article 21A', explanation: 'Article 21A makes education a fundamental right for children aged 6-14 years.' },
    ],
    learningResources: [],
    participantCount: 89,
    status: 'upcoming' as const,
    createdAt: serverTimestamp(),
  },
];

const weeklyChallenges = [
  {
    title: '🛡 Cyber Awareness Week',
    description: 'Complete these tasks to become a Cyber Safety Champion!',
    weekStartDate: Timestamp.fromDate(now),
    weekEndDate: Timestamp.fromDate(weekFromNow),
    tasks: [
      { id: 'read_3', title: 'Read 3 Cyber Safety Posts', description: 'Read and learn from community posts', type: 'read_posts', targetCount: 3, icon: 'article' },
      { id: 'quiz_1', title: 'Complete 1 Quiz', description: 'Test your knowledge with a quiz', type: 'complete_quiz', targetCount: 1, icon: 'quiz' },
      { id: 'share_2', title: 'Share 2 Tips', description: 'Share safety tips with the community', type: 'share_awareness', targetCount: 2, icon: 'share' },
      { id: 'learn_5', title: 'Learn 5 Cyber Safety Tips', description: 'Read 5 safety tips from the news section', type: 'learn_tips', targetCount: 5, icon: 'school' },
      { id: 'comment_3', title: 'Comment on 3 Posts', description: 'Engage with the community', type: 'comment', targetCount: 3, icon: 'chat_bubble' },
    ],
    rewardXP: 150,
    rewardCoins: 75,
    rewardBadge: 'Weekly Champion',
    status: 'active' as const,
    createdAt: serverTimestamp(),
  },
];

const nearbyEvents = [
  { title: 'Cyber Safety Workshop for Parents', description: 'Learn how to protect your children online. Free workshop by Delhi Police Cyber Cell.', type: 'cyber_awareness', location: 'Delhi Police HQ, New Delhi', address: 'Connaught Place, New Delhi', latitude: 28.6139, longitude: 77.2090, date: Timestamp.fromDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)), organizerName: 'Delhi Police', registeredCount: 34, maxCapacity: 100, mapsLink: 'https://maps.google.com/?q=28.6139,77.2090', status: 'upcoming' as const, createdAt: serverTimestamp() },
  { title: 'Child Rights Awareness Camp', description: 'Free legal consultation and awareness about child rights under Indian law.', type: 'child_rights', location: 'District Court, Mumbai', address: 'Fort, Mumbai', latitude: 18.9321, longitude: 72.8347, date: Timestamp.fromDate(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)), organizerName: 'UNICEF India', registeredCount: 56, maxCapacity: 200, mapsLink: 'https://maps.google.com/?q=18.9321,72.8347', status: 'upcoming' as const, createdAt: serverTimestamp() },
  { title: 'Women Safety Self-Defence Training', description: 'Free self-defence classes for women and girls. Learn practical safety techniques.', type: 'women_safety', location: 'Community Center, Bangalore', address: 'MG Road, Bangalore', latitude: 12.9716, longitude: 77.5946, date: Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)), organizerName: 'She Team', registeredCount: 78, maxCapacity: 150, mapsLink: 'https://maps.google.com/?q=12.9716,77.5946', status: 'upcoming' as const, createdAt: serverTimestamp() },
  { title: 'Legal Aid Camp - Know Your Rights', description: 'Free legal assistance and rights awareness. Bring your documents for consultation.', type: 'legal_aid', location: 'Taluk Office, Chennai', address: 'T Nagar, Chennai', latitude: 13.0827, longitude: 80.2707, date: Timestamp.fromDate(new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)), organizerName: 'Legal Services Authority', registeredCount: 23, maxCapacity: 80, mapsLink: 'https://maps.google.com/?q=13.0827,80.2707', status: 'upcoming' as const, createdAt: serverTimestamp() },
  { title: 'NGO Awareness Drive - Child Education', description: 'Join our campaign to ensure every child has access to quality education.', type: 'ngo_drive', location: 'Town Hall, Pune', address: 'Shivaji Nagar, Pune', latitude: 18.5204, longitude: 73.8567, date: Timestamp.fromDate(new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)), organizerName: 'CRY India', registeredCount: 42, maxCapacity: 120, mapsLink: 'https://maps.google.com/?q=18.5204,73.8567', status: 'upcoming' as const, createdAt: serverTimestamp() },
];

const legalNews = [
  { title: 'Supreme Court Strengthens Child Protection Laws', summary: 'The Supreme Court has issued new guidelines to strengthen child protection mechanisms across India, mandating faster trials under POCSO Act.', content: 'In a landmark ruling, the Supreme Court of India has directed all states to establish dedicated fast-track courts for POCSO cases. The court emphasized that delays in justice are a major concern and has set a 6-month deadline for states to comply. This ruling is expected to significantly improve the conviction rate in child abuse cases.', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', source: 'The Hindu', categoryId: 'child_rights' as CommunityCategoryId, readTimeMinutes: 2, rewardXP: 15, publishedAt: Timestamp.fromDate(now), createdAt: serverTimestamp() },
  { title: 'New Cyber Safety Guidelines for Schools', summary: 'Ministry of Education releases comprehensive cyber safety guidelines for schools, mandating digital literacy programs.', content: 'The Ministry of Education has released new guidelines requiring all schools to implement digital safety programs. These guidelines cover topics like online bullying prevention, safe social media usage, and protecting personal information online. Schools are expected to train teachers and integrate these topics into the curriculum by the next academic year.', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop', source: 'Times of India', categoryId: 'cyber_safety' as CommunityCategoryId, readTimeMinutes: 3, rewardXP: 20, publishedAt: Timestamp.fromDate(now), createdAt: serverTimestamp() },
  { title: 'Road Safety Bill 2026: Key Changes', summary: 'Parliament passes new Road Safety Bill with stricter penalties for traffic violations and enhanced protection for pedestrians.', content: 'The new Road Safety Bill includes provisions for heavier fines, license suspension for repeat offenders, and mandatory safety features in vehicles. Special emphasis has been placed on school zone safety with new speed limits and crossing guidelines.', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', source: 'NDTV', categoryId: 'road_safety' as CommunityCategoryId, readTimeMinutes: 2, rewardXP: 15, publishedAt: Timestamp.fromDate(now), createdAt: serverTimestamp() },
  { title: 'Consumer Rights: New E-Commerce Rules', summary: 'Government introduces new consumer protection rules for e-commerce platforms, strengthening buyer rights.', content: 'The updated Consumer Protection (E-Commerce) Rules require platforms to display all charges upfront, process refunds within 7 days, and provide clear grievance redressal mechanisms. Consumers can now file complaints online through the National Consumer Helpline.', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', source: 'Economic Times', categoryId: 'consumer_rights' as CommunityCategoryId, readTimeMinutes: 2, rewardXP: 15, publishedAt: Timestamp.fromDate(now), createdAt: serverTimestamp() },
  { title: 'Mental Health Support in Schools Now Mandatory', summary: 'New CBSE circular mandates counselors in all schools to support student mental health.', content: 'CBSE has issued a circular making it mandatory for all affiliated schools to have at least one trained counselor. Schools must also establish anti-bullying committees and conduct regular mental health awareness programs.', imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', source: 'Indian Express', categoryId: 'mental_health' as CommunityCategoryId, readTimeMinutes: 2, rewardXP: 15, publishedAt: Timestamp.fromDate(now), createdAt: serverTimestamp() },
];

const mythFacts = [
  { myth: 'Children cannot file a police complaint on their own.', fact: 'Under Indian law, anyone including children can file a First Information Report (FIR) at any police station.', explanation: 'Police stations are legally obligated to register FIRs regardless of the complainant\'s age. Section 154 of CrPC mandates this.', legalInfo: 'Section 154 of Code of Criminal Procedure (CrPC) - Any person can give information about a cognizable offence.', categoryId: 'child_rights' as CommunityCategoryId, rewardXP: 10, order: 1, createdAt: serverTimestamp() },
  { myth: 'Cyberbullying is not a crime in India.', fact: 'Cyberbullying is punishable under multiple Indian laws including the IT Act, 2000 and IPC.', explanation: 'Sections 66A (though struck down, 66C and 66D remain), 67, and 67A of the IT Act address cyber crimes. IPC sections on defamation and criminal intimidation also apply.', legalInfo: 'IT Act 2000, Sections 66C, 66D, 67 | IPC Sections 499, 500, 503, 506', categoryId: 'cyber_safety' as CommunityCategoryId, rewardXP: 10, order: 2, createdAt: serverTimestamp() },
  { myth: 'Only girls need to learn about personal safety.', fact: 'All children regardless of gender need safety education. Boys are also victims of abuse.', explanation: 'POCSO Act 2012 is gender-neutral and protects all children under 18. NCRB data shows boys also face sexual offences.', legalInfo: 'POCSO Act, 2012 - Gender neutral protection for all children under 18 years.', categoryId: 'girls_safety' as CommunityCategoryId, rewardXP: 10, order: 3, createdAt: serverTimestamp() },
  { myth: 'You cannot return a product bought online after opening it.', fact: 'Under the Consumer Protection Act 2019, you have the right to return defective products regardless of opening them.', explanation: 'The Consumer Protection Act 2019 provides consumers with the right to seek redressal for defective goods and deficient services. E-commerce rules mandate clear return/refund policies.', legalInfo: 'Consumer Protection Act, 2019 - Right to be heard and seek redressal.', categoryId: 'consumer_rights' as CommunityCategoryId, rewardXP: 10, order: 4, createdAt: serverTimestamp() },
  { myth: 'Self-defence can get you arrested.', fact: 'Indian law provides the right to self-defence. You can use reasonable force to protect yourself or others.', explanation: 'Sections 96-106 of the Indian Penal Code provide the right of private defence. You can even cause death in extreme cases of threat to life.', legalInfo: 'IPC Sections 96-106 - Right of Private Defence of Body and Property.', categoryId: 'self_defence' as CommunityCategoryId, rewardXP: 10, order: 5, createdAt: serverTimestamp() },
  { myth: 'Police can refuse to file your FIR.', fact: 'It is illegal for police to refuse to register an FIR for a cognizable offence. You can approach the SP or Magistrate if refused.', explanation: 'Under Section 154 CrPC, police MUST register an FIR. If they refuse, you can send the complaint to the Superintendent of Police or file it with the Judicial Magistrate under Section 156(3).', legalInfo: 'CrPC Section 154(1), 154(3), 156(3) - Mandatory FIR registration.', categoryId: 'police_awareness' as CommunityCategoryId, rewardXP: 10, order: 6, createdAt: serverTimestamp() },
  { myth: 'Environmental pollution complaints are not taken seriously.', fact: 'India has strong environmental laws. The National Green Tribunal (NGT) can impose heavy penalties for pollution.', explanation: 'The Environment Protection Act 1986, Water Act 1974, and Air Act 1981 provide comprehensive protection. NGT hears environmental cases and can order cleanup, compensation, and penalties.', legalInfo: 'Environment Protection Act, 1986 | NGT Act, 2010', categoryId: 'environment' as CommunityCategoryId, rewardXP: 10, order: 7, createdAt: serverTimestamp() },
  { myth: 'Schools can expel students without any reason.', fact: 'Under the Right to Education Act, no child can be held back or expelled from school until the completion of elementary education.', explanation: 'RTE Act 2009 mandates free and compulsory education for children aged 6-14. Schools cannot expel or deny admission based on caste, religion, or economic status.', legalInfo: 'Right to Education Act, 2009 - Section 16: No child shall be held back or expelled.', categoryId: 'school_safety' as CommunityCategoryId, rewardXP: 10, order: 8, createdAt: serverTimestamp() },
];

const scamAlerts = [
  {
    title: 'Fake OTP Scam',
    description: 'Scammers call pretending to be bank officials and ask for OTP to "verify" your account. Never share your OTP with anyone!',
    scamType: 'Banking Fraud',
    severity: 'high' as const,
    howItWorks: '1. You receive a call from someone claiming to be from your bank\n2. They say your account will be blocked or there\'s suspicious activity\n3. They ask for your OTP, card details, or UPI PIN\n4. Once you share, they transfer money from your account',
    howToStaySafe: '• Never share OTP, PIN, or card details with anyone\n• Banks NEVER ask for OTP or PIN on calls\n• Hang up and call your bank\'s official number to verify\n• Report to Cyber Crime helpline: 1930',
    reportLink: 'https://cybercrime.gov.in',
    categoryId: 'cyber_safety' as CommunityCategoryId,
    rewardXP: 20,
    quizQuestions: [
      { question: 'A bank official calls and asks for your OTP. What should you do?', options: ['Share the OTP', 'Hang up immediately', 'Ask them to call later', 'Give a wrong OTP'], correctAnswer: 'Hang up immediately', explanation: 'Banks never ask for OTP on phone calls. Always hang up and report.' },
    ],
    reportCount: 156,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Fake QR Code Payment Scam',
    description: 'Scammers send QR codes claiming you\'ll receive money. Scanning and entering PIN actually sends money FROM your account!',
    scamType: 'UPI Fraud',
    severity: 'high' as const,
    howItWorks: '1. Scammer contacts you on OLX/classifieds about buying your item\n2. They say they\'ll send money and share a QR code\n3. They ask you to scan and enter UPI PIN to "receive" payment\n4. Entering PIN actually transfers money to the scammer',
    howToStaySafe: '• You NEVER need to enter PIN to receive money\n• QR codes are only for SENDING money, not receiving\n• Never scan unknown QR codes\n• Use only your bank\'s official app',
    categoryId: 'cyber_safety' as CommunityCategoryId,
    rewardXP: 20,
    quizQuestions: [
      { question: 'Do you need to enter UPI PIN to receive money?', options: ['Yes, always', 'Only for large amounts', 'No, never', 'Only for first-time transfers'], correctAnswer: 'No, never', explanation: 'UPI PIN is only needed to SEND money. You never need to enter PIN to receive.' },
    ],
    reportCount: 234,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Fake Scholarship Scam',
    description: 'Fraudulent messages promising government scholarships. They collect fees or personal data from parents.',
    scamType: 'Education Fraud',
    severity: 'medium' as const,
    howItWorks: '1. You receive SMS/WhatsApp about a "government scholarship"\n2. The message has a link to a fake website\n3. They ask for Aadhaar, bank details, and a "processing fee"\n4. Your data is stolen or money is taken with no scholarship',
    howToStaySafe: '• Government scholarships are applied through official portals (scholarships.gov.in)\n• Never pay processing fees for scholarships\n• Verify through official government websites only\n• Don\'t click links in unsolicited messages',
    categoryId: 'digital_privacy' as CommunityCategoryId,
    rewardXP: 15,
    quizQuestions: [
      { question: 'How should you apply for government scholarships?', options: ['Through WhatsApp links', 'Through official government portals', 'Through email offers', 'Through agents'], correctAnswer: 'Through official government portals', explanation: 'Only use scholarships.gov.in or state portal websites. Never trust unsolicited messages.' },
    ],
    reportCount: 89,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Fake Job Offer Scam',
    description: 'Scammers offer high-paying jobs requiring upfront "registration fees" or "training charges".',
    scamType: 'Employment Fraud',
    severity: 'medium' as const,
    howItWorks: '1. Attractive job offer received via SMS, email, or social media\n2. Promises high salary with minimal qualifications\n3. Asks for registration fee, training fee, or security deposit\n4. After payment, the "company" disappears',
    howToStaySafe: '• Legitimate companies never charge for hiring\n• Research the company on official registrar websites\n• Never pay money to get a job\n• Report to cybercrime.gov.in',
    categoryId: 'consumer_rights' as CommunityCategoryId,
    rewardXP: 15,
    quizQuestions: [
      { question: 'A company asks for ₹5000 registration fee before hiring you. What is this?', options: ['Normal process', 'A scam', 'Security deposit', 'Training fee'], correctAnswer: 'A scam', explanation: 'No legitimate company charges money for hiring. This is a common job scam.' },
    ],
    reportCount: 178,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const awarenessShorts = [
  { title: 'Know Your Emergency Numbers', description: 'Learn the important emergency numbers every Indian should know', categoryId: 'police_awareness' as CommunityCategoryId, mediaUrl: '', mediaType: 'image_slideshow' as const, thumbnailUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=200&h=320&fit=crop', durationSeconds: 30, likesCount: 234, bookmarksCount: 56, sharesCount: 89, viewsCount: 1200, rewardXP: 10, tags: ['emergency', 'safety', 'numbers'], createdAt: serverTimestamp() },
  { title: 'What is POCSO Act?', description: 'Understanding the Protection of Children from Sexual Offences Act', categoryId: 'child_rights' as CommunityCategoryId, mediaUrl: '', mediaType: 'image_slideshow' as const, thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=320&fit=crop', durationSeconds: 60, likesCount: 567, bookmarksCount: 123, sharesCount: 234, viewsCount: 3400, rewardXP: 15, tags: ['POCSO', 'child rights', 'law'], createdAt: serverTimestamp() },
  { title: '5 Signs of Cyberbullying', description: 'Help your child - recognize these warning signs early', categoryId: 'cyber_safety' as CommunityCategoryId, mediaUrl: '', mediaType: 'image_slideshow' as const, thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=320&fit=crop', durationSeconds: 45, likesCount: 345, bookmarksCount: 89, sharesCount: 156, viewsCount: 2100, rewardXP: 10, tags: ['cyberbullying', 'signs', 'awareness'], createdAt: serverTimestamp() },
  { title: 'Road Safety Tips for Kids', description: 'Teach your children these life-saving road safety rules', categoryId: 'road_safety' as CommunityCategoryId, mediaUrl: '', mediaType: 'image_slideshow' as const, thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=320&fit=crop', durationSeconds: 30, likesCount: 189, bookmarksCount: 45, sharesCount: 67, viewsCount: 890, rewardXP: 10, tags: ['road safety', 'kids', 'rules'], createdAt: serverTimestamp() },
  { title: 'Your Consumer Rights', description: 'What to do when a product is defective - know your legal rights', categoryId: 'consumer_rights' as CommunityCategoryId, mediaUrl: '', mediaType: 'image_slideshow' as const, thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=320&fit=crop', durationSeconds: 60, likesCount: 123, bookmarksCount: 34, sharesCount: 45, viewsCount: 670, rewardXP: 15, tags: ['consumer', 'rights', 'refund'], createdAt: serverTimestamp() },
];

export const seedCommunityData = async () => {
  console.log('🌱 Starting community data seed...');
  
  try {
    // Campaigns
    console.log('📢 Seeding campaigns...');
    for (const c of campaigns) {
      await addDoc(collection(db, 'campaigns'), c);
    }
    console.log(`✅ ${campaigns.length} campaigns seeded`);

    // Weekly Challenges
    console.log('🏆 Seeding weekly challenges...');
    for (const wc of weeklyChallenges) {
      await addDoc(collection(db, 'weeklyChallenges'), wc);
    }
    console.log(`✅ ${weeklyChallenges.length} weekly challenges seeded`);

    // Nearby Events
    console.log('📍 Seeding nearby events...');
    for (const e of nearbyEvents) {
      await addDoc(collection(db, 'nearbyEvents'), e);
    }
    console.log(`✅ ${nearbyEvents.length} events seeded`);

    // Legal News
    console.log('📰 Seeding legal news...');
    for (const n of legalNews) {
      await addDoc(collection(db, 'legalNews'), n);
    }
    console.log(`✅ ${legalNews.length} news items seeded`);

    // Myth vs Facts
    console.log('💡 Seeding myth vs facts...');
    for (const mf of mythFacts) {
      await addDoc(collection(db, 'mythFacts'), mf);
    }
    console.log(`✅ ${mythFacts.length} myth/fact pairs seeded`);

    // Scam Alerts
    console.log('🚨 Seeding scam alerts...');
    for (const sa of scamAlerts) {
      await addDoc(collection(db, 'scamAlerts'), sa);
    }
    console.log(`✅ ${scamAlerts.length} scam alerts seeded`);

    // Awareness Shorts
    console.log('🎬 Seeding awareness shorts...');
    for (const s of awarenessShorts) {
      await addDoc(collection(db, 'awarenessShorts'), s);
    }
    console.log(`✅ ${awarenessShorts.length} shorts seeded`);

    console.log('🎉 Community data seeding complete!');
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return false;
  }
};
