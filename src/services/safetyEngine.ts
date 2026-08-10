import { getAllChildProgress, getModules, saveSafetyAssessment } from '../firebase/firestore';
import { groqService } from './groqService';
import type { Child, SafetyAssessment, TopicScore, RiskIndicator, AIRecommendation } from '../types';

export const generateAssessmentForChild = async (child: Child): Promise<SafetyAssessment> => {
  if (!child.id || !child.parentId) throw new Error('Invalid child data');

  const [progress, modules] = await Promise.all([
    getAllChildProgress(child.parentId, child.id),
    getModules()
  ]);

  const topicMap = new Map<string, { attempted: number; scoreSum: number; completedCount: number }>();
  
  // Group progress by category
  progress.forEach(p => {
    const mod = modules.find(m => m.id === p.moduleId);
    if (!mod) return;

    const cat = mod.category;
    if (!topicMap.has(cat)) {
      topicMap.set(cat, { attempted: 0, scoreSum: 0, completedCount: 0 });
    }
    
    const stats = topicMap.get(cat)!;
    stats.attempted++;
    stats.scoreSum += p.score || 0;
    if (p.status === 'completed') stats.completedCount++;
  });

  const topicScores: TopicScore[] = [];
  let totalScoreSum = 0;
  let totalAttempted = 0;

  topicMap.forEach((stats, catName) => {
    const accuracy = stats.attempted > 0 ? Math.round(stats.scoreSum / stats.attempted) : 0;
    
    topicScores.push({
      topicId: catName.toLowerCase().replace(/\s+/g, '_'),
      topicName: catName,
      score: accuracy, 
      accuracy: accuracy,
      totalAttempted: stats.attempted,
      completedModules: stats.completedCount
    });

    totalScoreSum += stats.scoreSum;
    totalAttempted += stats.attempted;
  });

  // Calculate overall accuracy
  let overallAccuracy = totalAttempted > 0 ? Math.round(totalScoreSum / totalAttempted) : 0;
  
  // If no progress at all, generate a default "New Learner" profile
  if (topicScores.length === 0) {
    overallAccuracy = 0;
  }

  // Ask AI for insights
  const aiResult = await groqService.generateSafetyAssessment(
    child.displayName,
    topicScores.map(t => ({ topicName: t.topicName, accuracy: t.accuracy, completedModules: t.completedModules })),
    overallAccuracy
  );

  // Derive strong / weak topics mathematically
  const strongTopics = topicScores.filter(t => t.accuracy >= 80).map(t => t.topicName);
  const weakTopics = topicScores.filter(t => t.accuracy < 60).map(t => t.topicName);

  const riskIndicators: RiskIndicator[] = aiResult.riskIndicators.map((r, i) => ({
    id: `risk_${Date.now()}_${i}`,
    ...r
  }));

  const recommendations: AIRecommendation[] = aiResult.recommendations.map((r, i) => ({
    id: `rec_${Date.now()}_${i}`,
    ...r
  }));

  const assessment: SafetyAssessment = {
    childId: child.id,
    parentId: child.parentId,
    overallScore: overallAccuracy,
    topicScores,
    strongTopics,
    weakTopics,
    riskIndicators,
    insights: aiResult.insights.length > 0 ? aiResult.insights : ["Just starting out! Complete some modules to get personalized insights."],
    recommendations: recommendations.length > 0 ? recommendations : [{ id: 'rec_0', action: 'Start your first RightsQuest module', type: 'play_level' }],
    generatedAt: null as any, // replaced by serverTimestamp in firestore.ts
  };

  // Only save if there's actual data
  if (totalAttempted > 0) {
    await saveSafetyAssessment(assessment);
  }

  return assessment;
};
