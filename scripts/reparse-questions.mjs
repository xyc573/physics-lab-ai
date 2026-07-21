import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';

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

// 提取所有段落（带图片标记）
function extractParagraphs(html) {
  const paragraphs = [];
  const parts = html.split(/<\/p>/);
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    
    // 提取纯文本
    let text = p.replace(/<[^>]+>/g, '').trim();
    
    // 提取图片
    const images = [];
    const imgPattern = /<img[^>]*src="([^"]+)"[^>]*>/g;
    let imgMatch;
    while ((imgMatch = imgPattern.exec(p)) !== null) {
      images.push(imgMatch[1]);
    }
    
    if (text || images.length > 0) {
      paragraphs.push({ text, images });
    }
  }
  return paragraphs;
}

// 将段落分割成题目
function splitIntoQuestions(paragraphs) {
  const questions = [];
  let currentQuestion = null;
  let inAnswerSection = false;
  
  for (const para of paragraphs) {
    const text = para.text;
    
    // 检测参考答案部分
    if (text.includes('参考答案') || text.includes('答案与解析') || text.includes('《')) {
      if (currentQuestion) {
        questions.push(currentQuestion);
        currentQuestion = null;
      }
      inAnswerSection = true;
      continue;
    }
    
    if (inAnswerSection) continue;
    
    // 跳过无意义的行
    if (text.includes('学校:') || text.includes('姓名：') || 
        text.includes('班级：') || text.includes('考号：') ||
        text.includes('一、实验题') || text.includes('高中物理作业') ||
        text === '') {
      continue;
    }
    
    // 检测新题目开头：数字+．.、 + 内容
    const qStartMatch = text.match(/^(\d+)[．.、]\s*/);
    if (qStartMatch) {
      const num = parseInt(qStartMatch[1]);
      if (!currentQuestion || num > currentQuestion.num) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          num,
          text: text,
          images: [...para.images],
          answerParagraphs: []
        };
        continue;
      }
    }
    
    // 添加到当前题目
    if (currentQuestion) {
      if (text) {
        currentQuestion.text += '\n' + text;
      }
      if (para.images.length > 0) {
        currentQuestion.images.push(...para.images);
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// 提取答案部分
function extractAnswers(paragraphs) {
  const answers = {};
  let inAnswerSection = false;
  let currentAnswer = null;
  
  for (const para of paragraphs) {
    const text = para.text;
    
    if (text.includes('参考答案') || text.includes('答案与解析')) {
      inAnswerSection = true;
      continue;
    }
    
    if (!inAnswerSection) continue;
    
    // 检测答案编号
    const ansMatch = text.match(/^(\d+)[．.、]\s*/);
    if (ansMatch) {
      const num = parseInt(ansMatch[1]);
      if (currentAnswer) {
        answers[currentAnswer.num] = currentAnswer;
      }
      currentAnswer = {
        num,
        text: text,
        images: [...para.images]
      };
      continue;
    }
    
    if (currentAnswer && text) {
      currentAnswer.text += '\n' + text;
      if (para.images.length > 0) {
        currentAnswer.images.push(...para.images);
      }
    }
  }
  
  if (currentAnswer) {
    answers[currentAnswer.num] = currentAnswer;
  }
  
  return answers;
}

// 智能判断题型
function determineQuestionType(question, answerText) {
  const text = question.text;
  
  // 提取题目末尾的部分（最后300字符），更容易判断
  const tailText = text.substring(Math.max(0, text.length - 400));
  
  // 检查是否有"下列说法正确的是"等典型选择题特征
  const choiceIndicators = [
    '下列说法正确的是',
    '下列说法错误的是',
    '下列选项正确的是',
    '正确的是',
    '错误的是',
    '下列操作正确的是',
    '下列措施中',
    '以下说法正确的是',
    '以下说法错误的是',
    '下列关于',
    '下列判断正确的是',
    '下列说法中正确的是',
    '下列说法中错误的是',
  ];
  
  const hasChoiceIndicator = choiceIndicators.some(ind => tailText.includes(ind) || text.includes(ind));
  
  // 提取可能的选项行
  const lines = text.split('\n');
  const optionLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // 匹配A. 或 A．或 A、开头的行
    if (/^A[．.、\s]/.test(trimmed)) {
      optionLines.push(trimmed);
    }
  }
  
  // 如果没有选项行，直接返回填空题
  if (optionLines.length === 0) {
    return { type: 'fill', options: null };
  }
  
  // 检查是否有连续的A、B、C、D选项
  let hasABCD = false;
  let options = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^A[．.、\s]/.test(line)) {
      // 检查接下来的几行是否有B、C、D
      const potentialOptions = [];
      potentialOptions.push(line.replace(/^A[．.、\s]+/, ''));
      
      for (let j = 1; j <= 4; j++) {
        if (i + j < lines.length) {
          const nextLine = lines[i + j].trim();
          const letterMatch = nextLine.match(/^([B-D])[．.、\s]+/);
          if (letterMatch) {
            potentialOptions.push(nextLine.replace(/^[B-D][．.、\s]+/, ''));
          } else {
            break;
          }
        }
      }
      
      if (potentialOptions.length >= 3) {
        hasABCD = true;
        options = potentialOptions;
        break;
      }
    }
  }
  
  // 如果没有连续的ABCD选项，返回填空题
  if (!hasABCD || options.length < 3) {
    return { type: 'fill', options: null };
  }
  
  // 检查选项内容是否合理（长度合适，不包含下一题内容）
  const avgOptionLength = options.reduce((sum, o) => sum + o.length, 0) / options.length;
  if (avgOptionLength > 150) {
    // 选项太长，可能是把题目正文也混进去了
    return { type: 'fill', options: null };
  }
  
  // 检查答案是否是字母形式
  const cleanAnswer = answerText.trim();
  const answerIsLetter = /^[A-D]+$/.test(cleanAnswer) || /^[A-D]$/.test(cleanAnswer);
  
  // 如果有选择题特征 + 有连续ABCD选项 + 答案是字母，则判定为选择题
  if (hasChoiceIndicator && options.length >= 3 && answerIsLetter) {
    const type = options.length > 4 || cleanAnswer.length > 1 ? 'multiple' : 'single';
    return { type, options };
  }
  
  // 如果选项很明确（3-4个）且答案是字母，也可以判定
  if (options.length >= 3 && options.length <= 4 && answerIsLetter && hasChoiceIndicator) {
    const type = cleanAnswer.length > 1 ? 'multiple' : 'single';
    return { type, options };
  }
  
  // 默认为填空题（实验题大多是填空题）
  return { type: 'fill', options: null };
}

// 从答案文本中提取答案和解析
function extractAnswerAndExplanation(answerText) {
  let answer = '';
  let explanation = '';
  
  // 查找【详解】标记
  const detailIndex = answerText.indexOf('【详解】');
  if (detailIndex >= 0) {
    answer = answerText.substring(0, detailIndex).trim();
    explanation = answerText.substring(detailIndex + 4).trim();
  } else {
    // 没有详解，全部作为答案
    answer = answerText.trim();
    explanation = '详细解析请参考教材相关内容。';
  }
  
  // 清理答案：去掉题号
  answer = answer.replace(/^\d+[．.、\s]*/, '').trim();
  
  return { answer, explanation };
}

// 处理单个文件
async function processFile(filePath, experimentId, difficulty) {
  const imageBuffers = {};
  let imageIndex = 0;
  
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(imageBuffer) {
          imageIndex++;
          const imgKey = `image_${imageIndex}.png`;
          if (image.contentType === 'image/png' && imageBuffer.length > 10000) {
            imageBuffers[imgKey] = {
              buffer: imageBuffer,
              size: imageBuffer.length,
              contentType: image.contentType
            };
          }
          return { src: imgKey, alt: image.altText || '' };
        });
      })
    }
  );
  
  const paragraphs = extractParagraphs(result.value);
  const questions = splitIntoQuestions(paragraphs);
  const answers = extractAnswers(paragraphs);
  
  // 处理每道题
  const processedQuestions = [];
  for (const q of questions) {
    const answerData = answers[q.num];
    const answerText = answerData ? answerData.text : '';
    const { answer, explanation } = extractAnswerAndExplanation(answerText);
    const { type, options } = determineQuestionType(q, answer);
    
    // 过滤图片（只保留大的PNG图片）
    const questionImages = q.images.filter(src => imageBuffers[src]);
    
    processedQuestions.push({
      num: q.num,
      text: q.text,
      type,
      options,
      answer: type === 'multiple' ? answer.split('').sort().join('') : answer,
      explanation,
      images: questionImages,
      imageBuffers: questionImages.map(src => imageBuffers[src]).filter(Boolean)
    });
  }
  
  return { questions: processedQuestions, imageBuffers };
}

// 主函数
async function reparseAllQuestions() {
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个docx文件\n`);
  
  const allQuestions = [];
  let totalChoiceQuestions = 0;
  let totalFillQuestions = 0;
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    
    const { experimentName, difficulty } = parsed;
    const experimentId = experimentIdMap[experimentName];
    if (!experimentId) continue;
    
    try {
      const { questions } = await processFile(filePath, experimentId, difficulty);
      
      const choiceCount = questions.filter(q => q.type === 'single' || q.type === 'multiple').length;
      const fillCount = questions.filter(q => q.type === 'fill').length;
      totalChoiceQuestions += choiceCount;
      totalFillQuestions += fillCount;
      
      console.log(`✓ ${file}: ${questions.length}题 (选择${choiceCount}/填空${fillCount})`);
      
      // 添加到总列表
      for (const q of questions) {
        allQuestions.push({
          id: `${experimentId}-${difficulty}-${q.num}`,
          experimentId,
          type: q.type,
          difficulty,
          content: q.text,
          options: q.options || undefined,
          answer: q.answer || '见解析',
          explanation: q.explanation || '详细解析请参考教材相关内容。',
          knowledgePoints: [],
          images: q.images.length > 0 ? q.images.map((_, i) => 
            `/question-images/${experimentId}-${difficulty}-${q.num}-${i + 1}.png`
          ) : undefined
        });
      }
      
    } catch (error) {
      console.error(`✗ 处理失败: ${file}`, error.message);
    }
  }
  
  console.log(`\n========================`);
  console.log(`总题目数: ${allQuestions.length}`);
  console.log(`选择题: ${totalChoiceQuestions}`);
  console.log(`填空题: ${totalFillQuestions}`);
  
  // 保存
  const outputPath = 'scripts/reparsed-questions.json';
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n已保存到: ${outputPath}`);
  
  // 输出选择题样例
  console.log('\n=== 选择题样例（前10个）===');
  const choiceSamples = allQuestions.filter(q => q.type === 'single' || q.type === 'multiple').slice(0, 10);
  choiceSamples.forEach(q => {
    console.log(`\n[${q.id}] ${q.type}`);
    console.log(`  ${q.content.substring(0, 100)}...`);
    if (q.options) {
      q.options.forEach((opt, i) => {
        console.log(`  ${String.fromCharCode(65 + i)}. ${opt.substring(0, 60)}`);
      });
    }
    console.log(`  答案: ${q.answer}`);
  });
}

reparseAllQuestions().catch(console.error);
