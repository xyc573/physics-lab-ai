import AdmZip from 'adm-zip';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/用单摆测量重力加速度（困难）.docx';

const zip = new AdmZip(testFile);

// 读取关系
const relsContent = zip.readAsText('word/_rels/document.xml.rels');
console.log('=== 所有图片关系 ===');
const allRels = [...relsContent.matchAll(/<Relationship[^>]*Type="[^"]*image[^"]*"[^>]*>/g)];
allRels.forEach(rel => {
  const idMatch = rel[0].match(/Id="(rId\d+)"/);
  const targetMatch = rel[0].match(/Target="([^"]+)"/);
  if (idMatch && targetMatch) {
    console.log(`  ${idMatch[1]} -> ${targetMatch[1]}`);
  }
});

// 检查media目录
console.log('\n=== word/media 目录 ===');
const entries = zip.getEntries();
const mediaFiles = entries.filter(e => e.entryName.startsWith('word/media/') && !e.isDirectory);
mediaFiles.forEach(f => {
  console.log(`  ${f.entryName} (${f.header.size} bytes)`);
});

// 用mammoth看看HTML中的图片情况
import mammoth from 'mammoth';
const result = await mammoth.convertToHtml(
  { path: testFile },
  {
    convertImage: mammoth.images.imgElement(function(image) {
      return image.read().then(function(buf) {
        return { src: `IMG_${image.contentType}_${buf.length}`, alt: '' };
      });
    })
  }
);

console.log('\n=== HTML中的图片（前10个）===');
const imgPattern = /<img[^>]*src="([^"]+)"[^>]*>/g;
let imgMatch;
let count = 0;
while ((imgMatch = imgPattern.exec(result.value)) !== null && count < 20) {
  console.log(`  ${imgMatch[1]}`);
  count++;
}
console.log(`总图片数: ${count}...`);

// 看看答案部分
const ansIdx = result.value.indexOf('参考答案');
if (ansIdx >= 0) {
  const ansPart = result.value.substring(ansIdx, ansIdx + 1500);
  console.log('\n=== 答案部分HTML ===');
  console.log(ansPart);
}
