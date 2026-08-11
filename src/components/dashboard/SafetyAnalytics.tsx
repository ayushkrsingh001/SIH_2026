import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { getLatestAssessment, getAssessmentHistory } from '../../firebase/firestore';
import { generateAssessmentForChild } from '../../services/safetyEngine';
import type { Child, SafetyAssessment } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  child: Child;
}

export const SafetyAnalytics = ({ child }: Props) => {
  const [assessment, setAssessment] = useState<SafetyAssessment | null>(null);
  const [history, setHistory] = useState<SafetyAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const latest = await getLatestAssessment(child.id!);
      const hist = await getAssessmentHistory(child.id!);
      setAssessment(latest);
      setHistory(hist.reverse()); // Chronological order
    } catch (err) {
      console.error(err);
      toast.error('Failed to load safety data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (child.id) {
      loadData();
    }
  }, [child.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading('AI is analyzing learning progress...', { id: 'gen_assessment' });
    try {
      const newAssessment = await generateAssessmentForChild(child);
      setAssessment(newAssessment);
      setHistory(prev => [...prev, newAssessment]);
      toast.success('Assessment generated successfully!', { id: 'gen_assessment' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate assessment', { id: 'gen_assessment' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading AI Analytics...</div>;
  }

  if (!assessment && !generating) {
    return (
      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm p-8 text-center max-w-lg mx-auto mt-8 border border-outline-variant">
        <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl text-primary">shield</span>
        </div>
        <h2 className="font-headline text-headline-sm text-on-surface mb-2">Aegis Safety Assessment</h2>
        <p className="font-body text-body-md text-on-surface-variant mb-6">
          Generate an AI-powered safety risk report based on {child.displayName}'s learning progress and quiz answers.
        </p>
        <button
          onClick={handleGenerate}
          className="bg-primary text-on-primary px-6 py-3 rounded-full font-body font-bold text-label-lg btn-tactile w-full flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          Generate First Report
        </button>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm p-12 text-center mt-8">
        <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />
        <h3 className="font-headline text-title-lg text-primary animate-pulse">AI is analyzing progress...</h3>
        <p className="font-body text-body-md text-on-surface-variant mt-2">Checking topic accuracy, weak areas, and generating insights.</p>
      </div>
    );
  }

  if (!assessment) return null;

  // Determine color based on overall score
  let scoreColor = "text-error";
  let scoreBg = "bg-error-container";
  let scoreBorder = "border-error";
  let scoreLabel = "High Priority";
  
  if (assessment.overallScore >= 95) {
    scoreColor = "text-[#4CAF50]";
    scoreBg = "bg-[#4CAF50]/10";
    scoreBorder = "border-[#4CAF50]";
    scoreLabel = "Excellent";
  } else if (assessment.overallScore >= 80) {
    scoreColor = "text-[#8BC34A]";
    scoreBg = "bg-[#8BC34A]/10";
    scoreBorder = "border-[#8BC34A]";
    scoreLabel = "Good";
  } else if (assessment.overallScore >= 60) {
    scoreColor = "text-[#FF9800]";
    scoreBg = "bg-[#FF9800]/10";
    scoreBorder = "border-[#FF9800]";
    scoreLabel = "Needs Practice";
  }

  // Formatting for Recharts
  const radarData = assessment.topicScores.map(t => ({
    subject: t.topicName,
    A: t.score,
    fullMark: 100,
  }));

  const trendData = history.map((h, i) => ({
    name: `Run ${i + 1}`,
    score: h.overallScore
  }));

  return (
    <div className="space-y-6">
      {/* Header section with Score and Action */}
      <div className="flex flex-col md:flex-row gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <h3 className="font-headline text-title-lg text-on-surface mb-6">Overall Safety Score</h3>
          
          {/* Animated Circular Progress Simulation */}
          <div className={`relative w-40 h-40 rounded-full flex items-center justify-center border-8 ${scoreBorder} ${scoreBg}`}>
            <div className="text-center">
              <span className={`font-headline text-display-md font-bold ${scoreColor}`}>{assessment.overallScore}%</span>
            </div>
          </div>
          <div className={`mt-4 px-4 py-1 rounded-full text-label-md font-bold ${scoreBg} ${scoreColor}`}>
            {scoreLabel}
          </div>
          <button onClick={handleGenerate} className="mt-6 text-primary hover:bg-primary/10 px-4 py-2 rounded-full transition-colors flex items-center gap-1 font-body text-label-md">
            <span className="material-symbols-outlined text-[18px]">refresh</span> Re-evaluate
          </button>
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant flex-[2]"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h3 className="font-headline text-title-lg text-on-surface">Aegis Insights</h3>
          </div>
          <ul className="space-y-3">
            {assessment.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-surface-container-high p-3 rounded-xl">
                <span className="material-symbols-outlined text-secondary mt-0.5 text-[20px]">lightbulb</span>
                <span className="font-body text-body-md text-on-surface">{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant"
        >
          <h3 className="font-headline text-title-md text-on-surface mb-4">Topic Progress (Spider Chart)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a4458', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Child" dataKey="A" stroke="#6750A4" fill="#6750A4" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant"
        >
          <h3 className="font-headline text-title-md text-on-surface mb-4">Score Trend</h3>
          <div className="h-[300px] w-full">
            {history.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#4a4458', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#4a4458', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#6750A4" strokeWidth={3} dot={{ r: 6, fill: '#6750A4' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant font-body">
                Need at least 2 assessments to show trends.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Risks & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant"
        >
          <h3 className="font-headline text-title-md text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">warning</span>
            Risk Indicators
          </h3>
          {assessment.riskIndicators.length > 0 ? (
            <div className="space-y-3">
              {assessment.riskIndicators.map(risk => (
                <div key={risk.id} className={`p-4 rounded-xl border ${
                  risk.priority === 'high' ? 'bg-error-container border-error text-on-error-container' : 
                  risk.priority === 'medium' ? 'bg-orange-100 border-orange-500 text-orange-900' : 
                  'bg-yellow-50 border-yellow-400 text-yellow-800'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-label-md capitalize">{risk.priority} Priority</span>
                    <span className="text-[10px] font-bold uppercase opacity-80">{risk.relatedTopic}</span>
                  </div>
                  <p className="font-body text-body-md">{risk.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container p-6 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
              <p className="font-body text-body-md text-on-surface-variant">No major risks detected!</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant"
        >
          <h3 className="font-headline text-title-md text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">explore</span>
            Aegis Recommendations
          </h3>
          <div className="space-y-3">
            {assessment.recommendations.map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors">
                <span className="font-body text-body-md text-on-surface font-medium">{rec.action}</span>
                <span className="material-symbols-outlined text-primary">arrow_forward_ios</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
};
