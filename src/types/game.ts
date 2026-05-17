export type Difficulty = 'fácil' | 'médio' | 'difícil';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: Difficulty;
  explanation: string;
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
  current_question?: number;
}

export interface GameState {
  currentQuestionIndex: number; // -1 = Pegadinha do Professor
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
  hiddenOptions: number[];
  questionStartedAt: string | null;
}