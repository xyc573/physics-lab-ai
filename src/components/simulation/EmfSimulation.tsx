import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const EmfSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    needleAnim: 0,
  });

  const emf = params.emf || 12;
  const internalResistance = params.internalResistance || 2;
  const externalResistance = params.externalResistance || 10;

  const totalResistance = internalResistance + externalResistance;
  const current = emf / totalResistance;
  const terminalVoltage = current * externalResistance;
  const internalVoltage = current * internalResistance;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const drawMeter = (cx: number, cy: number, radius: number, value: number, maxValue: number, label: string, unit: string, color: string) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      const angleRange = endAngle - startAngle;
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 8, startAngle, endAngle);
      ctx.stroke();
      
      const numTicks = 10;
      for (let i = 0; i <= numTicks; i++) {
        const angle = startAngle + (i / numTicks) * angleRange;
        const innerR = i % 5 === 0 ? radius - 18 : radius - 14;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (radius - 8);
        const y2 = cy + Math.sin(angle) * (radius - 8);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      const ratio = Math.min(value / maxValue, 1);
      const needleAngle = startAngle + ratio * angleRange;
      const needleLength = radius - 20;
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(needleAngle) * needleLength,
        cy + Math.sin(needleAngle) * needleLength
      );
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy + radius - 5);
      ctx.fillStyle = color;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${value.toFixed(2)} ${unit}`, cx, cy + radius + 8);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(`0 - ${maxValue} ${unit}`, cx, cy - radius + 15);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const circuitLeft = 80;
      const circuitRight = 360;
      const circuitTop = 80;
      const circuitBottom = 320;
      const circuitCX = (circuitLeft + circuitRight) / 2;
      const circuitCY = (circuitTop + circuitBottom) / 2;

      // 主回路导线（串联：电源+ → 外阻R → 电流表 → 开关 → 电源-）
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // 电源正极 → 上导线 → 外阻R上端
      ctx.moveTo(circuitLeft, circuitTop - 20);
      ctx.lineTo(circuitLeft, circuitTop);
      ctx.lineTo(circuitRight, circuitTop);
      // 外阻R
      ctx.moveTo(circuitRight, circuitTop);
      ctx.lineTo(circuitRight, circuitTop + 30);
      ctx.moveTo(circuitRight, circuitBottom - 30);
      ctx.lineTo(circuitRight, circuitBottom);
      // 下导线 → 电流表 → 开关 → 电源负极
      ctx.lineTo(circuitCX + 40, circuitBottom);
      ctx.moveTo(circuitCX - 40, circuitBottom);
      ctx.lineTo(circuitLeft - 30, circuitBottom);
      ctx.lineTo(circuitLeft - 30, circuitBottom + 20);
      ctx.stroke();

      // 电源（含内阻r）
      const batteryX = circuitLeft;
      const batteryY = circuitCY;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(batteryX - 15, batteryY - 40);
      ctx.lineTo(batteryX - 15, batteryY - 10);
      ctx.moveTo(batteryX + 15, batteryY - 40);
      ctx.lineTo(batteryX + 15, batteryY - 10);
      ctx.moveTo(batteryX - 15, batteryY + 10);
      ctx.lineTo(batteryX - 15, batteryY + 40);
      ctx.moveTo(batteryX + 15, batteryY + 10);
      ctx.lineTo(batteryX + 15, batteryY + 40);
      ctx.moveTo(batteryX - 25, batteryY);
      ctx.lineTo(batteryX - 15, batteryY);
      ctx.moveTo(batteryX + 15, batteryY);
      ctx.lineTo(batteryX + 25, batteryY);
      ctx.stroke();
      
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', batteryX - 5, batteryY - 50);
      ctx.fillStyle = '#2563eb';
      ctx.fillText('−', batteryX + 5, batteryY - 50);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`E=${emf}V`, batteryX, batteryY - 65);

      // 内阻标识
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(batteryX - 22, batteryY - 5, 44, 35);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`r=${internalResistance}Ω`, batteryX + 45, batteryY + 15);

      // 外阻R
      const resistorX = circuitRight;
      const resistorY = circuitCY;
      const zigzagH = 50;
      const zigzagCount = 6;
      const zigzagW = 18;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(resistorX, resistorY - zigzagH / 2);
      ctx.lineTo(resistorX - zigzagW / 2, resistorY - zigzagH / 2 + zigzagH / (zigzagCount * 2));
      for (let i = 0; i < zigzagCount; i++) {
        const y1 = resistorY - zigzagH / 2 + (i + 0.5) * zigzagH / zigzagCount;
        const y2 = resistorY - zigzagH / 2 + (i + 1) * zigzagH / zigzagCount;
        ctx.lineTo(resistorX + zigzagW / 2, y1);
        ctx.lineTo(resistorX - zigzagW / 2, y2);
      }
      ctx.lineTo(resistorX, resistorY + zigzagH / 2);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`R=${externalResistance}Ω`, resistorX + 25, resistorY + 5);

      // 电流表（串联在下方回路）
      const ammeterX = circuitCX;
      const ammeterY = circuitBottom;
      drawMeter(ammeterX, ammeterY, 28, current, emf / internalResistance * 1.2, '电流表', 'A', '#f97316');

      // 开关
      const switchX = circuitLeft - 30;
      const switchY = circuitBottom - 10;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(switchX - 12, switchY, 4, 0, Math.PI * 2);
      ctx.arc(switchX + 12, switchY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      if (isRunning) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(switchX - 12, switchY);
        ctx.lineTo(switchX + 12, switchY);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(switchX - 12, switchY);
        ctx.lineTo(switchX + 8, switchY - 18);
        ctx.stroke();
      }
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('开关 S', switchX, switchY + 20);

      // 电压表V（并联在电源两端，测量路端电压）
      const voltmeterX = circuitLeft - 70;
      const voltmeterY = circuitCY;
      drawMeter(voltmeterX, voltmeterY, 32, terminalVoltage, emf * 1.2, '电压表', 'V', '#3b82f6');

      // 电压表并联导线
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(circuitLeft, circuitTop);
      ctx.lineTo(circuitLeft - 40, circuitTop);
      ctx.lineTo(circuitLeft - 40, voltmeterY - 25);
      ctx.moveTo(circuitLeft - 40, voltmeterY + 25);
      ctx.lineTo(circuitLeft - 40, circuitBottom);
      ctx.lineTo(circuitLeft, circuitBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // 电流流动动画
      if (isRunning && current > 0.001) {
        const pathLen = 900;
        const electronSpeed = stateRef.current.time * 60;
        for (let i = 0; i < 10; i++) {
          const progress = ((electronSpeed + i * (pathLen / 10)) % pathLen) / pathLen;
          let ex, ey;
          
          if (progress < 0.08) {
            const t = progress / 0.08;
            ex = circuitLeft;
            ey = circuitTop - 20 + t * 20;
          } else if (progress < 0.35) {
            const t = (progress - 0.08) / 0.27;
            ex = circuitLeft + t * (circuitRight - circuitLeft);
            ey = circuitTop;
          } else if (progress < 0.42) {
            const t = (progress - 0.35) / 0.07;
            ex = circuitRight;
            ey = circuitTop + 30 + t * (circuitBottom - 30 - circuitTop - 30);
          } else if (progress < 0.65) {
            const t = (progress - 0.42) / 0.23;
            ex = circuitRight - t * (circuitRight - (circuitCX + 40));
            ey = circuitBottom;
          } else if (progress < 0.72) {
            const t = (progress - 0.65) / 0.07;
            ex = circuitCX - 40 - t * ((circuitCX - 40) - (circuitLeft - 30));
            ey = circuitBottom;
          } else {
            const t = (progress - 0.72) / 0.28;
            ex = circuitLeft - 30;
            ey = circuitBottom - t * (circuitBottom - (circuitTop + 30));
          }
          
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(410, 20, 270, 440, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('闭合电路欧姆定律', 430, 50);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(430, 58);
      ctx.lineTo(660, 58);
      ctx.stroke();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.fillText(`电动势 E = ${emf.toFixed(1)} V`, 430, 88);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`内阻 r = ${internalResistance.toFixed(1)} Ω`, 430, 111);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`外阻 R = ${externalResistance.toFixed(1)} Ω`, 430, 134);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`总电阻 R总 = R + r = ${totalResistance.toFixed(1)} Ω`, 430, 157);
      
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(430, 175);
      ctx.lineTo(660, 175);
      ctx.stroke();
      
      ctx.fillStyle = '#f97316';
      ctx.fillText(`电流 I = E / (R+r)`, 430, 200);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`     = ${emf} / (${externalResistance} + ${internalResistance})`, 430, 220);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`     = ${current.toFixed(3)} A`, 430, 240);
      
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(430, 258);
      ctx.lineTo(660, 258);
      ctx.stroke();
      
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`路端电压 U = IR = ${terminalVoltage.toFixed(2)} V`, 430, 283);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`内电压 U内 = Ir = ${internalVoltage.toFixed(2)} V`, 430, 306);
      
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(430, 324);
      ctx.lineTo(660, 324);
      ctx.stroke();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('验证: E = U + U内', 430, 352);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText(`${emf.toFixed(1)} = ${terminalVoltage.toFixed(2)} + ${internalVoltage.toFixed(2)}`, 430, 375);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`${emf.toFixed(1)} ≈ ${(terminalVoltage + internalVoltage).toFixed(2)}  ✓`, 430, 398);
      
      ctx.fillStyle = '#a78bfa';
      ctx.font = '10px monospace';
      ctx.fillText('公式: I = E / (R + r)', 430, 430);
      ctx.fillText('     E = U外 + U内', 430, 448);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;
      } else {
        lastTime = currentTime;
      }

      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, emf, internalResistance, externalResistance, totalResistance, current, terminalVoltage, internalVoltage, onReset]);

  useEffect(() => {
    stateRef.current.time = 0;
  }, [onReset]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default EmfSimulation;
