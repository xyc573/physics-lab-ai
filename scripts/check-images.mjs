import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// 读取题库数据
const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/questions-data.json'), 'utf8'));

// 读取现有图片文件
const questionImgDir = path.join(projectRoot, 'public/question-images');
const formulaImgDir = path.join(projectRoot, 'public/question-formulas');

const questionFiles = fs.existsSync(questionImgDir) ? fs.readdirSync(questionImgDir) : [];
const formulaFiles = fs.existsSync(formulaImgDir) ? fs.readdirSync(formulaImgDir) : [];

const questionFileSet = new Set(questionFiles);
const formulaFileSet = new Set(formulaFiles);

console.log('=== 图片文件统计 ===');
console.log('题目配图:', questionFiles.length, '张');
console.log('公式图片:', formulaFiles.length, '张');
console.log('');

// 检查images数组中的图片
console.log('=== 检查images数组中的图片 ===');
let missingFromArray = 0;
const missingFromArrayByExp = {};

data.forEach(q => {
  if (q.images && q.images.length > 0) {
    q.images.forEach(img => {
      const fileName = img.replace('/question-images/', '');
      if (!questionFileSet.has(fileName)) {
        missingFromArray++;
        if (!missingFromArrayByExp[q.experimentId]) missingFromArrayByExp[q.experimentId] = new Set();
        missingFromArrayByExp[q.experimentId].add(fileName);
      }
    });
  }
});

console.log('images数组中缺失的图片数:', missingFromArray);
if (missingFromArray > 0) {
  console.log('按实验分类:');
  Object.keys(missingFromArrayByExp).sort().forEach(exp => {
    console.log('  ' + exp + ': ' + missingFromArrayByExp[exp].size + ' 张');
  });
}
console.log('');

// 检查HTML中的图片
console.log('=== 检查HTML内容中的图片 ===');
let missingFromHtml = 0;
const missingFromHtmlImgs = new Set();
const missingFromHtmlByExp = {};

const imgRegex = /<img[^>]+src="([^"]+)"/g;

data.forEach(q => {
  const htmls = [q.contentHtml, q.explanationHtml, q.answerHtml];
  htmls.forEach(html => {
    if (!html) return;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      const fileName = src.split('/').pop();
      const isQuestionImg = src.includes('question-images');
      const isFormula = src.includes('question-formulas') || src.includes('formula_');
      
      if (isQuestionImg) {
        if (!questionFileSet.has(fileName)) {
          missingFromHtml++;
          missingFromHtmlImgs.add(fileName);
          if (!missingFromHtmlByExp[q.experimentId]) missingFromHtmlByExp[q.experimentId] = 0;
          missingFromHtmlByExp[q.experimentId]++;
        }
      } else if (isFormula) {
        if (!formulaFileSet.has(fileName)) {
          missingFromHtml++;
          missingFromHtmlImgs.add(fileName);
          if (!missingFromHtmlByExp[q.experimentId]) missingFromHtmlByExp[q.experimentId] = 0;
          missingFromHtmlByExp[q.experimentId]++;
        }
      }
    }
  });
});

console.log('HTML中缺失的图片数:', missingFromHtml);
if (missingFromHtml > 0) {
  console.log('按实验分类:');
  Object.keys(missingFromHtmlByExp).sort().forEach(exp => {
    console.log('  ' + exp + ': ' + missingFromHtmlByExp[exp] + ' 次引用');
  });
  console.log('缺失的文件:');
  [...missingFromHtmlImgs].sort().forEach(f => console.log('  ' + f));
}

console.log('');
console.log('=== 检查完成 ===');
