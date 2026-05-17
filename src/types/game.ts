export type Difficulty = 'fácil' | 'médio' | 'difícil';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: Difficulty;
  isBonus?: boolean;
  isMaldade?: boolean;
  hint?: string; // Nova propriedade para a ajuda de Dica
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
}