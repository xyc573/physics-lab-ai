import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));

// 检查单摆实验
const pendulum = data.filter(q => q.experimentId === 'simple-pendulum');
console.log('单摆实验题目数:', pendulum.length);

// 找包含"小钢球"或"等效摆长"的题目
const target = pendulum.find(q => 
  (q.contentHtml && q.contentHtml.includes('小钢球')) ||
  (q.explanationHtml && q.explanationHtml.includes('等效摆长')) ||
  (q.contentHtml && q.contentHtml.includes('管道'))
);

if (target) {
  console.log('\n=== 找到目标题目:', target.id, '===');
  console.log('\n--- 题目内容 ---');
  console.log(target.contentHtml.substring(0, 800));
  console.log('\n--- 答案 ---');
  console.log(target.answerHtml?.substring(0, 500));
  console.log('\n--- 解析 ---');
  console.log(target.explanationHtml?.substring(0, 1000));
  
  const formulaCount = (target.explanationHtml?.match(/question-formulas/g) || []).length;
  console.log('\n解析中的公式图片数:', formulaCount);
} else {
  console.log('没找到特定题目，展示一道单摆题:');
  if (pendulum[0]) {
    console.log('题目ID:', pendulum[0].id);
    console.log('解析前800字:', pendulum[0].explanationHtml?.substring(0, 800));
  }
}

console.log('\n=== 总体统计 ===');
console.log('总题数:', data.length);
console.log('有公式的题目:', data.filter(q => q.hasFormula).length);
console.log('有配图的题目:', data.filter(q => q.images).length);
console.log('有解析的题目:', data.filter(q => q.explanationHtml && q.explanationHtml.length > 10).length);
console.log('有知识点的题目:', data.filter(q => q.knowledgePoints && q.knowledgePoints.length > 0).length);
