
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameStatus, PlayerAnswer, AppRole, SyncMessage, Player } from './types';
import { COMPANY_CLIENT_QUIZ } from './data/staticQuiz';
import { analyzeResults } from './services/geminiService';
import ResponseChart from './components/ResponseChart';
import TreeChart from './components/TreeChart';
import PlayerUI from './components/PlayerUI';

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole>(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('role')?.toUpperCase();
    return (r === 'PLAYER' ? 'PLAYER' : 'HOST') as AppRole;
  });

  const [isSplitView, setIsSplitView] = useState(false);
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const quiz = COMPANY_CLIENT_QUIZ;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [revealedQuestions, setRevealedQuestions] = useState<number[]>([]);
  const [timer, setTimer] = useState(30);
  const [hasVoted, setHasVoted] = useState(false);
  const [lastSelectedOption, setLastSelectedOption] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('quiz_sync');
    
    channelRef.current.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload } = event.data;
      
      if (type === 'VOTE') {
        setAnswers(prev => [...prev, payload]);
      } else if (type === 'JOIN' && role === 'HOST') {
        setPlayers(prev => {
          if (prev.find(p => p.id === payload.id)) return prev;
          const newList = [...prev, payload];
          channelRef.current?.postMessage({ type: 'PLAYER_LIST', payload: newList });
          return newList;
        });
      } else if (type === 'PLAYER_LIST' && role === 'PLAYER') {
        setPlayers(payload);
      } else if (type === 'STATE_CHANGE') {
        setStatus(payload.status);
        setCurrentIndex(payload.currentIndex);
        setRevealedQuestions(payload.revealedQuestions);
      }
    };

    return () => channelRef.current?.close();
  }, [role]);

  useEffect(() => {
    if (role === 'PLAYER' || isSplitView) {
      setHasVoted(false);
      setLastSelectedOption(null);
    }
  }, [currentIndex, status === GameStatus.LOBBY, role, isSplitView]);

  useEffect(() => {
    if (role === 'HOST') {
      channelRef.current?.postMessage({
        type: 'STATE_CHANGE',
        payload: { status, currentIndex, revealedQuestions }
      });
    }
  }, [status, currentIndex, revealedQuestions, role]);

  const fetchInsight = async () => {
    setIsAnalyzing(true);
    const insight = await analyzeResults(quiz.questions[currentIndex], answers);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const startQuiz = () => {
    setStatus(GameStatus.QUESTION_ACTIVE);
    setCurrentIndex(0);
    setRevealedQuestions([]);
    setAnswers([]);
    setTimer(30);
    setAiInsight(null);
  };

  const submitVote = (index: number) => {
    if (hasVoted || status !== GameStatus.QUESTION_ACTIVE) return;
    
    const answer: PlayerAnswer = {
      playerId: 'player-' + Math.random().toString(36).substr(2, 5),
      questionId: quiz.questions[currentIndex].id,
      optionIndex: index,
      timestamp: Date.now()
    };
    
    channelRef.current?.postMessage({ type: 'VOTE', payload: answer });
    setHasVoted(true);
    setLastSelectedOption(index);
    
    if (isSplitView) {
      setAnswers(prev => [...prev, answer]);
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handlePlayerJoin = (name: string) => {
    const newPlayer = { id: 'p-' + Math.random().toString(36).substr(2, 5), name };
    channelRef.current?.postMessage({ type: 'JOIN', payload: newPlayer });
    if (isSplitView) {
      setPlayers(prev => [...prev, newPlayer]);
    }
  };

  const simulateAnswers = useCallback(() => {
    const currentQ = quiz.questions[currentIndex];
    const newAnswers: PlayerAnswer[] = Array.from({ length: 8 }).map((_, i) => ({
      playerId: `bot-${i}-${Date.now()}`,
      questionId: currentQ.id,
      optionIndex: Math.floor(Math.random() * currentQ.options.length),
      timestamp: Date.now(),
    }));
    setAnswers(prev => [...prev, ...newAnswers]);
  }, [quiz, currentIndex]);

  useEffect(() => {
    let interval: any;
    if (status === GameStatus.QUESTION_ACTIVE && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && status === GameStatus.QUESTION_ACTIVE) {
      setStatus(GameStatus.SHOWING_RESULTS);
    }
    return () => clearInterval(interval);
  }, [status, timer]);

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
          setAiInsight(null);
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
    setPlayers([]);
    setRevealedQuestions([]);
    setAiInsight(null);
  };

  const renderHostUI = () => {
    const currentQuestion = quiz.questions[currentIndex];
    const isCorrectRevealed = status === GameStatus.SHOWING_RESULTS && revealedQuestions.includes(currentIndex);

    return (
      <div className={`min-h-screen bg-[#fcfdff] text-slate-900 font-sans ${isSplitView ? 'border-r border-slate-200' : ''}`}>
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12 py-10">
          <header className="flex justify-between items-center mb-12 pb-8 border-b-2 border-slate-100">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white shadow-2xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">ESTRATÉGICA 2025</h1>
                <p className="text-xs font-black text-[#c90c14] uppercase tracking-[0.5em] mt-1">Sesión de Análisis en Vivo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="bg-slate-50 px-6 py-3 rounded-2xl flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{players.length} JUGADORES</span>
               </div>
               <button onClick={() => setIsSplitView(!isSplitView)} className="text-[10px] font-black text-slate-300 hover:text-black uppercase tracking-widest transition-colors">
                 {isSplitView ? 'Cerrar Test' : 'Test Multijugador'}
               </button>
            </div>
          </header>

          {status === GameStatus.LOBBY && (
            <main className="max-w-6xl mx-auto py-10 animate-in fade-in duration-1000">
              <div className="text-center mb-20">
                <h2 className="text-[120px] font-black text-slate-900 mb-8 tracking-tighter leading-none uppercase">
                  Únete al <span className="text-[#c90c14]">Reto</span>
                </h2>
                
                <div className="flex justify-center items-center gap-16 mt-16">
                   <div className="bg-white p-10 rounded-[48px] shadow-3xl border border-slate-50 flex flex-col items-center">
                      <div className="w-48 h-48 bg-black rounded-3xl mb-8 flex items-center justify-center text-white font-black text-xl">QR</div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Acceso Directo</p>
                      <p className="text-5xl font-black text-slate-900 tracking-widest">882-911</p>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                      <div className="bg-black p-8 rounded-[40px] text-white min-w-[300px] text-center">
                         <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Conectados</p>
                         <p className="text-7xl font-black tabular-nums">{players.length}</p>
                      </div>
                      <button 
                        onClick={startQuiz}
                        disabled={players.length === 0 && !isSplitView}
                        className="w-full py-8 bg-[#c90c14] text-white rounded-[40px] font-black text-2xl hover:opacity-90 shadow-2xl transition-all hover:-translate-y-2 uppercase tracking-widest disabled:grayscale disabled:opacity-30"
                      >
                        Iniciar
                      </button>
                   </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-[64px] border border-slate-100 p-16 min-h-[400px]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                  {players.map((p, i) => (
                    <div key={p.id} className="bg-white p-8 rounded-3xl text-center shadow-lg shadow-slate-200/50 border border-slate-50 animate-in zoom-in duration-300" style={{ animationDelay: `${i * 30}ms` }}>
                      <div className="w-14 h-14 bg-[#c90c14] text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-lg shadow-red-100">
                        {p.name.charAt(0)}
                      </div>
                      <p className="font-black text-slate-800 tracking-tighter text-lg truncate uppercase">{p.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          )}

          {(status === GameStatus.QUESTION_ACTIVE || status === GameStatus.SHOWING_RESULTS) && currentQuestion && (
            <div className="space-y-10">
              <TreeChart quiz={quiz} revealedQuestions={revealedQuestions} />

              <div className={`grid grid-cols-1 ${isSplitView ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-10`}>
                <div className={`${isSplitView ? 'lg:col-span-1' : 'lg:col-span-8'} bg-white rounded-[64px] shadow-3xl p-16 lg:p-20 border border-slate-50 relative overflow-hidden`}>
                  <div className="flex justify-between items-center mb-16">
                     <div className="flex items-center gap-4">
                        <span className="px-6 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.4em]">PREGUNTA {currentIndex + 1}</span>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{currentQuestion.segmentLabel}</span>
                     </div>
                    {status === GameStatus.QUESTION_ACTIVE && (
                      <div className="text-6xl font-black text-[#c90c14] tabular-nums tracking-tighter">
                        {timer}s
                      </div>
                    )}
                  </div>

                  <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mb-16 tracking-tighter leading-[0.95] max-w-4xl">
                    {currentQuestion.text}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {currentQuestion.options.map((option, idx) => {
                      let style = "p-10 rounded-[56px] border-[6px] transition-all flex flex-col items-start justify-center font-black group relative h-full min-h-[180px]";
                      if (isCorrectRevealed) {
                        style += idx === currentQuestion.correctIndex ? " border-[#c90c14] bg-red-50 text-[#c90c14] scale-105" : " opacity-20 grayscale border-slate-100";
                      } else {
                        style += " border-slate-50 bg-slate-50/50 hover:bg-slate-100/50";
                      }
                      return (
                        <div key={idx} className={style}>
                          <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-lg font-black ${
                            isCorrectRevealed && idx === currentQuestion.correctIndex ? 'bg-[#c90c14] text-white' : 'bg-white text-slate-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-3xl tracking-tighter leading-none">{option}</span>
                        </div>
                      );
                    })}
                  </div>

                  {isCorrectRevealed && (
                    <div className="p-12 bg-black rounded-[56px] text-white animate-in slide-in-from-bottom-12 border-l-[16px] border-[#c90c14] shadow-2xl">
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Contexto de Valor</div>
                      <p className="text-3xl text-slate-200 leading-snug font-medium italic">"{currentQuestion.explanation}"</p>
                    </div>
                  )}
                </div>

                <div className={`${isSplitView ? 'lg:col-span-1' : 'lg:col-span-4'} space-y-10`}>
                  <div className="bg-white rounded-[64px] p-12 border border-slate-50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-10 text-center">Pulso en Tiempo Real</h3>
                    <ResponseChart question={currentQuestion} answers={answers} showCorrect={isCorrectRevealed} />
                    <div className="mt-10 flex flex-col items-center gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-black text-slate-900">{answers.length}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Votos Registrados</p>
                      </div>
                      <button onClick={simulateAnswers} className="text-[10px] font-black text-slate-200 bg-slate-50 px-8 py-4 rounded-2xl uppercase tracking-[0.3em] hover:text-black transition-colors">
                        Simular Audiencia
                      </button>
                    </div>
                  </div>

                  <div className="bg-black rounded-[64px] p-10 text-white shadow-3xl">
                    {status === GameStatus.QUESTION_ACTIVE ? (
                      <button onClick={() => setTimer(0)} className="w-full py-10 bg-white/10 text-white border-2 border-white/20 rounded-[40px] font-black text-2xl hover:bg-white/20 transition-all uppercase tracking-widest">
                        Cerrar Votos
                      </button>
                    ) : (
                      <div className="space-y-6">
                        {!aiInsight && (
                          <button 
                            onClick={fetchInsight}
                            disabled={isAnalyzing}
                            className="w-full py-6 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-[32px] font-black text-sm hover:bg-emerald-600/30 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4"
                          >
                            {isAnalyzing ? "Analizando..." : "Obtener Insight IA"}
                          </button>
                        )}
                        
                        {aiInsight && (
                          <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-[40px] mb-8 animate-in zoom-in">
                            <p className="text-emerald-400 font-bold text-lg leading-snug italic">"{aiInsight}"</p>
                          </div>
                        )}

                        <button onClick={nextStep} className="w-full py-10 bg-[#c90c14] text-white rounded-[40px] font-black text-2xl hover:opacity-90 transition-all flex items-center justify-center gap-6 group uppercase tracking-widest">
                          {!revealedQuestions.includes(currentIndex) ? "Revelar" : "Continuar"}
                          <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === GameStatus.FINISHED && (
            <main className="bg-white rounded-[100px] shadow-4xl p-24 text-center max-w-[1700px] mx-auto border border-slate-50">
              <div className="w-24 h-24 bg-[#c90c14] rounded-full mx-auto mb-12 flex items-center justify-center text-white">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[120px] font-black mb-12 text-slate-900 tracking-tighter uppercase leading-none">Visión<br/><span className="text-[#c90c14]">Completada</span></h2>
              <div className="mb-24 py-10">
                <TreeChart quiz={quiz} revealedQuestions={quiz.questions.map((_, i) => i)} />
              </div>
              <button onClick={reset} className="px-32 py-12 bg-black text-white rounded-[64px] font-black text-3xl uppercase tracking-[0.4em] hover:bg-slate-900 transition-all shadow-2xl">
                REINICIAR EVENTO
              </button>
            </main>
          )}
        </div>
      </div>
    );
  };

  if (role === 'PLAYER') {
    return (
      <PlayerUI 
        status={status} 
        currentQuestion={quiz.questions[currentIndex]} 
        onVote={submitVote} 
        onJoin={handlePlayerJoin}
        hasVoted={hasVoted}
        lastSelectedOption={lastSelectedOption}
      />
    );
  }

  return (
    <div className={`flex ${isSplitView ? 'flex-row' : 'flex-col'} min-h-screen`}>
      <div className={isSplitView ? 'w-2/3' : 'w-full'}>
        {renderHostUI()}
      </div>
      {isSplitView && (
        <div className="w-1/3 bg-slate-900 border-l-8 border-black relative overflow-y-auto">
          <div className="absolute top-6 left-6 bg-[#c90c14] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] z-50 shadow-xl">
            Simulador de Participante
          </div>
          <PlayerUI 
            status={status} 
            currentQuestion={quiz.questions[currentIndex]} 
            onVote={submitVote} 
            onJoin={handlePlayerJoin}
            hasVoted={hasVoted}
            lastSelectedOption={lastSelectedOption}
          />
        </div>
      )}
    </div>
  );
};

export default App;
