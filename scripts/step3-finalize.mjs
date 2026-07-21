import * as fs from 'fs';

// 第三步：替换占位符，生成最终数据
function step3() {
  console.log('第三步：替换公式图片占位符...\n');
  
  const data = JSON.parse(fs.readFileSync('temp-questions-step1.json', 'utf-8'));
  
  let totalFormulas = 0;
  let formulaCounter = 0;
  
  // 先扫描所有占位符，建立全局映射
  // 占位符格式: __IMG_{expId}_{diff}_{idx}__
  // 我们需要按出现顺序映射到 formula_1.wmf, formula_2.wmf ...
  
  // 收集所有占位符出现的顺序
  const allPlaceholders = []; // [{placeholder, type}]
  const seen = new Set();
  
  // 扫描每个题目的三个html字段
  for (const q of data) {
    const htmlFields = [q.contentHtml, q.answerHtml, q.explanationHtml];
    for (const html of htmlFields) {
      if (!html) continue;
      const regex = /__IMG_([^_]+)_([^_]+)_(\d+)__/g;
      let m;
      while ((m = regex.exec(html)) !== null) {
        const placeholder = m[0];
        if (!seen.has(placeholder)) {
          seen.add(placeholder);
          allPlaceholders.push(placeholder);
        }
      }
    }
  }
  
  console.log(`找到 ${allPlaceholders.length} 个唯一图片占位符`);
  
  // 建立映射：placeholder -> formula_N.png 或 figure路径
  const placeholderMap = {};
  
  for (const placeholder of allPlaceholders) {
    // 判断是配图还是公式
    // 配图的占位符已经在第一步保存了文件，我们需要找到对应的文件
    // 实际上，第一步中：
    // - 配图：文件名为 {expId}-{diff}-fig-{idx}.png
    // - 公式：文件名为 formula_{n}.png，按全局出现顺序
    
    const m = placeholder.match(/__IMG_([^_]+)_([^_]+)_(\d+)__/);
    if (!m) continue;
    const expId = m[1];
    const diff = m[2];
    const idx = m[3];
    
    // 先检查是不是配图
    const figPath = `public/question-images/${expId}-${diff}-fig-${idx}.png`;
    if (fs.existsSync(figPath)) {
      placeholderMap[placeholder] = `/question-images/${expId}-${diff}-fig-${idx}.png`;
    } else {
      // 公式，按顺序分配formula编号
      formulaCounter++;
      placeholderMap[placeholder] = `/question-formulas/formula_${formulaCounter}.png`;
      totalFormulas++;
    }
  }
  
  console.log(`其中公式: ${totalFormulas}, 配图: ${allPlaceholders.length - totalFormulas}`);
  
  // 替换所有题目中的占位符
  for (const q of data) {
    // 替换三个HTML字段
    q.contentHtml = replacePlaceholders(q.contentHtml, placeholderMap);
    q.answerHtml = replacePlaceholders(q.answerHtml, placeholderMap);
    q.explanationHtml = replacePlaceholders(q.explanationHtml, placeholderMap);
    
    // 重新计算hasFormula
    q.hasFormula = q.contentHtml.includes('question-formulas') || 
                   q.answerHtml.includes('question-formulas') || 
                   q.explanationHtml.includes('question-formulas');
  }
  
  // 保存最终数据
  fs.writeFileSync('src/data/questions-data.json', JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\n第三步完成！`);
  console.log(`  总题数: ${data.length}`);
  console.log(`  有公式: ${data.filter(q => q.hasFormula).length}`);
  console.log(`  有配图: ${data.filter(q => q.images).length}`);
  console.log(`  保存到: src/data/questions-data.json`);
}

function replacePlaceholders(html, map) {
  if (!html) return html;
  return html.replace(/__IMG_[^_]+_[^_]+_\d+__/g, (match) => {
    if (map[match]) {
      return map[match];
    }
    return match;
  });
}

step3();
