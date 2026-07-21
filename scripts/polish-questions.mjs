import * as fs from 'fs';

// 读取最新解析的数据
const questions = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));
// 读取之前的图片映射
const imageMapping = JSON.parse(fs.readFileSync('scripts/question-image-mapping.json', 'utf-8'));

console.log(`当前题目数: ${questions.length}`);
console.log(`图片映射题目数: ${Object.keys(imageMapping).length}`);

// 修复每道题
let imgAdded = 0;
let ansCleaned = 0;

for (const q of questions) {
  // 1. 补充图片
  if (imageMapping[q.id] && (!q.images || q.images.length === 0)) {
    q.images = imageMapping[q.id];
    imgAdded++;
  }
  
  // 2. 清理答案中的题号（去掉开头的 "1．" 或 "1."）
  if (q.answer) {
    const original = q.answer;
    // 去掉开头的 "数字．" 或 "数字."
    q.answer = q.answer.replace(/^\d+[．.、]\s*/, '').trim();
    // 如果开头还有多余的换行和空格，清理
    q.answer = q.answer.replace(/^\n+/, '').trim();
    if (original !== q.answer) {
      ansCleaned++;
    }
  }
  
  // 3. 清理内容中的开头题号
  if (q.content) {
    q.content = q.content.replace(/^\d+[．.、]\s*/, '').trim();
  }
}

console.log(`补充图片: ${imgAdded} 道`);
console.log(`清理答案题号: ${ansCleaned} 道`);

// 保存
fs.writeFileSync('src/data/questions-data.json', JSON.stringify(questions, null, 2), 'utf-8');
console.log('\n已保存到 src/data/questions-data.json');

// 最终统计
const withExpl = questions.filter(q => q.explanation && q.explanation.length > 20).length;
const withImg = questions.filter(q => q.images && q.images.length > 0).length;
const withKP = questions.filter(q => q.knowledgePoints && q.knowledgePoints.length > 0).length;

console.log(`\n最终统计:`);
console.log(`  总题数: ${questions.length}`);
console.log(`  有详细解析: ${withExpl}`);
console.log(`  有题目配图: ${withImg}`);
console.log(`  有知识点: ${withKP}`);

// 抽样
console.log('\n=== 抽样（前3题）===');
questions.slice(0, 3).forEach(q => {
  console.log(`\n[${q.id}]`);
  console.log(`  内容开头: ${q.content.substring(0, 60)}...`);
  console.log(`  答案开头: ${q.answer.substring(0, 60)}...`);
  console.log(`  解析长度: ${q.explanation.length}`);
  console.log(`  知识点: ${q.knowledgePoints.join(', ')}`);
  console.log(`  图片: ${q.images ? q.images.length + '张' : '无'}`);
});
