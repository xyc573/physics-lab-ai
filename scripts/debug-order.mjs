import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究两个互成角度的力的合成规律（简单）.docx';
const experimentId = 'force-composition';
const difficulty = 'easy';
const formulaDir = 'public/question-formulas';
const figureDir = 'public/question-images';

async function test() {
  // 用convertImage返回占位符
  let imgCount = 0;
  const imgList = []; // 按顺序存储图片类型
  
  const result = await mammoth.convertToHtml(
    { path: testFile },
    {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(buf) {
          imgCount++;
          const idx = imgCount;
          const isPng = image.contentType === 'image/png';
          const isWmf = image.contentType.includes('wmf');
          
          let type = 'other';
          if (isPng && buf.length > 10000) type = 'figure';
          else if (isWmf) type = 'formula';
          
          imgList.push({ idx, type, size: buf.length, contentType: image.contentType });
          return { src: `__IMG_${idx}__`, alt: '' };
        });
      })
    }
  );
  
  console.log('图片数量:', imgCount);
  console.log('图片列表:', imgList.slice(0, 10));
  console.log('HTML长度:', result.value.length);
  
  // 检查HTML中是否有占位符
  const placeholders = result.value.match(/__IMG_\d+__/g);
  console.log('HTML中的占位符数量:', placeholders?.length);
  
  // 现在我们需要知道每个占位符对应原始docx中的第几张图
  // 用AdmZip读取图片顺序
  const zip = new AdmZip(testFile);
  const docXml = zip.readAsText('word/document.xml');
  const relsContent = zip.readAsText('word/_rels/document.xml.rels');
  
  // 建立rId->target映射
  const rels = {};
  const relPattern = /<Relationship\s+Id="(rId\d+)"\s+Type="[^"]*image[^"]*"\s+Target="([^"]+)"/g;
  let m;
  while ((m = relPattern.exec(relsContent)) !== null) {
    rels[m[1]] = m[2];
  }
  
  // 按文档顺序提取图片
  const embedPattern = /r:embed="(rId\d+)"/g;
  const order = [];
  let em;
  while ((em = embedPattern.exec(docXml)) !== null) {
    if (rels[em[1]] && !order.find(o => o.rId === em[1])) {
      order.push({ rId: em[1], target: rels[em[1]] });
    }
  }
  
  console.log('文档中图片顺序:', order.length);
  order.slice(0, 10).forEach((o, i) => {
    console.log(`  ${i+1}. ${o.rId} -> ${o.target}`);
  });
  
  // 检查mammoth的图片顺序是否和文档顺序一致
  console.log('\nimgList vs order:');
  for (let i = 0; i < Math.min(10, imgList.length, order.length); i++) {
    console.log(`  ${i+1}: mammoth=${imgList[i].type} (${imgList[i].contentType}), doc=${order[i].target}`);
  }
}

test().catch(console.error);
