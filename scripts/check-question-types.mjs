import * as fs from 'fs';

const questions = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));

// 统计各类型
const typeStats = {};
questions.forEach(q => {
  typeStats[q.type] = (typeStats[q.type] || 0) + 1;
});

console.log('=== 题型统计 ===');
console.log(typeStats);

// 找出所有被标记为选择题的题目，检查选项
console.log('\n=== 选择题样例（前20个）===');
const choiceQuestions = questions.filter(q => q.type === 'single' || q.type === 'multiple');
choiceQuestions.slice(0, 20).forEach(q => {
  console.log(`\n[${q.id}] ${q.type}`);
  console.log(`  题目: ${q.content.substring(0, 80)}...`);
  console.log(`  选项:`);
  if (q.options) {
    q.options.forEach((opt, i) => {
      console.log(`    ${String.fromCharCode(65 + i)}. ${opt.substring(0, 60)}...`);
    });
  }
  console.log(`  答案: ${q.answer}`);
});
