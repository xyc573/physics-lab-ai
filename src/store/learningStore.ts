import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DifficultyStats {
  total: number;
  correct: number;
}

export interface PracticeStats {
  totalQuestions: number;
  correctCount: number;
  wrongQuestionIds: string[];
  difficultyStats: Record<string, DifficultyStats>;
}

export interface ExperimentRecord {
  experimentId: string;
  previewCompleted: boolean;
  simulationCompleted: boolean;
  practiceStats: PracticeStats;
  lastStudyTime: string;
}

interface LearningState {
  records: Record<string, ExperimentRecord>;
  markPreviewCompleted: (experimentId: string) => void;
  markSimulationCompleted: (experimentId: string) => void;
  recordPracticeResult: (experimentId: string, questionId: string, isCorrect: boolean, difficulty: string) => void;
  getRecord: (experimentId: string) => ExperimentRecord;
  getTotalStats: () => {
    totalExperiments: number;
    completedPreviews: number;
    completedSimulations: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongQuestions: string[];
    allRecords: ExperimentRecord[];
  };
  resetProgress: () => void;
}

const createEmptyRecord = (experimentId: string): ExperimentRecord => ({
  experimentId,
  previewCompleted: false,
  simulationCompleted: false,
  practiceStats: {
    totalQuestions: 0,
    correctCount: 0,
    wrongQuestionIds: [],
    difficultyStats: {},
  },
  lastStudyTime: new Date().toISOString(),
});

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      records: {},
      
      markPreviewCompleted: (experimentId: string) => {
        set(state => {
          const record = state.records[experimentId] || createEmptyRecord(experimentId);
          return {
            records: {
              ...state.records,
              [experimentId]: {
                ...record,
                previewCompleted: true,
                lastStudyTime: new Date().toISOString(),
              },
            },
          };
        });
      },
      
      markSimulationCompleted: (experimentId: string) => {
        set(state => {
          const record = state.records[experimentId] || createEmptyRecord(experimentId);
          return {
            records: {
              ...state.records,
              [experimentId]: {
                ...record,
                simulationCompleted: true,
                lastStudyTime: new Date().toISOString(),
              },
            },
          };
        });
      },
      
      recordPracticeResult: (experimentId: string, questionId: string, isCorrect: boolean, difficulty: string) => {
        set(state => {
          const record = state.records[experimentId] || createEmptyRecord(experimentId);
          const stats = record.practiceStats;
          const diffStats = stats.difficultyStats[difficulty] || { total: 0, correct: 0 };
          
          const alreadyAnswered = stats.wrongQuestionIds.includes(questionId) || 
            (stats.totalQuestions > 0 && stats.correctCount + stats.wrongQuestionIds.length >= stats.totalQuestions);
          
          const newWrongIds = isCorrect
            ? stats.wrongQuestionIds.filter(id => id !== questionId)
            : stats.wrongQuestionIds.includes(questionId)
              ? stats.wrongQuestionIds
              : [...stats.wrongQuestionIds, questionId];
          
          return {
            records: {
              ...state.records,
              [experimentId]: {
                ...record,
                lastStudyTime: new Date().toISOString(),
                practiceStats: {
                  totalQuestions: stats.totalQuestions + (alreadyAnswered ? 0 : 1),
                  correctCount: isCorrect 
                    ? (alreadyAnswered ? stats.correctCount : stats.correctCount + 1)
                    : stats.correctCount,
                  wrongQuestionIds: newWrongIds,
                  difficultyStats: {
                    ...stats.difficultyStats,
                    [difficulty]: {
                      total: diffStats.total + 1,
                      correct: diffStats.correct + (isCorrect ? 1 : 0),
                    },
                  },
                },
              },
            },
          };
        });
      },
      
      getRecord: (experimentId: string) => {
        return get().records[experimentId] || createEmptyRecord(experimentId);
      },
      
      getTotalStats: () => {
        const records = Object.values(get().records);
        let totalQuestions = 0;
        let correctAnswers = 0;
        let completedPreviews = 0;
        let completedSimulations = 0;
        const allWrong: string[] = [];
        
        records.forEach(r => {
          if (r.previewCompleted) completedPreviews++;
          if (r.simulationCompleted) completedSimulations++;
          totalQuestions += r.practiceStats.totalQuestions;
          correctAnswers += r.practiceStats.correctCount;
          allWrong.push(...r.practiceStats.wrongQuestionIds);
        });
        
        return {
          totalExperiments: records.length,
          completedPreviews,
          completedSimulations,
          totalQuestions,
          correctAnswers,
          wrongQuestions: allWrong,
          allRecords: records,
        };
      },
      
      resetProgress: () => set({ records: {} }),
    }),
    {
      name: 'physics-lab-learning-storage',
    }
  )
);
