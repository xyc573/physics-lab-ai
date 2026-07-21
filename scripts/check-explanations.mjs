import * as fs from 'fs';

const questions = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));

// 统计
let hasExplanation = 0;
let defaultExplanation = 0;
let hasKnowledgePoints = 0;
let emptyAnswer = 0;

for (const q of questions) {
  if (q.explanation && q.explanation !== '详细解析请参考教材相关内容。' && q.explanation.length > 20) {
    hasExplanation++;
  } else {
    defaultExplanation++;
  }
  
  if (q.knowledgePoints && q.knowledgePoints.length > 0) {
    hasKnowledgePoints++;
  }
  
  if (!q.answer || q.answer === '见解析' || q.answer.length < 2) {
    emptyAnswer++;
  }
}

console.log('=== 当前题库统计 ===');
console.log(`总题数: ${questions.length}`);
console.log(`有详细解析: ${hasExplanation}`);
console.log(`默认解析: ${defaultExplanation}`);
console.log(`有知识点: ${hasKnowledgePoints}`);
console.log(`答案缺失/过短: ${emptyAnswer}`);

// 抽样看几个题的答案和解析
console.log('\n=== 抽样检查（前5题）===');
questions.slice(0, 5).forEach(q => {
  console.log(`\n[${q.id}]`);
  console.log(`  答案: ${q.answer.substring(0, 80)}...`);
  console.log(`  解析长度: ${q.explanation.length}`);
  console.log(`  解析: ${q.explanation.substring(0, 80)}...`);
});
