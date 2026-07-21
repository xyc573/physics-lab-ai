import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究弹簧弹力与形变量的关系（简单）.docx';

// 读取docx文件结构
function inspectDocx(filePath) {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();
  
  console.log('=== docx内部文件列表 ===');
  entries.forEach(entry => {
    if (!entry.isDirectory) {
      console.log(`  ${entry.entryName} (${entry.header.size} bytes)`);
    }
  });
  
  // 读取word/_rels/document.xml.rels - 这里包含图片与rId的映射
  console.log('\n=== word/_rels/document.xml.rels (图片关系映射) ===');
  try {
    const relsContent = zip.readAsText('word/_rels/document.xml.rels');
    console.log(relsContent);
  } catch (e) {
    console.log('未找到关系文件');
  }
  
  // 读取word/document.xml的部分内容，看看图片标签
  console.log('\n=== word/document.xml 中的图片标签 ===');
  try {
    const docContent = zip.readAsText('word/document.xml');
    // 查找所有drawing标签
    const drawingMatches = [...docContent.matchAll(/<w:drawing>[\s\S]*?<\/w:drawing>/g)];
    console.log(`找到 ${drawingMatches.length} 个图片`);
    drawingMatches.forEach((m, i) => {
      // 提取r:embed
      const embedMatch = m[0].match(/r:embed="(rId\d+)"/);
      if (embedMatch) {
        console.log(`  图片 ${i + 1}: rId = ${embedMatch[1]}`);
      }
    });
  } catch (e) {
    console.log('读取document.xml失败:', e.message);
  }
  
  // 列出word/media目录中的文件
  console.log('\n=== word/media 目录 ===');
  const mediaFiles = entries.filter(e => e.entryName.startsWith('word/media/') && !e.isDirectory);
  mediaFiles.forEach(f => {
    console.log(`  ${f.entryName} (${f.header.size} bytes)`);
  });
}

inspectDocx(testFile);
