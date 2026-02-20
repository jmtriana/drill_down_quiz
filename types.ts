
export interface Question {
  id: string;
  text: string;
  options: string[];
  optionValues: number[];
  optionMonetaryValues?: number[]; // Nuevo campo para valores monetarios
  optionLabels: string[];
  correctIndex: number;
  explanation: string;
  segmentLabel: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerAnswer {
  playerId: string;
  questionId: string;
  optionIndex: number;
  timestamp: number;
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  QUESTION_ACTIVE = 'QUESTION_ACTIVE',
  SHOWING_RESULTS = 'SHOWING_RESULTS',
  FINISHED = 'FINISHED'
}

export type AppRole = 'HOST' | 'PLAYER';

export interface QuizData {
  title: string;
  initialTotal: number;
  initialMonetaryTotal?: number; // Total monetario inicial
  initialLabel: string;
  description: string;
  questions: Question[];
}

export interface SyncMessage {
  type: 'VOTE' | 'STATE_CHANGE' | 'JOIN' | 'PLAYER_LIST';
  payload: any;
}
