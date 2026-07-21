import * as fs from 'fs';

// 读取当前题目数据
const questions = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));
// 读取图片映射
const imageMapping = JSON.parse(fs.readFileSync('scripts/question-image-mapping.json', 'utf-8'));

console.log(`原有题目: ${questions.length} 道`);
console.log(`有图片的题目: ${Object.keys(imageMapping).length} 道`);

// 统计原来的题型
const oldTypes = {};
questions.forEach(q => {
  oldTypes[q.type] = (oldTypes[q.type] || 0) + 1;
});
console.log(`原有题型分布:`, oldTypes);

// 更新每道题：改为填空题，移除错误的options，补充图片
let updated = 0;
let imgAdded = 0;

for (const q of questions) {
  // 全部改为填空题
  if (q.type !== 'fill') {
    q.type = 'fill';
    updated++;
  }
  
  // 移除错误的options
  if (q.options) {
    delete q.options;
  }
  
  // 补充图片（如果映射里有）
  if (imageMapping[q.id] && (!q.images || q.images.length === 0)) {
    q.images = imageMapping[q.id];
    imgAdded++;
  }
}

console.log(`\n修改为填空题: ${updated} 道`);
console.log(`补充图片: ${imgAdded} 道`);

// 保存
fs.writeFileSync('src/data/questions-data.json', JSON.stringify(questions, null, 2), 'utf-8');
console.log('\n已保存到 src/data/questions-data.json');

// 最终统计
const finalTypes = {};
const withImg = questions.filter(q => q.images && q.images.length > 0).length;
questions.forEach(q => {
  finalTypes[q.type] = (finalTypes[q.type] || 0) + 1;
});
console.log(`\n最终统计:`);
console.log(`  总题数: ${questions.length}`);
console.log(`  题型:`, finalTypes);
console.log(`  有图题目: ${withImg}`);

// 抽样检查
console.log('\n=== 抽样检查（前3题）===');
questions.slice(0, 3).forEach(q => {
  console.log(`\n[${q.id}] ${q.type}`);
  console.log(`  内容: ${q.content.substring(0, 100)}...`);
  console.log(`  图片: ${q.images ? q.images.length + '张' : '无'}`);
  console.log(`  答案: ${q.answer.substring(0, 50)}...`);
  console.log(`  有options: ${q.options ? '是' : '否'}`);
});
