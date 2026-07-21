import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const outputDir = 'public/question-images';

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

// 解析docx中的图片关系映射
function parseRels(zip) {
  const relsContent = zip.readAsText('word/_rels/document.xml.rels');
  const rels = {};
  
  const relPattern = /<Relationship\s+Id="(rId\d+)"\s+Type="[^"]*image[^"]*"\s+Target="([^"]+)"/g;
  let match;
  while ((match = relPattern.exec(relsContent)) !== null) {
    rels[match[1]] = match[2];
  }
  
  return rels;
}

// 解析document.xml，按段落顺序提取题目和图片
function parseDocumentWithImages(zip, rels) {
  const docXml = zip.readAsText('word/document.xml');
  
  // 提取所有段落（包含文本或图片）
  const items = [];
  
  // 先找到所有段落
  const pPattern = /<w:p[\s\S]*?<\/w:p>/g;
  let pMatch;
  
  while ((pMatch = pPattern.exec(docXml)) !== null) {
    const pXml = pMatch[0];
    
    // 检查段落中是否有图片
    const drawingMatches = [...pXml.matchAll(/<w:drawing>[\s\S]*?<\/w:drawing>/g)];
    
    if (drawingMatches.length > 0) {
      // 图片段落
      for (const drawing of drawingMatches) {
        const embedMatch = drawing[0].match(/r:embed="(rId\d+)"/);
        if (embedMatch && rels[embedMatch[1]]) {
          const target = rels[embedMatch[1]];
          // 只保留PNG和JPG等真实图片格式，跳过WMF等小图标
          const ext = path.extname(target).toLowerCase();
          if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.bmp') {
            items.push({
              type: 'image',
              target: target,
              rId: embedMatch[1]
            });
          }
        }
      }
    }
    
    // 提取段落文本
    let text = '';
    const tPattern = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tPattern.exec(pXml)) !== null) {
      text += tMatch[1];
    }
    
    if (text.trim()) {
      items.push({
        type: 'text',
        content: text.trim()
      });
    }
  }
  
  return items;
}

// 将段落项分割成题目
function splitIntoQuestions(items) {
  const questions = [];
  let currentQuestion = null;
  let questionNum = 0;
  
  for (const item of items) {
    if (item.type === 'text') {
      // 检查是否是新题目开头
      const qStartMatch = item.content.match(/^(\d+)[．.、\s]/);
      if (qStartMatch) {
        const num = parseInt(qStartMatch[1]);
        if (num > questionNum) {
          questionNum = num;
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          currentQuestion = {
            num: questionNum,
            textParts: [item.content],
            images: []
          };
          continue;
        }
      }
      
      // 跳过头部信息
      if (!currentQuestion && (item.content.includes('学校:') || item.content.includes('姓名：') || item.content.includes('班级：'))) {
        continue;
      }
      
      // 跳过参考答案部分
      if (item.content.includes('参考答案') || item.content.includes('【详解】')) {
        break;
      }
      
      if (currentQuestion) {
        currentQuestion.textParts.push(item.content);
      }
    } else if (item.type === 'image') {
      if (currentQuestion) {
        currentQuestion.images.push(item.target);
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// 主函数
function extractAllImages() {
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个docx文件\n`);
  
  const allQuestionImages = {}; // { questionId: [imagePaths]
  let totalImages = 0;
  let filesWithImages = 0;
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    
    if (!parsed) continue;
    
    const { experimentName, difficulty } = parsed;
    const experimentId = experimentIdMap[experimentName];
    
    if (!experimentId) continue;
    
    try {
      const zip = new AdmZip(filePath);
      const rels = parseRels(zip);
      const items = parseDocumentWithImages(zip, rels);
      const questions = splitIntoQuestions(items);
      
      let fileImageCount = 0;
      
      for (const q of questions) {
        if (q.images.length > 0) {
          const questionId = `${experimentId}-${difficulty}-${q.num}`;
          
          // 提取并保存图片
          const savedImages = [];
          for (let i = 0; i < q.images.length; i++) {
            const imgTarget = q.images[i];
            const ext = path.extname(imgTarget).toLowerCase();
            const imgName = `${questionId}-${i + 1}${ext}`;
            const imgOutputPath = path.join(outputDir, imgName);
            
            // 从docx中提取图片
            try {
              const imgData = zip.readFile('word/' + imgTarget);
              if (imgData) {
                fs.writeFileSync(imgOutputPath, imgData);
                savedImages.push(`/question-images/${imgName}`);
                fileImageCount++;
                totalImages++;
              }
            } catch (e) {
              console.log(`  提取图片失败: ${imgTarget}`);
            }
          }
          
          if (savedImages.length > 0) {
            allQuestionImages[questionId] = savedImages;
          }
        }
      }
      
      if (fileImageCount > 0) {
        filesWithImages++;
        console.log(`✓ ${file}: ${fileImageCount} 张图片 (${questions.length} 题)`);
      } else {
        console.log(`- ${file}: 无有效图片`);
      }
      
    } catch (error) {
      console.error(`✗ 处理失败: ${file}`, error.message);
    }
  }
  
  console.log(`\n========================`);
  console.log(`有图片的文件: ${filesWithImages} / ${files.length}`);
  console.log(`提取图片总数: ${totalImages} 张`);
  console.log(`有图片的题目数: ${Object.keys(allQuestionImages).length} 题`);
  
  // 保存映射关系
  const mappingPath = 'scripts/question-image-mapping.json';
  fs.writeFileSync(mappingPath, JSON.stringify(allQuestionImages, null, 2), 'utf-8');
  console.log(`\n图片映射已保存到: ${mappingPath}`);
  
  // 输出前10个有图片的题目作为样例
  console.log('\n=== 有图片的题目样例（前10个）===');
  const sampleKeys = Object.keys(allQuestionImages).slice(0, 10);
  sampleKeys.forEach(key => {
    console.log(`  ${key}: ${allQuestionImages[key].length} 张图 - ${allQuestionImages[key].join(', ')}`);
  });
}

extractAllImages();
