import AdmZip from 'adm-zip';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究弹簧弹力与形变量的关系（简单）.docx';

const zip = new AdmZip(testFile);

// 读取所有关系
const relsContent = zip.readAsText('word/_rels/document.xml.rels');
console.log('=== 所有关系中的图片 ===');
const allImageRels = [...relsContent.matchAll(/<Relationship[^>]*Type="[^"]*image[^"]*"[^>]*>/g)];
allImageRels.forEach(rel => {
  const idMatch = rel[0].match(/Id="(rId\d+)"/);
  const targetMatch = rel[0].match(/Target="([^"]+)"/);
  if (idMatch && targetMatch) {
    const ext = targetMatch[1].split('.').pop().toLowerCase();
    console.log(`  ${idMatch[1]} -> ${targetMatch[1]} (${ext})`);
  }
});

// 检查document.xml中所有包含图片的元素
const docXml = zip.readAsText('word/document.xml');
console.log('\n=== document.xml中的图片相关标签 ===');

// 查找所有包含r:embed的元素
const embedMatches = [...docXml.matchAll(/r:embed="(rId\d+)"/g)];
console.log(`找到 ${embedMatches.length} 个r:embed引用`);
embedMatches.forEach((m, i) => {
  console.log(`  ${i + 1}: ${m[1]}`);
});

// 查找v:imagedata（另一种图片格式）
const imageDataMatches = [...docXml.matchAll(/<v:imagedata[^>]*>/g)];
console.log(`\n找到 ${imageDataMatches.length} 个v:imagedata`);
imageDataMatches.forEach((m, i) => {
  const idMatch = m[0].match(/r:id="(rId\d+)"/);
  const titleMatch = m[0].match(/o:title="([^"]*)"/);
  console.log(`  ${i + 1}: r:id=${idMatch ? idMatch[1] : 'N/A'}, title=${titleMatch ? titleMatch[1] : 'N/A'}`);
});

// 查找所有pic:pic元素
const picMatches = [...docXml.matchAll(/<pic:pic>[\s\S]*?<\/pic:pic>/g)];
console.log(`\n找到 ${picMatches.length} 个pic:pic元素`);
