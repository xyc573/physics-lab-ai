import mammoth from 'mammoth';

const docPath = 'C:\\Users\\33496\\Documents\\xwechat_files\\wxid_9k2jj5n2sul922_2793\\msg\\file\\2026-07\\高中物理演示课堂小实验.docx';

const result = await mammoth.extractRawText({ path: docPath });
const text = result.value;

const urlRegex = /https?:\/\/[^\s<>"']+/g;
const urls = text.match(urlRegex) || [];
const bilibiliUrls = urls.filter(u => u.includes('bilibili'));

console.log('=== 视频链接统计 ===');
console.log('总链接数:', urls.length);
console.log('B站链接数:', bilibiliUrls.length);
console.log('');

console.log('=== 所有B站链接 ===');
bilibiliUrls.forEach((url, i) => {
  console.log((i + 1) + '. ' + url);
});

console.log('');
console.log('=== 文档前2000字预览 ===');
console.log(text.slice(0, 2000));
