import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';

// 实验名称到ID的映射
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

// 从文件名解析实验名称和难度
function parseFileName(fileName) {
  const name = fileName.replace(/\.docx$/, '');
  
  let difficulty = 'medium';
  if (name.includes('（困难）') || name.includes('(困难)')) difficulty = 'hard';
  else if (name.includes('（简单）') || name.includes('(简单)')) difficulty = 'easy';
  else if (name.includes('（适中）') || name.includes('(适中)')) difficulty = 'medium';
  else difficulty = 'medium';
  
  let experimentName = name.replace(/（困难）|（简单）|（适中）|\(困难\)|\(简单\)|\(适中\)/g, '');
  
  if (experimentName === '测量玻璃的折射率测量玻璃的折射率') {
    experimentName = '测量玻璃的折射率';
  }
  
  return { experimentName, difficulty };
}

// 解析单个docx文件内容，提取题目
function parseQuestions(text, experimentId, difficulty) {
  const questions = [];
  
  const answerMarker = '参考答案';
  const answerIndex = text.indexOf(answerMarker);
  
  let questionPart = text;
  let answerPart = '';
  
  if (answerIndex !== -1) {
    questionPart = text.substring(0, answerIndex);
    answerPart = text.substring(answerIndex);
  }
  
  // 提取题目：匹配数字序号开头
  const questionPattern = /(\d+)[．.]\s*([\s\S]*?)(?=\n\s*\d+[．.]|$)/g;
  let match;
  let questionNum = 0;
  
  while ((match = questionPattern.exec(questionPart)) !== null) {
    questionNum++;
    const fullContent = match[2].trim();
    
    // 跳过非题目内容
    if (fullContent.includes('学校:') || fullContent.includes('姓名：') || fullContent.length < 20) {
      continue;
    }
    
    let type = 'fill';
    let options = undefined;
    
    // 检查是否有选项A B C D
    if (fullContent.match(/[A-D][．.、\s]/) && fullContent.includes('B') && fullContent.includes('C')) {
      const optionA = fullContent.match(/A[．.、\s]+(.*?)(?=B[．.、\s])/s);
      const optionB = fullContent.match(/B[．.、\s]+(.*?)(?=C[．.、\s])/s);
      const optionC = fullContent.match(/C[．.、\s]+(.*?)(?=D[．.、\s]|$)/s);
      const optionD = fullContent.match(/D[．.、\s]+(.*?)$/s);
      
      if (optionA && optionB && optionC) {
        options = [
          optionA[1].trim().replace(/\n/g, ' '),
          optionB[1].trim().replace(/\n/g, ' '),
          optionC[1].trim().replace(/\n/g, ' '),
          optionD ? optionD[1].trim().replace(/\n/g, ' ') : ''
        ].filter(o => o);
        type = 'single';
      }
    }
    
    let content = fullContent;
    if (options) {
      const optionStart = fullContent.search(/[A-D][．.、\s]/);
      if (optionStart > 0) {
        content = fullContent.substring(0, optionStart).trim();
      }
    }
    
    content = content.replace(/\n{3,}/g, '\n\n').trim();
    
    // 从答案部分提取对应题目的答案
    const answerPattern = new RegExp(`${questionNum}[．.][\\s\\S]*?(?=${questionNum + 1}[．.]|【详解】|$)`, 'g');
    const answerMatch = answerPart.match(answerPattern);
    
    let answer = '';
    let explanation = '';
    
    if (answerMatch) {
      const answerContent = answerMatch[0];
      
      const detailMatch = answerContent.match(/【详解】([\s\S]*?)$/);
      if (detailMatch) {
        explanation = detailMatch[1].trim();
      }
      
      if (options) {
        // 选择题：在答案部分寻找字母
        const lines = answerContent.split('\n');
        let foundAnswer = false;
        for (const line of lines) {
          if (line.includes('【详解】')) break;
          const letterMatch = line.match(/([A-D])/g);
          if (letterMatch && !foundAnswer) {
            const uniqueLetters = [...new Set(letterMatch)].sort();
            answer = uniqueLetters.join('');
            if (uniqueLetters.length > 1) {
              type = 'multiple';
            } else {
              type = 'single';
            }
            foundAnswer = true;
            break;
          }
        }
      } else {
        // 填空题：提取答案
        const lines = answerContent.split('\n');
        let answerLines = [];
        let inDetail = false;
        for (const line of lines) {
          if (line.includes('【详解】')) {
            inDetail = true;
            continue;
          }
          if (!inDetail && line.trim() && !line.match(/^\d+[．.]/)) {
            answerLines.push(line.trim());
          }
        }
        answer = answerLines.join(' ').trim();
      }
    }
    
    explanation = explanation.replace(/\n{3,}/g, '\n').trim();
    if (!explanation) {
      explanation = '详细解析请参考教材相关内容。';
    }
    if (!answer) {
      answer = '见解析';
    }
    
    if (content.length > 15) {
      questions.push({
        id: `${experimentId}-${difficulty}-${questionNum}`,
        experimentId,
        type,
        difficulty,
        content,
        options: options && options.length > 0 ? options : undefined,
        answer,
        explanation,
        knowledgePoints: [],
      });
    }
  }
  
  return questions;
}

// 主函数：解析所有docx文件
async function parseAllFiles() {
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个docx文件\n`);
  
  const allQuestions = [];
  const experimentNames = new Set();
  const parseResults = [];
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    
    if (!parsed) {
      console.log(`跳过文件: ${file}`);
      continue;
    }
    
    const { experimentName, difficulty } = parsed;
    const experimentId = experimentIdMap[experimentName];
    
    if (!experimentId) {
      console.log(`未找到实验ID映射: ${experimentName} (${file})`);
      continue;
    }
    
    experimentNames.add(experimentName);
    
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      
      const questions = parseQuestions(text, experimentId, difficulty);
      allQuestions.push(...questions);
      
      parseResults.push({
        file,
        experimentName,
        experimentId,
        difficulty,
        questionCount: questions.length,
      });
      
      console.log(`✓ ${file}: ${questions.length} 题`);
    } catch (error) {
      console.error(`✗ 解析失败: ${file}`, error.message);
    }
  }
  
  console.log(`\n========================`);
  console.log(`实验数量: ${experimentNames.size}`);
  console.log(`题目总数: ${allQuestions.length}`);
  
  // 统计各实验题目数
  const expStats = {};
  allQuestions.forEach(q => {
    expStats[q.experimentId] = (expStats[q.experimentId] || 0) + 1;
  });
  
  console.log('\n各实验题目统计:');
  Object.entries(expStats).forEach(([id, count]) => {
    const name = Object.entries(experimentIdMap).find(([_, v]) => v === id)?.[0];
    console.log(`  ${name}: ${count} 题`);
  });
  
  // 保存到JSON文件
  const outputPath = 'scripts/parsed-questions.json';
  fs.writeFileSync(outputPath, JSON.stringify({
    questions: allQuestions,
    experimentNames: Array.from(experimentNames),
    parseResults,
  }, null, 2), 'utf-8');
  
  console.log(`\n解析结果已保存到: ${outputPath}`);
  
  // 输出样本题目
  console.log('\n=== 样本题目（前3个）===');
  allQuestions.slice(0, 3).forEach((q, i) => {
    console.log(`\n题目 ${i + 1}:`);
    console.log(`  ID: ${q.id}`);
    console.log(`  类型: ${q.type}, 难度: ${q.difficulty}`);
    console.log(`  内容: ${q.content.substring(0, 120)}...`);
    if (q.options) {
      console.log(`  选项: ${q.options.join(' | ')}`);
    }
    console.log(`  答案: ${q.answer}`);
    console.log(`  解析: ${q.explanation.substring(0, 120)}...`);
  });
}

parseAllFiles().catch(console.error);
