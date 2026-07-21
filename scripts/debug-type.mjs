import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究两个互成角度的力的合成规律（简单）.docx';

async function debug() {
  const result = await mammoth.convertToHtml({ path: testFile });
  const html = result.value;
  
  // 提取段落
  const paragraphs = [];
  const parts = html.split(/<\/p>/);
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const text = p.replace(/<[^>]+>/g, '').trim();
    if (text) paragraphs.push(text);
  }
  
  console.log('=== 所有段落 ===');
  paragraphs.forEach((p, i) => {
    if (p.length > 5) {
      console.log(`[${i + 1}] ${p.substring(0, 120)}`);
    }
  });
  
  // 找第2题
  console.log('\n=== 第2题的所有段落 ===');
  let inQ2 = false;
  for (const p of paragraphs) {
    if (/^2[．.、]/.test(p)) inQ2 = true;
    if (inQ2) {
      if (/^3[．.、]/.test(p)) break;
      console.log(`  ${p.substring(0, 150)}`);
    }
  }
  
  // 找答案部分
  console.log('\n=== 答案部分 ===');
  let inAnswer = false;
  for (const p of paragraphs) {
    if (p.includes('参考答案')) inAnswer = true;
    if (inAnswer) {
      console.log(`  ${p.substring(0, 150)}`);
    }
  }
}

debug().catch(console.error);
