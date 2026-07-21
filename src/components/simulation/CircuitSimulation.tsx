import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const CircuitSimulation: React.FC<Props> = ({ params, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const voltage = params.voltage || 3;
  const varResistance = params.resistance || 10;
  const wireLength = params.wireLength || 1;
  const wireDiameter = params.wireDiameter || 0.5;

  const resistivity = 1.7e-8;
  const wireArea = Math.PI * (wireDiameter * 1e-3 / 2) ** 2;
  const wireResistance = resistivity * wireLength / wireArea;
  const totalResistance = varResistance + wireResistance;
  const current = voltage / totalResistance;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    let animTime = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 背景 - 实验台
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#f1f5f9');
      bgGradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 实验台木纹
      ctx.strokeStyle = 'rgba(146, 64, 14, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.sin(i * 0.1) * 3);
        ctx.bezierCurveTo(width * 0.3, i + 5, width * 0.6, i - 3, width, i + 2);
        ctx.stroke();
      }

      const centerY = height / 2;

      // 电路线路
      const circuitPoints = [
        { x: 100, y: centerY - 80 },
        { x: 250, y: centerY - 80 },
        { x: 250, y: centerY + 80 },
        { x: 500, y: centerY + 80 },
        { x: 500, y: centerY - 80 },
        { x: 600, y: centerY - 80 },
        { x: 600, y: centerY + 40 },
        { x: 100, y: centerY + 40 },
        { x: 100, y: centerY - 80 },
      ];

      // 导线
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      circuitPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // 电流流动动画
      if (isRunning && current > 0) {
        const electronCount = 20;
        const totalLen = 0;
        for (let i = 0; i < electronCount; i++) {
          const progress = ((animTime * 30 + i * 200) % 1600) / 1600;
          
          let x, y;
          if (progress < 0.1) {
            const t = progress / 0.1;
            x = 100 + (600 - 100) * t;
            y = centerY - 80;
          } else if (progress < 0.2) {
            const t = (progress - 0.1) / 0.1;
            x = 600;
            y = centerY - 80 + (centerY + 40 - (centerY - 80)) * t;
          } else if (progress < 0.6) {
            const t = (progress - 0.2) / 0.4;
            x = 600 - (600 - 100) * t;
            y = centerY + 40;
          } else if (progress < 0.7) {
            const t = (progress - 0.6) / 0.1;
            x = 100;
            y = centerY + 40 - (centerY + 40 - (centerY - 80)) * t;
          } else if (progress < 0.85) {
            const t = (progress - 0.7) / 0.15;
            x = 100 + (250 - 100) * t;
            y = centerY - 80;
          } else if (progress < 0.95) {
            const t = (progress - 0.85) / 0.1;
            x = 250;
            y = centerY - 80 + (centerY + 80 - (centerY - 80)) * t;
          } else {
            const t = (progress - 0.95) / 0.05;
            x = 250 + (500 - 250) * t;
            y = centerY + 80;
          }
          
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 电源
      const batteryX = 80;
      const batteryY = centerY - 40;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(batteryX - 15, batteryY - 30, 30, 60);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(batteryX - 12, batteryY - 27, 24, 54);
      
      // 电池正负极
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', batteryX, batteryY - 15);
      ctx.fillText('-', batteryX, batteryY + 25);
      
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${voltage.toFixed(1)}V`, batteryX, batteryY + 5);

      // 开关
      const switchX = 350;
      const switchY = centerY - 80;
      ctx.fillStyle = '#475569';
      ctx.fillRect(switchX - 20, switchY - 8, 40, 6);
      if (isRunning) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(switchX - 15, switchY - 5);
        ctx.lineTo(switchX + 15, switchY - 5);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(switchX - 15, switchY - 5);
        ctx.lineTo(switchX + 10, switchY - 20);
        ctx.stroke();
      }
      ctx.fillStyle = '#475569';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('开关', switchX, switchY - 28);

      // 电流表
      const ammeterX = 175;
      const ammeterY = centerY - 80;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(ammeterX, ammeterY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', ammeterX, ammeterY + 4);
      
      // 电流表指针
      if (isRunning) {
        const angle = -Math.PI / 3 + (current / 2) * (2 * Math.PI / 3);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ammeterX, ammeterY);
        ctx.lineTo(ammeterX + Math.cos(angle) * 15, ammeterY + Math.sin(angle) * 15);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#475569';
      ctx.font = '9px sans-serif';
      ctx.fillText('电流表', ammeterX, ammeterY + 35);

      // 电压表
      const voltmeterX = 400;
      const voltmeterY = centerY + 80;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(voltmeterX, voltmeterY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('V', voltmeterX, voltmeterY + 4);
      
      if (isRunning) {
        const wireVoltage = current * wireResistance;
        const angle = -Math.PI / 3 + (voltage / 15) * (2 * Math.PI / 3);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(voltmeterX, voltmeterY);
        ctx.lineTo(voltmeterX + Math.cos(angle) * 15, voltmeterY + Math.sin(angle) * 15);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#475569';
      ctx.font = '9px sans-serif';
      ctx.fillText('电压表', voltmeterX, voltmeterY + 35);

      // 待测金属丝
      const wireStartX = 270;
      const wireEndX = 480;
      const wireY = centerY + 80;
      
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4 + wireDiameter;
      ctx.beginPath();
      ctx.moveTo(wireStartX, wireY);
      ctx.lineTo(wireEndX, wireY);
      ctx.stroke();
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`金属丝 L=${wireLength.toFixed(1)}m d=${wireDiameter.toFixed(2)}mm`, (wireStartX + wireEndX) / 2, wireY + 28);

      // 滑动变阻器
      const rheostatX = 550;
      const rheostatY = centerY + 10;
      
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(rheostatX - 25, rheostatY - 15, 50, 30);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(rheostatX - 25, rheostatY - 15, 50, 30);
      
      // 滑片
      const sliderPos = (varResistance - 1) / 99;
      ctx.fillStyle = '#f97316';
      ctx.fillRect(rheostatX - 25 + sliderPos * 40, rheostatY - 20, 10, 40);
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`滑动变阻器 ${varResistance.toFixed(0)}Ω`, rheostatX, rheostatY + 35);

      // 数据面板
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 200, 110, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`电压 U = ${voltage.toFixed(2)} V`, 35, 45);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`电流 I = ${(current * 1000).toFixed(1)} mA`, 35, 65);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`电阻 R = ${wireResistance.toFixed(4)} Ω`, 35, 85);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`电阻率 ρ = ${(resistivity * 1e8).toFixed(2)} ×10⁻⁸ Ω·m`, 35, 105);

      animTime += 0.016;
    };

    const animate = () => {
      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, voltage, varResistance, wireLength, wireDiameter, current, wireResistance, resistivity]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default CircuitSimulation;
