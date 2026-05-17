export type Difficulty = 'fácil' | 'médio' | 'difícil';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: Difficulty;
  explanation: string; // Justificativa da resposta
  isBonus?: boolean;
  isMaldade?: boolean;
  hint?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  score: number;
  is_eliminated: boolean;
  last_answer?: number | null;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  aidsUsed: {
    fiftyFifty: boolean;
    hint: boolean;
    probabilities: boolean;
  };
  isGameOver: boolean;
  isWinner: boolean;
  timeLeft: number;
  selectedOption: number | null;
  showResult: boolean;
  roomStatus: 'waiting' | 'playing' | 'finished';
}