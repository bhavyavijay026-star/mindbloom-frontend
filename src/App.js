import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Shield, BarChart3, Heart, Monitor, CheckCircle2, Info, Loader2 
} from 'lucide-react';

// --- CONFIGURATION ---
const BACKEND_URL = "https://mindbloom-host.onrender.com/submit";

const QUESTIONS = [
  { id: 'q1', cat: 'Emotional Instability', text: 'I often feel physical tension, like a tight chest or stomach ache, when I am stressed.' },
  { id: 'q2', cat: 'Emotional Instability', text: 'I feel like I’m pretending to be okay.' },
  { id: 'q3', cat: 'Emotional Instability', text: 'It takes me a long time to calm down after I get upset.' },
  { id: 'q4', cat: 'Emotional Instability', text: 'I feel stuck and don’t know how to move forward.' },
  { id: 'q5', cat: 'Emotional Instability', text: 'I get irritated more easily than before.' },
  { id: 'q6', cat: 'Home Environment', text: 'I feel guilty when I relax because my family is sacrificing for me.' },
  { id: 'q7', cat: 'Home Environment', text: 'Financial situations at home make me feel extra pressure.' },
  { id: 'q8', cat: 'Home Environment', text: 'I am scared to tell them if I fail.' },
  { id: 'q9', cat: 'Home Environment', text: 'I hide my stress from my family.' },
  { id: 'q10', cat: 'Academic', text: 'I avoid asking doubts because I don’t want to look dumb.' },
  { id: 'q11', cat: 'Academic', text: 'Before exams, my mind goes blank.' },
  { id: 'q12', cat: 'Academic', text: 'I study out of fear, not interest.' },
  { id: 'q13', cat: 'Academic', text: 'The medium of instruction (like English) makes subjects harder for me.' },
  { id: 'q14', cat: 'Screen Dependency', text: 'I pick up my phone automatically even when I don’t have any specific reason.' },
  { id: 'q15', cat: 'Screen Dependency', text: 'I use my phone to avoid thinking about stressful situations.' },
  { id: 'q16', cat: 'Screen Dependency', text: 'I delay important tasks because I get distracted by social media.' },
  { id: 'q17', cat: 'Screen Dependency', text: 'I use my phone right before sleeping, even when I’m tired.' },
  { id: 'q18', cat: 'Sleep Debt', text: 'I sacrifice sleep to finish assignments.' },
  { id: 'q19', cat: 'Sleep Debt', text: 'I rely on caffeine (tea/coffee) to stay awake.' },
  { id: 'q20', cat: 'Sleep Debt', text: 'I go to bed tired but still struggle to fall asleep.' },
  { id: 'q21', cat: 'Sleep Debt', text: 'I feel mentally foggy in the morning.' },
  { id: 'q22', cat: 'Social Isolation', text: 'I feel disconnected even in group settings.' },
  { id: 'q23', cat: 'Social Isolation', text: 'I rarely share my problems with others.' },
  { id: 'q24', cat: 'Social Isolation', text: 'I scroll social media instead of meeting people in person.' },
  { id: 'q25', cat: 'Social Isolation', text: 'I hesitate to join group activities.' },
];

const REVIEWS = [
  { name: "Aarav M.", role: "Student", text: "The screen dependency score was a wake-up call. I've cut my usage by 2 hours." },
  { name: "Dr. Elena", role: "Psychologist", text: "A clean, evidence-based approach to early intervention in student wellness." },
  { name: "Sophia K.", role: "Junior", text: "I love the anonymity. It feels like a safe space to be honest with myself." }
];

export default function App() {
  const [view, setView] = useState('home'); 
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priorities, setPriorities] = useState({ p1: 'Analyzing...', p2: 'Analyzing...' });
  
  const { scrollYProgress } = useScroll();

  // SCROLL ANIMATIONS
  const brainMoveLeft = useTransform(scrollYProgress, [0, 0.15], [0, -250]);
  const brainMoveRight = useTransform(scrollYProgress, [0, 0.15], [0, 250]);
  const brainOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1.2]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  // LOGIC
  const handleAnswer = async (val) => {
    const updatedAnswers = [...answers, val];
    
    if (currentStep < QUESTIONS.length - 1) {
      setAnswers(updatedAnswers);
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updatedAnswers })
        });
        
        const data = await response.json();

        // Calculate Category Scores for UI (1-5 Scale)
        const categories = [...new Set(QUESTIONS.map(q => q.cat))];
        const scores = {};
        
        categories.forEach(c => {
          const catQuestions = QUESTIONS.filter(q => q.cat === c);
          const sum = catQuestions.reduce((acc, q) => {
            const index = QUESTIONS.findIndex(question => question.id === q.id);
            return acc + updatedAnswers[index];
          }, 0);
          scores[c] = sum / catQuestions.length;
        });

        setResults(scores);
        setPriorities({ p1: data.p1, p2: data.p2 });
        setView('results');
        window.scrollTo(0, 0);
      } catch (error) {
        alert("Server error. Please ensure Render is online.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const reset = () => {
    setView('home');
    setCurrentStep(0);
    setAnswers([]);
    setResults(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-teal-100">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-6 md:px-20 py-5 flex justify-between items-center">
        <div className="text-2xl font-black text-teal-600 cursor-pointer" onClick={reset}>
          MindBloom
        </div>
        <button 
          onClick={() => setView('assessment')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-teal-100/50 text-sm"
        >
          {view === 'results' ? 'New Test' : 'Start Assessment'}
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* BRAIN SECTION */}
            <section className="h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative flex items-center justify-center scale-90 md:scale-110">
                <motion.div style={{ x: brainMoveLeft, opacity: brainOpacity }} className="z-20">
                  <img src={`${process.env.PUBLIC_URL}/left_brain.png`} alt="Left" className="w-52 h-auto object-contain" />
                </motion.div>
                <motion.div style={{ scale: textScale, opacity: textOpacity }} className="absolute z-10 text-center">
                  <h1 className="text-7xl md:text-8xl font-black text-teal-600 tracking-tighter italic">MindBloom</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Untangle your mind</p>
                </motion.div>
                <motion.div style={{ x: brainMoveRight, opacity: brainOpacity }} className="z-20">
                  <img src={`${process.env.PUBLIC_URL}/right_brain.png`} alt="Right" className="w-52 h-auto object-contain" />
                </motion.div>
              </div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-slate-300 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Scroll to Explore</span>
                <div className="w-[1px] h-8 bg-slate-200"></div>
              </motion.div>
            </section>

            {/* WHY SECTION */}
            <section className="py-24 max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-900">Why students <br/><span className="text-teal-600">choose us.</span></h2>
                <p className="text-xl text-slate-500 leading-relaxed font-medium">MindBloom transforms internal struggles into measurable data, providing a roadmap for emotional and behavioral growth.</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { title: "Anonymous", icon: Shield, bg: "bg-teal-50" },
                  { title: "Scalable", icon: BarChart3, bg: "bg-blue-50" },
                  { title: "Safe", icon: Heart, bg: "bg-rose-50" },
                  { title: "Insightful", icon: Monitor, bg: "bg-amber-50" }
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all group`}>
                    <item.icon size={32} className="mb-6 text-slate-800" />
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-500">Industry leading tools to support your mental journey.</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {view === 'assessment' && (
          <motion.div key="assess" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-6 py-20">
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
                <h3 className="text-2xl font-black italic text-slate-700">Analyzing patterns...</h3>
              </div>
            ) : (
              <>
                <div className="mb-12 text-center">
                  <div className="flex justify-between text-[10px] font-black text-teal-600 uppercase mb-3 tracking-[0.2em]">
                    <span>{QUESTIONS[currentStep].cat}</span>
                    <span>Question {currentStep + 1} / 25</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-teal-500" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${((currentStep + 1) / 25) * 100}%` }} 
                    />
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter text-slate-800 text-center leading-tight">
                  {QUESTIONS[currentStep].text}
                </h2>
                <p className="text-center text-slate-400 font-medium mb-12 uppercase text-[10px] tracking-widest">Select intensity from 1 (Low) to 5 (High)</p>

                <div className="flex justify-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button 
                      key={v} 
                      onClick={() => handleAnswer(v)} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-3xl border-2 border-slate-100 font-black text-2xl
                                 transition-all hover:border-teal-500 hover:bg-teal-50 hover:scale-110 active:scale-95
                                 flex items-center justify-center text-slate-400 hover:text-teal-600 shadow-sm"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8 px-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                  <span>Not at all</span>
                  <span>Extremely</span>
                </div>
              </>
            )}
          </motion.div>
        )}

        {view === 'results' && results && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <div className="bg-teal-50 text-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
              <h1 className="text-5xl font-black tracking-tighter mb-4">Your Wellness Report</h1>
              <p className="text-slate-500 font-bold italic">Analysis of your 25 behavioral data points.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(results).map(([cat, score], i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                    {/* Score based on 1-5 scale: >4 is high, >2.5 is mid */}
                    <span className={`h-2 w-2 rounded-full ${score >= 4 ? 'bg-rose-500' : score > 2.5 ? 'bg-amber-500' : 'bg-teal-500'}`}></span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-black text-slate-800">{score >= 4 ? 'High' : score > 2.5 ? 'Mid' : 'Low'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Intensity Level</p>
                    </div>
                    {/* Multiply by 20 to get percentage from 1-5 scale */}
                    <span className="text-2xl font-black text-teal-600 italic">{(score * 20).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-6 underline decoration-teal-500 underline-offset-8 italic">Primary Focus Areas</h3>
                <p className="text-slate-400 mb-4 font-bold text-teal-400 uppercase tracking-widest text-xs">Based on Priority Calculation:</p>
                <div className="flex gap-4 mb-8">
                  <span className="bg-slate-800 px-6 py-2 rounded-full border border-teal-500/30 font-bold text-teal-300">{priorities.p1}</span>
                  <span className="bg-slate-800 px-6 py-2 rounded-full border border-slate-600 font-bold text-slate-300">{priorities.p2}</span>
                </div>
                <p className="text-slate-400 mb-8 font-medium italic leading-relaxed text-lg">
                  "Your current patterns suggest a strong correlation between <strong>{priorities.p1}</strong> and your overall wellness. We recommend setting small boundaries this week."
                </p>
                <button onClick={reset} className="bg-teal-500 text-white px-12 py-4 rounded-full font-black hover:scale-105 transition-transform active:scale-95 shadow-xl">Retake Assessment</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}