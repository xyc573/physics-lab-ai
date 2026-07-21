export type ExperimentCategory = 'book1' | 'book2' | 'book3' | 'selective1' | 'selective2' | 'selective3';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Principle {
  title: string;
  content: string;
  formulas?: string[];
  notes?: string[];
}

export interface Equipment {
  name: string;
  icon: string;
  purpose: string;
  usage: string;
}

export interface SimulationConfig {
  type: string;
  initialParams: Record<string, number>;
  paramRanges: Record<string, { min: number; max: number; step: number; label: string; unit?: string }>;
}

export interface Experiment {
  id: string;
  name: string;
  category: ExperimentCategory;
  difficulty: Difficulty;
  description: string;
  icon: string;
  preview: {
    middleSchoolConnection: string[];
    principles: Principle[];
    equipment: Equipment[];
  };
  simulation: SimulationConfig;
}

export const categoryLabels: Record<ExperimentCategory, string> = {
  book1: '必修 第一册',
  book2: '必修 第二册',
  book3: '必修 第三册',
  selective1: '选择性必修 第一册',
  selective2: '选择性必修 第二册',
  selective3: '选择性必修 第三册',
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '适中',
  hard: '困难',
};

export const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};
