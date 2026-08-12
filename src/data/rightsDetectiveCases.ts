import type { DetectiveCase } from '../types';

export const RIGHTS_DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: 'case_01',
    title: 'The Cyber Bully Mystery',
    category: 'Cyberbullying',
    difficulty: 'Easy',
    description: 'Someone is leaving mean comments on Mia\'s photos. Can you help figure out what to do?',
    storyScenes: [
      { text: 'Mia loves sharing her drawings online.' },
      { text: 'But today, she received some very mean comments from an unknown user.' },
      { text: 'She feels sad and scared. Detective, we need your help!' }
    ],
    investigationText: 'Search Mia\'s tablet for clues about the cyberbully.',
    clues: [
      { id: 'c1', label: 'Mean Comment', description: '"Your drawings are ugly!" - Unknown User', icon: 'speaker_notes_off', isRelevant: true },
      { id: 'c2', label: 'Cute Dog Video', description: 'A funny video of a dog.', icon: 'pets', isRelevant: false },
      { id: 'c3', label: 'Block Button', description: 'A button to block mean users.', icon: 'block', isRelevant: true },
      { id: 'c4', label: 'Report Button', description: 'A button to report bullying to the app.', icon: 'flag', isRelevant: true }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'Which actions are safe and which are unsafe when dealing with a cyberbully?',
        hint: 'Think about what would protect Mia and what would make things worse.',
        actions: [
          { id: 'a1', label: 'Reply with mean words', isSafe: false, consequenceFeedback: 'Replying makes the bully want to continue and might get you in trouble too.' },
          { id: 'a2', label: 'Block the user', isSafe: true, consequenceFeedback: 'Great job! Blocking stops them from sending more messages.' },
          { id: 'a3', label: 'Tell a trusted adult', isSafe: true, consequenceFeedback: 'Perfect! Adults can help you report the user and feel safe.' },
          { id: 'a4', label: 'Keep it a secret', isSafe: false, consequenceFeedback: 'Keeping it a secret makes you feel worse. Always tell an adult.' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'What are the correct steps to handle a cyberbully?',
        hint: 'Don\'t delete the evidence before showing it to someone!',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Take a screenshot of the mean messages', isSafe: true, consequenceFeedback: 'Good! You need evidence.' },
          { id: 'seq2', label: 'Show the screenshot to a trusted adult', isSafe: true, consequenceFeedback: 'Right! Adults know how to help.' },
          { id: 'seq3', label: 'Block and Report the bully', isSafe: true, consequenceFeedback: 'Yes! This stops them from bothering you again.' }
        ]
      }
    ],
    learningPoint: 'If someone is mean online, remember to STOP, SCREENSHOT, BLOCK, and TELL an adult.',
    xpReward: 150,
    badgeId: 'badge_detective_1',
    nextCaseId: 'case_02'
  },
  {
    id: 'case_02',
    title: 'The Missing Privacy',
    category: 'Digital Privacy',
    difficulty: 'Easy',
    description: 'Leo is setting up a new gaming profile. Help him choose what information is safe to share.',
    storyScenes: [
      { text: 'Leo just downloaded a super cool new game!' },
      { text: 'It asks him to create a profile to play with friends.' },
      { text: 'But it asks for a lot of information. What should he share?' }
    ],
    investigationText: 'Look at the profile form and find the unsafe fields.',
    clues: [
      { id: 'c1', label: 'Full Name', description: 'Leo wants to use "Leo Smith".', icon: 'person', isRelevant: true },
      { id: 'c2', label: 'Cool Nickname', description: 'Leo likes "DragonSlayer99".', icon: 'smart_toy', isRelevant: true },
      { id: 'c3', label: 'Home Address', description: 'The game asks where he lives.', icon: 'location_on', isRelevant: true },
      { id: 'c4', label: 'Favorite Color', description: 'Blue!', icon: 'palette', isRelevant: false }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'Sort the information into "Safe to Share" and "Keep Private".',
        hint: 'Never share information that could let a stranger find you in real life.',
        actions: [
          { id: 'a1', label: 'Your real full name', isSafe: false, consequenceFeedback: 'Strangers can use your real name to find out more about you.' },
          { id: 'a2', label: 'A made-up nickname', isSafe: true, consequenceFeedback: 'Nicknames are fun and safe!' },
          { id: 'a3', label: 'Your home address', isSafe: false, consequenceFeedback: 'Never tell strangers where you live.' },
          { id: 'a4', label: 'Your favorite game', isSafe: true, consequenceFeedback: 'It\'s okay to share your hobbies!' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'What is the safest way to set up a new profile?',
        hint: 'Think about protecting your real identity first.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Think of a cool, made-up nickname', isSafe: true, consequenceFeedback: 'Perfect!' },
          { id: 'seq2', label: 'Skip the real address and phone fields', isSafe: true, consequenceFeedback: 'Smart move!' },
          { id: 'seq3', label: 'Start playing safely', isSafe: true, consequenceFeedback: 'Have fun!' }
        ]
      }
    ],
    learningPoint: 'Keep personal information like your full name, address, and phone number private online.',
    xpReward: 150,
    nextCaseId: 'case_03'
  },
  {
    id: 'case_03',
    title: 'The Fake Giveaway',
    category: 'Misinformation',
    difficulty: 'Medium',
    description: 'Sam sees a pop-up claiming he won a free smartphone. Is it real?',
    storyScenes: [
      { text: 'Sam is browsing a website to find cheat codes for his game.' },
      { text: 'Suddenly, a bright flashing pop-up appears: "YOU WON A FREE PHONE!"' },
      { text: 'It says he just needs to enter his parents\' credit card for shipping. What should he do?' }
    ],
    investigationText: 'Find the suspicious clues on the pop-up ad.',
    clues: [
      { id: 'c1', label: 'Flashing Text', description: 'Flashing text is often used to grab your attention quickly.', icon: 'warning', isRelevant: true },
      { id: 'c2', label: 'Credit Card Request', description: 'Asking for payment info for a "free" prize.', icon: 'credit_card', isRelevant: true },
      { id: 'c3', label: 'Countdown Timer', description: 'A timer making you feel rushed to decide.', icon: 'timer', isRelevant: true },
      { id: 'c4', label: 'Close Button', description: 'An X to close the ad.', icon: 'close', isRelevant: false }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'Is this ad Safe or Unsafe?',
        hint: 'If it asks for money for a free prize, it\'s a scam.',
        actions: [
          { id: 'a1', label: 'Enter credit card info', isSafe: false, consequenceFeedback: 'Scammers will steal the money if you give them payment info!' },
          { id: 'a2', label: 'Click the Close (X) button', isSafe: true, consequenceFeedback: 'Good job! Closing suspicious ads keeps you safe.' },
          { id: 'a3', label: 'Show an adult', isSafe: true, consequenceFeedback: 'Adults can help you figure out if something is a scam.' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'What steps should you take if you see a scam pop-up?',
        hint: 'Don\'t click on the ad, handle it safely.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Stop and do not click any links', isSafe: true, consequenceFeedback: 'Good.' },
          { id: 'seq2', label: 'Find the X or close the tab', isSafe: true, consequenceFeedback: 'Great!' },
          { id: 'seq3', label: 'Tell an adult about the pop-up', isSafe: true, consequenceFeedback: 'Excellent.' }
        ]
      }
    ],
    learningPoint: 'If something online looks too good to be true, it probably is a scam. Never share payment information.',
    xpReward: 200,
    nextCaseId: 'case_04'
  },
  {
    id: 'case_04',
    title: 'The Midnight Gamer',
    category: 'Digital Wellbeing',
    difficulty: 'Easy',
    description: 'Emma is staying up very late playing games and feels exhausted at school.',
    storyScenes: [
      { text: 'Emma loves playing "Galaxy Explorers". She wants to reach the highest level.' },
      { text: 'She plays under her blanket until 2:00 AM!' },
      { text: 'The next day at school, she is too tired to play with her friends.' }
    ],
    investigationText: 'Look around Emma\'s room and find why she might be so tired.',
    clues: [
      { id: 'c1', label: 'Alarm Clock', description: 'The clock shows 2:00 AM.', icon: 'schedule', isRelevant: true },
      { id: 'c2', label: 'Energy Drink', description: 'An empty can of sugary energy drink.', icon: 'local_cafe', isRelevant: true },
      { id: 'c3', label: 'Math Homework', description: 'Homework that is half-finished.', icon: 'menu_book', isRelevant: false },
      { id: 'c4', label: 'Glowing Tablet', description: 'The tablet is still on and bright.', icon: 'tablet_mac', isRelevant: true }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sequence',
        question: 'Help Emma build a healthy bedtime routine.',
        hint: 'Screens should be turned off before getting into bed.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Turn off the tablet 1 hour before bed', isSafe: true, consequenceFeedback: 'Great! This helps your brain relax.' },
          { id: 'seq2', label: 'Read a book or listen to calm music', isSafe: true, consequenceFeedback: 'Perfect for winding down.' },
          { id: 'seq3', label: 'Go to sleep on time', isSafe: true, consequenceFeedback: 'Good sleep gives you energy for the next day!' }
        ]
      },
      {
        id: 'p2',
        type: 'sort',
        question: 'Sort these evening activities into Healthy and Unhealthy.',
        hint: 'Avoid screens right before sleep.',
        actions: [
          { id: 'a1', label: 'Playing fast action games', isSafe: false, consequenceFeedback: 'Too stimulating!' },
          { id: 'a2', label: 'Reading a physical book', isSafe: true, consequenceFeedback: 'Very relaxing.' },
          { id: 'a3', label: 'Drinking sugary energy drinks', isSafe: false, consequenceFeedback: 'Sugar keeps you awake.' },
          { id: 'a4', label: 'Listening to calm music', isSafe: true, consequenceFeedback: 'Great choice.' }
        ]
      }
    ],
    learningPoint: 'Balancing screen time with sleep and real-world play is essential for your health and happiness.',
    xpReward: 150,
    nextCaseId: 'case_05'
  },
  {
    id: 'case_05',
    title: 'The "Friendly" Stranger',
    category: 'Online Safety',
    difficulty: 'Medium',
    description: 'A player in a game is asking for Alex\'s real photo and school name.',
    storyScenes: [
      { text: 'Alex is playing a multiplayer racing game.' },
      { text: 'Another player named "SpeedKing" starts chatting with him.' },
      { text: 'SpeedKing seems nice, but starts asking personal questions.' }
    ],
    investigationText: 'Read the chat logs and find the unsafe messages.',
    clues: [
      { id: 'c1', label: '"Where do you go to school?"', description: 'Asking for physical location.', icon: 'school', isRelevant: true },
      { id: 'c2', label: '"Send a selfie!"', description: 'Asking for personal photos.', icon: 'photo_camera', isRelevant: true },
      { id: 'c3', label: '"Good race!"', description: 'A friendly game message.', icon: 'sports_score', isRelevant: false },
      { id: 'c4', label: '"I\'ll give you free coins if you tell me"', description: 'Bribing for personal info.', icon: 'monetization_on', isRelevant: true }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'How should Alex react to SpeedKing?',
        hint: 'Remember that you don\'t actually know who SpeedKing is in real life.',
        actions: [
          { id: 'a1', label: 'Tell him the school name', isSafe: false, consequenceFeedback: 'Never share your real-life location with online strangers.' },
          { id: 'a2', label: 'Say "No, I don\'t share that"', isSafe: true, consequenceFeedback: 'Good job setting boundaries!' },
          { id: 'a3', label: 'Block the player', isSafe: true, consequenceFeedback: 'If a stranger makes you uncomfortable, blocking them is very safe.' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'How to handle a stranger asking for personal info?',
        hint: 'Say no, block, and report.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Refuse to share the information', isSafe: true, consequenceFeedback: 'Good.' },
          { id: 'seq2', label: 'Block the player in the game', isSafe: true, consequenceFeedback: 'Great.' },
          { id: 'seq3', label: 'Tell an adult about what happened', isSafe: true, consequenceFeedback: 'Excellent.' }
        ]
      }
    ],
    learningPoint: 'People online might not be who they say they are. Never share personal photos or locations with strangers.',
    xpReward: 200,
    nextCaseId: 'case_06'
  },
  {
    id: 'case_06',
    title: 'The Password Puzzle',
    category: 'Security',
    difficulty: 'Hard',
    description: 'Maya\'s account got hacked because her password was too easy.',
    storyScenes: [
      { text: 'Maya tried to log into her favorite pet simulator, but her password didn\'t work!' },
      { text: 'Someone logged in and traded away all her rare pets.' },
      { text: 'How did the hacker guess her password so easily?' }
    ],
    investigationText: 'Find clues around Maya\'s desk that show why her password was weak.',
    clues: [
      { id: 'c1', label: 'Sticky Note', description: 'A note on the monitor says "Password: password123".', icon: 'edit_note', isRelevant: true },
      { id: 'c2', label: 'Dog\'s Collar', description: 'Her dog\'s name is "Buddy".', icon: 'pets', isRelevant: true },
      { id: 'c3', label: 'Calendar', description: 'Her birthday is circled in red.', icon: 'calendar_month', isRelevant: true },
      { id: 'c4', label: 'Math Book', description: 'A textbook for school.', icon: 'menu_book', isRelevant: false }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'Which passwords are strong, and which are weak?',
        hint: 'Strong passwords are long and use a mix of letters, numbers, and symbols.',
        actions: [
          { id: 'a1', label: 'Buddy2015', isSafe: false, consequenceFeedback: 'Using a pet\'s name and birth year is too easy to guess!' },
          { id: 'a2', label: 'password123', isSafe: false, consequenceFeedback: 'This is one of the most common and weakest passwords.' },
          { id: 'a3', label: 'B!ue$kies88', isSafe: true, consequenceFeedback: 'Great! It has upper/lowercase, numbers, and symbols.' },
          { id: 'a4', label: '12345678', isSafe: false, consequenceFeedback: 'Anyone could guess this sequence.' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'How do you set up a strong, safe password?',
        hint: 'Create it, memorize it, secure it.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Think of a unique mix of words and symbols', isSafe: true, consequenceFeedback: 'Good.' },
          { id: 'seq2', label: 'Memorize it or use a password manager', isSafe: true, consequenceFeedback: 'Great.' },
          { id: 'seq3', label: 'Throw away any sticky notes with the password', isSafe: true, consequenceFeedback: 'Excellent.' }
        ]
      }
    ],
    learningPoint: 'Create strong passwords using a mix of letters, numbers, and symbols. Keep them secret, and don\'t write them on sticky notes!',
    xpReward: 250,
    nextCaseId: 'case_07'
  },
  {
    id: 'case_07',
    title: 'The Accidental Purchase',
    category: 'In-App Purchases',
    difficulty: 'Medium',
    description: 'Jake clicked a button and accidentally spent real money on virtual gems.',
    storyScenes: [
      { text: 'Jake was playing a free game on his dad\'s phone.' },
      { text: 'He wanted a shiny new sword for his character.' },
      { text: 'He clicked a shiny green button, and suddenly the sword was his, but his dad got a bill!' }
    ],
    investigationText: 'Analyze the game store screen to find the trap.',
    clues: [
      { id: 'c1', label: 'Shiny Button', description: 'A massive button saying "GET 1000 GEMS NOW!".', icon: 'ads_click', isRelevant: true },
      { id: 'c2', label: 'Tiny Text', description: 'Very small text reading "$99.99 will be charged".', icon: 'text_fields', isRelevant: true },
      { id: 'c3', label: 'Game Character', description: 'A cool knight holding a sword.', icon: 'sports_esports', isRelevant: false },
      { id: 'c4', label: 'No Password Check', description: 'The purchase went through without asking for a password.', icon: 'lock_open', isRelevant: true }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sequence',
        question: 'What should Jake do before getting a new item in a game?',
        hint: 'Always communicate with the owner of the device.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Check if the item costs real money', isSafe: true, consequenceFeedback: 'Always look for the price tag!' },
          { id: 'seq2', label: 'Ask an adult for permission', isSafe: true, consequenceFeedback: 'Parents need to approve real-money purchases.' },
          { id: 'seq3', label: 'Let the adult enter the password', isSafe: true, consequenceFeedback: 'This keeps the payment information safe.' }
        ]
      },
      {
        id: 'p2',
        type: 'sort',
        question: 'Sort these purchase habits into Safe and Unsafe.',
        hint: 'If it costs real money, you need an adult.',
        actions: [
          { id: 'a1', label: 'Clicking "Buy" without asking', isSafe: false, consequenceFeedback: 'This is unsafe.' },
          { id: 'a2', label: 'Asking parents before spending gems', isSafe: true, consequenceFeedback: 'Very safe.' },
          { id: 'a3', label: 'Saving payment passwords on the device', isSafe: false, consequenceFeedback: 'Can lead to accidents.' },
          { id: 'a4', label: 'Reading the small text on buttons', isSafe: true, consequenceFeedback: 'Always read carefully.' }
        ]
      }
    ],
    learningPoint: 'Always ask a trusted adult before clicking "Buy" or downloading new things. Real money is used in many "free" games.',
    xpReward: 200,
    nextCaseId: 'case_08'
  },
  {
    id: 'case_08',
    title: 'The Copycat Crisis',
    category: 'Digital Plagiarism',
    difficulty: 'Hard',
    description: 'Lily is tempted to copy-paste a whole article for her school project.',
    storyScenes: [
      { text: 'Lily has a big science report due tomorrow about space.' },
      { text: 'She finds a perfect article online that has all the answers.' },
      { text: 'She thinks it would be so much faster to just copy and paste it all.' }
    ],
    investigationText: 'Look at Lily\'s computer screen and identify the plagiarism.',
    clues: [
      { id: 'c1', label: 'Highlighted Text', description: 'An entire Wikipedia page is highlighted.', icon: 'format_paint', isRelevant: true },
      { id: 'c2', label: 'Ctrl+C / Ctrl+V', description: 'The keyboard shortcuts for Copy and Paste.', icon: 'content_copy', isRelevant: true },
      { id: 'c3', label: 'Blank Document', description: 'Lily hasn\'t written any of her own words yet.', icon: 'draft', isRelevant: true },
      { id: 'c4', label: 'Space Picture', description: 'A cool photo of Mars.', icon: 'image', isRelevant: false }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'Which of these actions is fair and safe for a school project?',
        hint: 'It\'s okay to research, but you must write your own thoughts.',
        actions: [
          { id: 'a1', label: 'Copying the whole text', isSafe: false, consequenceFeedback: 'This is plagiarism (stealing someone\'s work).' },
          { id: 'a2', label: 'Reading the text, then writing in your own words', isSafe: true, consequenceFeedback: 'This is how you actually learn!' },
          { id: 'a3', label: 'Copying one sentence, but putting it in quotes ""', isSafe: true, consequenceFeedback: 'Quoting with credit is completely fine.' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'What are the right steps to use online research safely?',
        hint: 'Read, summarize, and credit.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Read and understand the article', isSafe: true, consequenceFeedback: 'Good.' },
          { id: 'seq2', label: 'Close the article and write from memory', isSafe: true, consequenceFeedback: 'Great way to use your own words!' },
          { id: 'seq3', label: 'Include a link to where you learned it', isSafe: true, consequenceFeedback: 'Excellent.' }
        ]
      }
    ],
    learningPoint: 'You have a right to learn and research online, but you must respect others\' work by not stealing it (plagiarism). Use your own words!',
    xpReward: 250,
    nextCaseId: 'case_09'
  },
  {
    id: 'case_09',
    title: 'The Embarrassing Post',
    category: 'Digital Footprint',
    difficulty: 'Medium',
    description: 'Someone is about to post a funny but embarrassing picture of their friend without asking.',
    storyScenes: [
      { text: 'At a sleepover, Sarah took a photo of Chloe with chocolate smeared all over her face.' },
      { text: 'Sarah thinks it\'s hilarious and wants to post it on social media.' },
      { text: 'Chloe doesn\'t know about the photo yet.' }
    ],
    investigationText: 'Examine Sarah\'s phone screen before she hits "Post".',
    clues: [
      { id: 'c1', label: 'The Photo', description: 'Chloe looks very messy and unaware of the camera.', icon: 'face', isRelevant: true },
      { id: 'c2', label: '"Post to Everyone"', description: 'The privacy setting is set to public.', icon: 'public', isRelevant: true },
      { id: 'c3', label: 'No Permission', description: 'Chloe hasn\'t said it\'s okay to post.', icon: 'do_not_disturb_alt', isRelevant: true },
      { id: 'c4', label: 'Funny Caption', description: 'Sarah wrote "Chocolate monster!"', icon: 'chat', isRelevant: false }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sequence',
        question: 'What should Sarah do before posting the photo?',
        hint: 'Think about how the other person feels before sharing their image.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Show the photo to Chloe', isSafe: true, consequenceFeedback: 'Always let them see it first.' },
          { id: 'seq2', label: 'Ask Chloe if it\'s okay to post', isSafe: true, consequenceFeedback: 'Getting permission is a key digital right.' },
          { id: 'seq3', label: 'Respect her choice if she says no', isSafe: true, consequenceFeedback: 'True friends respect boundaries.' }
        ]
      },
      {
        id: 'p2',
        type: 'sort',
        question: 'Sort these photo sharing actions into Respectful and Disrespectful.',
        hint: 'Always ask permission first.',
        actions: [
          { id: 'a1', label: 'Posting a funny face picture secretly', isSafe: false, consequenceFeedback: 'Not respectful.' },
          { id: 'a2', label: 'Asking "Can I post this?"', isSafe: true, consequenceFeedback: 'Very respectful.' },
          { id: 'a3', label: 'Deleting it if your friend asks', isSafe: true, consequenceFeedback: 'Good friend.' },
          { id: 'a4', label: 'Sending embarrassing photos to a group chat', isSafe: false, consequenceFeedback: 'This is bullying.' }
        ]
      }
    ],
    learningPoint: 'Think before you post. Once something is online, it becomes part of someone\'s digital footprint. Always ask permission before posting photos of others.',
    xpReward: 200,
    nextCaseId: 'case_10'
  },
  {
    id: 'case_10',
    title: 'The Helpful Bot',
    category: 'AI Awareness',
    difficulty: 'Hard',
    description: 'Max is asking an AI chatbot for advice, but the bot is giving strange answers.',
    storyScenes: [
      { text: 'Max is using a new AI chatbot to help him build a treehouse.' },
      { text: 'The bot tells him to use glue instead of nails.' },
      { text: 'The bot also says, "Trust me, I am a human expert."' }
    ],
    investigationText: 'Find the red flags in the chatbot\'s messages.',
    clues: [
      { id: 'c1', label: '"I am a human expert"', description: 'AI bots are not humans.', icon: 'smart_toy', isRelevant: true },
      { id: 'c2', label: 'Dangerous Advice', description: 'Glue will not hold a treehouse together safely!', icon: 'warning', isRelevant: true },
      { id: 'c3', label: 'No Sources', description: 'The bot didn\'t provide any website links to prove its advice.', icon: 'link_off', isRelevant: true },
      { id: 'c4', label: '"Hello, how can I help?"', description: 'A standard greeting.', icon: 'waving_hand', isRelevant: false }
    ],
    puzzles: [
      {
        id: 'p1',
        type: 'sort',
        question: 'What is true and false about Artificial Intelligence (AI)?',
        hint: 'AI is smart, but it doesn\'t really "know" things like a human does.',
        actions: [
          { id: 'a1', label: 'AI can sometimes make mistakes (hallucinate)', isSafe: true, consequenceFeedback: 'Correct! Always double-check AI answers.' },
          { id: 'a2', label: 'AI has real feelings', isSafe: false, consequenceFeedback: 'AI is just a computer program, it doesn\'t have feelings.' },
          { id: 'a3', label: 'It is a good idea to verify AI advice with an adult', isSafe: true, consequenceFeedback: 'Adults can help you figure out if the advice is safe and true.' }
        ]
      },
      {
        id: 'p2',
        type: 'sequence',
        question: 'How should you use AI chatbots for homework?',
        hint: 'Use them for ideas, but verify the facts.',
        correctSequenceIds: ['seq1', 'seq2', 'seq3'],
        actions: [
          { id: 'seq1', label: 'Ask the AI for ideas or an outline', isSafe: true, consequenceFeedback: 'Good.' },
          { id: 'seq2', label: 'Double check the facts in a book or website', isSafe: true, consequenceFeedback: 'Great.' },
          { id: 'seq3', label: 'Write the final essay in your own words', isSafe: true, consequenceFeedback: 'Excellent.' }
        ]
      }
    ],
    learningPoint: 'AI tools are very helpful, but they are not human and can make mistakes. Always verify important information with trusted sources or adults.',
    xpReward: 300,
    badgeId: 'badge_detective_master'
  }
];
