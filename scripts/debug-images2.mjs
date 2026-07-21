import AdmZip from 'adm-zip';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究弹簧弹力与形变量的关系（简单）.docx';

const zip = new AdmZip(testFile);
const docXml = zip.readAsText('word/document.xml');

// 找到第一个drawing标签及其上下文
const drawIndex = docXml.indexOf('<w:drawing>');
if (drawIndex >= 0) {
  const start = Math.max(0, drawIndex - 500);
  const end = Math.min(docXml.length, drawIndex + 1000);
  console.log('=== 第一个drawing标签周围的XML ===');
  console.log(docXml.substring(start, end));
}

// 检查有多少个w:p中包含w:drawing
const pWithDrawing = [...docXml.matchAll(/<w:p[^>]*>[\s\S]*?<w:drawing>[\s\S]*?<\/w:p>/g)];
console.log(`\n\n包含drawing的段落数: ${pWithDrawing.length}`);

// 列出前几个
pWithDrawing.slice(0, 3).forEach((p, i) => {
  console.log(`\n段落 ${i + 1}:`);
  // 提取rId
  const rIdMatch = p[0].match(/r:embed="(rId\d+)"/);
  console.log(`  rId: ${rIdMatch ? rIdMatch[1] : 'N/A'}`);
  // 提取段落中的文本
  const texts = [...p[0].matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1]);
  console.log(`  文本: ${texts.join('')}`);
});
