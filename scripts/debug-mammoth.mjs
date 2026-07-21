import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

const testFile = 'D:/高中物理实验题库/高中物理实验题库/探究弹簧弹力与形变量的关系（简单）.docx';

// 先用mammoth转HTML，这样能知道图片的位置
async function testMammothImages() {
  try {
    // 收集所有图片
    const images = [];
    
    const result = await mammoth.convertToHtml({
      path: testFile
    }, {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(imageBuffer) {
          images.push({
            contentType: image.contentType,
            size: imageBuffer.length,
            altText: image.altText || ''
          });
          return {
            src: `image_${images.length}.png`,
            alt: image.altText || ''
          };
        });
      })
    });
    
    console.log('=== 转换的HTML（前2000字符）===');
    console.log(result.value.substring(0, 2000));
    console.log(`\n=== 图片数: ${images.length} ===`);
    images.forEach((img, i) => {
      console.log(`  图${i + 1}: ${img.contentType}, ${img.size} bytes, alt="${img.altText}"`);
    });
    
    console.log('\n=== 所有警告 ===');
    console.log(result.messages.map(m => m.message).join('\n'));
    
  } catch (error) {
    console.error('错误:', error);
  }
}

testMammothImages();
