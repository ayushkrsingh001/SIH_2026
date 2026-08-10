import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getChild, getSafetyTwinProfile, getLearningHistory, getAIReports,
  addAIReport, saveSafetyTwinProfile, deleteAIReport
} from '../../firebase/firestore';
import { groqService } from '../../services/groqService';
import type { Child, SafetyTwinProfile, AIReport, LearningEvent } from '../../types';
import toast from 'react-hot-toast';

const AISafetyTwinDashboard = () => {
  const { user } = useAuth();
  const { childId } = useParams();
  
  const [child, setChild] = useState<Child | null>(null);
  const [profile, setProfile] = useState<SafetyTwinProfile | null>(null);
  const [history, setHistory] = useState<LearningEvent[]>([]);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [user, childId]);

  const loadData = async () => {
    if (!user || !childId) return;
    try {
      const c = await getChild(user.uid, childId);
      setChild(c);

      const p = await getSafetyTwinProfile(user.uid, childId);
      setProfile(p);

      const h = await getLearningHistory(user.uid, childId);
      setHistory(h);

      const r = await getAIReports(user.uid, childId);
      setReports(r);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load AI Twin data');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteReport = async (reportId: string) => {
    if (!user || !childId) return;
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteAIReport(user.uid, childId, reportId);
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Report deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete report');
    }
  };

  const generateWeeklyReport = async () => {
    if (!profile || !childId || !user) return;
    setGeneratingReport(true);
    try {
      const recentEvents = history.slice(0, 15); // taking recent events
      const reportData = await groqService.generateWeeklyReport(recentEvents, profile);
      
      const newReport: Omit<AIReport, 'id' | 'createdAt'> = {
        childId,
        parentId: user.uid,
        weekStartDate: new Date() as any, // Timestamp conversion happens in firestore
        ...reportData
      };
      
      await addAIReport(newReport);
      toast.success('Weekly report generated successfully!');
      loadData(); // reload to show new report
    } catch (e) {
      toast.error('Failed to generate report.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!child) return <div className="p-8 text-center">Child not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link to="/dashboard" className="text-primary font-body hover:underline flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-headline font-bold text-on-surface">AI Safety Twin</h1>
          <p className="text-on-surface-variant font-body mt-1">
            Personalized safety analysis for {child.displayName}
          </p>
        </div>
        
        <div className="bg-primary-container px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm border border-outline-variant/30">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center font-headline text-2xl font-bold text-primary shadow-sm border border-primary/20">
            {profile?.overallScore || 0}%
          </div>
          <div>
            <p className="font-body text-sm text-on-primary-container/70 font-semibold uppercase tracking-wider">Overall Safety Score</p>
            <p className="font-body text-body-md text-on-primary-container font-medium">Based on recent activity</p>
          </div>
        </div>
      </div>

      {!profile ? (
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant text-center">
          <span className="material-symbols-outlined text-6xl text-secondary mb-4">smart_toy</span>
          <h3 className="text-xl font-bold font-body mb-2">No AI Twin Data Yet</h3>
          <p className="text-on-surface-variant font-body max-w-md mx-auto">
            {child.displayName} needs to complete a few quests or quizzes for the AI Safety Twin to generate a profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Strengths & Weaknesses */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm">
              <h3 className="font-bold font-body text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">verified</span>
                Strong Areas
              </h3>
              {profile.strengthAreas?.length > 0 ? (
                <ul className="space-y-2">
                  {profile.strengthAreas.map(s => (
                    <li key={s} className="flex items-center gap-2 font-body text-body-md text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 font-body">Not enough data to determine strengths.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm">
              <h3 className="font-bold font-body text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                Areas for Improvement
              </h3>
              {profile.weakAreas?.length > 0 ? (
                <ul className="space-y-2">
                  {profile.weakAreas.map(w => (
                    <li key={w} className="flex items-center gap-2 font-body text-body-md text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 font-body">No significant weaknesses detected.</p>
              )}
            </div>
            
            <div className="bg-tertiary-container/30 p-6 rounded-3xl border border-tertiary/20 shadow-sm">
               <h3 className="font-bold font-body text-lg mb-2 text-on-tertiary-container">Learning Style</h3>
               <p className="font-body text-on-surface capitalize">{profile.learningStyle || 'mixed'} Learner</p>
               <p className="text-xs text-on-surface-variant mt-1">The AI adapts future content to this style.</p>
            </div>
          </div>

          {/* Middle Column: Category Scores */}
          <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm lg:col-span-2">
            <h3 className="font-bold font-body text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Detailed Topic Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile.categoryScores || {}).map(([key, score]) => {
                const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
                    <span className="font-body font-medium text-on-surface">{title}</span>
                    <span className={`font-bold font-body px-2 py-1 rounded-lg text-sm ${getScoreColor(score as number)}`}>
                      {score as number}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Bottom Row: AI Weekly Reports */}
          <div className="lg:col-span-3 mt-4">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold font-headline">Weekly AI Reports</h2>
               <button 
                 onClick={generateWeeklyReport}
                 disabled={generatingReport}
                 className="bg-secondary text-on-secondary px-4 py-2 rounded-full font-body font-bold text-sm shadow-sm disabled:opacity-50 flex items-center gap-2 hover:bg-secondary/90 transition-colors"
               >
                 {generatingReport ? (
                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                 ) : (
                   <span className="material-symbols-outlined text-[18px]">magic_button</span>
                 )}
                 Generate New Report
               </button>
            </div>

            {reports.length === 0 ? (
              <p className="text-on-surface-variant font-body">No reports generated yet.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={report.id} 
                    className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col md:flex-row gap-6 items-start"
                  >
                    <div className="bg-primary/10 p-4 rounded-xl text-center min-w-[120px]">
                       <span className="material-symbols-outlined text-primary text-3xl mb-1">calendar_month</span>
                       <p className="text-xs font-bold font-body text-primary uppercase">Report</p>
                       <p className="text-[10px] text-on-surface-variant">
                         {report.learningTimeMinutes} mins learned
                       </p>
                    </div>
                    
                    <div className="flex-1 space-y-3 relative">
                       <button 
                         onClick={() => handleDeleteReport(report.id!)}
                         className="absolute -top-2 right-0 text-on-surface-variant hover:text-error transition-colors p-2"
                         title="Delete Report"
                       >
                         <span className="material-symbols-outlined text-lg">delete</span>
                       </button>
                       <p className="font-body text-on-surface font-medium italic border-l-4 border-primary pl-3 bg-surface-container-lowest p-2 rounded-r-lg pr-8">
                         "{report.improvementText}"
                       </p>
                       <div className="grid grid-cols-2 gap-4 text-sm font-body">
                         <div>
                           <span className="text-on-surface-variant block mb-1">Strongest Area</span>
                           <span className="font-bold text-green-600 flex items-center gap-1">
                             <span className="material-symbols-outlined text-[16px]">trending_up</span>
                             {report.strongestTopic}
                           </span>
                         </div>
                         <div>
                           <span className="text-on-surface-variant block mb-1">Needs Attention</span>
                           <span className="font-bold text-red-600 flex items-center gap-1">
                             <span className="material-symbols-outlined text-[16px]">trending_down</span>
                             {report.needsAttentionTopic}
                           </span>
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-outline-variant">
                          <h4 className="font-bold font-body text-sm mb-1 flex items-center gap-1 text-primary">
                            <span className="material-symbols-outlined text-[16px]">psychology</span>
                            AI Recommendation
                          </h4>
                          <p className="font-body text-body-sm text-on-surface">{report.aiRecommendationText}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AISafetyTwinDashboard;
