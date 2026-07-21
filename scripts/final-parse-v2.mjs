import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const outputDir = 'public/question-images';

const experimentIdMap = {
  '利用传感器制作简单的自动控制装置': 'sensor-control',
  '导体电阻率的测量': 'resistivity',
  '探究两个互成角度的力的合成规律': 'force-composition',
  '探究加速度与力、质量的关系': 'acceleration-force',
  '探究变压器原、副线圈电压与匝数的关系': 'transformer',
  '探究向心力大小与半径、角速度、质量的关系': 'centripetal-force',
  '探究小车速度随时间变化的规律': 'velocity-time',
  '探究平抛运动的特点': 'projectile-motion',
  '探究弹簧弹力与形变量的关系': 'spring-force',
  '探究感应电流产生的条件': 'induction-current',
  '探究等温情况下一定质量气体压强与体积的关系': 'boyle-law',
  '测量玻璃的折射率': 'refraction',
  '用单摆测量重力加速度': 'simple-pendulum',
  '用双缝干涉测量光的波长': 'double-slit',
  '用油膜法估测油酸分子的大小': 'oil-film',
  '电源电动势和内阻的测量': 'emf-internal-resistance',
  '练习使用多用电表': 'multimeter',
  '观察电容器的充放电现象': 'capacitor-charge',
  '长度的测量及其测量工具的选用': 'length-measurement',
  '验证动量守恒定律': 'momentum-conservation',
  '验证机械能守恒定律': 'mechanical-energy',
};

function parseFileName(fileName) {
  const name = fileName.replace(/\.docx$/, '');
  let difficulty = 'medium';
  if (name.includes('（困难）') || name.includes('(困难)')) difficulty = 'hard';
  else if (name.includes('（简单）') || name.includes('(简单)')) difficulty = 'easy';
  else if (name.includes('（适中）') || name.includes('(适中)')) difficulty = 'medium';
  let experimentName = name.replace(/（困难）|（简单）|（适中）|\(困难\)|\(简单\)|\(适中\)/g, '');
  if (experimentName === '测量玻璃的折射率测量玻璃的折射率') {
    experimentName = '测量玻璃的折射率';
  }
  return { experimentName, difficulty };
}

// 用mammoth提取原始文本，然后用正则分割题目
async function extractQuestions(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;
  
  // 找到参考答案位置
  const ansMarker = text.indexOf('参考答案');
  const questionText = ansMarker >= 0 ? text.substring(0, ansMarker) : text;
  const answerText = ansMarker >= 0 ? text.substring(ansMarker) : '';
  
  // 分割题目：按数字+．.开头
  const questions = [];
  const qPattern = /(?:^|\n)(\d+)[．.、]\s*/g;
  const matches = [];
  let m;
  while ((m = qPattern.exec(questionText)) !== null) {
    matches.push({ num: parseInt(m[1]), index: m.index + m[0].length });
  }
  
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1][0].length + matches[i + 1].index : questionText.length;
    const content = questionText.substring(start, end).trim();
    
    // 过滤掉太短或头部信息
    if (content.length < 20) continue;
    if (content.includes('学校:') || content.includes('姓名：')) continue;
    
    questions.push({
      num: matches[i].num,
      content
    });
  }
  
  // 分割答案
  const answers = {};
  if (answerText) {
    const aPattern = /(?:^|\n)(\d+)[．.、]\s*/g;
    const aMatches = [];
    let am;
    while ((am = aPattern.exec(answerText)) !== null) {
      aMatches.push({ num: parseInt(am[1]), index: am.index + am[0].length });
    }
    
    for (let i = 0; i < aMatches.length; i++) {
      const start = aMatches[i].index;
      const end = i + 1 < aMatches.length ? aMatches[i + 1].index - aMatches[i + 1][0].length + aMatches[i + 1].index : answerText.length;
      const content = answerText.substring(start, end).trim();
      
      // 分离答案和解析
      let ans = content;
      let expl = '';
      const detailIdx = content.indexOf('【详解】');
      if (detailIdx >= 0) {
        ans = content.substring(0, detailIdx).trim();
        expl = content.substring(detailIdx + 4).trim();
      }
      
      answers[aMatches[i].num] = { answer: ans, explanation: expl };
    }
  }
  
  return { questions, answers };
}

// 主函数
async function main() {
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个文件\n`);
  
  // 读取图片映射
  const imageMapping = JSON.parse(fs.readFileSync('scripts/question-image-mapping.json', 'utf-8'));
  
  const allQuestions = [];
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    
    const { experimentName, difficulty } = parsed;
    const experimentId = experimentIdMap[experimentName];
    if (!experimentId) continue;
    
    try {
      const { questions, answers } = await extractQuestions(filePath);
      
      for (const q of questions) {
        const ans = answers[q.num] || { answer: '', explanation: '' };
        const qId = `${experimentId}-${difficulty}-${q.num}`;
        
        allQuestions.push({
          id: qId,
          experimentId,
          type: 'fill',  // 全部填空题
          difficulty,
          content: q.content,
          answer: ans.answer || '见解析',
          explanation: ans.explanation || '详细解析请参考教材相关内容。',
          knowledgePoints: [],
          images: imageMapping[qId] || undefined
        });
      }
      
      console.log(`✓ ${file}: ${questions.length}题`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  }
  
  console.log(`\n总共 ${allQuestions.length} 道题`);
  
  // 保存
  fs.writeFileSync('src/data/questions-data.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log('已保存到 src/data/questions-data.json');
  
  // 统计
  const withImg = allQuestions.filter(q => q.images && q.images.length > 0).length;
  console.log(`\n有图片的题目: ${withImg}/${allQuestions.length}`);
  
  // 按实验统计
  const stats = {};
  allQuestions.forEach(q => {
    if (!stats[q.experimentId]) stats[q.experimentId] = 0;
    stats[q.experimentId]++;
  });
  console.log('\n各实验题数:');
  Object.entries(stats).forEach(([id, n]) => {
    console.log(`  ${id}: ${n}`);
  });
}

main().catch(console.error);
