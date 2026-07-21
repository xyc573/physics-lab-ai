import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究弹簧弹力与形变量的关系（简单）.docx';

async function testParse() {
  try {
    const result = await mammoth.extractRawText({ path: testFile });
    console.log('=== 文件内容 ===');
    console.log(result.value);
    console.log('=== 内容长度 ===');
    console.log(result.value.length);
  } catch (error) {
    console.error('解析错误:', error);
  }
}

testParse();
