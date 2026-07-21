import * as fs from 'fs';

// 读取解析好的题目数据
const data = JSON.parse(fs.readFileSync('scripts/parsed-questions.json', 'utf-8'));
const questions = data.questions;

// 生成一个安全的JSON文件，供TS直接import
const jsonContent = JSON.stringify(questions, null, 2);
fs.writeFileSync('src/data/questions-data.json', jsonContent, 'utf-8');
console.log(`已生成 src/data/questions-data.json，共 ${questions.length} 道题目`);

// 生成questions.ts文件，从JSON导入
const tsContent = `import type { Question } from '../types/question';
import questionsData from './questions-data.json';

export const questions: Question[] = questionsData as Question[];

export const getQuestionsByExperimentId = (experimentId: string) => {
  return questions.filter(q => q.experimentId === experimentId);
};

export const getQuestionsByDifficulty = (experimentId: string, difficulty: string) => {
  return questions.filter(q => q.experimentId === experimentId && q.difficulty === difficulty);
};
`;

fs.writeFileSync('src/data/questions.ts', tsContent, 'utf-8');
console.log('已生成 src/data/questions.ts');

// 统计信息
const expStats = {};
questions.forEach(q => {
  if (!expStats[q.experimentId]) {
    expStats[q.experimentId] = { easy: 0, medium: 0, hard: 0, total: 0 };
  }
  expStats[q.experimentId][q.difficulty]++;
  expStats[q.experimentId].total++;
});

console.log('\n各实验题目统计:');
Object.entries(expStats).forEach(([id, stats]) => {
  console.log(`  ${id}: ${stats.total} 题 (简单${stats.easy}/适中${stats.medium}/困难${stats.hard})`);
});
