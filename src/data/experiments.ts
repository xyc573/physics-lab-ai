import type { Experiment } from '../types/experiment';

export const experiments: Experiment[] = [
  {
    id: 'spring-force',
    name: '探究弹簧弹力与形变量的关系',
    category: 'book1',
    difficulty: 'easy',
    description: '通过实验探究弹簧弹力与形变量之间的关系，验证胡克定律。',
    icon: 'spring',
    preview: {
      middleSchoolConnection: [
        '初中已学习力的概念和力的三要素',
        '初中已了解弹力的基本概念（拉力、压力、支持力）',
        '初中已学习弹簧测力计的使用方法',
        '初中已接触简单的正比例函数图像',
      ],
      principles: [
        {
          title: '胡克定律',
          content: '弹簧发生弹性形变时，弹力的大小F跟弹簧伸长（或缩短）的长度x成正比，即：F = kx。其中k称为弹簧的劲度系数，单位是牛顿每米，符号是N/m。',
          formulas: ['F = kx', 'k = F / x'],
          notes: [
            '胡克定律的适用条件是在弹性限度内',
            'x是形变量，不是弹簧的原长或总长',
            '劲度系数k由弹簧本身的性质决定',
          ],
        },
        {
          title: '实验原理',
          content: '在弹簧下端悬挂钩码，弹簧受到的拉力等于钩码的重力。用刻度尺测量弹簧的伸长量，通过改变钩码质量来改变拉力，测量多组数据后绘制F-x图像，分析弹力与形变量的关系。',
          formulas: ['F = mg', 'Δx = L - L₀'],
        },
      ],
      equipment: [
        {
          name: '铁架台',
          icon: 'stand',
          purpose: '固定弹簧，提供稳定的实验支架',
          usage: '将铁架台放置在水平桌面上，调整底座使其稳固',
        },
        {
          name: '弹簧',
          icon: 'spring',
          purpose: '研究对象，产生弹力',
          usage: '上端悬挂在铁架台上，下端挂钩码',
        },
        {
          name: '钩码',
          icon: 'weight',
          purpose: '提供拉力（重力）',
          usage: '逐个增加或减少，改变弹簧受到的拉力',
        },
        {
          name: '刻度尺',
          icon: 'ruler',
          purpose: '测量弹簧的长度和形变量',
          usage: '竖直放置，与弹簧平行，读数时视线与刻度垂直',
        },
      ],
    },
    simulation: {
      type: 'spring',
      initialParams: {
        mass: 0.1,
        k: 50,
        gravity: 9.8,
        damping: 0.5,
      },
      paramRanges: {
        mass: { min: 0.05, max: 0.5, step: 0.01, label: '钩码质量', unit: 'kg' },
        k: { min: 10, max: 200, step: 5, label: '劲度系数', unit: 'N/m' },
        gravity: { min: 1, max: 20, step: 0.1, label: '重力加速度', unit: 'm/s²' },
        damping: { min: 0, max: 2, step: 0.1, label: '阻尼系数' },
      },
    },
  },
  {
    id: 'simple-pendulum',
    name: '用单摆测量重力加速度',
    category: 'selective1',
    difficulty: 'medium',
    description: '利用单摆周期公式测量当地的重力加速度g值。',
    icon: 'pendulum',
    preview: {
      middleSchoolConnection: [
        '初中已学习摆的等时性原理',
        '初中已了解周期的概念',
        '初中已学习长度和时间的测量',
        '初中已接触重力的概念',
      ],
      principles: [
        {
          title: '单摆周期公式',
          content: '单摆在小角度（小于5°）摆动时，其周期T与摆长L的平方根成正比，与重力加速度g的平方根成反比，与振幅和摆球质量无关。公式为：T = 2π√(L/g)',
          formulas: ['T = 2π√(L/g)', 'g = 4π²L / T²'],
          notes: [
            '单摆的摆角必须小于5°才能看作简谐运动',
            '摆长是悬点到摆球球心的距离',
            '测量周期时从平衡位置开始计时更准确',
          ],
        },
        {
          title: '实验方法',
          content: '用刻度尺测量摆长L，用秒表测量单摆完成n次全振动的时间t，求出周期T = t/n。代入公式计算重力加速度g。改变摆长多次测量，取平均值减小误差。',
          formulas: ['T = t/n', 'g = 4π²L / T²'],
        },
      ],
      equipment: [
        {
          name: '铁架台',
          icon: 'stand',
          purpose: '固定单摆',
          usage: '将铁架台放在水平桌面上，夹紧摆线上端',
        },
        {
          name: '摆球',
          icon: 'circle',
          purpose: '单摆的摆动物体',
          usage: '使用密度大、体积小的金属球',
        },
        {
          name: '秒表',
          icon: 'clock',
          purpose: '测量摆动周期',
          usage: '测量多次全振动时间，求平均周期',
        },
        {
          name: '刻度尺',
          icon: 'ruler',
          purpose: '测量摆长',
          usage: '测量悬点到球心的距离',
        },
      ],
    },
    simulation: {
      type: 'pendulum',
      initialParams: {
        length: 1,
        gravity: 9.8,
        amplitude: 5,
        damping: 0,
      },
      paramRanges: {
        length: { min: 0.3, max: 3, step: 0.1, label: '摆长', unit: 'm' },
        gravity: { min: 1, max: 20, step: 0.1, label: '重力加速度', unit: 'm/s²' },
        amplitude: { min: 1, max: 10, step: 0.5, label: '振幅', unit: '°' },
        damping: { min: 0, max: 1, step: 0.01, label: '阻尼系数' },
      },
    },
  },
  {
    id: 'projectile-motion',
    name: '探究平抛运动的特点',
    category: 'book2',
    difficulty: 'medium',
    description: '通过实验探究平抛运动的规律，分解为水平方向匀速直线运动和竖直方向自由落体运动。',
    icon: 'target',
    preview: {
      middleSchoolConnection: [
        '初中已学习匀速直线运动和变速直线运动',
        '初中已了解重力和自由落体',
        '初中已学习速度、路程等概念',
        '初中已接触运动的合成与分解思想',
      ],
      principles: [
        {
          title: '平抛运动分解',
          content: '平抛运动可以分解为水平方向和竖直方向的两个分运动：水平方向由于不受力，做匀速直线运动；竖直方向由于只受重力，做自由落体运动。两个分运动独立进行，互不干扰。',
          formulas: ['x = v₀t', 'y = ½gt²', 'v_x = v₀', 'v_y = gt'],
          notes: [
            '平抛运动是匀变速曲线运动，加速度恒为g',
            '运动时间由下落高度决定，与初速度无关',
            '水平位移由初速度和下落高度共同决定',
          ],
        },
        {
          title: '实验验证方法',
          content: '通过描迹法记录平抛运动轨迹，在轨迹上取多个点，测量各点的水平位移x和竖直位移y，验证x与t成正比、y与t²成正比的关系。',
          formulas: ['t = x/v₀', 'y = ½g(x/v₀)²'],
        },
      ],
      equipment: [
        {
          name: '斜槽轨道',
          icon: 'ramp',
          purpose: '使小球获得水平初速度',
          usage: '固定在桌边，末端保持水平',
        },
        {
          name: '小球',
          icon: 'circle',
          purpose: '平抛运动的研究对象',
          usage: '每次从同一位置由静止释放',
        },
        {
          name: '木板',
          icon: 'square',
          purpose: '固定白纸记录轨迹',
          usage: '竖直放置在斜槽末端旁边',
        },
        {
          name: '刻度尺',
          icon: 'ruler',
          purpose: '测量坐标',
          usage: '建立坐标系，测量轨迹点坐标',
        },
      ],
    },
    simulation: {
      type: 'projectile',
      initialParams: {
        velocity: 20,
        height: 50,
        gravity: 9.8,
      },
      paramRanges: {
        velocity: { min: 5, max: 50, step: 1, label: '初速度', unit: 'm/s' },
        height: { min: 10, max: 200, step: 5, label: '初始高度', unit: 'm' },
        gravity: { min: 1, max: 20, step: 0.1, label: '重力加速度', unit: 'm/s²' },
      },
    },
  },
  {
    id: 'circuit-ohm',
    name: '导体电阻率的测量',
    category: 'book3',
    difficulty: 'medium',
    description: '测量金属丝的电阻率，学习伏安法测电阻的方法。',
    icon: 'zap',
    preview: {
      middleSchoolConnection: [
        '初中已学习欧姆定律 I = U/R',
        '初中已了解电阻的概念和单位',
        '初中已学习电流表、电压表的使用',
        '初中已接触串联电路和并联电路',
      ],
      principles: [
        {
          title: '电阻定律',
          content: '导体的电阻R跟它的长度L成正比，跟它的横截面积S成反比，还跟导体的材料有关。公式为：R = ρL/S，其中ρ是导体的电阻率，反映材料导电性能的好坏。',
          formulas: ['R = ρL/S', 'ρ = RS/L'],
          notes: [
            '电阻率ρ的单位是Ω·m',
            '金属的电阻率随温度升高而增大',
            '超导现象：温度降低到某一值时电阻突然变为零',
          ],
        },
        {
          title: '伏安法测电阻',
          content: '根据欧姆定律R = U/I，用电压表测出导体两端的电压U，用电流表测出通过导体的电流I，就可以求出导体的电阻R。有电流表外接法和内接法两种电路。',
          formulas: ['R = U/I', 'ρ = πd²U/(4IL)'],
        },
      ],
      equipment: [
        {
          name: '电源',
          icon: 'battery',
          purpose: '提供电能',
          usage: '选择合适电压的直流电源',
        },
        {
          name: '电流表',
          icon: 'gauge',
          purpose: '测量电路中的电流',
          usage: '串联在待测电路中，选择合适量程',
        },
        {
          name: '电压表',
          icon: 'gauge',
          purpose: '测量导体两端的电压',
          usage: '并联在待测导体两端，选择合适量程',
        },
        {
          name: '滑动变阻器',
          icon: 'sliders',
          purpose: '改变电路中的电流和电压',
          usage: '可以用限流法或分压法接法',
        },
        {
          name: '螺旋测微器',
          icon: 'settings',
          purpose: '测量金属丝直径',
          usage: '精确测量到0.001mm，在不同位置测量取平均',
        },
      ],
    },
    simulation: {
      type: 'circuit',
      initialParams: {
        voltage: 3,
        resistance: 10,
        wireLength: 1,
        wireDiameter: 0.5,
      },
      paramRanges: {
        voltage: { min: 1, max: 12, step: 0.5, label: '电源电压', unit: 'V' },
        resistance: { min: 1, max: 100, step: 1, label: '滑动变阻器', unit: 'Ω' },
        wireLength: { min: 0.2, max: 2, step: 0.1, label: '金属丝长度', unit: 'm' },
        wireDiameter: { min: 0.1, max: 1, step: 0.05, label: '金属丝直径', unit: 'mm' },
      },
    },
  },
  {
    id: 'refraction',
    name: '测量玻璃的折射率',
    category: 'selective3',
    difficulty: 'medium',
    description: '用插针法测量玻璃的折射率，理解光的折射定律。',
    icon: 'sun',
    preview: {
      middleSchoolConnection: [
        '初中已学习光的直线传播',
        '初中已了解光的反射定律',
        '初中已接触光的折射现象',
        '初中已学习光路图的画法',
      ],
      principles: [
        {
          title: '折射定律（斯涅尔定律）',
          content: '光从一种介质射入另一种介质时，入射角的正弦与折射角的正弦成正比，即n₁sinθ₁ = n₂sinθ₂。其中n是介质的折射率，反映介质的光学性质。',
          formulas: ['n = sinθ₁ / sinθ₂', 'n = c / v'],
          notes: [
            '折射率n总是大于1（光密介质）',
            '折射率越大，光的偏折程度越大',
            '折射率与光的频率有关（色散）',
          ],
        },
        {
          title: '插针法原理',
          content: '利用大头针确定入射光线和出射光线的位置，在玻璃砖上找到入射点和出射点，连接两点得到玻璃中的折射光线，用量角器测量入射角和折射角，计算折射率。',
          formulas: ['n = sinθ₁ / sinθ₂'],
        },
      ],
      equipment: [
        {
          name: '玻璃砖',
          icon: 'square',
          purpose: '研究光的折射的介质',
          usage: '放在白纸上，用铅笔描出轮廓',
        },
        {
          name: '大头针',
          icon: 'map-pin',
          purpose: '确定光路',
          usage: '在入射侧和出射侧各插两枚',
        },
        {
          name: '量角器',
          icon: 'circle',
          purpose: '测量入射角和折射角',
          usage: '测量光线与法线的夹角',
        },
        {
          name: '刻度尺',
          icon: 'ruler',
          purpose: '画直线和测量长度',
          usage: '连接大头针确定光线',
        },
      ],
    },
    simulation: {
      type: 'refraction',
      initialParams: {
        incidentAngle: 30,
        topMedium: 0,
        bottomMedium: 2,
        incidentFromBottom: 0,
      },
      paramRanges: {
        incidentAngle: { min: 0, max: 89, step: 1, label: '入射角', unit: '°' },
      },
    },
  },
  {
    id: 'boyle-law',
    name: '探究等温情况下一定质量气体压强与体积的关系',
    category: 'selective3',
    difficulty: 'medium',
    description: '探究等温过程中一定质量理想气体的压强与体积的关系（玻意耳定律）。',
    icon: 'thermometer',
    preview: {
      middleSchoolConnection: [
        '初中已学习大气压强的概念',
        '初中已了解气体有体积和压强',
        '初中已接触温度、体积、压强的概念',
        '初中已学习密度公式和反比例函数',
      ],
      principles: [
        {
          title: '玻意耳定律',
          content: '一定质量的某种气体，在温度不变的情况下，压强p与体积V成反比，即pV = C（常量）。或者说：p₁V₁ = p₂V₂。',
          formulas: ['pV = C', 'p₁V₁ = p₂V₂'],
          notes: [
            '适用条件：一定质量、温度不变、压强不太大',
            'p-V图像是双曲线（等温线）',
            '微观解释：温度不变，分子平均动能不变，体积减小则分子密集程度增大，压强增大',
          ],
        },
        {
          title: '实验方法',
          content: '用注射器封闭一定质量的气体，通过改变活塞位置来改变气体体积，用压强传感器测量气体压强。保持环境温度不变，测量多组p和V的数据，验证pV是否为定值。',
          formulas: ['pV = 常量'],
        },
      ],
      equipment: [
        {
          name: '注射器',
          icon: 'pipette',
          purpose: '封闭一定质量的气体',
          usage: '活塞可以移动，改变气体体积',
        },
        {
          name: '压强传感器',
          icon: 'gauge',
          purpose: '测量气体压强',
          usage: '连接注射器，实时显示压强',
        },
        {
          name: '铁架台',
          icon: 'stand',
          purpose: '固定注射器',
          usage: '竖直固定，保持稳定',
        },
      ],
    },
    simulation: {
      type: 'gas',
      initialParams: {
        volume: 100,
        temperature: 300,
        moles: 0.004,
      },
      paramRanges: {
        volume: { min: 20, max: 200, step: 5, label: '体积', unit: 'mL' },
        temperature: { min: 200, max: 400, step: 5, label: '温度', unit: 'K' },
        moles: { min: 0.001, max: 0.01, step: 0.001, label: '物质的量', unit: 'mol' },
      },
    },
  },
  {
    id: 'sensor-control',
    name: '利用传感器制作简单的自动控制装置',
    category: 'selective2',
    difficulty: 'medium',
    description: '通过传感器将非电学量转换为电学量，结合继电器等元件制作自动控制装置，体验现代技术在生活中的应用。',
    icon: 'cpu',
    preview: {
      middleSchoolConnection: [
        '初中已学习简单电路的组成和连接',
        '初中已了解电磁继电器的原理',
        '初中已接触光敏电阻、热敏电阻等敏感元件',
        '初中已学习电路的设计与绘制',
      ],
      principles: [
        {
          title: '传感器工作原理',
          content: '传感器是指能将感受到的物理量（如温度、光照、压力、声音等非电学量）转换成便于测量的电学量（如电压、电流、电阻等）的器件。常见的传感器有光敏传感器、热敏传感器、压力传感器、声音传感器等。',
          formulas: ['输出电学量 = f(输入非电学量)'],
          notes: [
            '光敏电阻的阻值随光照强度增大而减小',
            '热敏电阻的阻值随温度变化（NTC型阻值随温度升高而减小）',
            '传感器是现代自动控制系统的重要组成部分',
          ],
        },
        {
          title: '自动控制原理',
          content: '利用传感器获取环境信息，通过电路处理（如放大、比较）后控制执行元件（如继电器、电动机、指示灯）工作，实现自动控制功能。例如：光控开关、温控报警器等。',
          formulas: [],
        },
      ],
      equipment: [
        {
          name: '光敏电阻',
          icon: 'sun',
          purpose: '感知光照强度',
          usage: '与分压电阻串联，光照变化时输出电压变化',
        },
        {
          name: '热敏电阻',
          icon: 'thermometer',
          purpose: '感知温度变化',
          usage: '放置在待测温度环境中，阻值随温度变化',
        },
        {
          name: '电磁继电器',
          icon: 'toggle-right',
          purpose: '控制执行电路的通断',
          usage: '低压控制电路控制高压工作电路',
        },
        {
          name: '直流电源',
          icon: 'battery',
          purpose: '提供电能',
          usage: '为控制电路和工作电路供电',
        },
      ],
    },
    simulation: {
      type: 'sensor',
      initialParams: {
        lightIntensity: 500,
        threshold: 300,
        temperature: 25,
      },
      paramRanges: {
        lightIntensity: { min: 0, max: 1000, step: 10, label: '光照强度', unit: 'lux' },
        threshold: { min: 0, max: 1000, step: 10, label: '控制阈值', unit: 'lux' },
        temperature: { min: -20, max: 80, step: 1, label: '环境温度', unit: '℃' },
      },
    },
  },
  {
    id: 'force-composition',
    name: '探究两个互成角度的力的合成规律',
    category: 'book1',
    difficulty: 'medium',
    description: '通过实验探究两个互成角度的共点力的合成规律，验证平行四边形定则。',
    icon: 'merge',
    preview: {
      middleSchoolConnection: [
        '初中已学习力的概念和力的图示',
        '初中已了解同一直线上力的合成（同向相加、反向相减）',
        '初中已学习弹簧测力计的使用',
        '初中已接触力的作用效果',
      ],
      principles: [
        {
          title: '平行四边形定则',
          content: '两个力合成时，以表示这两个力的有向线段为邻边作平行四边形，这两个邻边之间的对角线就代表合力的大小和方向，这就是力的平行四边形定则。它是所有矢量合成的普遍法则。',
          formulas: ['F合² = F₁² + F₂² + 2F₁F₂cosθ', 'tanφ = F₂sinθ/(F₁ + F₂cosθ)'],
          notes: [
            '当两力夹角为0°时，合力最大，F合 = F₁ + F₂',
            '当两力夹角为180°时，合力最小，F合 = |F₁ - F₂|',
            '合力的取值范围：|F₁-F₂| ≤ F合 ≤ F₁+F₂',
          ],
        },
        {
          title: '实验方法',
          content: '用两个弹簧测力计互成角度地拉橡皮条，使结点到达某一位置O；再用一个弹簧测力计单独拉橡皮条，使结点到达同一位置O。记录两个分力和一个等效力的大小和方向，验证它们是否符合平行四边形定则。',
          formulas: [],
        },
      ],
      equipment: [
        {
          name: '弹簧测力计',
          icon: 'gauge',
          purpose: '测量力的大小',
          usage: '两个测力计互成角度拉橡皮条，或一个单独拉',
        },
        {
          name: '橡皮条',
          icon: 'stretch-horizontal',
          purpose: '产生相同的力的作用效果',
          usage: '一端固定，另一端与细绳结点连接',
        },
        {
          name: '木板',
          icon: 'square',
          purpose: '固定白纸和实验装置',
          usage: '水平放置，钉上白纸记录力的方向',
        },
        {
          name: '白纸和图钉',
          icon: 'map-pin',
          purpose: '记录结点位置和力的方向',
          usage: '钉在木板上，用铅笔描出力的方向',
        },
      ],
    },
    simulation: {
      type: 'force',
      initialParams: {
        force1: 3,
        force2: 4,
        angle: 60,
      },
      paramRanges: {
        force1: { min: 0, max: 10, step: 0.1, label: '力F₁', unit: 'N' },
        force2: { min: 0, max: 10, step: 0.1, label: '力F₂', unit: 'N' },
        angle: { min: 0, max: 180, step: 1, label: '两力夹角', unit: '°' },
      },
    },
  },
  {
    id: 'acceleration-force',
    name: '探究加速度与力、质量的关系',
    category: 'book1',
    difficulty: 'hard',
    description: '通过控制变量法探究物体的加速度与所受合外力、质量之间的关系，验证牛顿第二定律。',
    icon: 'gauge',
    preview: {
      middleSchoolConnection: [
        '初中已学习力是改变物体运动状态的原因',
        '初中已了解质量的概念和单位',
        '初中已学习匀速直线运动和变速运动',
        '初中已接触二力平衡条件',
      ],
      principles: [
        {
          title: '牛顿第二定律',
          content: '物体的加速度跟所受的合外力成正比，跟物体的质量成反比，加速度的方向跟合外力的方向相同。公式为：F = ma。其中F是合外力（单位N），m是质量（单位kg），a是加速度（单位m/s²）。',
          formulas: ['F = ma', 'a = F / m'],
          notes: [
            '使用控制变量法：研究a与F关系时保持m不变，研究a与m关系时保持F不变',
            'a-F图像是过原点的直线，a-1/m图像也是过原点的直线',
            '加速度的方向始终与合外力方向一致',
            '实验中要平衡摩擦力，使小车所受合力等于沙桶的重力',
          ],
        },
        {
          title: '实验方法',
          content: '用打点计时器记录小车运动的纸带，通过纸带分析求出加速度。保持小车质量不变，改变沙桶质量（即改变拉力），研究a与F的关系；保持拉力不变，改变小车质量，研究a与m的关系。',
          formulas: ['a = Δv/Δt', 'a = (x_n+1 - x_n)/T²'],
        },
      ],
      equipment: [
        {
          name: '小车',
          icon: 'truck',
          purpose: '研究对象',
          usage: '放在轨道上，可在拉力作用下加速运动',
        },
        {
          name: '打点计时器',
          icon: 'clock',
          purpose: '记录小车运动情况',
          usage: '固定在轨道一端，纸带穿过打点计时器连在小车上',
        },
        {
          name: '沙桶和沙',
          icon: 'weight',
          purpose: '提供拉力',
          usage: '通过细线跨过滑轮连接小车，改变沙的质量改变拉力',
        },
        {
          name: '天平',
          icon: 'scale',
          purpose: '测量小车和沙桶的质量',
          usage: '测量前调平，读数准确到0.1g',
        },
      ],
    },
    simulation: {
      type: 'acceleration',
      initialParams: {
        force: 0.5,
        mass: 0.4,
        friction: 0.05,
      },
      paramRanges: {
        force: { min: 0.1, max: 2, step: 0.05, label: '拉力', unit: 'N' },
        mass: { min: 0.1, max: 2, step: 0.05, label: '小车质量', unit: 'kg' },
        friction: { min: 0, max: 0.5, step: 0.01, label: '摩擦系数' },
      },
    },
  },
  {
    id: 'transformer',
    name: '探究变压器原、副线圈电压与匝数的关系',
    category: 'book3',
    difficulty: 'medium',
    description: '通过实验探究理想变压器原、副线圈两端电压与匝数的关系，理解变压器的工作原理。',
    icon: 'zap',
    preview: {
      middleSchoolConnection: [
        '初中已学习电磁感应现象',
        '初中已了解电流的磁效应',
        '初中已学习交流电的概念',
        '初中已接触线圈和磁场的相互作用',
      ],
      principles: [
        {
          title: '变压器原理',
          content: '变压器是由闭合铁芯和绕在铁芯上的两个线圈组成的。原线圈接交流电源，在铁芯中产生交变磁通量，通过电磁感应使副线圈产生感应电动势。理想变压器（无能量损耗）原、副线圈两端电压之比等于它们的匝数之比。',
          formulas: ['U₁/U₂ = n₁/n₂', 'U₁I₁ = U₂I₂（理想变压器）'],
          notes: [
            '变压器只能改变交流电压，不能改变直流电压',
            '理想变压器输入功率等于输出功率',
            '升压变压器：n₂ > n₁；降压变压器：n₂ < n₁',
            '实际变压器存在铁损、铜损等能量损失，效率小于100%',
          ],
        },
        {
          title: '实验方法',
          content: '使用可拆变压器，保持原线圈匝数和输入电压不变，改变副线圈匝数，测量副线圈两端电压。也可以保持匝数比不变，改变输入电压，观察输出电压的变化规律。',
          formulas: ['U₂ = U₁·(n₂/n₁)'],
        },
      ],
      equipment: [
        {
          name: '可拆变压器',
          icon: 'box',
          purpose: '研究变压器规律',
          usage: '原、副线圈匝数可调，铁芯可拆卸',
        },
        {
          name: '学生电源',
          icon: 'battery',
          purpose: '提供交流输入电压',
          usage: '选择交流输出，电压可调',
        },
        {
          name: '交流电压表',
          icon: 'gauge',
          purpose: '测量原、副线圈电压',
          usage: '分别测量输入和输出电压',
        },
        {
          name: '导线',
          icon: 'cable',
          purpose: '连接电路',
          usage: '连接电源、变压器和电压表',
        },
      ],
    },
    simulation: {
      type: 'transformer',
      initialParams: {
        primaryVoltage: 6,
        primaryTurns: 200,
        secondaryTurns: 100,
      },
      paramRanges: {
        primaryVoltage: { min: 1, max: 12, step: 0.5, label: '原线圈电压', unit: 'V' },
        primaryTurns: { min: 50, max: 500, step: 10, label: '原线圈匝数', unit: '匝' },
        secondaryTurns: { min: 50, max: 500, step: 10, label: '副线圈匝数', unit: '匝' },
      },
    },
  },
  {
    id: 'centripetal-force',
    name: '探究向心力大小与半径、角速度、质量的关系',
    category: 'book2',
    difficulty: 'hard',
    description: '通过控制变量法探究向心力大小与圆周运动的半径、角速度、物体质量之间的关系，验证向心力公式。',
    icon: 'rotate-cw',
    preview: {
      middleSchoolConnection: [
        '初中已学习圆周运动的初步概念',
        '初中已了解力的概念和测量方法',
        '初中已学习质量的概念',
        '初中已接触过匀速运动的特点',
      ],
      principles: [
        {
          title: '向心力公式',
          content: '做匀速圆周运动的物体所需的向心力大小为F = mω²r = mv²/r，方向始终指向圆心。其中m是物体质量，ω是角速度，r是圆周半径，v是线速度。',
          formulas: ['F = mω²r', 'F = mv²/r', 'v = ωr'],
          notes: [
            '向心力是变力，方向不断变化但始终指向圆心',
            '向心力只改变速度方向，不改变速度大小',
            '向心力是效果力，可以由重力、弹力、摩擦力等提供',
            '使用控制变量法分别探究F与m、ω、r的关系',
          ],
        },
        {
          title: '实验方法',
          content: '使用向心力演示器，通过控制变量法分别研究向心力与质量、角速度、半径的关系。保持其中两个量不变，改变第三个量，观察向心力的变化规律。可通过弹簧测力计或传感器测量向心力大小。',
          formulas: ['F ∝ m（ω、r不变）', 'F ∝ ω²（m、r不变）', 'F ∝ r（m、ω不变）'],
        },
      ],
      equipment: [
        {
          name: '向心力演示器',
          icon: 'circle',
          purpose: '研究向心力的实验装置',
          usage: '可改变质量、半径、转速进行实验',
        },
        {
          name: '砝码',
          icon: 'weight',
          purpose: '提供不同质量的实验对象',
          usage: '改变砝码质量研究F与m的关系',
        },
        {
          name: '弹簧测力计',
          icon: 'gauge',
          purpose: '测量向心力大小',
          usage: '连接在转动体上，测量所需向心力',
        },
        {
          name: '秒表',
          icon: 'clock',
          purpose: '测量转动周期',
          usage: '测量n圈所用时间t，求出周期T = t/n和角速度ω = 2π/T',
        },
      ],
    },
    simulation: {
      type: 'centripetal',
      initialParams: {
        mass: 0.1,
        radius: 0.2,
        angularVelocity: 5,
      },
      paramRanges: {
        mass: { min: 0.01, max: 1, step: 0.01, label: '物体质量', unit: 'kg' },
        radius: { min: 0.05, max: 1, step: 0.05, label: '圆周半径', unit: 'm' },
        angularVelocity: { min: 0.5, max: 20, step: 0.5, label: '角速度', unit: 'rad/s' },
      },
    },
  },
  {
    id: 'velocity-time',
    name: '探究小车速度随时间变化的规律',
    category: 'book1',
    difficulty: 'medium',
    description: '通过打点计时器记录小车运动情况，分析纸带上的点迹，研究小车速度随时间变化的规律。',
    icon: 'trending-up',
    preview: {
      middleSchoolConnection: [
        '初中已学习速度的概念和公式v = s/t',
        '初中已了解匀速直线运动的特点',
        '初中已学习路程-时间图像',
        '初中已接触变速运动的初步概念',
      ],
      principles: [
        {
          title: '匀变速直线运动',
          content: '物体沿直线运动，且加速度保持恒定，这种运动称为匀变速直线运动。其速度随时间均匀变化，满足v = v₀ + at。在v-t图像中是一条倾斜直线，斜率等于加速度。',
          formulas: ['v = v₀ + at', 'x = v₀t + ½at²', 'v² - v₀² = 2ax'],
          notes: [
            '匀加速直线运动：加速度a与速度v方向相同',
            '匀减速直线运动：加速度a与速度v方向相反',
            'v-t图像中直线的斜率表示加速度',
            '纸带上相邻计数点的时间间隔相同',
          ],
        },
        {
          title: '纸带分析方法',
          content: '在纸带上每隔若干个点取一个计数点，测量各计数点间的距离。用"中间时刻速度等于该段平均速度"的方法求各计数点的瞬时速度，绘制v-t图像分析运动规律。用逐差法求加速度。',
          formulas: ['v_n = (x_n + x_n+1)/(2T)', 'a = (x4+x5+x6 - x1-x2-x3)/(9T²)'],
        },
      ],
      equipment: [
        {
          name: '打点计时器',
          icon: 'clock',
          purpose: '记录小车运动',
          usage: '使用交流电源，每0.02s打一个点',
        },
        {
          name: '小车',
          icon: 'truck',
          purpose: '研究对象',
          usage: '在轨道上做匀加速运动',
        },
        {
          name: '纸带',
          icon: 'scroll',
          purpose: '记录运动信息',
          usage: '穿过打点计时器固定在小车上',
        },
        {
          name: '刻度尺',
          icon: 'ruler',
          purpose: '测量纸带上各点间距离',
          usage: '准确到mm，多次测量取平均值',
        },
      ],
    },
    simulation: {
      type: 'velocity',
      initialParams: {
        acceleration: 1,
        initialVelocity: 0,
        duration: 5,
      },
      paramRanges: {
        acceleration: { min: -5, max: 5, step: 0.1, label: '加速度', unit: 'm/s²' },
        initialVelocity: { min: 0, max: 10, step: 0.1, label: '初速度', unit: 'm/s' },
        duration: { min: 1, max: 20, step: 1, label: '运动时间', unit: 's' },
      },
    },
  },
  {
    id: 'induction-current',
    name: '探究感应电流产生的条件',
    category: 'book3',
    difficulty: 'medium',
    description: '通过实验探究电磁感应现象，理解产生感应电流的条件，加深对磁通量变化的认识。',
    icon: 'zap',
    preview: {
      middleSchoolConnection: [
        '初中已学习电流的磁效应（奥斯特实验）',
        '初中已了解磁场和磁感线的概念',
        '初中已学习闭合电路和电流的方向',
        '初中已接触简单的电磁现象',
      ],
      principles: [
        {
          title: '电磁感应现象',
          content: '当穿过闭合电路的磁通量发生变化时，电路中就产生感应电流，这种现象叫做电磁感应。产生感应电流的条件是：电路闭合且穿过电路的磁通量发生变化。',
          formulas: ['Φ = BS（当B⊥S时）', 'ε = -dΦ/dt'],
          notes: [
            '磁通量变化的原因：B变化、S变化、B与S夹角变化',
            '电路必须闭合才能形成感应电流',
            '磁通量变化是产生感应电流的根本原因',
            '感应电流的方向由楞次定律判断',
          ],
        },
        {
          title: '实验方法',
          content: '将线圈与灵敏电流计连接成闭合回路，通过条形磁铁相对线圈运动、改变线圈面积、改变磁场强弱等方式使穿过线圈的磁通量发生变化，观察电流计指针是否偏转，分析感应电流产生的条件。',
          formulas: [],
        },
      ],
      equipment: [
        {
          name: '灵敏电流计',
          icon: 'gauge',
          purpose: '检测感应电流',
          usage: '连接在线圈回路中，指针偏转表示有电流',
        },
        {
          name: '线圈',
          icon: 'circle',
          purpose: '产生感应电流的载体',
          usage: '与电流计连接成闭合回路',
        },
        {
          name: '条形磁铁',
          icon: 'magnet',
          purpose: '提供磁场',
          usage: '相对线圈运动改变磁通量',
        },
        {
          name: '滑动变阻器',
          icon: 'sliders',
          purpose: '改变原线圈电流',
          usage: '在原线圈电路中改变电流大小，引起磁通量变化',
        },
      ],
    },
    simulation: {
      type: 'induction',
      initialParams: {
        magnetVelocity: 0.5,
        coilTurns: 100,
        magneticField: 0.5,
      },
      paramRanges: {
        magnetVelocity: { min: 0, max: 5, step: 0.1, label: '磁铁速度', unit: 'm/s' },
        coilTurns: { min: 10, max: 500, step: 10, label: '线圈匝数', unit: '匝' },
        magneticField: { min: 0.01, max: 2, step: 0.01, label: '磁感应强度', unit: 'T' },
      },
    },
  },
  {
    id: 'double-slit',
    name: '用双缝干涉测量光的波长',
    category: 'selective3',
    difficulty: 'hard',
    description: '通过杨氏双缝干涉实验，测量单色光的波长，理解光的波动性。',
    icon: 'waves',
    preview: {
      middleSchoolConnection: [
        '初中已学习光的直线传播',
        '初中已了解光的反射和折射',
        '初中已接触光的色散现象',
        '初中已学习波长、频率的概念',
      ],
      principles: [
        {
          title: '杨氏双缝干涉',
          content: '光通过双缝后形成两个相干光源，光屏上出现明暗相间的干涉条纹。相邻明条纹（或暗条纹）中心间距Δx与双缝到屏的距离L成正比，与光的波长λ成正比，与双缝间距d成反比。',
          formulas: ['Δx = Lλ/d', 'λ = dΔx/L'],
          notes: [
            '相干光源：频率相同、相位差恒定的两列光波',
            '明条纹条件：光程差为波长的整数倍',
            '暗条纹条件：光程差为半波长的奇数倍',
            '不同颜色的光波长不同，红光波长最长，紫光最短',
          ],
        },
        {
          title: '实验方法',
          content: '让单色光通过双缝干涉仪，在光屏上观察到干涉条纹。用测量头测量n条明条纹间的距离a，求出相邻明条纹间距Δx = a/(n-1)。代入公式λ = dΔx/L计算光的波长。',
          formulas: ['Δx = a/(n-1)', 'λ = d·a/[(n-1)L]'],
        },
      ],
      equipment: [
        {
          name: '双缝干涉仪',
          icon: 'square',
          purpose: '产生双缝干涉条纹',
          usage: '包括光源、单缝、双缝、遮光筒、光屏',
        },
        {
          name: '单色光源',
          icon: 'sun',
          purpose: '提供单色光',
          usage: '常用激光或钠光灯',
        },
        {
          name: '测量头',
          icon: 'ruler',
          purpose: '测量条纹间距',
          usage: '游标尺准确到0.1mm',
        },
        {
          name: '遮光筒',
          icon: 'cylinder',
          purpose: '提供暗环境',
          usage: '连接双缝和光屏，长度可测',
        },
      ],
    },
    simulation: {
      type: 'interference',
      initialParams: {
        wavelength: 600,
        slitDistance: 0.5,
        screenDistance: 1,
      },
      paramRanges: {
        wavelength: { min: 380, max: 780, step: 10, label: '光波长', unit: 'nm' },
        slitDistance: { min: 0.1, max: 2, step: 0.05, label: '双缝间距', unit: 'mm' },
        screenDistance: { min: 0.3, max: 2, step: 0.1, label: '屏到双缝距离', unit: 'm' },
      },
    },
  },
  {
    id: 'oil-film',
    name: '用油膜法估测油酸分子的大小',
    category: 'selective3',
    difficulty: 'medium',
    description: '通过油膜法估测油酸分子的大小，理解分子大小的数量级，建立分子模型。',
    icon: 'droplet',
    preview: {
      middleSchoolConnection: [
        '初中已学习物质的组成（分子、原子）',
        '初中已了解分子很小但有一定大小',
        '初中已学习体积、面积的计算',
        '初中已接触溶液和浓度的概念',
      ],
      principles: [
        {
          title: '油膜法原理',
          content: '将一定体积的油酸酒精溶液滴在水面上，油酸会在水面上展开形成单分子层油膜。假设分子是球形且紧密排列，油膜厚度就等于油酸分子的直径。测出油膜面积S和油酸体积V，由d = V/S即可估算分子直径。',
          formulas: ['d = V/S', 'V = V溶液 × 浓度'],
          notes: [
            '油酸分子一端亲水一端疏水，能形成单分子层',
            '分子直径的数量级为10⁻¹⁰m',
            '油酸酒精溶液的浓度很小，便于形成单分子层',
            '用爽身粉显示油膜轮廓便于测量面积',
          ],
        },
        {
          title: '实验方法',
          content: '在浅盘中倒入水，撒上爽身粉。用注射器滴入一定体积的油酸酒精溶液，油酸在水面展开形成单分子油膜。将玻璃板盖在盘上描出油膜轮廓，用坐标纸数方格计算油膜面积，再代入公式求分子直径。',
          formulas: ['d = V油酸/S油膜'],
        },
      ],
      equipment: [
        {
          name: '注射器',
          icon: 'pipette',
          purpose: '滴入油酸酒精溶液',
          usage: '事先测定每滴溶液的体积',
        },
        {
          name: '浅盘',
          icon: 'square',
          purpose: '盛水形成油膜',
          usage: '面积较大、深度适中的方盘',
        },
        {
          name: '爽身粉',
          icon: 'circle',
          purpose: '显示油膜轮廓',
          usage: '均匀撒在水面上',
        },
        {
          name: '坐标纸',
          icon: 'grid',
          purpose: '测量油膜面积',
          usage: '覆盖在玻璃板上，数方格计算面积',
        },
      ],
    },
    simulation: {
      type: 'oilfilm',
      initialParams: {
        solutionVolume: 1,
        concentration: 0.5,
        filmArea: 200,
      },
      paramRanges: {
        solutionVolume: { min: 0.5, max: 5, step: 0.1, label: '溶液体积', unit: 'mL' },
        concentration: { min: 0.1, max: 5, step: 0.1, label: '油酸浓度', unit: '%' },
        filmArea: { min: 50, max: 1000, step: 10, label: '油膜面积', unit: 'cm²' },
      },
    },
  },
  {
    id: 'emf-internal-resistance',
    name: '电源电动势和内阻的测量',
    category: 'book3',
    difficulty: 'hard',
    description: '通过实验测量电源的电动势和内阻，理解闭合电路欧姆定律，掌握多种测量方法。',
    icon: 'battery',
    preview: {
      middleSchoolConnection: [
        '初中已学习电源的概念（电压）',
        '初中已了解欧姆定律 I = U/R',
        '初中已学习电流表、电压表的使用',
        '初中已接触串联电路和并联电路的特点',
      ],
      principles: [
        {
          title: '闭合电路欧姆定律',
          content: '闭合电路中的电流跟电源的电动势成正比，跟内、外电路的电阻之和成反比。公式为：I = E/(R+r)，或E = U外 + U内 = IR + Ir。其中E是电源电动势，r是内阻，R是外电阻。',
          formulas: ['E = U + Ir', 'I = E/(R+r)', 'U = E - Ir'],
          notes: [
            '电源电动势由电源本身决定，与外电路无关',
            '路端电压U = E - Ir，随电流增大而减小',
            '外电路断路时U = E；外电路短路时I = E/r',
            'U-I图像中直线的纵截距为E，斜率的绝对值为r',
          ],
        },
        {
          title: '实验方法',
          content: '用电流表和电压表测量多组外电阻变化时的电流和电压数据，由闭合电路欧姆定律通过解方程组或作U-I图像求出电源电动势E和内阻r。常用方法有伏安法、安阻法、伏阻法等。',
          formulas: ['E = U₁ + I₁r', 'E = U₂ + I₂r'],
        },
      ],
      equipment: [
        {
          name: '待测电源',
          icon: 'battery',
          purpose: '研究对象',
          usage: '常用干电池或水果电池',
        },
        {
          name: '电压表',
          icon: 'gauge',
          purpose: '测量路端电压',
          usage: '并联在电源两端',
        },
        {
          name: '电流表',
          icon: 'gauge',
          purpose: '测量电路电流',
          usage: '串联在电路中',
        },
        {
          name: '滑动变阻器',
          icon: 'sliders',
          purpose: '改变外电阻',
          usage: '采用限流或分压式接法',
        },
      ],
    },
    simulation: {
      type: 'emf',
      initialParams: {
        emf: 1.5,
        internalResistance: 0.5,
        externalResistance: 5,
      },
      paramRanges: {
        emf: { min: 1, max: 12, step: 0.1, label: '电动势', unit: 'V' },
        internalResistance: { min: 0.1, max: 10, step: 0.1, label: '内阻', unit: 'Ω' },
        externalResistance: { min: 0.5, max: 100, step: 0.5, label: '外电阻', unit: 'Ω' },
      },
    },
  },
  {
    id: 'multimeter',
    name: '练习使用多用电表',
    category: 'book3',
    difficulty: 'easy',
    description: '学习多用电表的使用方法，掌握测量电压、电流和电阻的技能，了解多用电表的基本原理。',
    icon: 'gauge',
    preview: {
      middleSchoolConnection: [
        '初中已学习电压表和电流表的使用',
        '初中已了解欧姆定律',
        '初中已学习电阻的概念',
        '初中已接触简单电路的连接',
      ],
      principles: [
        {
          title: '多用电表原理',
          content: '多用电表是一种多功能测量仪表，由表头（灵敏电流计）和测量电路组成。通过转换开关选择不同的测量项目和量程，可以测量直流电压、直流电流、交流电压和电阻等多种物理量。',
          formulas: ['I = E/(Rg + R0 + Rx)', 'U = IR'],
          notes: [
            '测电压电流时被测电路必须通电',
            '测电阻时必须将被测电阻与电源断开',
            '每次换挡后都需要重新进行欧姆调零',
            '红表笔接高电势，黑表笔接低电势',
          ],
        },
        {
          title: '使用方法',
          content: '机械调零后，选择合适的挡位和量程。测电压时将多用电表并联在被测电路两端；测电流时串联在电路中；测电阻时先选挡、欧姆调零，再测量读数。测量完毕将选择开关旋至OFF挡或交流电压最高挡。',
          formulas: [],
        },
      ],
      equipment: [
        {
          name: '多用电表',
          icon: 'gauge',
          purpose: '多功能测量仪表',
          usage: '可测电压、电流、电阻',
        },
        {
          name: '待测电阻',
          icon: 'zap',
          purpose: '练习电阻测量',
          usage: '多种阻值的定值电阻',
        },
        {
          name: '干电池',
          icon: 'battery',
          purpose: '练习直流电压测量',
          usage: '提供直流电压',
        },
        {
          name: '小灯泡',
          icon: 'lightbulb',
          purpose: '练习电路测量',
          usage: '与电池组成简单电路',
        },
      ],
    },
    simulation: {
      type: 'multimeter',
      initialParams: {
        measuredValue: 10,
        range: 100,
        mode: 1,
      },
      paramRanges: {
        measuredValue: { min: 1, max: 500, step: 1, label: '待测量大小' },
        range: { min: 1, max: 1000, step: 1, label: '所选量程' },
        mode: { min: 1, max: 3, step: 1, label: '测量模式（1电压2电流3电阻）' },
      },
    },
  },
  {
    id: 'capacitor-charge',
    name: '观察电容器的充放电现象',
    category: 'book3',
    difficulty: 'medium',
    description: '通过实验观察电容器的充电和放电过程，理解电容器的储能特性，探究RC电路的时间常数。',
    icon: 'battery-charging',
    preview: {
      middleSchoolConnection: [
        '初中已学习简单的电路组成',
        '初中已了解电流的形成条件',
        '初中已学习电荷的初步概念',
        '初中已接触电容器在简单电路中的应用（如闪光灯）',
      ],
      principles: [
        {
          title: '电容器',
          content: '电容器是由两个相互靠近、中间夹有绝缘介质的导体组成。它可以储存电荷和电能。电容器的电容C等于电容器所带电荷量Q与两极板间电压U的比值，即C = Q/U。',
          formulas: ['C = Q/U', 'Q = CU', 'W = ½CU²'],
          notes: [
            '电容单位是法拉（F），常用单位有μF、pF',
            '充电时电荷量增加，电压升高，电流减小',
            '放电时电荷量减少，电压降低，电流减小',
            '充放电过程是暂态过程，由RC时间常数决定',
          ],
        },
        {
          title: '充放电规律',
          content: '电容器充电时电压按指数规律上升：u = E(1 - e^(-t/τ))；放电时电压按指数规律下降：u = U₀·e^(-t/τ)。其中τ = RC称为时间常数，反映了充放电过程的快慢。',
          formulas: ['τ = RC', 'u充 = E(1 - e^(-t/τ))', 'u放 = U₀·e^(-t/τ)'],
        },
      ],
      equipment: [
        {
          name: '电容器',
          icon: 'battery-charging',
          purpose: '储存电荷的元件',
          usage: '选择较大电容值的电解电容器便于观察',
        },
        {
          name: '电阻',
          icon: 'zap',
          purpose: '限制充放电电流',
          usage: '与电容器串联，决定时间常数',
        },
        {
          name: '直流电源',
          icon: 'battery',
          purpose: '提供充电电压',
          usage: '电压稳定，与电容器额定电压匹配',
        },
        {
          name: '电压表',
          icon: 'gauge',
          purpose: '测量电容器两端电压',
          usage: '并联在电容器两端',
        },
      ],
    },
    simulation: {
      type: 'capacitor',
      initialParams: {
        capacitance: 1000,
        resistance: 1000,
        voltage: 6,
      },
      paramRanges: {
        capacitance: { min: 100, max: 10000, step: 100, label: '电容', unit: 'μF' },
        resistance: { min: 100, max: 10000, step: 100, label: '电阻', unit: 'Ω' },
        voltage: { min: 1, max: 12, step: 0.5, label: '电源电压', unit: 'V' },
      },
    },
  },
  {
    id: 'length-measurement',
    name: '长度的测量及其测量工具的选用',
    category: 'book1',
    difficulty: 'easy',
    description: '学习使用刻度尺、游标卡尺和螺旋测微器测量长度，理解不同测量工具的原理和精度，掌握正确的读数方法。',
    icon: 'ruler',
    preview: {
      middleSchoolConnection: [
        '初中已学习刻度尺的使用和读数方法',
        '初中已了解误差的概念',
        '初中已学习长度单位及其换算',
        '初中已接触有效数字的概念',
      ],
      principles: [
        {
          title: '游标卡尺原理',
          content: '游标卡尺由主尺和游标尺组成。游标尺上有n个分度，总长度等于主尺上(n-1)个分度的长度。常见有10分度（精度0.1mm）、20分度（精度0.05mm）和50分度（精度0.02mm）。读数=主尺读数+游标尺读数。',
          formulas: ['L = 主尺读数 + (对齐刻度线 × 精度)'],
          notes: [
            '游标卡尺不需要估读',
            '10分度游标卡尺精度为0.1mm',
            '20分度游标卡尺精度为0.05mm',
            '50分度游标卡尺精度为0.02mm',
          ],
        },
        {
          title: '螺旋测微器原理',
          content: '螺旋测微器（千分尺）利用精密螺旋原理测长。测微螺杆的螺距为0.5mm，可动刻度有50个等分刻度，每旋转一格螺杆移动0.01mm。读数=固定刻度+可动刻度（含估读位）。',
          formulas: ['L = 固定刻度 + 可动刻度 × 0.01mm'],
          notes: [
            '螺旋测微器需要估读到0.001mm',
            '使用前应检查零点并校准',
            '测量时使用测力装置防止过度用力',
          ],
        },
      ],
      equipment: [
        {
          name: '刻度尺',
          icon: 'ruler',
          purpose: '粗略测量长度',
          usage: '分度值通常为1mm，需估读到0.1mm',
        },
        {
          name: '游标卡尺',
          icon: 'ruler',
          purpose: '较精确测量长度',
          usage: '可测量外径、内径、深度',
        },
        {
          name: '螺旋测微器',
          icon: 'settings',
          purpose: '精确测量微小长度',
          usage: '可测量到0.01mm，估读到0.001mm',
        },
        {
          name: '待测物体',
          icon: 'circle',
          purpose: '测量对象',
          usage: '金属丝、小圆柱体、金属管等',
        },
      ],
    },
    simulation: {
      type: 'length',
      initialParams: {
        mainScale: 10,
        vernierScale: 5,
        instrument: 2,
      },
      paramRanges: {
        mainScale: { min: 0, max: 50, step: 0.5, label: '主尺读数', unit: 'mm' },
        vernierScale: { min: 0, max: 50, step: 1, label: '副尺读数' },
        instrument: { min: 1, max: 3, step: 1, label: '测量工具（1游标卡尺2螺旋测微器3刻度尺）' },
      },
    },
  },
  {
    id: 'momentum-conservation',
    name: '验证动量守恒定律',
    category: 'selective1',
    difficulty: 'hard',
    description: '通过气垫导轨上的滑块碰撞实验，验证动量守恒定律，理解动量守恒的条件。',
    icon: 'arrow-right-left',
    preview: {
      middleSchoolConnection: [
        '初中已学习力是物体对物体的作用',
        '初中已了解物体的运动状态',
        '初中已学习速度的概念',
        '初中已接触质量的概念',
      ],
      principles: [
        {
          title: '动量守恒定律',
          content: '一个系统不受外力或所受外力之和为零时，这个系统的总动量保持不变，这就是动量守恒定律。两个物体相互作用时，总动量保持不变：m₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'。',
          formulas: ['m₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'', 'Δp₁ = -Δp₂'],
          notes: [
            '动量是矢量，动量守恒是矢量守恒',
            '系统内力不改变系统总动量',
            '动量守恒的条件：合外力为零或合外力远小于内力',
            '碰撞分为弹性碰撞、非弹性碰撞和完全非弹性碰撞',
          ],
        },
        {
          title: '实验方法',
          content: '利用气垫导轨减少摩擦，使滑块在水平方向近似不受外力。让两滑块在导轨上发生碰撞，用光电门测量碰撞前后的速度，计算碰撞前后的总动量，比较是否相等以验证动量守恒定律。',
          formulas: ['p总前 = m₁v₁ + m₂v₂', 'p总后 = m₁v₁\' + m₂v₂\''],
        },
      ],
      equipment: [
        {
          name: '气垫导轨',
          icon: 'minus',
          purpose: '减小摩擦',
          usage: '通过气孔喷气形成气垫，使滑块近似无摩擦运动',
        },
        {
          name: '滑块',
          icon: 'square',
          purpose: '碰撞对象',
          usage: '可安装挡光片、弹簧、橡皮泥等实现不同类型碰撞',
        },
        {
          name: '光电门',
          icon: 'gate',
          purpose: '测量滑块速度',
          usage: '记录挡光片通过的时间，计算速度',
        },
        {
          name: '天平',
          icon: 'scale',
          purpose: '测量滑块质量',
          usage: '准确测量碰撞物体的质量',
        },
      ],
    },
    simulation: {
      type: 'momentum',
      initialParams: {
        mass1: 0.2,
        mass2: 0.3,
        velocity1: 1,
        velocity2: -0.5,
      },
      paramRanges: {
        mass1: { min: 0.05, max: 1, step: 0.01, label: '滑块1质量', unit: 'kg' },
        mass2: { min: 0.05, max: 1, step: 0.01, label: '滑块2质量', unit: 'kg' },
        velocity1: { min: -3, max: 3, step: 0.1, label: '滑块1初速度', unit: 'm/s' },
        velocity2: { min: -3, max: 3, step: 0.1, label: '滑块2初速度', unit: 'm/s' },
      },
    },
  },
  {
    id: 'mechanical-energy',
    name: '验证机械能守恒定律',
    category: 'book2',
    difficulty: 'medium',
    description: '通过自由落体运动实验验证机械能守恒定律，理解动能和势能的相互转化。',
    icon: 'trending-up',
    preview: {
      middleSchoolConnection: [
        '初中已学习重力势能和动能的初步概念',
        '初中已了解机械能的转化',
        '初中已学习自由落体运动',
        '初中已接触能量守恒的思想',
      ],
      principles: [
        {
          title: '机械能守恒定律',
          content: '在只有重力或弹力做功的物体系统内，动能与势能可以相互转化，而总的机械能保持不变，这就是机械能守恒定律。对自由落体运动，下落h高度时减少的重力势能mgh等于增加的动能½mv²。',
          formulas: ['mgh = ½mv²', 'E₁ = E₂', '½mv₁² + mgh₁ = ½mv₂² + mgh₂'],
          notes: [
            '机械能守恒条件：只有重力或弹力做功',
            '动能和势能可以相互转化',
            '实际实验中由于阻力存在会有微小误差',
            '验证时比较减少的重力势能与增加的动能是否相等',
          ],
        },
        {
          title: '实验方法',
          content: '用打点计时器记录重物自由下落的纸带。在纸带上选取适当的点作为起点，测量某点到起点的距离h即为下落高度。用"中间时刻速度"求该点的瞬时速度v，验证mgh是否等于½mv²。',
          formulas: ['v_n = (x_n+1 - x_n-1)/(2T)', 'mgh_n = ½mv_n²'],
        },
      ],
      equipment: [
        {
          name: '打点计时器',
          icon: 'clock',
          purpose: '记录重物下落过程',
          usage: '固定在铁架台上，纸带穿过打点计时器',
        },
        {
          name: '重物',
          icon: 'weight',
          purpose: '做自由落体运动',
          usage: '质量较大，减少空气阻力影响',
        },
        {
          name: '纸带',
          icon: 'scroll',
          purpose: '记录运动信息',
          usage: '一端连接重物，穿过打点计时器',
        },
        {
          name: '铁架台',
          icon: 'stand',
          purpose: '固定打点计时器',
          usage: '稳固放置，使打点计时器位于较高位置',
        },
      ],
    },
    simulation: {
      type: 'energy',
      initialParams: {
        mass: 0.5,
        height: 1,
        gravity: 9.8,
      },
      paramRanges: {
        mass: { min: 0.05, max: 2, step: 0.05, label: '重物质量', unit: 'kg' },
        height: { min: 0.2, max: 5, step: 0.1, label: '下落高度', unit: 'm' },
        gravity: { min: 1, max: 20, step: 0.1, label: '重力加速度', unit: 'm/s²' },
      },
    },
  },
];

export const getExperimentById = (id: string) => {
  return experiments.find(exp => exp.id === id);
};
