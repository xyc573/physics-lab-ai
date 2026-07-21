import * as fs from 'fs';

// 读取原始解析的289题
const questions = JSON.parse(fs.readFileSync('scripts/parsed-questions.json', 'utf-8')).questions;
// 读取图片映射
const imageMapping = JSON.parse(fs.readFileSync('scripts/question-image-mapping.json', 'utf-8'));

console.log(`原始题目: ${questions.length} 道`);

// 统计原来的题型
const oldTypes = {};
questions.forEach(q => {
  oldTypes[q.type] = (oldTypes[q.type] || 0) + 1;
});
console.log(`原有题型:`, oldTypes);

// 修改每道题
let imgCount = 0;
for (const q of questions) {
  // 1. 全部改为填空题
  q.type = 'fill';
  
  // 2. 移除错误的options
  if (q.options) {
    delete q.options;
  }
  
  // 3. 补充图片
  if (imageMapping[q.id]) {
    q.images = imageMapping[q.id];
    imgCount++;
  }
}

console.log(`\n补充图片的题目: ${imgCount} 道`);

// 保存
fs.writeFileSync('src/data/questions-data.json', JSON.stringify(questions, null, 2), 'utf-8');
console.log('已保存到 src/data/questions-data.json');

// 验证
const final = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));
console.log(`\n最终统计:`);
console.log(`  总题数: ${final.length}`);
console.log(`  有图片: ${final.filter(q => q.images && q.images.length > 0).length}`);
console.log(`  有options: ${final.filter(q => q.options).length}`);
console.log(`  选择题: ${final.filter(q => q.type === 'single' || q.type === 'multiple').length}`);
console.log(`  填空题: ${final.filter(q => q.type === 'fill').length}`);

// 抽样
console.log('\n=== 抽样 ===');
final.slice(10, 13).forEach(q => {
  console.log(`\n[${q.id}] ${q.type}`);
  console.log(`  ${q.content.substring(0, 80)}...`);
  console.log(`  图片: ${q.images ? q.images.length + '张' : '无'}`);
  console.log(`  答案: ${q.answer.substring(0, 60)}...`);
});
