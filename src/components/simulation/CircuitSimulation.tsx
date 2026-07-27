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

      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#f1f5f9');
      bgGradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const circuitTop = 100;
      const circuitBottom = 320;
      const leftX = 100;
      const rightX = 600;

      // 主回路导线（串联：电源+ → 开关 → 电流表 → 滑动变阻器 → 金属丝 → 电源-）
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // 电源正极 → 上方导线 → 开关 → 电流表 → 滑动变阻器上端
      ctx.moveTo(leftX, circuitTop - 30);
      ctx.lineTo(leftX, circuitTop);
      ctx.lineTo(200, circuitTop);
      ctx.lineTo(200, circuitTop + 25);
      ctx.moveTo(200, circuitTop + 55);
      ctx.lineTo(200, circuitTop + 80);
      ctx.lineTo(300, circuitTop + 80);
      // 滑动变阻器（限流式）
      ctx.moveTo(300, circuitTop + 80);
      ctx.lineTo(300, circuitTop + 100);
      ctx.lineTo(300, circuitBottom - 60);
      ctx.lineTo(300, circuitBottom - 40);
      ctx.lineTo(400, circuitBottom - 40);
      // 金属丝
      ctx.moveTo(400, circuitBottom - 40);
      ctx.lineTo(550, circuitBottom - 40);
      // 回到电源负极
      ctx.lineTo(rightX, circuitBottom - 40);
      ctx.lineTo(rightX, circuitBottom);
      ctx.lineTo(leftX, circuitBottom);
      ctx.lineTo(leftX, circuitBottom + 30);
      ctx.stroke();

      // 电压表并联导线（并联在金属丝两端）
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(400, circuitBottom - 40);
      ctx.lineTo(400, circuitBottom + 50);
      ctx.lineTo(455, circuitBottom + 50);
      ctx.moveTo(495, circuitBottom + 50);
      ctx.lineTo(550, circuitBottom + 50);
      ctx.lineTo(550, circuitBottom - 40);
      ctx.stroke();
      ctx.setLineDash([]);

      // 电流流动动画
      if (isRunning && current > 0) {
        const electronCount = 16;
        const pathLength = 1200;
        for (let i = 0; i < electronCount; i++) {
          const progress = ((animTime * 40 + i * (pathLength / electronCount)) % pathLength) / pathLength;
          let x, y;
          
          if (progress < 0.05) {
            const t = progress / 0.05;
            x = leftX;
            y = circuitTop - 30 + t * 30;
          } else if (progress < 0.15) {
            const t = (progress - 0.05) / 0.10;
            x = leftX + t * 100;
            y = circuitTop;
          } else if (progress < 0.20) {
            const t = (progress - 0.15) / 0.05;
            x = 200;
            y = circuitTop + t * 25;
          } else if (progress < 0.25) {
            const t = (progress - 0.20) / 0.05;
            x = 200;
            y = circuitTop + 55 + t * 25;
          } else if (progress < 0.33) {
            const t = (progress - 0.25) / 0.08;
            x = 200 + t * 100;
            y = circuitTop + 80;
          } else if (progress < 0.55) {
            const t = (progress - 0.33) / 0.22;
            x = 300;
            y = circuitTop + 100 + t * (circuitBottom - 60 - circuitTop - 100);
          } else if (progress < 0.60) {
            const t = (progress - 0.55) / 0.05;
            x = 300 + t * 100;
            y = circuitBottom - 40;
          } else if (progress < 0.75) {
            const t = (progress - 0.60) / 0.15;
            x = 400 + t * 150;
            y = circuitBottom - 40;
          } else if (progress < 0.83) {
            const t = (progress - 0.75) / 0.08;
            x = 550 + t * 50;
            y = circuitBottom - 40;
          } else if (progress < 0.88) {
            const t = (progress - 0.83) / 0.05;
            x = rightX;
            y = circuitBottom - 40 + t * 40;
          } else {
            const t = (progress - 0.88) / 0.12;
            x = rightX - t * (rightX - leftX);
            y = circuitBottom;
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
      const batteryX = leftX;
      const batteryY = (circuitTop + circuitBottom) / 2;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(batteryX - 18, batteryY - 40, 36, 80);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(batteryX - 15, batteryY - 37, 30, 74);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', batteryX, batteryY - 20);
      ctx.fillText('-', batteryX, batteryY + 30);
      
      ctx.fillStyle = 'white';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${voltage.toFixed(1)}V`, batteryX, batteryY + 5);
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText('电源', batteryX, batteryY + 55);

      // 开关
      const switchX = 150;
      const switchY = circuitTop;
      ctx.fillStyle = '#475569';
      ctx.fillRect(switchX - 20, switchY - 5, 40, 4);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(switchX - 15, switchY - 3, 4, 0, Math.PI * 2);
      ctx.arc(switchX + 15, switchY - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      
      if (isRunning) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(switchX - 15, switchY - 3);
        ctx.lineTo(switchX + 15, switchY - 3);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(switchX - 15, switchY - 3);
        ctx.lineTo(switchX + 10, switchY - 22);
        ctx.stroke();
      }
      ctx.fillStyle = '#475569';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('开关 S', switchX, switchY - 30);

      // 电流表（串联）
      const ammeterX = 200;
      const ammeterY = circuitTop + 40;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(ammeterX, ammeterY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ammeterX, ammeterY, 18, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', ammeterX, ammeterY + 5);
      
      if (isRunning) {
        const maxCurrent = voltage / wireResistance;
        const ratio = Math.min(current / maxCurrent, 1);
        const angle = -Math.PI * 0.75 + ratio * Math.PI * 0.5;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ammeterX, ammeterY);
        ctx.lineTo(ammeterX + Math.cos(angle) * 16, ammeterY + Math.sin(angle) * 16);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText('电流表', ammeterX, ammeterY + 40);

      // 电压表（并联）
      const voltmeterX = 475;
      const voltmeterY = circuitBottom + 50;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(voltmeterX, voltmeterY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(voltmeterX, voltmeterY, 18, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('V', voltmeterX, voltmeterY + 5);
      
      if (isRunning) {
        const wireVoltage = current * wireResistance;
        const ratio = Math.min(wireVoltage / voltage, 1);
        const angle = -Math.PI * 0.75 + ratio * Math.PI * 0.5;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(voltmeterX, voltmeterY);
        ctx.lineTo(voltmeterX + Math.cos(angle) * 16, voltmeterY + Math.sin(angle) * 16);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText('电压表', voltmeterX, voltmeterY + 40);

      // 待测金属丝
      const wireStartX = 400;
      const wireEndX = 550;
      const wireY = circuitBottom - 40;
      
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 5 + wireDiameter * 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wireStartX, wireY);
      ctx.lineTo(wireEndX, wireY);
      ctx.stroke();
      
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wireStartX - 5, wireY - 8, 10, 16);
      ctx.fillRect(wireEndX - 5, wireY - 8, 10, 16);
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`待测金属丝`, (wireStartX + wireEndX) / 2, wireY - 18);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(`L=${wireLength.toFixed(1)}m d=${wireDiameter.toFixed(2)}mm`, (wireStartX + wireEndX) / 2, wireY + 22);

      // 滑动变阻器（限流式）
      const rheostatX = 300;
      const rheostatTop = circuitTop + 100;
      const rheostatBottom = circuitBottom - 60;
      const rheostatHeight = rheostatBottom - rheostatTop;
      
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(rheostatX - 20, rheostatTop - 10, 40, rheostatHeight + 20);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(rheostatX - 20, rheostatTop - 10, 40, rheostatHeight + 20);
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const y = rheostatTop + i * (rheostatHeight / 9);
        ctx.moveTo(rheostatX - 12, y);
        ctx.lineTo(rheostatX + 12, y);
      }
      ctx.stroke();
      
      const sliderPos = (varResistance - 1) / 99;
      const sliderY = rheostatTop + sliderPos * rheostatHeight;
      ctx.fillStyle = '#f97316';
      ctx.fillRect(rheostatX - 25, sliderY - 6, 50, 12);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(rheostatX - 22, sliderY - 4, 44, 8);
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`滑动变阻器`, rheostatX, rheostatBottom + 20);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${varResistance.toFixed(0)}Ω`, rheostatX, rheostatBottom + 33);

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
