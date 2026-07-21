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

// 从HTML中提取题目和图片
function extractQuestionsFromHtml(html) {
  const questions = [];
  let currentQuestion = null;
  let inAnswerSection = false;
  
  // 将HTML按段落分割
  const paragraphs = html.split(/<\/p>/).map(p => p.trim()).filter(p => p);
  
  for (const p of paragraphs) {
    // 检测参考答案部分
    if (p.includes('参考答案') || p.includes('答案与解析')) {
      inAnswerSection = true;
      if (currentQuestion) {
        questions.push(currentQuestion);
        currentQuestion = null;
      }
      continue;
    }
    
    if (inAnswerSection) continue;
    
    // 提取纯文本（去掉HTML标签）
    const text = p.replace(/<[^>]+>/g, '').trim();
    
    // 提取图片src
    const imgSrcs = [];
    const imgPattern = /<img[^>]*src="([^"]+)"[^>]*>/g;
    let imgMatch;
    while ((imgMatch = imgPattern.exec(p)) !== null) {
      imgSrcs.push(imgMatch[1]);
    }
    
    // 检测新题目开头
    const qStartMatch = text.match(/^(\d+)[．.、\s]+/);
    if (qStartMatch) {
      const num = parseInt(qStartMatch[1]);
      if (!currentQuestion || num > currentQuestion.num) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          num,
          text: text,
          images: [...imgSrcs]
        };
        continue;
      }
    }
    
    // 跳过头部信息
    if (!currentQuestion) {
      if (text.includes('学校:') || text.includes('姓名：') || 
          text.includes('班级：') || text.includes('考号：') ||
          text.includes('一、实验题') || text.includes('高中物理作业') ||
          text === '') {
        continue;
      }
    }
    
    // 添加到当前题目
    if (currentQuestion) {
      if (text) {
        currentQuestion.text += '\n' + text;
      }
      if (imgSrcs.length > 0) {
        currentQuestion.images.push(...imgSrcs);
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// 处理单个文件
async function processFile(filePath, experimentId, difficulty) {
  // 收集图片数据
  const imageBuffers = {};
  let imageIndex = 0;
  
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(imageBuffer) {
          imageIndex++;
          const imgKey = `image_${imageIndex}.png`;
          // 只保存PNG格式且较大的图片（题目配图）
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
  
  const questions = extractQuestionsFromHtml(result.value);
  
  // 过滤图片：只保留大的PNG图片
  for (const q of questions) {
    q.images = q.images.filter(src => imageBuffers[src]);
  }
  
  return { questions, imageBuffers };
}

// 主函数
async function extractAllImages() {
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
      const { questions, imageBuffers } = await processFile(filePath, experimentId, difficulty);
      
      let fileImageCount = 0;
      
      for (const q of questions) {
        if (q.images.length > 0) {
          const questionId = `${experimentId}-${difficulty}-${q.num}`;
          const savedImages = [];
          
          for (let i = 0; i < q.images.length; i++) {
            const imgKey = q.images[i];
            const imgData = imageBuffers[imgKey];
            if (imgData) {
              const ext = '.png';
              const imgName = `${questionId}-${i + 1}${ext}`;
              const imgOutputPath = path.join(outputDir, imgName);
              
              fs.writeFileSync(imgOutputPath, imgData.buffer);
              savedImages.push(`/question-images/${imgName}`);
              fileImageCount++;
              totalImages++;
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
        console.log(`- ${file}: ${questions.length}题, 无配图`);
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
  console.log('\n=== 有图片的题目样例（前20个）===');
  const sampleKeys = Object.keys(allQuestionImages).slice(0, 20);
  sampleKeys.forEach(key => {
    console.log(`  ${key}: ${allQuestionImages[key].length}张 - ${allQuestionImages[key].join(', ')}`);
  });
}

extractAllImages().catch(console.error);
