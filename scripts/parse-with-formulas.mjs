import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const formulaDir = 'public/question-formulas';
const figureDir = 'public/question-images';

if (!fs.existsSync(formulaDir)) fs.mkdirSync(formulaDir, { recursive: true });
if (!fs.existsSync(figureDir)) fs.mkdirSync(figureDir, { recursive: true });

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

const knowledgePointsMap = {
  'sensor-control': ['传感器原理', '自动控制', '电路设计'],
  'resistivity': ['电阻定律', '电阻率测量', '伏安法', '螺旋测微器'],
  'force-composition': ['力的合成', '平行四边形定则', '等效替代法'],
  'acceleration-force': ['牛顿第二定律', '控制变量法', '打点计时器'],
  'transformer': ['变压器原理', '电磁感应', '匝数比'],
  'centripetal-force': ['圆周运动', '向心力', '向心加速度'],
  'velocity-time': ['匀变速直线运动', '打点计时器', '速度时间图像'],
  'projectile-motion': ['平抛运动', '运动的合成与分解', '曲线运动'],
  'spring-force': ['胡克定律', '弹簧弹力', '弹性形变'],
  'induction-current': ['电磁感应', '感应电流', '磁通量'],
  'boyle-law': ['气体定律', '玻意耳定律', '理想气体状态方程'],
  'refraction': ['光的折射', '折射率', '全反射'],
  'simple-pendulum': ['单摆', '重力加速度', '简谐运动', '周期公式'],
  'double-slit': ['光的干涉', '双缝干涉', '波长测量'],
  'oil-film': ['油膜法', '分子动理论', '分子大小估算'],
  'emf-internal-resistance': ['电源电动势', '内阻测量', '闭合电路欧姆定律'],
  'multimeter': ['多用电表', '欧姆表', '电压电流电阻测量'],
  'capacitor-charge': ['电容器', '充放电', 'RC电路'],
  'length-measurement': ['长度测量', '刻度尺', '游标卡尺', '螺旋测微器'],
  'momentum-conservation': ['动量守恒', '碰撞实验', '动量定理'],
  'mechanical-energy': ['机械能守恒', '重力势能', '动能定理'],
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

// 将WMF buffer转换为PNG buffer（通过临时文件+PowerShell）
let wmfCounter = 0;
function wmfToPng(wmfBuffer) {
  wmfCounter++;
  const tempWmf = `temp-wmf/temp_${wmfCounter}.wmf`;
  const tempPng = `temp-wmf/temp_${wmfCounter}.png`;
  
  fs.writeFileSync(tempWmf, wmfBuffer);
  
  try {
    execSync(`powershell -Command "Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile('${path.resolve(tempWmf).replace(/\\/g, '\\\\')}'); $img.Save('${path.resolve(tempPng).replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png); $img.Dispose()"`, {
      stdio: 'pipe',
      timeout: 5000
    });
    
    if (fs.existsSync(tempPng)) {
      const pngBuffer = fs.readFileSync(tempPng);
      fs.unlinkSync(tempWmf);
      fs.unlinkSync(tempPng);
      return pngBuffer;
    }
  } catch (e) {
    // 转换失败，返回null
  }
  
  try { if (fs.existsSync(tempWmf)) fs.unlinkSync(tempWmf); } catch(e) {}
  try { if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng); } catch(e) {}
  return null;
}

// 处理单个文件
async function processFile(filePath, experimentId, difficulty) {
  let imgCounter = 0;
  const imageMap = {}; // key -> { url, type: 'figure'|'formula' }
  
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(buf) {
          imgCounter++;
          const key = `IMG_${imgCounter}`;
          
          const isPng = image.contentType === 'image/png';
          const isWmf = image.contentType === 'image/x-wmf' || image.contentType === 'image/wmf';
          
          if (isPng && buf.length > 10000) {
            // 大PNG = 题目配图
            const filename = `${experimentId}-${difficulty}-fig-${imgCounter}.png`;
            fs.writeFileSync(path.join(figureDir, filename), buf);
            imageMap[key] = { url: `/question-images/${filename}`, type: 'figure' };
          } else if (isWmf) {
            // WMF = 公式，转换为PNG
            const pngBuf = wmfToPng(buf);
            if (pngBuf) {
              const filename = `${experimentId}-${difficulty}-formula-${imgCounter}.png`;
              fs.writeFileSync(path.join(formulaDir, filename), pngBuf);
              imageMap[key] = { url: `/question-formulas/${filename}`, type: 'formula' };
            } else {
              imageMap[key] = { url: '', type: 'formula' };
            }
          } else {
            imageMap[key] = { url: '', type: 'other' };
          }
          
          return { src: key, alt: '' };
        });
      })
    }
  );
  
  // 替换HTML中的图片占位符为真实URL
  let html = result.value;
  for (const [key, info] of Object.entries(imageMap)) {
    if (info.url) {
      html = html.replace(new RegExp(`src="${key}"`, 'g'), `src="${info.url}"`);
    } else {
      // 转换失败的图片，移除img标签
      html = html.replace(new RegExp(`<img[^>]*src="${key}"[^>]*>`, 'g'), '');
    }
  }
  
  // 提取配图列表（type为figure的）
  const figureImages = Object.values(imageMap)
    .filter(i => i.type === 'figure' && i.url)
    .map(i => i.url);
  
  return { html, figureImages };
}

// 从HTML中分割题目
function splitQuestions(html, figureImagesFromHtml) {
  // 将HTML按段落分割
  const paragraphs = [];
  const parts = html.split(/<\/p>/);
  for (const part of parts) {
    const p = part.trim();
    if (p) paragraphs.push(p + '</p>');
  }
  
  // 找到参考答案位置
  let answerStartIdx = -1;
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].replace(/<[^>]+>/g, '').trim();
    if (text.includes('参考答案') || text.includes('答案与解析')) {
      answerStartIdx = i;
      break;
    }
  }
  
  const questionParas = answerStartIdx >= 0 ? paragraphs.slice(0, answerStartIdx) : paragraphs;
  const answerParas = answerStartIdx >= 0 ? paragraphs.slice(answerStartIdx + 1) : [];
  
  // 分割题目（用纯文本判断题号，用HTML作为内容）
  const questions = [];
  let currentQ = null;
  
  for (const para of questionParas) {
    const text = para.replace(/<[^>]+>/g, '').trim();
    
    if (text.includes('学校:') || text.includes('姓名：') || 
        text.includes('班级：') || text.includes('考号：') ||
        text.includes('一、实验题') || text.includes('高中物理作业') ||
        text === '') {
      continue;
    }
    
    const qMatch = text.match(/^(\d+)[．.、]\s*/);
    if (qMatch) {
      const num = parseInt(qMatch[1]);
      if (!currentQ || num > currentQ.num) {
        if (currentQ) questions.push(currentQ);
        currentQ = { num, html: para };
        continue;
      }
    }
    
    if (currentQ) {
      currentQ.html += '\n' + para;
    }
  }
  if (currentQ) questions.push(currentQ);
  
  // 分割答案
  const answers = {};
  let currentAns = null;
  
  for (const para of answerParas) {
    const text = para.replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    
    const aMatch = text.match(/^(\d+)[．.、]\s*/);
    if (aMatch) {
      const num = parseInt(aMatch[1]);
      if (currentAns) answers[currentAns.num] = currentAns;
      currentAns = { num, html: para };
      continue;
    }
    
    if (currentAns) {
      currentAns.html += '\n' + para;
    }
  }
  if (currentAns) answers[currentAns.num] = currentAns;
  
  return { questions, answers };
}

// 从答案HTML中分离答案和解析
function extractAnswerAndDetail(html) {
  const text = html.replace(/<[^>]+>/g, '').trim();
  const detailIdx = text.indexOf('【详解】');
  
  if (detailIdx >= 0) {
    // 找到HTML中对应位置
    // 简单处理：找到【详解】文本所在的位置，分割HTML
    const htmlDetailIdx = html.indexOf('【详解】');
    if (htmlDetailIdx >= 0) {
      const answerHtml = html.substring(0, htmlDetailIdx).trim();
      const detailHtml = html.substring(htmlDetailIdx + 4).trim();
      return { answerHtml, detailHtml };
    }
  }
  
  return { answerHtml: html, detailHtml: '' };
}

// 提取纯文本（用于content字段）
function htmlToText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 主函数
async function main() {
  // 准备临时目录
  if (!fs.existsSync('temp-wmf')) fs.mkdirSync('temp-wmf', { recursive: true });
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个文件\n`);
  
  const allQuestions = [];
  let successFiles = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    
    const experimentId = experimentIdMap[parsed.experimentName];
    if (!experimentId) continue;
    
    try {
      process.stdout.write(`处理中 (${i + 1}/${files.length}): ${file}... `);
      
      const { html, figureImages } = await processFile(filePath, experimentId, parsed.difficulty);
      const { questions, answers } = splitQuestions(html, figureImages);
      
      let qWithFormula = 0;
      
      for (const q of questions) {
        const qId = `${experimentId}-${parsed.difficulty}-${q.num}`;
        const ansData = answers[q.num];
        
        let answerHtml = '';
        let detailHtml = '';
        if (ansData) {
          const { answerHtml: a, detailHtml: d } = extractAnswerAndDetail(ansData.html);
          answerHtml = a;
          detailHtml = d;
        }
        
        const hasFormula = q.html.includes('question-formulas') || 
                          (ansData && ansData.html.includes('question-formulas'));
        if (hasFormula) qWithFormula++;
        
        allQuestions.push({
          id: qId,
          experimentId,
          type: 'fill',
          difficulty: parsed.difficulty,
          content: htmlToText(q.html),
          contentHtml: q.html,
          answer: htmlToText(answerHtml) || '见解析',
          answerHtml,
          explanation: htmlToText(detailHtml) || '详细解析见参考答案。',
          explanationHtml: detailHtml,
          knowledgePoints: knowledgePointsMap[experimentId] || [],
          images: figureImages.length > 0 ? figureImages : undefined,
          hasFormula
        });
      }
      
      console.log(`✓ ${questions.length}题 (${qWithFormula}有公式)`);
      successFiles++;
      
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
  
  console.log(`\n========================`);
  console.log(`成功处理: ${successFiles}/${files.length} 个文件`);
  console.log(`总题数: ${allQuestions.length}`);
  console.log(`有公式的题: ${allQuestions.filter(q => q.hasFormula).length}`);
  
  // 保存
  fs.writeFileSync('src/data/questions-data.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log('\n已保存到 src/data/questions-data.json');
  
  // 清理临时目录
  try {
    const tempFiles = fs.readdirSync('temp-wmf');
    for (const f of tempFiles) {
      fs.unlinkSync(`temp-wmf/${f}`);
    }
  } catch (e) {}
  
  // 抽样
  console.log('\n=== 抽样（第1题）===');
  const q = allQuestions[0];
  console.log(`ID: ${q.id}`);
  console.log(`有公式: ${q.hasFormula}`);
  console.log(`配图: ${q.images ? q.images.length + '张' : '无'}`);
  console.log(`contentHtml长度: ${q.contentHtml.length}`);
  console.log(`answerHtml长度: ${q.answerHtml.length}`);
  console.log(`explanationHtml长度: ${q.explanationHtml.length}`);
}

main().catch(console.error);
