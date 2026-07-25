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
      if (selectedAnswers[idx] === q.answer) {
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
    (q, idx) => selectedAnswers[idx] === q.answer
  ).length;

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-slate-150 animate-slide-up">
        
        {/* Test progress header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-rounded text-emerald-400">timer</span>
            <span className="text-xs font-black tracking-wider">
              {hasQuestions ? formatTimer(quizTimer) : "00:00"}
            </span>
          </div>
          
          {hasQuestions && !quizCompleted && (
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Q: {quizStep + 1} / {questions.length}
            </span>
          )}

          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <span className="material-symbols-rounded text-sm">close</span>
          </button>
        </div>

        {/* Body wrapper */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar min-h-[300px] flex flex-col">
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
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-350"
                  style={{ width: `${((quizStep + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* The Question */}
              <div className="space-y-4">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Question {quizStep + 1}</span>
                <h4 className="text-sm font-bold text-slate-800 leading-snug">
                  {questions[quizStep].q}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {questions[quizStep].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [quizStep]: oIdx })}
                    className={`w-full p-3.5 text-left rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      selectedAnswers[quizStep] === oIdx
                        ? 'bg-blue-600/10 border-blue-600 text-blue-600'
                        : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedAnswers[quizStep] === oIdx && (
                      <span className="material-symbols-rounded text-sm text-blue-600">radio_button_checked</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="flex flex-col items-center justify-center text-center space-y-6 pt-4 animate-fade-in flex-1">
              <div className="relative">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-50">
                  <span className="material-symbols-rounded text-3xl animate-bounce-soft">workspace_premium</span>
                </div>
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-800">Test Submitted!</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Excellent attempt! Your test was evaluated dynamically by the grading engine.
                </p>
              </div>

              {/* Result Score */}
              <div className="bg-slate-50 p-4 rounded-2xl w-full border border-slate-100 flex items-center justify-around">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Questions Answered</p>
                  <p className="text-base font-black text-slate-800">
                    {Object.keys(selectedAnswers).length} / {questions.length}
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Correct Answers</p>
                  <p className="text-base font-black text-emerald-600">
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
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer"
            >
              Close Exam
            </button>
          ) : !quizCompleted ? (
            <div className="flex justify-between items-center space-x-3 select-none">
              <button
                disabled={quizStep === 0}
                onClick={() => setQuizStep(prev => prev - 1)}
                className={`flex-1 py-3 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  quizStep === 0 
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' 
                    : 'border-slate-250 text-slate-650 hover:bg-white active:scale-95'
                }`}
              >
                Back
              </button>
              
              {quizStep === questions.length - 1 ? (
                <button
                  onClick={handleQuizSubmit}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition active:scale-95 cursor-pointer"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setQuizStep(prev => prev + 1)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition active:scale-95 cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer"
            >
              Return to Portal
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
