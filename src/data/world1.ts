import type { Module, Scene } from '../types';

export const createChoiceScene = (
  text: string, scenario: string, options: { text: string; isCorrect: boolean; feedback: string }[], 
  educationalTip: string, legalInfo: string
): Omit<Scene, 'id' | 'moduleId'> => ({
  type: 'choice', text, scenario, mediaUrl: null,
  choices: options.map(o => ({ text: o.text, isCorrect: o.isCorrect, feedbackText: o.feedback, nextSceneId: null })),
  educationalTip, relatedLegalInfo: legalInfo,
});

export const createSpotDangerScene = (
  text: string, scenario: string, dangerZones: { id: string; x: number; y: number; radius: number; description: string }[],
  educationalTip: string, legalInfo: string
): Omit<Scene, 'id' | 'moduleId'> => {
  const dangerDesc = dangerZones[0]?.description || "The hidden danger";
  return {
    type: 'choice', text: `Analyze the situation: ${text}`, scenario, mediaUrl: null,
    choices: [
      { text: dangerDesc, isCorrect: true, feedbackText: "Exactly! You identified the core issue.", nextSceneId: null },
      { text: "Everything seems safe", isCorrect: false, feedbackText: "Look closer! There is a hidden danger here.", nextSceneId: null },
      { text: "No immediate threat", isCorrect: false, feedbackText: "That's incorrect. There is a risk present.", nextSceneId: null },
      { text: "Ignore the situation", isCorrect: false, feedbackText: "Never ignore potential dangers.", nextSceneId: null }
    ],
    educationalTip, relatedLegalInfo: legalInfo,
  };
};

export const createOrderScene = (
  text: string, scenario: string, sequence: { id: string; text: string; correctOrder: number }[],
  educationalTip: string, legalInfo: string
): Omit<Scene, 'id' | 'moduleId'> => ({
  type: 'order_sequence', text, scenario, mediaUrl: null, choices: [],
  sequenceItems: sequence, educationalTip, relatedLegalInfo: legalInfo,
});

export const world1Modules: Omit<Module, 'id'>[] = [
  { title: "Child Rights Basics", description: "What are child rights?", category: "Child Rights", difficulty: "Easy", estimatedMinutes: 5, ageRange: "all", order: 1, xpReward: 100, coinReward: 10, coverImageUrl: "", prerequisiteModuleId: null },
  { title: "Right to Education", description: "Why school is important.", category: "Education", difficulty: "Easy", estimatedMinutes: 5, ageRange: "all", order: 2, xpReward: 120, coinReward: 15, coverImageUrl: "", prerequisiteModuleId: "W1_L1" },
  { title: "Right to Food & Health", description: "Healthy food and medicine.", category: "Health", difficulty: "Easy", estimatedMinutes: 6, ageRange: "all", order: 3, xpReward: 130, coinReward: 15, coverImageUrl: "", prerequisiteModuleId: "W1_L2" },
  { title: "Safe Boundaries", description: "Good touch, bad touch.", category: "Safety", difficulty: "Medium", estimatedMinutes: 8, ageRange: "all", order: 4, xpReward: 150, coinReward: 20, coverImageUrl: "", prerequisiteModuleId: "W1_L3" },
  { title: "Stand Up to Bullying", description: "Stop bullying in school.", category: "Wellbeing", difficulty: "Medium", estimatedMinutes: 8, ageRange: "all", order: 5, xpReward: 160, coinReward: 20, coverImageUrl: "", prerequisiteModuleId: "W1_L4" },
  { title: "Stranger Danger", description: "Staying safe with strangers.", category: "Safety", difficulty: "Medium", estimatedMinutes: 7, ageRange: "all", order: 6, xpReward: 170, coinReward: 25, coverImageUrl: "", prerequisiteModuleId: "W1_L5" },
  { title: "School Safety", description: "Rules to keep safe at school.", category: "Safety", difficulty: "Easy", estimatedMinutes: 5, ageRange: "all", order: 7, xpReward: 140, coinReward: 15, coverImageUrl: "", prerequisiteModuleId: "W1_L6" },
  { title: "Emergency Numbers", description: "Numbers to call for help.", category: "Emergency", difficulty: "Medium", estimatedMinutes: 6, ageRange: "all", order: 8, xpReward: 180, coinReward: 25, coverImageUrl: "", prerequisiteModuleId: "W1_L7" },
  { title: "Protect Your Info", description: "Why you shouldn't share secrets.", category: "Privacy", difficulty: "Medium", estimatedMinutes: 7, ageRange: "all", order: 9, xpReward: 190, coinReward: 25, coverImageUrl: "", prerequisiteModuleId: "W1_L8" },
  { title: "World 1 Boss: The Rights Guardian", description: "Test your knowledge!", category: "Boss", difficulty: "Boss", estimatedMinutes: 12, ageRange: "all", order: 10, xpReward: 300, coinReward: 50, coverImageUrl: "", prerequisiteModuleId: "W1_L9", isBoss: true }
];

export const world1Scenes: Record<number, Omit<Scene, 'id' | 'moduleId'>[]> = {
  1: [
    createChoiceScene("What are Child Rights?", "You hear your teacher talking about 'Child Rights'.", [{ text: "Basic freedoms for every child.", isCorrect: true, feedback: "Correct!" }, { text: "Rules made by parents.", isCorrect: false, feedback: "Incorrect." }], "Rights protect you.", "UNCRC"),
    createChoiceScene("Right to Play", "Is playing a right?", [{ text: "Yes", isCorrect: true, feedback: "Play helps you grow." }, { text: "No", isCorrect: false, feedback: "You have a right to rest." }], "Rest is vital.", "Article 31"),
    createChoiceScene("Who protects your rights?", "Who should you talk to if your rights are denied?", [{ text: "Trusted Adult", isCorrect: true, feedback: "Yes!" }, { text: "Stranger", isCorrect: false, feedback: "Never." }], "Find a trusted adult.", "State Duty"),
    createChoiceScene("Equality", "Do all children have the same rights?", [{ text: "Yes, everywhere.", isCorrect: true, feedback: "Universal rights." }, { text: "No", isCorrect: false, feedback: "Rights are equal." }], "Treat everyone equally.", "Article 2"),
    createChoiceScene("Expression", "Can you express your views?", [{ text: "Yes, respectfully.", isCorrect: true, feedback: "Your voice matters." }, { text: "No", isCorrect: false, feedback: "Outdated." }], "Speak up politely.", "Article 12")
  ],
  2: [
    createChoiceScene("Going to School", "Your parents say you can't go to school.", [{ text: "Every child has a right to education.", isCorrect: true, feedback: "Correct." }, { text: "Okay, I'll work instead.", isCorrect: false, feedback: "Child labor is illegal." }], "Education is free and compulsory.", "RTE Act 2009"),
    createOrderScene("Morning Routine", "Order the steps to get ready for school.", [{ id: "1", text: "Wake up", correctOrder: 1 }, { id: "2", text: "Brush teeth", correctOrder: 2 }, { id: "3", text: "Go to school", correctOrder: 3 }], "Be punctual.", "RTE"),
    createChoiceScene("Boys vs Girls", "Should only boys study?", [{ text: "No, girls and boys have equal rights.", isCorrect: true, feedback: "Equality!" }, { text: "Yes", isCorrect: false, feedback: "Discrimination is wrong." }], "Education is for all genders.", "Article 14"),
    createChoiceScene("Homework", "Is getting a safe place to study a right?", [{ text: "Yes", isCorrect: true, feedback: "A conducive environment helps." }, { text: "No", isCorrect: false, feedback: "Environment matters." }], "Find a quiet place.", "UNCRC"),
    createChoiceScene("School Fees", "Can government schools charge fees for elementary education?", [{ text: "No, it's free.", isCorrect: true, feedback: "Free and compulsory." }, { text: "Yes", isCorrect: false, feedback: "Illegal." }], "Free education up to 14.", "RTE Act 2009")
  ],
  3: [
    createChoiceScene("Healthy Food", "What is the right to food?", [{ text: "Getting nutritious food daily.", isCorrect: true, feedback: "Yes, nutrition is key." }, { text: "Eating junk food all day.", isCorrect: false, feedback: "That hurts your health." }], "Eat vegetables and fruits.", "Article 24"),
    createChoiceScene("Mid-day Meals", "Why do schools give mid-day meals?", [{ text: "To ensure children get nutrition.", isCorrect: true, feedback: "Correct." }, { text: "To waste time.", isCorrect: false, feedback: "Incorrect." }], "Mid-day meal scheme helps millions.", "National Food Security Act"),
    createChoiceScene("Clean Water", "Is clean drinking water a right?", [{ text: "Yes, safe water is a fundamental right.", isCorrect: true, feedback: "Water is life." }, { text: "No", isCorrect: false, feedback: "Unsafe water causes diseases." }], "Boil or filter water.", "Article 21"),
    createSpotDangerScene("Find the Unsafe Food", "Click on the food that might make you sick.", [{ id: "fly", x: 50, y: 50, radius: 20, description: "Uncovered food with flies." }], "Never eat uncovered street food.", "Health regulations"),
    createChoiceScene("Medical Help", "If you fall sick, what right do you have?", [{ text: "Right to medical care.", isCorrect: true, feedback: "Yes, doctors must treat you." }, { text: "No right", isCorrect: false, feedback: "Health is a right." }], "Don't ignore illnesses.", "Article 24")
  ],
  4: [
    createChoiceScene("Safe Boundaries", "What is a 'safe touch'?", [{ text: "A hug from parents, high-five with friends.", isCorrect: true, feedback: "Correct." }, { text: "A touch that makes you uncomfortable.", isCorrect: false, feedback: "That's unsafe." }], "Trust your feelings.", "POCSO Act"),
    createChoiceScene("Saying NO", "If someone touches you and it feels wrong, what do you do?", [{ text: "Yell NO and run to a safe adult.", isCorrect: true, feedback: "Always say NO." }, { text: "Keep quiet.", isCorrect: false, feedback: "Never keep it a secret." }], "Your body belongs to you.", "POCSO Act"),
    createChoiceScene("The Bathing Suit Rule", "What parts are private?", [{ text: "Parts covered by a bathing suit.", isCorrect: true, feedback: "Correct." }, { text: "Hands and feet.", isCorrect: false, feedback: "Incorrect." }], "No one should touch your private parts.", "POCSO Act"),
    createChoiceScene("Secrets", "An adult tells you to keep a 'special secret'.", [{ text: "Never keep secrets about touches.", isCorrect: true, feedback: "Tell a trusted adult." }, { text: "Keep the secret.", isCorrect: false, feedback: "Bad secrets are dangerous." }], "Differentiate good surprises and bad secrets.", "Child Safety Guidelines"),
    createOrderScene("Action Plan", "What to do if you face bad touch?", [{ id: "1", text: "Shout NO", correctOrder: 1 }, { id: "2", text: "Run away", correctOrder: 2 }, { id: "3", text: "Tell a trusted adult", correctOrder: 3 }], "Act quickly and loudly.", "POCSO")
  ],
  5: [
    createChoiceScene("What is Bullying?", "A kid keeps calling you names every day.", [{ text: "That is bullying.", isCorrect: true, feedback: "Repeated mean behavior is bullying." }, { text: "Just a joke.", isCorrect: false, feedback: "If it hurts, it's not a joke." }], "Bullying is never okay.", "Anti-bullying laws"),
    createChoiceScene("Bystander", "You see someone being bullied. What should you do?", [{ text: "Tell a teacher immediately.", isCorrect: true, feedback: "Be an upstander!" }, { text: "Laugh along.", isCorrect: false, feedback: "That makes you a bully too." }], "Don't be a silent spectator.", "School Guidelines"),
    createChoiceScene("Cyberbullying", "Someone posts a mean comment on your photo.", [{ text: "Block them and show your parents.", isCorrect: true, feedback: "Don't reply." }, { text: "Insult them back.", isCorrect: false, feedback: "That escalates the problem." }], "Digital respect is important.", "IT Act"),
    createSpotDangerScene("Spot the Bully", "Click the action that is bullying.", [{ id: "push", x: 70, y: 40, radius: 15, description: "A bigger kid pushing a smaller kid." }], "Physical harm is bullying.", "IPC"),
    createChoiceScene("Getting Help", "Are you weak if you report a bully?", [{ text: "No, reporting takes courage.", isCorrect: true, feedback: "You are strong." }, { text: "Yes", isCorrect: false, feedback: "Never feel ashamed." }], "Teachers are there to help.", "CBSE Anti-Bullying")
  ],
  6: [
    createChoiceScene("Stranger Offers Candy", "A stranger in a car offers you a chocolate.", [{ text: "Say no and run in the opposite direction.", isCorrect: true, feedback: "Never take things from strangers." }, { text: "Take it politely.", isCorrect: false, feedback: "Danger!" }], "Strangers can be dangerous.", "Child Protection"),
    createChoiceScene("Lost in a Mall", "You lose your parents in a crowd.", [{ text: "Go to a uniform guard or store counter.", isCorrect: true, feedback: "Find a safe stranger." }, { text: "Wander outside.", isCorrect: false, feedback: "Stay inside where there are cameras." }], "Know who a 'safe stranger' is.", "Safety rules"),
    createChoiceScene("Internet Strangers", "Someone online asks where you live.", [{ text: "Do not tell them and inform parents.", isCorrect: true, feedback: "Online friends are strangers." }, { text: "Give them the address.", isCorrect: false, feedback: "Huge risk." }], "Never share addresses online.", "Cyber Safety"),
    createChoiceScene("Opening the Door", "You are home alone and the doorbell rings.", [{ text: "Do not open the door.", isCorrect: true, feedback: "Keep doors locked." }, { text: "Open it to see who it is.", isCorrect: false, feedback: "Unsafe." }], "Look through peepholes if you have them.", "Home Safety"),
    createOrderScene("Stranger Approach", "A stranger grabs your arm. Order your actions:", [{ id: "1", text: "Yell 'I don't know you!'", correctOrder: 1 }, { id: "2", text: "Pull away hard", correctOrder: 2 }, { id: "3", text: "Run to a crowd", correctOrder: 3 }], "Make a scene to attract attention.", "Self Defence")
  ],
  7: [
    createChoiceScene("Stairs Safety", "How should you walk on the stairs?", [{ text: "Walk slowly, use the handrail.", isCorrect: true, feedback: "Safe." }, { text: "Run and push friends.", isCorrect: false, feedback: "You could cause a bad fall." }], "Stairs are dangerous if misused.", "School Rules"),
    createSpotDangerScene("Lab Safety", "Find the danger in the science lab.", [{ id: "spill", x: 30, y: 80, radius: 15, description: "Spilled chemical on the floor." }], "Report spills immediately.", "Lab Safety"),
    createChoiceScene("Fire Drill", "The fire alarm rings. What do you do?", [{ text: "Leave everything, line up quietly, and exit.", isCorrect: true, feedback: "Follow instructions." }, { text: "Hide under the desk.", isCorrect: false, feedback: "Only for earthquakes." }], "Don't panic during drills.", "Fire Safety"),
    createChoiceScene("Playground", "Someone is swinging very high.", [{ text: "Stay away from the swing path.", isCorrect: true, feedback: "Keep a safe distance." }, { text: "Walk right in front of them.", isCorrect: false, feedback: "You will get hit." }], "Awareness prevents injuries.", "Playground Rules"),
    createChoiceScene("Heavy Bags", "Your school bag is too heavy.", [{ text: "Pack only what you need according to timetable.", isCorrect: true, feedback: "Protects your back." }, { text: "Carry everything everyday.", isCorrect: false, feedback: "Bad for spine." }], "Max bag weight is 10% of body weight.", "Education Guidelines")
  ],
  8: [
    createChoiceScene("Police Number", "What number do you dial for Police in India?", [{ text: "112 or 100", isCorrect: true, feedback: "Correct! 112 is the National Emergency Number." }, { text: "1098", isCorrect: false, feedback: "That's Childline." }], "112 works even without a SIM card.", "Emergency Services"),
    createChoiceScene("Childline", "You see a child in distress on the street. Who do you call?", [{ text: "1098 (Childline)", isCorrect: true, feedback: "They help children in trouble." }, { text: "101", isCorrect: false, feedback: "101 is for Fire." }], "1098 is a 24/7 free service.", "Childline India"),
    createChoiceScene("Fire Brigade", "You see a fire breaking out. Number?", [{ text: "101 or 112", isCorrect: true, feedback: "Correct." }, { text: "108", isCorrect: false, feedback: "108 is Ambulance." }], "Give exact address when calling.", "Fire Services"),
    createChoiceScene("Ambulance", "Someone is badly injured and needs a hospital.", [{ text: "108 or 112", isCorrect: true, feedback: "Correct." }, { text: "100", isCorrect: false, feedback: "100 is Police." }], "108 provides emergency medical transport.", "Health Services"),
    createChoiceScene("Prank Calls", "Is it okay to call 112 for fun?", [{ text: "No, it's illegal and wastes time.", isCorrect: true, feedback: "Never prank call emergencies." }, { text: "Yes, just a joke.", isCorrect: false, feedback: "Someone else might die waiting." }], "Emergency lines must be kept free.", "Telecom Laws")
  ],
  9: [
    createChoiceScene("What is PII?", "Which of these is Personal Identifiable Information?", [{ text: "Your full name, school name, and address.", isCorrect: true, feedback: "Correct." }, { text: "Your favorite color.", isCorrect: false, feedback: "Color isn't PII." }], "Keep PII private.", "Privacy Laws"),
    createChoiceScene("Sharing Passwords", "Your best friend asks for your email password.", [{ text: "Never share passwords, even with friends.", isCorrect: true, feedback: "Keep it secret." }, { text: "Give it, they are a friend.", isCorrect: false, feedback: "Friendships change, keep data secure." }], "Only parents should know your passwords.", "Cyber Safety"),
    createChoiceScene("Social Media Photos", "You are posting a photo in your school uniform.", [{ text: "Don't post it; it reveals your school location.", isCorrect: true, feedback: "Smart move." }, { text: "Post it, it looks cool.", isCorrect: false, feedback: "Strangers can find your school." }], "Blur logos on uniforms.", "Digital Footprint"),
    createSpotDangerScene("Find the Leak", "Find the privacy leak in the room.", [{ id: "diary", x: 40, y: 60, radius: 10, description: "A diary left open with phone numbers." }], "Protect physical info too.", "Privacy"),
    createChoiceScene("Public Wi-Fi", "Should you log into your bank or email on a free cafe Wi-Fi?", [{ text: "No, hackers can steal your info.", isCorrect: true, feedback: "Use mobile data instead." }, { text: "Yes, it's free.", isCorrect: false, feedback: "Free networks are insecure." }], "Avoid sensitive tasks on public Wi-Fi.", "Cyber Security")
  ],
  10: [
    createChoiceScene("Boss Question 1", "To claim the Guardian Trophy, answer this: What does 1098 do?", [{ text: "Helps children in distress.", isCorrect: true, feedback: "Yes!" }, { text: "Orders pizza.", isCorrect: false, feedback: "No." }], "Childline 1098.", "Childline"),
    createChoiceScene("Boss Question 2", "Which right ensures you are treated equally?", [{ text: "Right against discrimination.", isCorrect: true, feedback: "Yes!" }, { text: "Right to play.", isCorrect: false, feedback: "No." }], "Article 2", "UNCRC"),
    createChoiceScene("Boss Question 3", "If a touch feels wrong...", [{ text: "Say NO, Run, Tell.", isCorrect: true, feedback: "Yes!" }, { text: "Keep quiet.", isCorrect: false, feedback: "No." }], "POCSO", "POCSO Act"),
    createChoiceScene("Boss Question 4", "Who is a safe stranger?", [{ text: "A police officer or store clerk.", isCorrect: true, feedback: "Yes!" }, { text: "Anyone who smiles.", isCorrect: false, feedback: "No." }], "Uniforms help identify safe strangers.", "Safety"),
    createChoiceScene("Boss Question 5", "Is bullying a crime?", [{ text: "Yes, serious bullying has legal consequences.", isCorrect: true, feedback: "Yes!" }, { text: "No, just a joke.", isCorrect: false, feedback: "No." }], "Report bullying.", "Law")
  ]
};
