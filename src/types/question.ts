import type { Difficulty } from './experiment';

export type QuestionType = 'single' | 'multiple' | 'fill';

export interface Question {
  id: string;
  experimentId: string;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  contentHtml?: string;
  options?: string[];
  answer: string | string[];
  answerHtml?: string;
  explanation: string;
  explanationHtml?: string;
  knowledgePoints: string[];
  images?: string[];
  hasFormula?: boolean;
}
