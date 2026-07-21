import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/questions-data.json', 'utf-8'));

// 修复嵌套img标签问题
function fixHtml(html) {
  if (!html) return html;
  // mammoth生成的是 <img src="__IMG_xxx__" alt="" />
  // 然后我们替换成 <img src="<img src="..." class="formula-inline" />" alt="" />
  // 这导致了嵌套。需要修复。
  
  // 正确做法：直接替换img的src属性，而不是整个占位符
  // 但现在数据已经生成了，我们来修复
  
  // 匹配 <img src="<img src="xxx" class="formula-inline" />" alt="" />
  // 替换为 <img src="xxx" class="formula-inline" />
  return html.replace(/<img\s+src="<img\s+src="([^"]+)"\s+class="formula-inline"\s+\/?>"[^>]*\/?\s*>/g, 
    '<img src="$1" class="formula-inline" />');
}

let fixedCount = 0;
for (const q of data) {
  const before = JSON.stringify([q.contentHtml, q.answerHtml, q.explanationHtml]);
  q.contentHtml = fixHtml(q.contentHtml);
  q.answerHtml = fixHtml(q.answerHtml);
  q.explanationHtml = fixHtml(q.explanationHtml);
  const after = JSON.stringify([q.contentHtml, q.answerHtml, q.explanationHtml]);
  if (before !== after) fixedCount++;
}

fs.writeFileSync('src/data/questions-data.json', JSON.stringify(data, null, 2), 'utf-8');

console.log(`修复了 ${fixedCount} 道题目的嵌套img标签`);

// 再验证一下
const sample = data.find(q => q.explanationHtml && q.explanationHtml.includes('整理得'));
if (sample) {
  console.log('\n样例解析（前1000字）:');
  console.log(sample.explanationHtml.substring(0, 1000));
  console.log('\n检查是否还有嵌套img:', sample.explanationHtml.includes('<img src="<img'));
}
