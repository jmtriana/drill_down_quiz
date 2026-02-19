
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameStatus, PlayerAnswer, AppRole, SyncMessage } from './types';
import { COMPANY_CLIENT_QUIZ } from './data/staticQuiz';
import ResponseChart from './components/ResponseChart';
import TreeChart from './components/TreeChart';
import PlayerUI from './components/PlayerUI';

const App: React.FC = () => {
  // Check URL for role, default to HOST
  const [role, setRole] = useState<AppRole>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('role') as AppRole) || 'HOST';
  });

  const [status, setStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const quiz = COMPANY_CLIENT_QUIZ;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [revealedQuestions, setRevealedQuestions] = useState<number[]>([]);
  const [timer, setTimer] = useState(30);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Real-time Sync Channel (In a real app, this would be Firebase/Supabase)
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('quiz_sync');
    
    channelRef.current.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload } = event.data;
      
      if (role === 'HOST') {
        if (type === 'VOTE') {
          setAnswers(prev => [...prev, payload]);
        }
      } else {
        if (type === 'STATE_CHANGE') {
          setStatus(payload.status);
          setCurrentIndex(payload.currentIndex);
          setRevealedQuestions(payload.revealedQuestions);
          setHasVoted(false); // Reset vote state for new question
        }
      }
    };

    return () => channelRef.current?.close();
  }, [role]);

  // HOST: Broadcaster of state
  useEffect(() => {
    if (role === 'HOST') {
      channelRef.current?.postMessage({
        type: 'STATE_CHANGE',
        payload: { status, currentIndex, revealedQuestions }
      });
    }
  }, [status, currentIndex, revealedQuestions, role]);

  const startQuiz = () => {
    setStatus(GameStatus.QUESTION_ACTIVE);
    setCurrentIndex(0);
    setRevealedQuestions([]);
    setAnswers([]);
    setTimer(30);
  };

  const submitVote = (index: number) => {
    if (hasVoted) return;
    const answer: PlayerAnswer = {
      playerId: 'player-' + Math.random().toString(36).substr(2, 5),
      questionId: quiz.questions[currentIndex].id,
      optionIndex: index,
      timestamp: Date.now()
    };
    channelRef.current?.postMessage({ type: 'VOTE', payload: answer });
    setHasVoted(true);
  };

  const simulateAnswers = useCallback(() => {
    const currentQ = quiz.questions[currentIndex];
    const newAnswers: PlayerAnswer[] = Array.from({ length: 5 }).map((_, i) => ({
      playerId: `bot-${i}-${Date.now()}`,
      questionId: currentQ.id,
      optionIndex: Math.floor(Math.random() * currentQ.options.length),
      timestamp: Date.now(),
    }));
    setAnswers(prev => [...prev, ...newAnswers]);
  }, [quiz, currentIndex]);

  useEffect(() => {
    let interval: any;
    if (role === 'HOST' && status === GameStatus.QUESTION_ACTIVE && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && status === GameStatus.QUESTION_ACTIVE) {
      setStatus(GameStatus.SHOWING_RESULTS);
    }
    return () => clearInterval(interval);
  }, [status, timer, role]);

  const nextStep = () => {
    if (status === GameStatus.SHOWING_RESULTS) {
      if (!revealedQuestions.includes(currentIndex)) {
        setRevealedQuestions(prev => [...prev, currentIndex]);
      } else {
        if (currentIndex < quiz.questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setTimer(30);
          setAnswers([]);
          setStatus(GameStatus.QUESTION_ACTIVE);
        } else {
          setStatus(GameStatus.FINISHED);
        }
      }
    }
  };

  const reset = () => {
    setStatus(GameStatus.LOBBY);
    setCurrentIndex(0);
    setAnswers([]);
    setRevealedQuestions([]);
  };

  // If Player role, show the Mobile Interface
  if (role === 'PLAYER') {
    return (
      <PlayerUI 
        status={status} 
        currentQuestion={quiz.questions[currentIndex]} 
        onVote={submitVote} 
        hasVoted={hasVoted}
        playerName="Participante"
      />
    );
  }

  // Host View Logic
  const currentQuestion = quiz.questions[currentIndex];
  const isCorrectRevealed = status === GameStatus.SHOWING_RESULTS && revealedQuestions.includes(currentIndex);

  return (
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-8 py-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1 uppercase">ESTRATÉGICA 2025</h1>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Panel de Presentador</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              ID SESIÓN: 882-911
            </div>
            <button 
              onClick={() => window.open(window.location.href + '?role=player', '_blank')}
              className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all rounded-xl uppercase tracking-widest shadow-sm"
            >
              Abrir Vista Jugador
            </button>
            {status !== GameStatus.LOBBY && (
              <button onClick={reset} className="text-slate-300 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {status === GameStatus.LOBBY && (
          <main className="max-w-5xl mx-auto py-20 text-center animate-in fade-in duration-1000 slide-in-from-bottom-8">
            <div className="mb-24">
              <h2 className="text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.85]">
                Conoce a tu <br/><span className="text-indigo-600 italic">Audiencia Real.</span>
              </h2>
              <p className="text-2xl text-slate-400 font-semibold max-w-3xl mx-auto leading-relaxed tracking-tight">
                Escanea el código o entra a la URL para participar en vivo desde tu dispositivo móvil.
              </p>
            </div>

            <div className="bg-white p-12 rounded-[56px] shadow-2xl shadow-indigo-100/20 border border-slate-50 max-w-2xl mx-auto mb-20 flex flex-col items-center">
               <div className="w-48 h-48 bg-slate-900 rounded-3xl mb-8 flex items-center justify-center p-4">
                 <div className="w-full h-full bg-white rounded-xl flex items-center justify-center font-black text-slate-900 text-4xl">QR</div>
               </div>
               <div className="text-3xl font-black text-slate-900 tracking-widest mb-2">882-911</div>
               <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Código de la Sala</p>
            </div>

            <button 
              onClick={startQuiz}
              className="px-20 py-8 bg-slate-900 text-white rounded-[40px] font-black text-2xl hover:bg-black shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-2 active:scale-95 uppercase tracking-widest"
            >
              Iniciar Sesión de Voto
            </button>
          </main>
        )}

        {(status === GameStatus.QUESTION_ACTIVE || status === GameStatus.SHOWING_RESULTS) && currentQuestion && (
          <div className="space-y-12">
            <div className="animate-in slide-in-from-top-12 duration-1000">
              <TreeChart quiz={quiz} revealedQuestions={revealedQuestions} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-white rounded-[56px] shadow-2xl shadow-indigo-100/30 p-14 border border-slate-50 relative">
                <div className="flex justify-between items-center mb-12">
                   <span className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                      PREGUNTA {currentIndex + 1}
                    </span>
                  {status === GameStatus.QUESTION_ACTIVE && (
                    <div className="text-4xl font-black text-indigo-100 tabular-nums animate-pulse">
                      {timer}s
                    </div>
                  )}
                </div>

                <h2 className="text-5xl font-black text-slate-900 mb-16 tracking-tighter leading-[1.05]">
                  {currentQuestion.text}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  {currentQuestion.options.map((option, idx) => {
                    let style = "p-10 rounded-[48px] border-4 transition-all flex flex-col items-center justify-center text-center font-black group relative h-full min-h-[220px]";
                    if (isCorrectRevealed) {
                      style += idx === currentQuestion.correctIndex ? " border-emerald-500 bg-emerald-50 text-emerald-800 scale-105" : " opacity-40 grayscale";
                    } else {
                      style += " border-slate-50 bg-slate-50/50";
                    }
                    return (
                      <div key={idx} className={style}>
                        <div className={`w-14 h-14 rounded-3xl mx-auto mb-6 flex items-center justify-center text-xs font-black ${
                          isCorrectRevealed && idx === currentQuestion.correctIndex ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-3xl tracking-tighter">{option}</span>
                      </div>
                    );
                  })}
                </div>

                {isCorrectRevealed && (
                  <div className="p-12 bg-slate-900 rounded-[56px] text-white animate-in slide-in-from-bottom-8">
                    <p className="text-2xl text-slate-200 leading-snug font-medium italic">"{currentQuestion.explanation}"</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-10">
                <div className="bg-white rounded-[56px] p-12 border border-slate-50 shadow-xl shadow-slate-100">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-10">Resultados en Tiempo Real</h3>
                  <ResponseChart question={currentQuestion} answers={answers} showCorrect={isCorrectRevealed} />
                  <div className="mt-8 flex justify-center">
                    <button onClick={simulateAnswers} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl uppercase tracking-widest">
                      Añadir Bots (+5 votos)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl">
                  <div className="space-y-6">
                    {status === GameStatus.QUESTION_ACTIVE ? (
                      <button onClick={() => setTimer(0)} className="w-full py-8 bg-white text-slate-900 rounded-[32px] font-black text-xl hover:bg-indigo-50 transition-all">
                        Cerrar Votación
                      </button>
                    ) : (
                      <button onClick={nextStep} className="w-full py-8 bg-indigo-600 text-white rounded-[32px] font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 group">
                        {!revealedQuestions.includes(currentIndex) ? "Revelar Rama" : "Siguiente Nivel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === GameStatus.FINISHED && (
          <main className="bg-white rounded-[80px] shadow-2xl p-24 text-center max-w-6xl mx-auto border border-slate-50">
            <h2 className="text-7xl font-black mb-8 text-slate-900 tracking-tighter uppercase">Protocolo Finalizado</h2>
            <div className="mb-24 scale-105">
              <TreeChart quiz={quiz} revealedQuestions={quiz.questions.map((_, i) => i)} />
            </div>
            <button onClick={reset} className="px-24 py-10 bg-slate-900 text-white rounded-[48px] font-black text-2xl uppercase tracking-[0.3em]">
              Reiniciar Sesión
            </button>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
