import { useState, useEffect, useRef } from 'react';
import type { ObjectiveTest } from '../types';

interface QuizModalProps {
  test: ObjectiveTest;
  onClose: () => void;
  onComplete: (scorePoints: number) => void;
}

export default function QuizModal({ test, onClose, onComplete }: QuizModalProps) {
  const questions = test.questionsList || [];
  const hasQuestions = questions.length > 0;

  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizTimer, setQuizTimer] = useState(test.timeLimit * 60);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hasQuestions && quizTimer > 0 && !quizCompleted) {
      timerRef.current = setTimeout(() => {
        setQuizTimer((prev) => prev - 1);
      }, 1000);
    } else if (hasQuestions && quizTimer === 0 && !quizCompleted) {
      handleQuizSubmit();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [quizTimer, quizCompleted, hasQuestions]);

  const handleQuizSubmit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        correct++;
      }
    });

    const scorePoints = Math.round((correct / questions.length) * test.marks);
    setQuizCompleted(true);
    onComplete(scorePoints);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const correctAnswersCount = questions.filter(
    (q, idx) => selectedAnswers[idx] === q.correctOption
  ).length;

  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white w-full max-w-[365px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        
        {/* Test progress header */}
        <div className="bg-white text-slate-800 p-4 flex items-center justify-between shrink-0 border-b border-slate-100">
          {/* Glowing Timer Badge */}
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100/80 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
            <span className="material-symbols-rounded text-emerald-600 text-xs font-black animate-pulse">timer</span>
            <span className="text-[10px] font-black tracking-wider leading-none">
              {hasQuestions ? formatTimer(quizTimer) : "00:00"}
            </span>
          </div>
          
          {hasQuestions && !quizCompleted && (
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
              Q: {quizStep + 1} / {questions.length}
            </span>
          )}

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <span className="material-symbols-rounded text-base font-bold">close</span>
          </button>
        </div>

        {/* Body wrapper */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar min-h-[320px] flex flex-col">
          {!hasQuestions ? (
            /* Empty State: No Questions configured in Firestore document */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8 select-none">
              <span className="material-symbols-rounded text-orange-500 text-4xl animate-pulse">error</span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-805">Questions Not Configured</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[250px] mx-auto">
                  No questions have been configured for this mock test in Firestore yet. Contact your educator to publish questions.
                </p>
              </div>
            </div>
          ) : !quizCompleted ? (
            <div className="space-y-6">
              
              {/* Question progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full transition-all duration-350"
                  style={{ width: `${((quizStep + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* The Question */}
              <div className="space-y-2 text-left">
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block">Question {quizStep + 1} of {questions.length}</span>
                <h4 className="text-[13px] font-extrabold text-slate-850 leading-snug">
                  {questions[quizStep].questionText}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-1">
                {questions[quizStep].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [quizStep]: oIdx })}
                    className={`w-full p-3.5 text-left rounded-2xl border flex items-center justify-between transition cursor-pointer group active:scale-[0.98] ${
                      selectedAnswers[quizStep] === oIdx
                        ? 'bg-blue-50/50 border-blue-650 text-blue-700 shadow-sm shadow-blue-500/5'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50/80 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition ${
                        selectedAnswers[quizStep] === oIdx
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-450 group-hover:bg-slate-100 group-hover:text-slate-700'
                      }`}>
                        {optionLetters[oIdx] || oIdx + 1}
                      </span>
                      <span className="text-xs font-bold leading-normal">{opt}</span>
                    </div>
                    {selectedAnswers[quizStep] === oIdx && (
                      <span className="material-symbols-rounded text-sm text-blue-600">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="flex flex-col items-center justify-center text-center space-y-6 pt-4 animate-fade-in flex-1">
              <div className="relative">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-sm">
                  <span className="material-symbols-rounded text-3xl animate-bounce-soft">workspace_premium</span>
                </div>
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-550 rounded-full animate-ping"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-850">Test Submitted!</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed max-w-[240px]">
                  Excellent attempt! Your test was evaluated dynamically by the grading engine.
                </p>
              </div>

              {/* Result Score */}
              <div className="bg-slate-50 p-4 rounded-2xl w-full border border-slate-150 flex items-center justify-around shadow-sm select-none">
                <div className="text-center">
                  <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Answered</p>
                  <p className="text-sm font-black text-slate-800 pt-0.5">
                    {Object.keys(selectedAnswers).length} / {questions.length}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Correct Score</p>
                  <p className="text-sm font-black text-emerald-600 pt-0.5">
                    {correctAnswersCount} / {questions.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test actions footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          {!hasQuestions ? (
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-805 text-white text-xs font-bold rounded-2xl transition active:scale-95 cursor-pointer shadow-sm"
            >
              Close Exam
            </button>
          ) : !quizCompleted ? (
            <div className="flex justify-between items-center space-x-3 select-none">
              <button
                disabled={quizStep === 0}
                onClick={() => setQuizStep(prev => prev - 1)}
                className={`flex-1 py-3 text-xs font-bold rounded-2xl border transition cursor-pointer ${
                  quizStep === 0 
                    ? 'border-slate-205 text-slate-300 cursor-not-allowed bg-slate-100/50' 
                    : 'border-slate-200 text-slate-655 hover:bg-white active:scale-95 bg-white shadow-sm'
                }`}
              >
                Back
              </button>
              
              {quizStep === questions.length - 1 ? (
                <button
                  onClick={handleQuizSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/10 transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span className="material-symbols-rounded text-xs font-black">check</span>
                  <span>Submit Exam</span>
                </button>
              ) : (
                <button
                  onClick={() => setQuizStep(prev => prev + 1)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/10 transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Next</span>
                  <span className="material-symbols-rounded text-xs font-black">arrow_forward</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-805 text-white text-xs font-bold rounded-2xl transition active:scale-95 cursor-pointer shadow"
            >
              Return to Portal
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
