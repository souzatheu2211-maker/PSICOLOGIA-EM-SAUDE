export type Difficulty = 'fácil' | 'médio' | 'difícil';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // 0-3 (A-D)
  difficulty: Difficulty;
  isBonus?: boolean;
  isMaldade?: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  status: 'finalizou' | 'eliminado';
  date: string;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  aidsUsed: {
    fiftyFifty: boolean;
    audience: boolean;
    phone: boolean;
  };
  isGameOver: boolean;
  isWinner: boolean;
  eliminatedReason?: string;
  correctCount: number;
  wrongCount: number;
  showProfessorTrick: boolean;
  professorTrickDone: boolean;
}