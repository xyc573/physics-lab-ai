import mammoth from 'mammoth';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究两个互成角度的力的合成规律（简单）.docx';

async function test() {
  const result = await mammoth.convertToHtml({ path: testFile });
  console.log('result type:', typeof result.value);
  console.log('result is string:', typeof result.value === 'string');
  console.log('value length:', result.value?.length);
  console.log('first 200 chars:', result.value?.substring(0, 200));
}

test().catch(e => console.error(e));
