
import React from 'react';
import { Question, GameStatus } from '../types';

interface PlayerUIProps {
  status: GameStatus;
  currentQuestion?: Question;
  onVote: (index: number) => void;
  hasVoted: boolean;
  playerName: string;
}

const PlayerUI: React.FC<PlayerUIProps> = ({ status, currentQuestion, onVote, hasVoted, playerName }) => {
  if (status === GameStatus.LOBBY) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="w-24 h-24 bg-[#c90c14] rounded-3xl flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-red-900/20">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">¡Conectado!</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Esperando al presentador...</p>
        <div className="mt-12 bg-white/5 px-6 py-3 rounded-full font-black text-xs text-slate-500 uppercase tracking-widest border border-white/5">{playerName}</div>
      </div>
    );
  }

  if (status === GameStatus.QUESTION_ACTIVE && currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6">
        <div className="mb-8 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Vivo: {currentQuestion.segmentLabel}</span>
          <div className="w-2.5 h-2.5 rounded-full bg-[#c90c14] animate-pulse"></div>
        </div>

        {hasVoted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Respuesta Enviada</h3>
            <p className="text-slate-400 font-bold text-sm">Mira la pantalla principal para los resultados</p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 gap-4 py-4">
            {currentQuestion.options.map((option, idx) => {
              const colors = [
                'bg-[#c90c14]', 
                'bg-slate-900', 
                'bg-slate-700', 
                'bg-slate-500'
              ];
              return (
                <button 
                  key={idx}
                  onClick={() => onVote(idx)}
                  className={`${colors[idx % colors.length]} rounded-3xl text-white font-black text-4xl shadow-lg active:scale-95 transition-all flex items-center justify-center`}
                >
                  {String.fromCharCode(65 + idx)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white text-center">
      <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Analizando Resultados</h2>
      <div className="w-12 h-1 bg-[#c90c14] rounded-full animate-pulse"></div>
    </div>
  );
};

export default PlayerUI;
