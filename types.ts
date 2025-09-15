

export type PracticeCategoryId = 'verbal' | 'quantitative' | 'non-verbal' | 'creative';

export interface Question {
  question: string;
  options: string[];
  isImageBased: boolean;
  correctAnswerIndex: number;
  explanation: string;
  subCategory: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: PracticeCategoryId | 'daily' | 'smart';
  name: string;
  description: string;
  icon: JSX.Element;
}

export interface UserAnswer {
  questionIndex: number;
  answerIndex: number;
  isCorrect: boolean;
}

export enum GameState {
  GradeSelection = 'gradeSelection',
  Home = 'home',
  Quiz = 'quiz',
  Results = 'results',
  Progress = 'progress',
  TutorChat = 'tutorChat',
  CreativeQuiz = 'creativeQuiz',
  CreativeResult = 'creativeResult',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserData {
  grade: number | null;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // ISO date string
  unlockedAchievements: string[]; // List of achievement IDs
  quizCompletions: {
    verbal: number;
    quantitative: number;
    'non-verbal': number;
    smart: number;
    creative: number;
  };
  performance: {
    [subCategory: string]: {
        correct: number;
        total: number;
    };
  };
  perfectScores: number;
  totalCorrectAnswers: number;
}

export interface AllQuestions {
  verbal: Question[];
  quantitative: Question[];
  'non-verbal': Question[];
}

export interface CachedQuestions {
  date: string; // YYYY-MM-DD
  questions: AllQuestions;
}

export type ChatMessage = { 
  role: 'user' | 'model'; 
  text: string; 
};

export interface CreativeQuestion { 
  prompt: string; 
}

export interface CreativeResult {
  prompt: string;
  answer: string;
  feedback: string;
}
