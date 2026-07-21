import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const tempWmfDir = 'temp-wmf-final2';

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

async function main() {
  if (!fs.existsSync(tempWmfDir)) fs.mkdirSync(tempWmfDir, { recursive: true });
  if (!fs.existsSync('public/question-images')) fs.mkdirSync('public/question-images', { recursive: true });
  if (!fs.existsSync('public/question-formulas')) fs.mkdirSync('public/question-formulas', { recursive: true });
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  console.log(`提取图片并解析题目...\n`);
  
  const allQuestions = [];
  let wmfCounter = 0;
  const placeholderMap = {}; // placeholder -> image url
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    const experimentId = experimentIdMap[parsed.experimentName];
    if (!experimentId) continue;
    
    try {
      process.stdout.write(`(${i + 1}/${files.length}) ${file}... `);
      
      let localImgIdx = 0;
      const figureImgs = [];
      
      const result = await mammoth.convertToHtml(
        { path: filePath },
        {
          convertImage: mammoth.images.imgElement(function(image) {
            return image.read().then(function(buf) {
              localImgIdx++;
              const placeholder = `__IMG_${experimentId}_${parsed.difficulty}_${localImgIdx}__`;
              
              const isPng = image.contentType === 'image/png';
              const isWmf = image.contentType.includes('wmf');
              
              if (isPng && buf.length > 10000) {
                // 大PNG配图
                const figName = `${experimentId}-${parsed.difficulty}-fig-${localImgIdx}.png`;
                fs.writeFileSync(`public/question-images/${figName}`, buf);
                placeholderMap[placeholder] = `/question-images/${figName}`;
                figureImgs.push(`/question-images/${figName}`);
              } else if (isWmf) {
                // WMF公式
                wmfCounter++;
                const wmfName = `formula_${wmfCounter}.wmf`;
                fs.writeFileSync(path.join(tempWmfDir, wmfName), buf);
                placeholderMap[placeholder] = `/question-formulas/formula_${wmfCounter}.png`;
              } else {
                // 小PNG（图标等），忽略
                placeholderMap[placeholder] = '';
              }
              
              return { src: placeholder, alt: '' };
            });
          })
        }
      );
      
      const html = result.value;
      
      // 分割题目
      const paragraphs = html.split(/<\/p>/).map(p => p.trim()).filter(p => p);
      
      let ansIdx = -1;
      for (let j = 0; j < paragraphs.length; j++) {
        const t = paragraphs[j].replace(/<[^>]+>/g, '').trim();
        if (t.includes('参考答案') || t.includes('答案与解析')) {
          ansIdx = j;
          break;
        }
      }
      
      const qParas = ansIdx >= 0 ? paragraphs.slice(0, ansIdx) : paragraphs;
      const aParas = ansIdx >= 0 ? paragraphs.slice(ansIdx + 1) : [];
      
      const questions = [];
      let cur = null;
      for (const p of qParas) {
        const t = p.replace(/<[^>]+>/g, '').trim();
        if (!t || t.includes('学校:') || t.includes('姓名：') || t.includes('班级：') || 
            t.includes('考号：') || t.includes('一、实验题') || t.includes('高中物理作业')) continue;
        const m = t.match(/^(\d+)[．.、]\s*/);
        if (m) {
          const num = parseInt(m[1]);
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
      let curA = null;
      for (const p of aParas) {
        const t = p.replace(/<[^>]+>/g, '').trim();
        if (!t) continue;
        const m = t.match(/^(\d+)[．.、]\s*/);
        if (m) {
          const num = parseInt(m[1]);
          if (curA) answers[curA.num] = curA;
          curA = { num, html: p + '</p>' };
          continue;
        }
        if (curA) curA.html += p + '</p>';
      }
      if (curA) answers[curA.num] = curA;
      
      for (const q of questions) {
        const qId = `${experimentId}-${parsed.difficulty}-${q.num}`;
        const ans = answers[q.num];
        
        let ansHtml = '';
        let detHtml = '';
        if (ans) {
          const di = ans.html.indexOf('【详解】');
          if (di >= 0) {
            ansHtml = ans.html.substring(0, di).trim();
            detHtml = ans.html.substring(di + 4).trim();
          } else {
            ansHtml = ans.html;
          }
        }
        
        allQuestions.push({
          id: qId,
          experimentId,
          type: 'fill',
          difficulty: parsed.difficulty,
          content: q.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
          contentHtml: q.html,
          answer: ansHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '见解析',
          answerHtml: ansHtml,
          explanation: detHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '详细解析见参考答案。',
          explanationHtml: detHtml,
          knowledgePoints: knowledgePointsMap[experimentId] || [],
          images: figureImgs.length > 0 ? figureImgs : undefined,
        });
      }
      
      const formulaCount = Object.values(placeholderMap).filter(v => v && v.includes('formula')).length - 
        (allQuestions.length > 0 ? Object.values(placeholderMap).filter(v => v && v.includes('formula')).length - 0 : 0);
      
      console.log(`✓ ${questions.length}题`);
      
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
  
  // 替换所有占位符
  console.log(`\n替换占位符...`);
  for (const q of allQuestions) {
    q.contentHtml = replacePlaceholders(q.contentHtml, placeholderMap);
    q.answerHtml = replacePlaceholders(q.answerHtml, placeholderMap);
    q.explanationHtml = replacePlaceholders(q.explanationHtml, placeholderMap);
    q.hasFormula = q.contentHtml.includes('question-formulas') || 
                   q.answerHtml.includes('question-formulas') || 
                   q.explanationHtml.includes('question-formulas');
  }
  
  // 保存最终数据
  fs.writeFileSync('src/data/questions-data.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
  
  const formulaCount = Object.values(placeholderMap).filter(v => v && v.includes('question-formulas')).length;
  const figureCount = Object.values(placeholderMap).filter(v => v && v.includes('question-images')).length;
  
  console.log(`\n完成！`);
  console.log(`  总题数: ${allQuestions.length}`);
  console.log(`  公式图片: ${formulaCount}`);
  console.log(`  题目配图: ${figureCount}`);
  console.log(`  有公式的题目: ${allQuestions.filter(q => q.hasFormula).length}`);
  console.log(`  有配图的题目: ${allQuestions.filter(q => q.images).length}`);
}

function replacePlaceholders(html, map) {
  if (!html) return html;
  return html.replace(/__IMG_[^_]+_[^_]+_\d+__/g, (match) => {
    const url = map[match];
    if (url) {
      return `<img src="${url}" class="formula-inline" />`;
    }
    return '';
  });
}

main().catch(console.error);
