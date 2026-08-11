import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveIncidentReport, getIncidentReports } from '../firebase/firestore';
import { groqService } from '../services/groqService';
import type { IncidentReport, IncidentRiskLevel } from '../types';
import toast from 'react-hot-toast';

const IncidentAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wizard State
  const [isReporting, setIsReporting] = useState(false);
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<IncidentReport | null>(null);

  // Form Data
  const [initialConcern, setInitialConcern] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    }
  }, [user?.uid]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const reports = await getIncidentReports(user.uid);
      setHistory(reports);
    } catch (e) {
      toast.error('Failed to load incident history.');
    } finally {
      setLoading(false);
    }
  };

  const { childId } = useParams();
  const isChildMode = !!childId;

  const PARENT_QUESTIONS = [
    { id: 1, text: "How old is the child involved?", type: "text", placeholder: "e.g. 10 years old" },
    { id: 2, text: "Where did this happen?", type: "options", options: ["Instagram", "WhatsApp", "School", "Game", "Facebook", "Other"] },
    { id: 3, text: "Is the incident still ongoing?", type: "options", options: ["Yes", "No", "Not Sure"] },
    { id: 4, text: "Has anyone threatened your child?", type: "options", options: ["Yes", "No"] },
    { id: 5, text: "Has your child shared any personal information (address, photos, passwords)?", type: "options", options: ["Yes", "No", "Not Sure"] }
  ];

  const CHILD_QUESTIONS = [
    { id: 1, text: "Where did this happen?", type: "options", options: ["Instagram", "WhatsApp", "School", "Game", "Facebook", "Other"] },
    { id: 2, text: "Is this still happening right now?", type: "options", options: ["Yes", "No", "I'm not sure"] },
    { id: 3, text: "Has anyone threatened or scared you?", type: "options", options: ["Yes", "No"] },
    { id: 4, text: "Did you share any personal information (address, photos, passwords)?", type: "options", options: ["Yes", "No", "I don't remember"] },
    { id: 5, text: "Have you told any adult about this yet?", type: "options", options: ["Yes", "No"] }
  ];

  const QUESTIONS = isChildMode ? CHILD_QUESTIONS : PARENT_QUESTIONS;

  const handleNext = async () => {
    if (step === 0 && !initialConcern.trim()) {
      toast.error("Please describe your concern.");
      return;
    }
    if (step > 0 && step <= QUESTIONS.length && !answers[step]) {
      toast.error("Please provide an answer.");
      return;
    }

    if (step === QUESTIONS.length + 1) {
      // Final submission
      await submitReport();
    } else {
      setStep(step + 1);
    }
  };

  const handleFakeUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success("Evidence uploaded securely.");
      setStep(step + 1);
      submitReport();
    }, 1500);
  };

  const submitReport = async () => {
    if (!user) return;
    setGenerating(true);
    setStep(99); // processing state
    
    try {
      const chatHistory = QUESTIONS.map((q, i) => ({
        question: q.text,
        answer: answers[i + 1] || 'Skipped'
      }));

      const aiResponse = await groqService.generateIncidentReport(initialConcern, chatHistory, isChildMode);

      const reportData: Omit<IncidentReport, 'id' | 'createdAt'> = {
        parentId: user.uid,
        initialConcern,
        chatHistory,
        status: 'pending',
        ...aiResponse
      };

      const id = await saveIncidentReport(reportData);
      const fullReport = { id, ...reportData, createdAt: null as any };
      
      setActiveReport(fullReport as IncidentReport);
      setHistory([fullReport as IncidentReport, ...history]);
      toast.success('AI Report generated.');
    } catch (e) {
      toast.error('Failed to generate report.');
      setStep(QUESTIONS.length); // go back
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (level: IncidentRiskLevel) => {
    switch(level) {
      case 'critical': return 'bg-error text-white border-error';
      case 'high': return 'bg-orange-500 text-white border-orange-500';
      case 'medium': return 'bg-yellow-400 text-yellow-900 border-yellow-400';
      case 'low': return 'bg-green-500 text-white border-green-500';
      default: return 'bg-gray-200';
    }
  };

  const resetWizard = () => {
    setIsReporting(false);
    setStep(0);
    setInitialConcern('');
    setAnswers({});
    setActiveReport(null);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Assistant...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Disclaimer */}
      <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
        <span className="material-symbols-outlined text-secondary text-3xl">info</span>
        <div>
          <h4 className="font-bold font-body text-label-lg text-on-surface">Educational Guidance Only</h4>
          <p className="font-body text-body-sm text-on-surface-variant">
            This AI assistant provides educational information and safety suggestions. It is <strong>not a substitute for professional legal advice</strong> or emergency services. In case of immediate physical danger, always call <strong>112</strong> or your local emergency number.
          </p>
        </div>
      </div>

      {!isReporting && !activeReport ? (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-headline text-headline-md text-on-surface">{isChildMode ? "My Safety Assistant" : "Safety Incident Assistant"}</h2>
              <p className="text-on-surface-variant font-body">{isChildMode ? "Tell us what happened and we will help you right away." : "Report concerns and get immediate AI guidance."}</p>
            </div>
            <button 
              onClick={() => setIsReporting(true)}
              className="bg-error text-white px-6 py-3 rounded-full font-bold font-body flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md"
            >
              <span className="material-symbols-outlined">report</span>
              {isChildMode ? "Report an Issue" : "Report New Concern"}
            </button>
          </div>

          {/* History */}
          <div className="space-y-4">
            <h3 className="font-headline text-title-lg text-on-surface mt-8 mb-4">Previous Reports</h3>
            {history.length === 0 ? (
              <div className="bg-surface-container p-8 rounded-[24px] text-center text-on-surface-variant">
                You have no active or past reports.
              </div>
            ) : (
              history.map(report => (
                <div key={report.id} onClick={() => setActiveReport(report)} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-[24px] shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline text-title-md font-bold truncate max-w-[70%] text-on-surface">{report.initialConcern}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRiskColor(report.riskLevel)}`}>
                      {report.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-body text-body-sm line-clamp-2">{report.summary}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      ) : activeReport ? (
        <motion.div initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} className="space-y-6">
          <button onClick={resetWizard} className="flex items-center gap-2 text-primary hover:bg-primary-container px-4 py-2 rounded-full w-fit">
             <span className="material-symbols-outlined">arrow_back</span> Back to Assistant
          </button>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-[32px] overflow-hidden shadow-sm">
            <div className={`p-6 md:p-8 ${getRiskColor(activeReport.riskLevel)}`}>
              <h2 className="font-headline text-headline-sm mb-2 text-white">AI Incident Report</h2>
              <div className="flex gap-2">
                <span className="bg-black/20 px-3 py-1 rounded-full text-sm font-bold capitalize text-white">
                  Risk Level: {activeReport.riskLevel}
                </span>
                <span className="bg-black/20 px-3 py-1 rounded-full text-sm font-bold capitalize text-white">
                  Status: {activeReport.status}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div>
                <h3 className="font-headline text-title-lg text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">subject</span> Situation Summary
                </h3>
                <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
                  {activeReport.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-headline text-title-lg text-error mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">running_with_errors</span> Immediate Actions
                  </h3>
                  <ul className="space-y-3">
                    {activeReport.immediateSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 bg-error-container/30 p-4 rounded-2xl border border-error/20">
                         <span className="material-symbols-outlined text-error mt-0.5">priority_high</span>
                         <span className="font-body text-on-surface">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                   <h3 className="font-headline text-title-lg text-secondary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">psychology</span> Support Advice
                  </h3>
                  <div className="bg-secondary-container/30 p-5 rounded-2xl border border-secondary/20 font-body text-on-surface">
                    {activeReport.mentalHealthAdvice}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-outline-variant p-5 rounded-2xl bg-surface-container-lowest">
                  <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> DO'S</h4>
                  <ul className="list-disc pl-5 space-y-1 font-body text-on-surface">
                    {activeReport.dosAndDonts.dos.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
                <div className="border border-outline-variant p-5 rounded-2xl bg-surface-container-lowest">
                  <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2"><span className="material-symbols-outlined">cancel</span> DONT'S</h4>
                  <ul className="list-disc pl-5 space-y-1 font-body text-on-surface">
                    {activeReport.dosAndDonts.donts.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </div>

              {(activeReport.emergencyNumbers.length > 0 || activeReport.officialReportingOptions.length > 0) && (
                <div className="bg-surface-container-high p-6 rounded-[24px]">
                  <h3 className="font-headline text-title-lg text-on-surface mb-4">Official Channels</h3>
                  <div className="flex flex-wrap gap-6">
                    {activeReport.emergencyNumbers.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-on-surface-variant mb-2">Emergency Numbers</p>
                        <div className="flex gap-2">
                          {activeReport.emergencyNumbers.map(n => (
                            <a key={n} href={`tel:${n}`} className="bg-error text-white px-4 py-2 rounded-full font-bold flex items-center gap-1 shadow-sm hover:scale-105 transition-transform">
                              <span className="material-symbols-outlined text-sm">call</span> {n}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeReport.officialReportingOptions.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-on-surface-variant mb-2">Reporting Portals</p>
                        <ul className="list-disc pl-5 font-body text-primary underline">
                          {activeReport.officialReportingOptions.map((opt, i) => <li key={i}>{opt}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeReport.recommendedMissions.length > 0 && (
                <div>
                   <h3 className="font-headline text-title-md text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">sports_esports</span> Recommended Learning (RightsQuest)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeReport.recommendedMissions.map((m, i) => (
                      <span key={i} className="bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-xl font-bold text-sm border border-tertiary/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[32px] shadow-sm max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                <h2 className="font-headline text-headline-sm mb-4">What is your concern?</h2>
                <p className="font-body text-on-surface-variant mb-6">Briefly describe what happened so the AI can prepare.</p>
                <textarea 
                  value={initialConcern}
                  onChange={e => setInitialConcern(e.target.value)}
                  placeholder="e.g., My child is receiving strange messages on Instagram..."
                  className="w-full bg-surface-container p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-outline-variant resize-none font-body text-on-surface"
                  rows={4}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={resetWizard} className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container">Cancel</button>
                  <button onClick={handleNext} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold btn-tactile">Next Step</button>
                </div>
              </motion.div>
            )}

            {step > 0 && step <= QUESTIONS.length && (
              <motion.div key={`s${step}`} initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                <span className="text-primary font-bold text-sm mb-2 block">Step {step} of {QUESTIONS.length + 1}</span>
                <h2 className="font-headline text-headline-sm mb-6">{QUESTIONS[step-1].text}</h2>
                
                {QUESTIONS[step-1].type === 'text' ? (
                  <input 
                    type="text"
                    value={answers[step] || ''}
                    onChange={e => setAnswers({...answers, [step]: e.target.value})}
                    placeholder={'placeholder' in QUESTIONS[step-1] ? (QUESTIONS[step-1] as any).placeholder : ''}
                    className="w-full bg-surface-container p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary border border-outline-variant font-body"
                  />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {QUESTIONS[step-1].options?.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({...answers, [step]: opt})}
                        className={`px-6 py-3 rounded-full font-bold border-2 transition-all ${answers[step] === opt ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container">Back</button>
                  <button onClick={handleNext} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold btn-tactile">Next Step</button>
                </div>
              </motion.div>
            )}

            {step === QUESTIONS.length + 1 && (
              <motion.div key="supload" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                <span className="text-primary font-bold text-sm mb-2 block">Final Step</span>
                <h2 className="font-headline text-headline-sm mb-4">Any Evidence? (Optional)</h2>
                <p className="font-body text-on-surface-variant mb-6">Upload screenshots of the messages, profile, or game. This helps provide better context (simulated for now).</p>
                
                <div className="border-2 border-dashed border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">cloud_upload</span>
                  <p className="font-bold text-on-surface">Click to upload screenshots</p>
                  <p className="text-sm text-on-surface-variant mt-1">PNG, JPG up to 5MB</p>
                  <button onClick={handleFakeUpload} disabled={uploading} className="mt-6 bg-secondary text-white px-6 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2">
                    {uploading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Simulate Upload'}
                  </button>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container">Back</button>
                  <button onClick={handleNext} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold btn-tactile flex items-center gap-2">
                     Skip & Generate Report <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 99 && (
               <motion.div key="sprocessing" initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
                 <div className="w-20 h-20 border-4 border-error border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                 <h2 className="font-headline text-headline-sm text-error animate-pulse">AI is compiling report...</h2>
                 <p className="font-body text-on-surface-variant mt-2">Analyzing situation and finding emergency resources.</p>
               </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default IncidentAssistant;
