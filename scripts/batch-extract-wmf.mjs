import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const questionBankDir = 'D:/高中物理实验题库/高中物理实验题库';
const wmfDir = 'temp-wmf-all';

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

// 批量提取所有WMF文件，并重命名以建立映射
function extractAllWmf() {
  if (!fs.existsSync(wmfDir)) {
    fs.mkdirSync(wmfDir, { recursive: true });
  }
  
  const files = fs.readdirSync(questionBankDir).filter(f => f.endsWith('.docx'));
  const mapping = {}; // { "experimentId_difficulty_image1": "实际文件名.png" }
  let totalWmf = 0;
  
  for (const file of files) {
    const filePath = path.join(questionBankDir, file);
    const parsed = parseFileName(file);
    if (!parsed) continue;
    const experimentId = experimentIdMap[parsed.experimentName];
    if (!experimentId) continue;
    
    const prefix = `${experimentId}_${parsed.difficulty}_`;
    
    try {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();
      
      // 获取所有media文件，按原始顺序
      const mediaFiles = entries
        .filter(e => e.entryName.startsWith('word/media/') && !e.isDirectory)
        .sort((a, b) => {
          const numA = parseInt(a.entryName.match(/image(\d+)/)?.[1] || '0');
          const numB = parseInt(b.entryName.match(/image(\d+)/)?.[1] || '0');
          return numA - numB;
        });
      
      for (const mediaEntry of mediaFiles) {
        const origName = path.basename(mediaEntry.entryName);
        const ext = path.extname(origName).toLowerCase();
        const numMatch = origName.match(/image(\d+)/);
        const num = numMatch ? numMatch[1] : '0';
        
        const data = zip.readFile(mediaEntry.entryName);
        if (!data) continue;
        
        if (ext === '.wmf') {
          const outName = `${prefix}img${num}.wmf`;
          fs.writeFileSync(path.join(wmfDir, outName), data);
          totalWmf++;
        }
      }
    } catch (e) {
      console.log(`  跳过 ${file}: ${e.message}`);
    }
  }
  
  console.log(`共提取 ${totalWmf} 个WMF文件`);
  return totalWmf;
}

extractAllWmf();
