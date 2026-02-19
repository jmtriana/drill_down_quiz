
import React, { useState } from 'react';
import { Question, GameStatus } from '../types';

interface PlayerUIProps {
  status: GameStatus;
  currentQuestion?: Question;
  onVote: (index: number) => void;
  onJoin: (name: string) => void;
  hasVoted: boolean;
  lastSelectedOption: number | null;
}

const PlayerUI: React.FC<PlayerUIProps> = ({ status, currentQuestion, onVote, onJoin, hasVoted, lastSelectedOption }) => {
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name);
      setIsJoined(true);
      if ("vibrate" in navigator) navigator.vibrate([30, 10, 30]);
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-black flex flex-col p-10 justify-center items-center text-white font-sans">
        <div className="w-24 h-24 bg-[#c90c14] rounded-[32px] mb-16 flex items-center justify-center shadow-[0_0_60px_rgba(201,12,20,0.4)] animate-pulse">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 className="text-5xl font-black mb-12 tracking-tighter uppercase italic text-center leading-none">Entra al<br/><span className="text-[#c90c14]">Análisis</span></h2>
        <form onSubmit={handleJoinSubmit} className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">Identifícate para participar</p>
            <input 
              type="text" 
              placeholder="NOMBRE" 
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border-4 border-white/10 rounded-[32px] px-8 py-8 text-center text-3xl font-black tracking-widest focus:border-[#c90c14] focus:bg-white/10 transition-all outline-none"
              maxLength={12}
            />
          </div>
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full py-8 bg-[#c90c14] rounded-[32px] font-black text-2xl uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(201,12,20,0.3)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-10"
          >
            INGRESAR
          </button>
        </form>
      </div>
    );
  }

  if (status === GameStatus.LOBBY) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-12 text-white text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#c90c14] rounded-full blur-[40px] opacity-20 animate-pulse"></div>
          <div className="w-32 h-32 bg-[#c90c14] rounded-[40px] flex items-center justify-center relative shadow-2xl">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">¡DENTRO, {name}!</h2>
        <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">Mira la pantalla principal...</p>
        
        <div className="mt-20 flex flex-col items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#c90c14] animate-ping"></div>
           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Esperando Señal</span>
        </div>
      </div>
    );
  }

  if (status === GameStatus.QUESTION_ACTIVE && currentQuestion && !hasVoted) {
    return (
      <div className="min-h-screen bg-black flex flex-col p-8">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Sesión Estratégica</p>
            <p className="text-lg font-black text-white uppercase italic">{currentQuestion.segmentLabel}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#c90c14] shadow-[0_0_15px_#c90c14]"></div>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-6 py-4">
          {currentQuestion.options.map((option, idx) => {
            const styles = [
              'bg-[#c90c14] shadow-[0_15px_30px_rgba(201,12,20,0.3)]', 
              'bg-slate-800 shadow-[0_15px_30px_rgba(30,41,59,0.3)]', 
              'bg-slate-900 shadow-[0_15px_30px_rgba(15,23,42,0.3)]', 
              'bg-slate-950 shadow-[0_15px_30px_rgba(2,6,23,0.3)]'
            ];
            return (
              <button 
                key={idx}
                onClick={() => onVote(idx)}
                className={`${styles[idx % styles.length]} rounded-[40px] text-white font-black text-6xl shadow-xl active:scale-95 transition-all flex items-center justify-center border-2 border-white/5 hover:border-white/20`}
              >
                {String.fromCharCode(65 + idx)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (status === GameStatus.QUESTION_ACTIVE && hasVoted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-white text-center animate-in fade-in">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Voto Enviado</h3>
        <p className="text-white/40 font-bold text-sm uppercase tracking-[0.3em]">Analizando Pulso de la Sala</p>
      </div>
    );
  }

  if (status === GameStatus.SHOWING_RESULTS && currentQuestion) {
    const isCorrect = lastSelectedOption === currentQuestion.correctIndex;
    
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-12 text-white text-center transition-all duration-700 ${isCorrect ? 'bg-emerald-600' : 'bg-[#c90c14]'}`}>
        <div className="w-32 h-32 bg-white/20 rounded-[48px] flex items-center justify-center mb-12 shadow-2xl backdrop-blur-md">
          {isCorrect ? (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h2 className="text-6xl font-black mb-6 uppercase italic tracking-tighter leading-none">
          {isCorrect ? '¡ACIERTO!' : 'ERROR'}
        </h2>
        <p className="text-white/80 font-bold text-xl max-w-xs leading-tight">
          {isCorrect 
            ? 'Tu análisis es correcto.' 
            : `Era la opción ${String.fromCharCode(65 + currentQuestion.correctIndex)}.`
          }
        </p>
        <div className="mt-20 flex flex-col items-center gap-4">
           <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-white animate-progress-fast"></div>
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Sincronizando Insights</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-white text-center font-sans">
      <h2 className="text-3xl font-black mb-6 uppercase tracking-widest italic opacity-40">KNOWLEDGE TREE</h2>
      <div className="w-16 h-1.5 bg-[#c90c14] rounded-full animate-pulse shadow-[0_0_20px_#c90c14]"></div>
      {status === GameStatus.FINISHED && (
        <div className="mt-16 space-y-4 animate-in slide-in-from-bottom-8">
           <p className="text-emerald-400 font-black text-2xl uppercase tracking-tighter">ESTRUCTURA COMPLETADA</p>
           <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Fin de la Sesión</p>
        </div>
      )}
    </div>
  );
};

export default PlayerUI;
