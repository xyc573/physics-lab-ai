import * as fs from 'fs';

// 读取题目数据
const questionsData = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));

// 读取图片映射
const imageMapping = JSON.parse(fs.readFileSync('scripts/question-image-mapping.json', 'utf-8'));

console.log(`原有题目数: ${questionsData.length}`);
console.log(`有图片的题目数: ${Object.keys(imageMapping).length}`);

// 合并图片到题目数据
let updatedCount = 0;
for (const question of questionsData) {
  if (imageMapping[question.id]) {
    question.images = imageMapping[question.id];
    updatedCount++;
  }
}

console.log(`已更新图片的题目数: ${updatedCount}`);

// 保存更新后的数据
fs.writeFileSync('src/data/questions-data.json', JSON.stringify(questionsData, null, 2), 'utf-8');
console.log('已保存到 src/data/questions-data.json');

// 统计各实验有图片的题目数
const expStats = {};
for (const q of questionsData) {
  if (!expStats[q.experimentId]) {
    expStats[q.experimentId] = { total: 0, withImages: 0 };
  }
  expStats[q.experimentId].total++;
  if (q.images && q.images.length > 0) {
    expStats[q.experimentId].withImages++;
  }
}

console.log('\n各实验图片统计:');
Object.entries(expStats).forEach(([id, stats]) => {
  console.log(`  ${id}: ${stats.withImages}/${stats.total} 题有图`);
});
