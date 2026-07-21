import AdmZip from 'adm-zip';
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

// 从document.xml中按顺序提取所有段落内容（文本 + 图片）
function extractDocumentItems(zip, rels) {
  const docXml = zip.readAsText('word/document.xml');
  const items = [];
  
  // 找到body内容
  const bodyMatch = docXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) return items;
  const bodyContent = bodyMatch[1];
  
  // 提取所有段落
  const pPattern = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  let pMatch;
  
  while ((pMatch = pPattern.exec(bodyContent)) !== null) {
    const pContent = pMatch[1];
    
    // 提取段落中的图片（a:blip r:embed）
    const imageMatches = [...pContent.matchAll(/<a:blip\s+r:embed="(rId\d+)"[^>]*\/>/g)];
    for (const imgMatch of imageMatches) {
      const rId = imgMatch[1];
      const target = rels[rId];
      if (target) {
        const ext = path.extname(target).toLowerCase();
        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.bmp') {
          items.push({ type: 'image', target, rId });
        }
      }
    }
    
    // 提取段落文本
    let text = '';
    const tPattern = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tPattern.exec(pContent)) !== null) {
      text += tMatch[1];
    }
    
    if (text.trim()) {
      items.push({ type: 'text', content: text.trim() });
    }
  }
  
  return items;
}

// 将items分割成题目
function splitIntoQuestions(items) {
  const questions = [];
  let currentQuestion = null;
  let inAnswerSection = false;
  
  for (const item of items) {
    if (item.type === 'text') {
      // 检测参考答案部分
      if (item.content.includes('参考答案') || item.content.includes('答案与解析')) {
        inAnswerSection = true;
        if (currentQuestion) {
          questions.push(currentQuestion);
          currentQuestion = null;
        }
        continue;
      }
      
      if (inAnswerSection) continue;
      
      // 检测新题目开头
      const qStartMatch = item.content.match(/^(\d+)[．.、\s]+/);
      if (qStartMatch) {
        const num = parseInt(qStartMatch[1]);
        // 验证题号递增（避免匹配到正文中的数字）
        if (!currentQuestion || num > currentQuestion.num) {
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          currentQuestion = {
            num,
            content: item.content,
            images: []
          };
          continue;
        }
      }
      
      // 跳过头部信息
      if (!currentQuestion) {
        if (item.content.includes('学校:') || item.content.includes('姓名：') || 
            item.content.includes('班级：') || item.content.includes('考号：') ||
            item.content.includes('一、实验题') || item.content.includes('高中物理作业')) {
          continue;
        }
      }
      
      // 添加到当前题目
      if (currentQuestion) {
        currentQuestion.content += '\n' + item.content;
      }
      
    } else if (item.type === 'image') {
      if (currentQuestion && !inAnswerSection) {
        currentQuestion.images.push(item.target);
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

function extractAllImages() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个docx文件\n`);
  
  const allQuestionImages = {};
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
      const items = extractDocumentItems(zip, rels);
      const questions = splitIntoQuestions(items);
      
      let fileImageCount = 0;
      
      for (const q of questions) {
        if (q.images.length > 0) {
          const questionId = `${experimentId}-${difficulty}-${q.num}`;
          const savedImages = [];
          
          for (let i = 0; i < q.images.length; i++) {
            const imgTarget = q.images[i];
            const ext = path.extname(imgTarget).toLowerCase();
            const imgName = `${questionId}-${i + 1}${ext}`;
            const imgOutputPath = path.join(outputDir, imgName);
            
            try {
              const imgData = zip.readFile('word/' + imgTarget);
              if (imgData && imgData.length > 1000) { // 只保留大于1KB的图片（过滤小图标）
                fs.writeFileSync(imgOutputPath, imgData);
                savedImages.push(`/question-images/${imgName}`);
                fileImageCount++;
                totalImages++;
              }
            } catch (e) {
              // 忽略提取失败的图片
            }
          }
          
          if (savedImages.length > 0) {
            allQuestionImages[questionId] = savedImages;
          }
        }
      }
      
      if (fileImageCount > 0) {
        filesWithImages++;
        console.log(`✓ ${file}: ${questions.length}题, ${fileImageCount}张图`);
      } else {
        console.log(`- ${file}: ${questions.length}题, 无图片`);
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
  
  // 输出样例
  console.log('\n=== 有图片的题目样例（前15个）===');
  const sampleKeys = Object.keys(allQuestionImages).slice(0, 15);
  sampleKeys.forEach(key => {
    console.log(`  ${key}: ${allQuestionImages[key].length}张 - ${allQuestionImages[key].join(', ')}`);
  });
}

extractAllImages();
