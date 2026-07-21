import * as fs from 'fs';
import mammoth from 'mammoth';
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

// 提取段落
function extractParagraphs(html) {
  const paragraphs = [];
  const parts = html.split(/<\/p>/);
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    let text = p.replace(/<[^>]+>/g, '').trim();
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

// 分割题目
function splitQuestions(paragraphs) {
  const questions = [];
  let current = null;
  let inAnswer = false;
  let answerSectionStart = -1;
  
  // 先找到答案部分的位置
  for (let i = 0; i < paragraphs.length; i++) {
    if (paragraphs[i].text.includes('参考答案') || paragraphs[i].text.includes('答案与解析')) {
      answerSectionStart = i;
      break;
    }
  }
  
  // 处理题目部分
  for (let i = 0; i < (answerSectionStart >= 0 ? answerSectionStart : paragraphs.length); i++) {
    const para = paragraphs[i];
    const text = para.text;
    
    // 跳过头部
    if (text.includes('学校:') || text.includes('姓名：') || 
        text.includes('班级：') || text.includes('考号：') ||
        text.includes('一、实验题') || text.includes('高中物理作业') ||
        text === '') {
      continue;
    }
    
    // 检测新题目
    const qMatch = text.match(/^(\d+)[．.、]\s*/);
    if (qMatch) {
      const num = parseInt(qMatch[1]);
      if (!current || num > current.num) {
        if (current) questions.push(current);
        current = { num, text, images: [...para.images] };
        continue;
      }
    }
    
    // 添加到当前题目
    if (current) {
      if (text) current.text += '\n' + text;
      if (para.images.length > 0) current.images.push(...para.images);
    }
  }
  
  if (current) questions.push(current);
  
  // 处理答案部分
  const answers = {};
  if (answerSectionStart >= 0) {
    let curAns = null;
    for (let i = answerSectionStart; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const text = para.text;
      
      if (text.includes('参考答案') || text.includes('答案与解析')) continue;
      
      const ansMatch = text.match(/^(\d+)[．.、]\s*/);
      if (ansMatch) {
        const num = parseInt(ansMatch[1]);
        if (curAns) answers[curAns.num] = curAns;
        curAns = { num, text };
        continue;
      }
      
      if (curAns && text) {
        curAns.text += '\n' + text;
      }
    }
    if (curAns) answers[curAns.num] = curAns;
  }
  
  return { questions, answers };
}

// 处理单个文件
async function processFile(filePath, experimentId, difficulty) {
  const imageBuffers = {};
  let imgIdx = 0;
  
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(buf) {
          imgIdx++;
          const key = `img_${imgIdx}.png`;
          if (image.contentType === 'image/png' && buf.length > 10000) {
            imageBuffers[key] = buf;
          }
          return { src: key, alt: '' };
        });
      })
    }
  );
  
  const paragraphs = extractParagraphs(result.value);
  const { questions, answers } = splitQuestions(paragraphs);
  
  const processed = [];
  for (const q of questions) {
    const ans = answers[q.num];
    const ansText = ans ? ans.text : '';
    
    // 分离答案和解析
    let answer = '';
    let explanation = '';
    const detailIdx = ansText.indexOf('【详解】');
    if (detailIdx >= 0) {
      answer = ansText.substring(0, detailIdx).trim();
      explanation = ansText.substring(detailIdx + 4).trim();
    } else {
      answer = ansText.trim();
      explanation = '详细解析见参考答案内容。';
    }
    
    // 清理答案中的题号
    answer = answer.replace(/^\d+[．.、\s]*/, '').trim();
    
    // 过滤大图片
    const qImages = q.images.filter(src => imageBuffers[src]);
    
    processed.push({
      id: `${experimentId}-${difficulty}-${q.num}`,
      experimentId,
      type: 'fill',  // 全部标记为填空题（实验大题都是填空形式）
      difficulty,
      content: q.text,
      answer: answer || '见解析',
      explanation: explanation || '详细解析请参考教材相关内容。',
      knowledgePoints: [],
      images: qImages.length > 0 ? qImages.map((_, i) => 
        `/question-images/${experimentId}-${difficulty}-${q.num}-${i + 1}.png`
      ) : undefined,
      _imageData: qImages.map(src => imageBuffers[src]).filter(Boolean)
    });
  }
  
  return processed;
}

// 主函数
async function main() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个文件\n`);
  
  const allQuestions = [];
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    
    const { experimentName, difficulty } = parsed;
    const experimentId = experimentIdMap[experimentName];
    if (!experimentId) continue;
    
    try {
      const questions = await processFile(filePath, experimentId, difficulty);
      
      // 保存图片
      for (const q of questions) {
        if (q._imageData && q._imageData.length > 0) {
          q._imageData.forEach((buf, i) => {
            const imgPath = path.join(outputDir, 
              `${experimentId}-${difficulty}-${q.num.split('-').pop()}-${i + 1}.png`
            );
            fs.writeFileSync(imgPath, buf);
          });
        }
        delete q._imageData;
        allQuestions.push(q);
      }
      
      console.log(`✓ ${file}: ${questions.length}题`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  }
  
  console.log(`\n总共 ${allQuestions.length} 道题`);
  
  // 保存JSON
  fs.writeFileSync('src/data/questions-data.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log('已保存到 src/data/questions-data.json');
  
  // 统计
  const stats = {};
  allQuestions.forEach(q => {
    if (!stats[q.experimentId]) stats[q.experimentId] = { total: 0, withImg: 0 };
    stats[q.experimentId].total++;
    if (q.images) stats[q.experimentId].withImg++;
  });
  console.log('\n各实验统计:');
  Object.entries(stats).forEach(([id, s]) => {
    console.log(`  ${id}: ${s.total}题, ${s.withImg}有图`);
  });
}

main().catch(console.error);
