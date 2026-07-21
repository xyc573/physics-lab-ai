import { create } from 'zustand';
import type { Question } from '../types/question';

interface QuestionState {
  questions: Question[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  loadQuestions: () => Promise<void>;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  loading: true,
  error: null,
  loaded: false,
  
  loadQuestions: async () => {
    if (get().loaded && get().questions.length > 0) {
      set({ loading: false });
      return;
    }
    
    try {
      set({ loading: true, error: null });
      const res = await fetch('./questions.json?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      set({ questions: data, loading: false, loaded: true });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, loaded: true });
    }
  },
}));

export const getQuestionsByExperimentId = (experimentId: string, questions: Question[]) => {
  return questions.filter(q => q.experimentId === experimentId);
};

export const getQuestionsByDifficulty = (experimentId: string, difficulty: string, questions: Question[]) => {
  return questions.filter(q => q.experimentId === experimentId && q.difficulty === difficulty);
};
