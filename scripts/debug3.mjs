import AdmZip from 'adm-zip';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究弹簧弹力与形变量的关系（简单）.docx';

const zip = new AdmZip(testFile);

// 读取关系
const relsContent = zip.readAsText('word/_rels/document.xml.rels');
const rels = {};
const relPattern = /<Relationship\s+Id="(rId\d+)"\s+Type="[^"]*image[^"]*"\s+Target="([^"]+)"/g;
let match;
while ((match = relPattern.exec(relsContent)) !== null) {
  rels[match[1]] = match[2];
}
console.log('图片关系数:', Object.keys(rels).length);

// 提取文档项
const docXml = zip.readAsText('word/document.xml');
const bodyMatch = docXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
console.log('找到body:', !!bodyMatch);

if (bodyMatch) {
  const bodyContent = bodyMatch[1];
  
  // 提取所有段落
  const pPattern = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  const allPs = [...bodyContent.matchAll(pPattern)];
  console.log('段落总数:', allPs.length);
  
  // 输出前15个段落的文本
  console.log('\n前15个段落:');
  for (let i = 0; i < Math.min(15, allPs.length); i++) {
    const pContent = allPs[i][1];
    let text = '';
    const tPattern = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tPattern.exec(pContent)) !== null) {
      text += tMatch[1];
    }
    
    // 检查是否有图片
    const imageMatches = [...pContent.matchAll(/<a:blip\s+r:embed="(rId\d+)"[^>]*\/>/g)];
    
    console.log(`  [${i + 1}] ${text ? text.substring(0, 60) : '(空)'} ${imageMatches.length > 0 ? `[${imageMatches.length}张图]` : ''}`);
  }
}
