export interface ImageDecisionRound {
  id: string;
  topic: string;
  category: string;
  description: string;
  question: string;
  optionA: { imageUrl: string; isCorrect: boolean };
  optionB: { imageUrl: string; isCorrect: boolean };
  feedbackCorrect: string;
  feedbackIncorrect: string;
  legalFact?: string;
  xpReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ageRange: '8-11' | '12-16' | 'all';
}

export const imageDecisionRounds: ImageDecisionRound[] = [
  {
    id: "img_decision_1",
    topic: "Right to Education vs Child Labour",
    category: "child_rights",
    description: "Every child has a right to free and compulsory education and should not be forced to work.",
    question: "Which image shows a child's rights being respected?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 11_53_47 AM.png",
      isCorrect: true 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 11_53_41 AM.png",
      isCorrect: false 
    },
    feedbackCorrect: "Exactly! Children should be in school learning, not doing hard physical labor.",
    feedbackIncorrect: "Child labour is illegal and takes away a child's right to play and learn.",
    legalFact: "The Right to Education (RTE) Act guarantees free education for children aged 6 to 14, and the Child Labour Act prohibits employment of children in certain occupations.",
    xpReward: 50,
    difficulty: "Easy",
    ageRange: "all"
  },
  {
    id: "img_decision_2",
    topic: "Right to Safe Environment",
    category: "school_safety",
    description: "School should be a safe space for everyone. We should help others and not make them feel bad.",
    question: "Which situation shows the right way to treat classmates?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 11_55_45 AM.png",
      isCorrect: false 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 11_57_00 AM.png",
      isCorrect: true 
    },
    feedbackCorrect: "Great job! Helping a classmate up shows kindness and respects their dignity.",
    feedbackIncorrect: "Bullying is wrong. Every child has the right to be protected from physical and mental harassment.",
    legalFact: "Many schools have strict anti-bullying policies to ensure a fear-free environment for all children.",
    xpReward: 50,
    difficulty: "Easy",
    ageRange: "all"
  },
  {
    id: "img_decision_3",
    topic: "Stranger Danger & Safety",
    category: "safety",
    description: "It is important to know who to trust and how to stay safe around people we don't know.",
    question: "Which image shows a safe and proper situation?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_02_32 PM.png",
      isCorrect: true 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_02_38 PM.png",
      isCorrect: false 
    },
    feedbackCorrect: "Correct! Walking with a trusted adult like a teacher or parent keeps you safe.",
    feedbackIncorrect: "Be careful around strangers! Never follow or talk to someone you don't know if you feel unsafe.",
    xpReward: 50,
    difficulty: "Medium",
    ageRange: "all"
  },
  {
    id: "img_decision_4",
    topic: "Road Safety",
    category: "safety",
    description: "Road safety rules exist to protect us from accidents. Always follow traffic signals.",
    question: "Which child is following safety rules properly?",
    optionA: { 
      imageUrl: "/assets/image.png",
      isCorrect: false 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_04_58 PM.png",
      isCorrect: true 
    },
    feedbackCorrect: "Yes! Always use a zebra crossing and wait for the green walking signal.",
    feedbackIncorrect: "Crossing the road randomly through traffic is very dangerous!",
    xpReward: 50,
    difficulty: "Easy",
    ageRange: "all"
  },
  {
    id: "img_decision_5",
    topic: "Disaster Preparedness",
    category: "safety",
    description: "Knowing what to do during an earthquake can save your life.",
    question: "Which image shows the correct action during an earthquake?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_11_17 PM.png",
      isCorrect: false 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_10_25 PM.png",
      isCorrect: true 
    },
    feedbackCorrect: "Drop, Cover, and Hold on! Hiding under a sturdy table protects you from falling objects.",
    feedbackIncorrect: "Standing near tall furniture like a bookshelf during an earthquake is very dangerous.",
    xpReward: 50,
    difficulty: "Medium",
    ageRange: "all"
  },
  {
    id: "img_decision_6",
    topic: "Consumer Rights",
    category: "child_rights",
    description: "As consumers, we have the right to know about the quality, quantity, and expiry date of products we buy.",
    question: "Which image shows someone being a smart and safe consumer?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_15_24 PM.png",
      isCorrect: true 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_16_04 PM.png",
      isCorrect: false 
    },
    feedbackCorrect: "Correct! Always check the expiry date and labels on food items before buying.",
    feedbackIncorrect: "Buying unlabelled or expired items can be harmful. You have a right to information about products.",
    legalFact: "The Consumer Protection Act guarantees the right to be informed about the quality and purity of goods.",
    xpReward: 50,
    difficulty: "Medium",
    ageRange: "all"
  },
  {
    id: "img_decision_7",
    topic: "Civic Duties",
    category: "environment",
    description: "Along with rights, we have duties to keep our environment clean and safe.",
    question: "Which action respects our environment and civic duties?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_19_11 PM.png",
      isCorrect: true 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_19_17 PM.png",
      isCorrect: false 
    },
    feedbackCorrect: "Excellent! Throwing trash in the bin keeps our surroundings clean for everyone.",
    feedbackIncorrect: "Littering harms the environment and makes public spaces dirty.",
    xpReward: 50,
    difficulty: "Easy",
    ageRange: "all"
  },
  {
    id: "img_decision_8",
    topic: "Emotional Well-being",
    category: "health",
    description: "Your feelings are important. If someone or something makes you feel uncomfortable, you should speak up.",
    question: "What should you do if you feel worried or unsafe?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_21_35 PM.png",
      isCorrect: true 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_22_41 PM.png",
      isCorrect: false 
    },
    feedbackCorrect: "Right! Always talk to a trusted adult if you feel worried, sad, or unsafe.",
    feedbackIncorrect: "Don't keep your worries a secret, especially if you feel someone is following you.",
    xpReward: 50,
    difficulty: "Hard",
    ageRange: "all"
  },
  {
    id: "img_decision_9",
    topic: "Fire Safety",
    category: "safety",
    description: "Fire can be very dangerous. Children should never play with matches or the stove.",
    question: "Which image shows a safe approach to fire?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_27_12 PM.png",
      isCorrect: false 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_25_23 PM.png",
      isCorrect: true 
    },
    feedbackCorrect: "Yes! Always ask an adult for help when dealing with fire or a stove.",
    feedbackIncorrect: "Playing with matches or turning on the stove alone is extremely dangerous!",
    xpReward: 50,
    difficulty: "Easy",
    ageRange: "all"
  },
  {
    id: "img_decision_10",
    topic: "Online Privacy",
    category: "cyber_safety",
    description: "The internet can be tricky. We must protect our privacy and think before we share.",
    question: "What is the safest way to post things online?",
    optionA: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_32_43 PM.png",
      isCorrect: false 
    },
    optionB: { 
      imageUrl: "/assets/ChatGPT Image Aug 12, 2026, 12_30_15 PM.png",
      isCorrect: true 
    },
    feedbackCorrect: "Perfect! It's always best to ask a parent before sharing photos or personal details online.",
    feedbackIncorrect: "Posting personal photos without an adult's permission can compromise your online privacy and safety.",
    legalFact: "Children's online privacy is protected by laws, but it's important to be careful about your digital footprint.",
    xpReward: 50,
    difficulty: "Medium",
    ageRange: "all"
  }
];
