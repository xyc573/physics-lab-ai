import mammoth from 'mammoth';

const docPath = 'C:\\Users\\33496\\Documents\\xwechat_files\\wxid_9k2jj5n2sul922_2793\\msg\\file\\2026-07\\高中物理演示课堂小实验.docx';

const result = await mammoth.extractRawText({ path: docPath });
const text = result.value;

console.log(text);
