import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const MultimeterSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    needleSwing: 0,
  });

  const measuredValue = params.measuredValue || 5;
  const range = params.range || 10;
  const mode = Math.floor(params.mode || 1) - 1;

  const modes = ['直流电压', '直流电流', '电阻'];
  const modeNames = modes[Math.min(Math.max(mode, 0), 2)];
  const ratio = Math.min(measuredValue / range, 1);
  const isOhmMode = mode === 2;

  const targetRatio = isOhmMode
    ? (measuredValue <= 0 ? 0 : 1 - 1 / (1 + measuredValue / 30))
    : ratio;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f1f5f9');
      bgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const meterX = width / 2;
      const meterY = 200;
      const meterRadius = 140;

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(meterX - meterRadius - 30, meterY - meterRadius - 20, meterRadius * 2 + 60, meterRadius * 2 + 150, 20);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(meterX - meterRadius - 15, meterY - meterRadius - 10, meterRadius * 2 + 30, meterRadius * 2 + 80, 12);
      ctx.fill();

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(meterX, meterY, meterRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(meterX, meterY, meterRadius - 10, 0, Math.PI * 2);
      ctx.fill();

      const startAngle = Math.PI + Math.PI / 6;
      const endAngle = -Math.PI / 6;
      const totalAngle = endAngle - startAngle + Math.PI * 2;

      if (isOhmMode) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(meterX, meterY, meterRadius - 15, startAngle, endAngle, false);
        ctx.stroke();

        const ohmMarks = [0, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, Infinity];
        const ohmLabels = ['0', '2', '5', '10', '20', '50', '100', '200', '500', '1k', '2k', '∞'];

        for (let i = 0; i < ohmMarks.length; i++) {
          let angleFrac;
          if (ohmMarks[i] === Infinity) {
            angleFrac = 1;
          } else if (ohmMarks[i] === 0) {
            angleFrac = 0;
          } else {
            angleFrac = 1 - 1 / (1 + ohmMarks[i] / 30);
          }

          const angle = startAngle + angleFrac * totalAngle;
          const isMajor = i % 2 === 0;
          const tickLen = isMajor ? 15 : 8;
          const innerR = meterRadius - 15;

          const x1 = meterX + Math.cos(angle) * (innerR - tickLen);
          const y1 = meterY + Math.sin(angle) * (innerR - tickLen);
          const x2 = meterX + Math.cos(angle) * innerR;
          const y2 = meterY + Math.sin(angle) * innerR;

          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = isMajor ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          if (isMajor) {
            const labelR = innerR - tickLen - 12;
            const lx = meterX + Math.cos(angle) * labelR;
            const ly = meterY + Math.sin(angle) * labelR;
            ctx.fillStyle = '#991b1b';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ohmLabels[i], lx, ly + 4);
          }
        }

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ω', meterX, meterY - 45);
      } else {
        const isVoltMode = mode === 0;
        const scaleColor = isVoltMode ? '#1e40af' : '#92400e';
        const majorTicks = 10;
        const minorTicks = 50;

        for (let i = 0; i <= minorTicks; i++) {
          const frac = i / minorTicks;
          const angle = startAngle + frac * totalAngle;
          const isMajor = i % (minorTicks / majorTicks) === 0;
          const isHalf = i % (minorTicks / majorTicks / 2) === 0;
          const tickLen = isMajor ? 15 : isHalf ? 10 : 5;
          const innerR = meterRadius - 15;

          const x1 = meterX + Math.cos(angle) * (innerR - tickLen);
          const y1 = meterY + Math.sin(angle) * (innerR - tickLen);
          const x2 = meterX + Math.cos(angle) * innerR;
          const y2 = meterY + Math.sin(angle) * innerR;

          ctx.strokeStyle = isMajor ? scaleColor : '#475569';
          ctx.lineWidth = isMajor ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          if (isMajor) {
            const labelR = innerR - tickLen - 12;
            const lx = meterX + Math.cos(angle) * labelR;
            const ly = meterY + Math.sin(angle) * labelR;
            ctx.fillStyle = scaleColor;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            const val = (i / minorTicks) * 50;
            ctx.fillText(`${val.toFixed(0)}`, lx, ly + 4);
          }
        }

        ctx.fillStyle = scaleColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isVoltMode ? 'V' : 'A', meterX, meterY - 45);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px sans-serif';
        ctx.fillText(isVoltMode ? '直流电压' : '直流电流', meterX, meterY - 60);
      }

      const displayRatio = stateRef.current.needleSwing;

      const needleAngle = startAngle + displayRatio * totalAngle;
      const needleBaseR = 12;
      const needleTipR = meterRadius - 25;

      const needleGradient = ctx.createLinearGradient(
        meterX + Math.cos(needleAngle) * needleBaseR,
        meterY + Math.sin(needleAngle) * needleBaseR,
        meterX + Math.cos(needleAngle) * needleTipR,
        meterY + Math.sin(needleAngle) * needleTipR
      );
      needleGradient.addColorStop(0, '#dc2626');
      needleGradient.addColorStop(1, '#991b1b');

      ctx.fillStyle = needleGradient;
      ctx.beginPath();
      ctx.moveTo(
        meterX + Math.cos(needleAngle + Math.PI / 2) * 4,
        meterY + Math.sin(needleAngle + Math.PI / 2) * 4
      );
      ctx.lineTo(
        meterX + Math.cos(needleAngle) * needleTipR,
        meterY + Math.sin(needleAngle) * needleTipR
      );
      ctx.lineTo(
        meterX + Math.cos(needleAngle - Math.PI / 2) * 4,
        meterY + Math.sin(needleAngle - Math.PI / 2) * 4
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(meterX, meterY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(meterX, meterY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(meterX, meterY, 3, 0, Math.PI * 2);
      ctx.fill();

      const knobY = meterY + meterRadius + 55;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(meterX, knobY, 38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(meterX, knobY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(meterX, knobY, 26, 0, Math.PI * 2);
      ctx.fill();

      const rangeLabels = ['OFF', 'V', 'A', 'Ω'];
      const rangeAngles = [
        -Math.PI / 2 - Math.PI / 3,
        -Math.PI / 2 - Math.PI / 9,
        -Math.PI / 2 + Math.PI / 9,
        -Math.PI / 2 + Math.PI / 3
      ];
      const labelIndex = mode + 1;

      const knobAngle = rangeAngles[labelIndex];
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(meterX, knobY);
      ctx.lineTo(
        meterX + Math.cos(knobAngle) * 22,
        knobY + Math.sin(knobAngle) * 22
      );
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(meterX, knobY, 6, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < rangeLabels.length; i++) {
        const a = rangeAngles[i];
        const lx = meterX + Math.cos(a) * 48;
        const ly = knobY + Math.sin(a) * 48;
        const isActive = i === labelIndex;
        
        if (isActive) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.beginPath();
          ctx.arc(lx, ly, 16, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = isActive ? '#fbbf24' : '#94a3b8';
        ctx.font = isActive ? 'bold 13px sans-serif' : 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(rangeLabels[i], lx, ly + 4);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('档位选择旋钮', meterX, knobY + 58);

      const terminalY = meterY + meterRadius + 95;
      const terminalSpacing = 80;

      const terminals = [
        { label: 'Ω', color: '#dc2626', x: meterX - terminalSpacing },
        { label: 'V·A', color: '#dc2626', x: meterX },
        { label: 'COM', color: '#1e40af', x: meterX + terminalSpacing },
      ];

      for (const t of terminals) {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(t.x, terminalY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(t.x, terminalY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t.label, t.x, terminalY + 3);
      }

      const displayX = 20;
      const displayY = 20;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(displayX, displayY, 200, 130, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`模式: ${modeNames}`, displayX + 15, displayY + 30);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`量程: ${range} ${isOhmMode ? 'Ω' : mode === 0 ? 'V' : 'A'}`, displayX + 15, displayY + 52);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`测量值: ${measuredValue}`, displayX + 15, displayY + 74);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`指针偏转: ${(displayRatio * 100).toFixed(1)}%`, displayX + 15, displayY + 96);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`读数: ${measuredValue.toFixed(2)}`, displayX + 15, displayY + 118);

      if (isOhmMode) {
        const zeroAdjX = width - 180;
        const zeroAdjY = 20;

        ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
        ctx.beginPath();
        ctx.roundRect(zeroAdjX, zeroAdjY, 160, 60, 8);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔧 欧姆调零', zeroAdjX + 80, zeroAdjY + 25);
        ctx.fillStyle = '#b91c1c';
        ctx.font = '10px sans-serif';
        ctx.fillText('红黑表笔短接，调节调零旋钮', zeroAdjX + 80, zeroAdjY + 45);
      }

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 200, height - 70, 180, 50, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('读数 = 刻度值 × 倍率', width - 110, height - 42);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('注意量程选择与单位换算', width - 110, height - 25);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;

        stateRef.current.needleSwing += (targetRatio - stateRef.current.needleSwing) * dt * 3;
      } else {
        lastTime = currentTime;
      }

      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    stateRef.current.needleSwing = 0;

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, params.measuredValue, params.range, params.mode]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default MultimeterSimulation;
