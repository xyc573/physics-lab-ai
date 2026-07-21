import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const tempWmfDir = 'temp-wmf';
const formulaDir = 'public/question-formulas';

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

// 步骤1: 从所有docx中提取WMF图片到临时目录
function extractAllWmf() {
  if (!fs.existsSync(tempWmfDir)) {
    fs.mkdirSync(tempWmfDir, { recursive: true });
  }
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  let totalWmf = 0;
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    const experimentId = experimentIdMap[parsed.experimentName];
    if (!experimentId) continue;
    
    try {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();
      const wmfFiles = entries.filter(e => 
        e.entryName.startsWith('word/media/') && 
        !e.isDirectory && 
        e.entryName.endsWith('.wmf')
      );
      
      for (const wmfEntry of wmfFiles) {
        const fileName = path.basename(wmfEntry.entryName);
        const prefix = `${experimentId}_${parsed.difficulty}_`;
        const outName = prefix + fileName;
        const outPath = path.join(tempWmfDir, outName);
        
        const data = zip.readFile(wmfEntry.entryName);
        if (data) {
          fs.writeFileSync(outPath, data);
          totalWmf++;
        }
      }
    } catch (e) {
      // 忽略错误
    }
  }
  
  console.log(`提取了 ${totalWmf} 个WMF文件到 ${tempWmfDir}`);
  return totalWmf;
}

// 步骤2: 转换WMF到PNG
function convertWmfToPng() {
  console.log('\n正在转换WMF到PNG...');
  try {
    execSync(`powershell -ExecutionPolicy Bypass -File scripts/convert-wmf.ps1`, {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('转换完成');
    return true;
  } catch (e) {
    console.log('转换失败:', e.message);
    return false;
  }
}

async function main() {
  console.log('步骤1: 提取WMF图片...');
  extractAllWmf();
  
  console.log('\n步骤2: 转换WMF到PNG...');
  const ok = convertWmfToPng();
  
  if (ok) {
    const pngFiles = fs.readdirSync(formulaDir).filter(f => f.endsWith('.png'));
    console.log(`\n转换成功: ${pngFiles.length} 个PNG公式图片`);
  }
}

main().catch(console.error);
