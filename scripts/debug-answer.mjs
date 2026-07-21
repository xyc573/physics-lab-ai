import mammoth from 'mammoth';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究两个互成角度的力的合成规律（简单）.docx';

async function debug() {
  const result = await mammoth.extractRawText({ path: testFile });
  const text = result.value;
  
  // 找到参考答案位置
  const ansIdx = text.indexOf('参考答案');
  console.log('参考答案位置:', ansIdx);
  
  if (ansIdx >= 0) {
    const answerSection = text.substring(ansIdx);
    console.log('\n=== 答案部分（完整）===');
    console.log(answerSection);
  }
}

debug().catch(console.error);
