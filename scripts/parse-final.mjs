import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const formulaDir = 'public/question-formulas';
const figureDir = 'public/question-images';

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

// 从docx中获取图片顺序（建立rId到序号的映射）
function getImageOrder(filePath) {
  const zip = new AdmZip(filePath);
  const relsContent = zip.readAsText('word/_rels/document.xml.rels');
  const docXml = zip.readAsText('word/document.xml');
  
  // 建立rId -> target的映射
  const rels = {};
  const relPattern = /<Relationship\s+Id="(rId\d+)"\s+Type="[^"]*image[^"]*"\s+Target="([^"]+)"/g;
  let m;
  while ((m = relPattern.exec(relsContent)) !== null) {
    rels[m[1]] = m[2];
  }
  
  // 按文档中出现的顺序提取rId
  const order = [];
  const embedPattern = /r:embed="(rId\d+)"/g;
  let em;
  while ((em = embedPattern.exec(docXml)) !== null) {
    if (rels[em[1]] && !order.includes(em[1])) {
      order.push(em[1]);
    }
  }
  
  // 建立顺序索引: orderIndex -> target
  const orderMap = {};
  order.forEach((rId, idx) => {
    orderMap[idx] = rels[rId];
  });
  
  return orderMap;
}

// 处理单个文件
async function processFile(filePath, experimentId, difficulty) {
  const imageOrder = getImageOrder(filePath);
  let imgIdx = 0; // 当前处理的图片索引
  
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(buf) {
          const target = imageOrder[imgIdx] || `image_${imgIdx}`;
          const imgName = path.basename(target);
          const baseName = path.basename(imgName, path.extname(imgName));
          const numMatch = baseName.match(/image(\d+)/);
          const num = numMatch ? numMatch[1] : imgIdx;
          
          const isPng = image.contentType === 'image/png';
          const isWmf = image.contentType.includes('wmf');
          
          let url = '';
          let type = 'other';
          
          if (isPng && buf.length > 10000) {
            // 大PNG = 题目配图
            const filename = `${experimentId}-${difficulty}-fig-${num}.png`;
            const outPath = path.join(figureDir, filename);
            if (!fs.existsSync(outPath)) {
              fs.writeFileSync(outPath, buf);
            }
            url = `/question-images/${filename}`;
            type = 'figure';
          } else if (isWmf) {
            // WMF = 公式，已经转换好了
            const formulaName = `${experimentId}_${difficulty}_img${num}.png`;
            const formulaPath = path.join(formulaDir, formulaName);
            if (fs.existsSync(formulaPath)) {
              url = `/question-formulas/${formulaName}`;
              type = 'formula';
            }
          }
          
          imgIdx++;
          return { src: `__IMG_${imgIdx}__`, alt: '', url, type, idx: imgIdx };
        });
      })
    }
  );
  
  // 从结果中提取图片信息
  const imgInfos = [];
  let html = result.value;
  const imgPattern = /<img[^>]*src="__IMG_(\d+)__"[^>]*>/g;
  let im;
  while ((im = imgPattern.exec(html)) !== null) {
    const idx = parseInt(im[1]);
    imgInfos.push({ idx, tag: im[0] });
  }
  
  // 重新处理：用convertImage回调里的信息
  // 更简单的方式：读取原始docx中的图片顺序，然后构建映射
  const figureImages = [];
  let html2 = result.value;
  
  // 重新遍历并替换
  let imgCount = 0;
  const replacePattern = /<img[^>]*src="__IMG_(\d+)__"[^>]*>/g;
  html2 = html2.replace(replacePattern, (match, idxStr) => {
    const idx = parseInt(idxStr) - 1; // 转换为0-based
    const target = imageOrder[idx];
    if (!target) return '';
    
    const baseName = path.basename(target, path.extname(target));
    const numMatch = baseName.match(/image(\d+)/);
    const num = numMatch ? numMatch[1] : idx;
    const ext = path.extname(target).toLowerCase();
    
    if (ext === '.png') {
      // 配图
      const filename = `${experimentId}-${difficulty}-fig-${num}.png`;
      figureImages.push(`/question-images/${filename}`);
      return `<img src="/question-images/${filename}" class="question-figure" />`;
    } else if (ext === '.wmf') {
      // 公式
      const formulaName = `${experimentId}_${difficulty}_img${num}.png`;
      const formulaPath = path.join(formulaDir, formulaName);
      if (fs.existsSync(formulaPath)) {
        return `<img src="/question-formulas/${formulaName}" class="formula-img" />`;
      }
      return '';
    }
    return '';
  });
  
  return { html: html2, figureImages };
}

// 分割题目
function splitQuestions(html) {
  const paragraphs = html.split(/<\/p>/).map(p => p.trim()).filter(p => p);
  
  let answerStartIdx = -1;
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].replace(/<[^>]+>/g, '').trim();
    if (text.includes('参考答案') || text.includes('答案与解析')) {
      answerStartIdx = i;
      break;
    }
  }
  
  const qParas = answerStartIdx >= 0 ? paragraphs.slice(0, answerStartIdx) : paragraphs;
  const aParas = answerStartIdx >= 0 ? paragraphs.slice(answerStartIdx + 1) : [];
  
  const questions = [];
  let cur = null;
  
  for (const p of qParas) {
    const text = p.replace(/<[^>]+>/g, '').trim();
    if (!text || text.includes('学校:') || text.includes('姓名：') || 
        text.includes('班级：') || text.includes('考号：') ||
        text.includes('一、实验题') || text.includes('高中物理作业')) {
      continue;
    }
    
    const qMatch = text.match(/^(\d+)[．.、]\s*/);
    if (qMatch) {
      const num = parseInt(qMatch[1]);
      if (!cur || num > cur.num) {
        if (cur) questions.push(cur);
        cur = { num, html: p + '</p>' };
        continue;
      }
    }
    
    if (cur) cur.html += p + '</p>';
  }
  if (cur) questions.push(cur);
  
  const answers = {};
  let curAns = null;
  
  for (const p of aParas) {
    const text = p.replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    
    const aMatch = text.match(/^(\d+)[．.、]\s*/);
    if (aMatch) {
      const num = parseInt(aMatch[1]);
      if (curAns) answers[curAns.num] = curAns;
      curAns = { num, html: p + '</p>' };
      continue;
    }
    
    if (curAns) curAns.html += p + '</p>';
  }
  if (curAns) answers[curAns.num] = curAns;
  
  return { questions, answers };
}

function splitAnswerAndDetail(html) {
  // 在HTML中找【详解】
  const detailIdx = html.indexOf('【详解】');
  if (detailIdx >= 0) {
    const answerHtml = html.substring(0, detailIdx).trim();
    const detailHtml = html.substring(detailIdx + 4).trim();
    return { answerHtml, detailHtml };
  }
  return { answerHtml: html, detailHtml: '' };
}

function htmlToText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`找到 ${files.length} 个文件\n`);
  
  if (!fs.existsSync(figureDir)) fs.mkdirSync(figureDir, { recursive: true });
  if (!fs.existsSync(formulaDir)) fs.mkdirSync(formulaDir, { recursive: true });
  
  const allQuestions = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    
    const experimentId = experimentIdMap[parsed.experimentName];
    if (!experimentId) continue;
    
    try {
      process.stdout.write(`(${i + 1}/${files.length}) ${file}... `);
      
      const { html, figureImages } = await processFile(filePath, experimentId, parsed.difficulty);
      const { questions, answers } = splitQuestions(html);
      
      let qWithFormula = 0;
      
      for (const q of questions) {
        const qId = `${experimentId}-${parsed.difficulty}-${q.num}`;
        const ansData = answers[q.num];
        
        let answerHtml = '';
        let detailHtml = '';
        if (ansData) {
          const { answerHtml: a, detailHtml: d } = splitAnswerAndDetail(ansData.html);
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
      
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
  
  console.log(`\n========================`);
  console.log(`总题数: ${allQuestions.length}`);
  console.log(`有公式: ${allQuestions.filter(q => q.hasFormula).length}`);
  console.log(`有配图: ${allQuestions.filter(q => q.images).length}`);
  
  fs.writeFileSync('src/data/questions-data.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log('\n已保存到 src/data/questions-data.json');
}

main().catch(console.error);
