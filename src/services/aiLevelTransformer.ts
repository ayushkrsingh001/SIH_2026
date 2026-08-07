import type { AIGeneratedLevel, AIQuestion, Scene, Choice } from '../types';

/**
 * Transforms an AI-generated level from Gemini into the existing Scene[] format
 * so the ScenarioPlayer can play it without any changes.
 */
export function transformAILevelToScenes(aiLevel: AIGeneratedLevel, moduleId: string): Scene[] {
  const scenes: Scene[] = [];
  
  // Scene 1: Story intro
  scenes.push({
    id: `${moduleId}_ai_story`,
    moduleId,
    type: 'story',
    text: aiLevel.story,
    scenario: aiLevel.learningObjective,
    mediaUrl: null,
    choices: [],
    order: 1,
    nextSceneId: aiLevel.questions.length > 0 ? `${moduleId}_ai_q_1` : null,
    educationalTip: aiLevel.learningObjective,
    relatedLegalInfo: `World: ${aiLevel.world} | ${aiLevel.difficulty}`,
  });

  // Convert each question into a Scene
  aiLevel.questions.forEach((q, idx) => {
    const sceneId = `${moduleId}_ai_q_${idx + 1}`;
    const nextSceneId = idx < aiLevel.questions.length - 1 ? `${moduleId}_ai_q_${idx + 2}` : null;
    
    const scene = questionToScene(q, sceneId, moduleId, idx + 2, nextSceneId);
    scenes.push(scene);
  });

  return scenes;
}

function questionToScene(
  q: AIQuestion,
  sceneId: string,
  moduleId: string,
  order: number,
  nextSceneId: string | null
): Scene {
  switch (q.type) {
    case 'mcq':
    case 'decision':
    case 'scenario':
      return createMCQScene(q, sceneId, moduleId, order, nextSceneId);
    case 'true_false':
      return createTrueFalseScene(q, sceneId, moduleId, order, nextSceneId);
    case 'order_sequence':
      return createOrderScene(q, sceneId, moduleId, order, nextSceneId);
    case 'spot_danger':
      return createSpotDangerScene(q, sceneId, moduleId, order, nextSceneId);
    default:
      // Fallback: treat unknown types as MCQ
      return createMCQScene(q, sceneId, moduleId, order, nextSceneId);
  }
}

function createMCQScene(
  q: AIQuestion, sceneId: string, moduleId: string, order: number, nextSceneId: string | null
): Scene {
  const options = q.options || [q.correctAnswer, 'Incorrect'];
  const choices: Choice[] = options.map(opt => ({
    text: opt,
    isCorrect: opt === q.correctAnswer,
    feedbackText: opt === q.correctAnswer ? `✅ ${q.explanation}` : `❌ The correct answer is: ${q.correctAnswer}. ${q.explanation}`,
    nextSceneId,
    educationalTip: q.legalFact,
  }));

  // Shuffle choices so correct answer isn't always first
  shuffleArray(choices);

  return {
    id: sceneId,
    moduleId,
    type: 'choice',
    text: q.question,
    scenario: q.legalFact,
    mediaUrl: null,
    choices,
    order,
    nextSceneId,
    educationalTip: q.explanation,
    relatedLegalInfo: q.legalFact,
  };
}

function createTrueFalseScene(
  q: AIQuestion, sceneId: string, moduleId: string, order: number, nextSceneId: string | null
): Scene {
  const isTrue = q.correctAnswer.toLowerCase() === 'true';
  
  const choices: Choice[] = [
    {
      text: 'True',
      isCorrect: isTrue,
      feedbackText: isTrue ? `✅ ${q.explanation}` : `❌ ${q.explanation}`,
      nextSceneId,
      educationalTip: q.legalFact,
    },
    {
      text: 'False',
      isCorrect: !isTrue,
      feedbackText: !isTrue ? `✅ ${q.explanation}` : `❌ ${q.explanation}`,
      nextSceneId,
      educationalTip: q.legalFact,
    },
  ];

  return {
    id: sceneId,
    moduleId,
    type: 'choice',
    text: q.question,
    scenario: q.legalFact,
    mediaUrl: null,
    choices,
    order,
    nextSceneId,
    educationalTip: q.explanation,
    relatedLegalInfo: q.legalFact,
  };
}

function createOrderScene(
  q: AIQuestion, sceneId: string, moduleId: string, order: number, nextSceneId: string | null
): Scene {
  const items = (q.options || []).map((text, i) => ({
    id: `seq_${i}`,
    text,
    correctOrder: i + 1,
  }));

  // Shuffle the items for display
  const shuffledItems = [...items];
  shuffleArray(shuffledItems);
  // Re-assign correctOrder based on original position
  const originalOrder = (q.options || []);
  shuffledItems.forEach(item => {
    item.correctOrder = originalOrder.indexOf(item.text) + 1;
  });

  return {
    id: sceneId,
    moduleId,
    type: 'order_sequence',
    text: q.question,
    scenario: q.legalFact,
    mediaUrl: null,
    choices: [
      { text: 'Correct Order', isCorrect: true, feedbackText: `✅ ${q.explanation}`, nextSceneId },
      { text: 'Wrong Order', isCorrect: false, feedbackText: `❌ ${q.explanation}`, nextSceneId },
    ],
    sequenceItems: shuffledItems,
    order,
    nextSceneId,
    educationalTip: q.explanation,
    relatedLegalInfo: q.legalFact,
  };
}

function createSpotDangerScene(
  q: AIQuestion, sceneId: string, moduleId: string, order: number, nextSceneId: string | null
): Scene {
  // For AI-generated spot_danger, we convert it to a choice-based question
  // since we don't have a real image to click on.
  // The "danger" is described textually and the player picks the right answer.
  const options = q.options || [q.correctAnswer, 'Nothing seems wrong', 'It is safe', 'No danger here'];
  
  const choices: Choice[] = options.map(opt => ({
    text: opt,
    isCorrect: opt === q.correctAnswer,
    feedbackText: opt === q.correctAnswer
      ? `🎯 Great eye! ${q.explanation}`
      : `❌ Look closer! ${q.explanation}`,
    nextSceneId,
    educationalTip: q.legalFact,
  }));
  
  shuffleArray(choices);

  return {
    id: sceneId,
    moduleId,
    type: 'choice', // Render as choice since no real image
    text: `🔍 SPOT THE DANGER: ${q.question}`,
    scenario: q.legalFact,
    mediaUrl: null,
    choices,
    order,
    nextSceneId,
    educationalTip: q.explanation,
    relatedLegalInfo: q.legalFact,
  };
}

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Create a Module-like object from an AI level for display purposes.
 */
export function aiLevelToModuleMeta(aiLevel: AIGeneratedLevel, id: string) {
  return {
    id,
    title: aiLevel.title,
    description: aiLevel.learningObjective,
    category: aiLevel.world,
    difficulty: aiLevel.difficulty as 'Easy' | 'Medium' | 'Hard' | 'Boss',
    estimatedMinutes: parseInt(aiLevel.estimatedTime) || 8,
    ageRange: 'all' as const,
    order: aiLevel.level,
    xpReward: aiLevel.reward.xp,
    coinReward: aiLevel.reward.coins,
    coverImageUrl: '',
    prerequisiteModuleId: null,
  };
}
