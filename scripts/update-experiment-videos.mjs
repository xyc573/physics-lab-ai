import fs from 'fs';

const videoMapping = {
  'spring-force': [
    { title: '激光平面镜观察桌面微小形变', url: 'https://www.bilibili.com/video/BV1iT4y1c7Eh/' },
    { title: '静摩擦力、滑动摩擦力大小演示', url: 'https://www.bilibili.com/video/BV1Mw411Z7CX/' },
  ],
  'simple-pendulum': [
    { title: '单摆振动、受迫振动与共振演示', url: 'https://www.bilibili.com/video/BV1tD421V7cK/' },
    { title: '弹簧振子简谐运动', url: 'https://www.bilibili.com/video/BV1F54y1J7tf/' },
  ],
  'projectile-motion': [
    { title: '红蜡块运动（运动合成与分解）', url: 'https://www.bilibili.com/video/BV1mV411H7wX/' },
    { title: '曲线运动速度方向（飞镖、砂轮火花）', url: 'https://www.bilibili.com/video/BV1vF4m1j7WT/' },
    { title: '物体做曲线运动的条件（磁铁吸引小球）', url: 'https://www.bilibili.com/video/BV1GM4y1P7Hg/' },
  ],
  'circuit-ohm': [
    { title: '伏安法测小灯泡伏安特性曲线', url: 'https://www.bilibili.com/video/BV1wr9BB7ECd/' },
  ],
  'refraction': [
    { title: '光的折射、全反射（光导纤维）', url: 'https://www.bilibili.com/video/BV1kK4y1S7kt/' },
  ],
  'boyle-law': [
    { title: '探究气体等温变化规律', url: 'https://www.bilibili.com/video/BV1dV4y1U7UF/' },
    { title: '压缩空气引燃硝化棉（内能做功）', url: 'https://www.bilibili.com/video/BV1EdndevEkm/' },
    { title: '焦耳热功当量实验', url: 'https://www.bilibili.com/video/BV1vT421v7QK/' },
  ],
  'sensor-control': [
    { title: '各类传感器（光、声、力、温度传感器）特性探究', url: 'https://www.bilibili.com/video/BV1tQ4y137rc/' },
  ],
  'force-composition': [
    { title: '两个弹簧测力计探究作用力与反作用力', url: 'https://www.bilibili.com/video/BV1zd1WYQE5t/' },
    { title: '悬挂法找不规则物体重心', url: 'https://www.bilibili.com/video/BV1F3kfBuEzs/' },
  ],
  'acceleration-force': [
    { title: '伽利略斜面实验（冲淡重力）', url: 'https://www.bilibili.com/video/BV1514y1W7Qj/' },
    { title: '电梯/体重秤演示超重、失重', url: 'https://www.bilibili.com/video/BV1434y167Vu/' },
    { title: '牛顿管（羽毛、金属片自由落体对比）', url: 'https://www.bilibili.com/video/BV1qD4y1s7GY/' },
  ],
  'transformer': [
    { title: '变压器改变电压演示', url: 'https://www.bilibili.com/video/BV1nh4y197Rt/' },
    { title: 'LC电磁振荡电路', url: 'https://www.bilibili.com/video/BV1ur4y1A77e/' },
  ],
  'centripetal-force': [
    { title: '向心力大小与质量、半径、转速关系', url: 'https://www.bilibili.com/video/BV11h4y1x7Xu/' },
    { title: '水流星圆周运动', url: 'https://www.bilibili.com/video/BV16G411W7Td/' },
  ],
  'velocity-time': [
    { title: '气垫导轨测滑块速度', url: 'https://www.bilibili.com/video/BV12w411K71a/' },
    { title: '用打点计时器测速度', url: 'https://www.bilibili.com/video/BV1xG411P7B1/' },
    { title: '传感器+计算机测速度（选做）', url: 'https://www.bilibili.com/video/BV1NJT96yENe/' },
  ],
  'induction-current': [
    { title: '奥斯特实验（电流磁效应）', url: 'https://www.bilibili.com/video/BV14q4y1u7fM/' },
    { title: '探究影响感应电流方向的因素（楞次定律）', url: 'https://www.bilibili.com/video/BV1QP4y1Q7Qd/' },
    { title: '手摇发电机、电磁感应现象', url: 'https://www.bilibili.com/video/BV1vN4y1C7E4/' },
    { title: '通电、断电自感演示', url: 'https://www.bilibili.com/video/BV1xz7X6ME1c/' },
  ],
  'double-slit': [
    { title: '肥皂膜光的干涉、单缝衍射、偏振片偏振实验', url: 'https://www.bilibili.com/video/BV15VPFzEEH9/' },
    { title: '绳波、水波演示波的传播', url: 'https://www.bilibili.com/video/BV1io4y1X78C/' },
    { title: '波的反射、折射、衍射、干涉', url: 'https://www.bilibili.com/video/BV1YMdpYwEX4/' },
    { title: '多普勒效应演示', url: 'https://www.bilibili.com/video/BV1QW411c7CY/' },
  ],
  'oil-film': [
    { title: '水与酒精混合体积减小（分子间隙）', url: 'https://www.bilibili.com/video/BV1nK421t7a2/' },
    { title: '布朗运动显微镜观察', url: 'https://www.bilibili.com/video/BV148AjzmEbr/' },
    { title: '肥皂膜、毛细现象、各向异性晶体石蜡熔化', url: 'https://www.bilibili.com/video/BV1Ft421T7bZ/' },
  ],
  'emf-internal-resistance': [],
  'multimeter': [],
  'capacitor-charge': [
    { title: '观察电容器充、放电现象', url: 'https://www.bilibili.com/video/BV1Up4y1d7jd/' },
    { title: '探究平行板电容器电容影响因素', url: 'https://www.bilibili.com/video/BV1fU4y137fM/' },
  ],
  'length-measurement': [
    { title: '刻度尺测反应时间', url: 'https://www.bilibili.com/video/BV1Ta411Y7uX/' },
  ],
  'momentum-conservation': [
    { title: '弹性碰撞、非弹性碰撞、完全非弹性碰撞', url: 'https://www.bilibili.com/video/BV17G4y1F7b7/' },
    { title: '反冲小车、气球反冲', url: 'https://www.bilibili.com/video/BV1et411k7xC/' },
  ],
  'mechanical-energy': [
    { title: '伽利略斜面实验（冲淡重力）', url: 'https://www.bilibili.com/video/BV1514y1W7Qj/' },
    { title: '牛顿管（羽毛、金属片自由落体对比）', url: 'https://www.bilibili.com/video/BV1qD4y1s7GY/' },
  ],
};

const filePath = 'src/data/experiments.ts';
let content = fs.readFileSync(filePath, 'utf-8');

for (const [expId, videos] of Object.entries(videoMapping)) {
  if (videos.length === 0) continue;
  
  const videoArrayStr = JSON.stringify(videos, null, 2)
    .split('\n')
    .map((line, i) => i === 0 ? line : '    ' + line)
    .join('\n');
  
  const oldPattern = new RegExp(`id: '${expId}',[\\s\\S]*?videoUrl: '[^']*',`);
  const match = content.match(oldPattern);
  
  if (match) {
    const oldStr = match[0];
    const newStr = oldStr.replace(
      /videoUrl: '[^']*',/,
      `videos: ${videoArrayStr},`
    );
    content = content.replace(oldStr, newStr);
    console.log(`已更新实验: ${expId} (${videos.length}个视频)`);
  } else {
    console.log(`未找到实验: ${expId}`);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('完成！');
