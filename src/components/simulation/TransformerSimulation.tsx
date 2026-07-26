import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const TransformerSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    fluxPhase: 0,
  });

  const primaryVoltage = params.primaryVoltage || 220;
  const primaryTurns = params.primaryTurns || 1100;
  const secondaryTurns = params.secondaryTurns || 550;

  const turnsRatio = primaryTurns / secondaryTurns;
  const secondaryVoltage = primaryVoltage / turnsRatio;
  const voltageRatio = primaryVoltage / secondaryVoltage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const drawCore = (cx: number, cy: number) => {
      const coreW = 200;
      const coreH = 220;
      const coreThickness = 25;
      
      ctx.fillStyle = '#6b7280';
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.roundRect(cx - coreW / 2, cy - coreH / 2, coreW, coreThickness, 3);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.roundRect(cx - coreW / 2, cy + coreH / 2 - coreThickness, coreW, coreThickness, 3);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.roundRect(cx - coreW / 2, cy - coreH / 2, coreThickness, coreH, 3);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.roundRect(cx + coreW / 2 - coreThickness, cy - coreH / 2, coreThickness, coreH, 3);
      ctx.fill();
      ctx.stroke();
      
      if (isRunning) {
        const fluxIntensity = (Math.sin(stateRef.current.fluxPhase) + 1) / 2;
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 + fluxIntensity * 0.5})`;
        ctx.lineWidth = 2;
        
        const numArrows = 6;
        const arrowPositions = [
          { x: cx - coreW / 2 + coreThickness / 2, y: cy - coreH / 4, dir: 'up' },
          { x: cx - coreW / 2 + coreThickness / 2, y: cy + coreH / 4, dir: 'up' },
          { x: cx, y: cy - coreH / 2 + coreThickness / 2, dir: 'right' },
          { x: cx, y: cy + coreH / 2 - coreThickness / 2, dir: 'left' },
          { x: cx + coreW / 2 - coreThickness / 2, y: cy - coreH / 4, dir: 'down' },
          { x: cx + coreW / 2 - coreThickness / 2, y: cy + coreH / 4, dir: 'down' },
        ];
        
        const phaseOffset = stateRef.current.fluxPhase % (Math.PI * 2);
        const visibleCount = Math.floor((phaseOffset / (Math.PI * 2)) * numArrows) + 1;
        
        for (let i = 0; i < visibleCount; i++) {
          const pos = arrowPositions[i];
          const headLen = 8;
          
          if (pos.dir === 'up') {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + 15);
            ctx.lineTo(pos.x, pos.y - 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y - 15);
            ctx.lineTo(pos.x - headLen / 2, pos.y - 15 + headLen);
            ctx.lineTo(pos.x + headLen / 2, pos.y - 15 + headLen);
            ctx.closePath();
            ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + fluxIntensity * 0.5})`;
            ctx.fill();
          } else if (pos.dir === 'down') {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y - 15);
            ctx.lineTo(pos.x, pos.y + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + 15);
            ctx.lineTo(pos.x - headLen / 2, pos.y + 15 - headLen);
            ctx.lineTo(pos.x + headLen / 2, pos.y + 15 - headLen);
            ctx.closePath();
            ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + fluxIntensity * 0.5})`;
            ctx.fill();
          } else if (pos.dir === 'right') {
            ctx.beginPath();
            ctx.moveTo(pos.x - 20, pos.y);
            ctx.lineTo(pos.x + 20, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x + 20, pos.y);
            ctx.lineTo(pos.x + 20 - headLen, pos.y - headLen / 2);
            ctx.lineTo(pos.x + 20 - headLen, pos.y + headLen / 2);
            ctx.closePath();
            ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + fluxIntensity * 0.5})`;
            ctx.fill();
          } else if (pos.dir === 'left') {
            ctx.beginPath();
            ctx.moveTo(pos.x + 20, pos.y);
            ctx.lineTo(pos.x - 20, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x - 20, pos.y);
            ctx.lineTo(pos.x - 20 + headLen, pos.y - headLen / 2);
            ctx.lineTo(pos.x - 20 + headLen, pos.y + headLen / 2);
            ctx.closePath();
            ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + fluxIntensity * 0.5})`;
            ctx.fill();
          }
        }
      }
    };

    const drawCoil = (cx: number, cy: number, side: 'left' | 'right', turns: number, color: string) => {
      const coilHeight = 140;
      const coilWidth = 35;
      const visibleTurns = Math.min(Math.floor(turns / 50), 10);
      const turnSpacing = coilHeight / (visibleTurns + 1);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < visibleTurns; i++) {
        const y = cy - coilHeight / 2 + (i + 1) * turnSpacing;
        const xOffset = side === 'left' ? -coilWidth / 2 : coilWidth / 2;
        ctx.beginPath();
        ctx.ellipse(cx + xOffset, y, coilWidth / 2, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (side === 'left') {
        ctx.beginPath();
        ctx.moveTo(cx - coilWidth / 2 - 5, cy - coilHeight / 2 - 5);
        ctx.lineTo(cx - coilWidth - 20, cy - coilHeight / 2 - 5);
        ctx.moveTo(cx - coilWidth / 2 - 5, cy + coilHeight / 2 + 5);
        ctx.lineTo(cx - coilWidth - 20, cy + coilHeight / 2 + 5);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(cx + coilWidth / 2 + 5, cy - coilHeight / 2 - 5);
        ctx.lineTo(cx + coilWidth + 20, cy - coilHeight / 2 - 5);
        ctx.moveTo(cx + coilWidth / 2 + 5, cy + coilHeight / 2 + 5);
        ctx.lineTo(cx + coilWidth + 20, cy + coilHeight / 2 + 5);
        ctx.stroke();
      }
    };

    const drawBulb = (x: number, y: number, brightness: number) => {
      const bulbRadius = 18;
      
      const glowGradient = ctx.createRadialGradient(x, y - 5, 0, x, y - 5, bulbRadius * 2);
      glowGradient.addColorStop(0, `rgba(251, 191, 36, ${brightness * 0.5})`);
      glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y - 5, bulbRadius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      const bulbGradient = ctx.createRadialGradient(x - 5, y - 10, 0, x, y - 5, bulbRadius);
      bulbGradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 + brightness * 0.7})`);
      bulbGradient.addColorStop(0.5, `rgba(251, 191, 36, ${0.2 + brightness * 0.6})`);
      bulbGradient.addColorStop(1, `rgba(245, 158, 11, ${0.1 + brightness * 0.5})`);
      ctx.fillStyle = bulbGradient;
      ctx.beginPath();
      ctx.arc(x, y - 5, bulbRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.roundRect(x - 10, y + 10, 20, 12, 2);
      ctx.fill();
      
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 12 + i * 4);
        ctx.lineTo(x + 10, y + 12 + i * 4);
        ctx.stroke();
      }
      
      if (brightness > 0.3) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
        ctx.lineWidth = 1;
        const filamentOffset = Math.sin(stateRef.current.time * 10) * 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 8 + filamentOffset);
        ctx.quadraticCurveTo(x, y - 2, x + 6, y - 8 - filamentOffset);
        ctx.stroke();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const coreCX = 320;
      const coreCY = 200;

      drawCore(coreCX, coreCY);
      drawCoil(coreCX - 75, coreCY, 'left', primaryTurns, '#dc2626');
      drawCoil(coreCX + 75, coreCY, 'right', secondaryTurns, '#2563eb');

      const acY1 = coreCY - 75;
      const acY2 = coreCY + 75;
      
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(coreCX - 130, acY1);
      ctx.lineTo(coreCX - 170, acY1);
      ctx.moveTo(coreCX - 130, acY2);
      ctx.lineTo(coreCX - 170, acY2);
      ctx.stroke();
      
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      const acAmplitude = 8;
      const acCycles = 3;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const x = coreCX - 170 + t * 25;
        const y = acY1 + acY2 - acY1 - acY2 + 0;
        const sineY = (acY1 + acY2) / 2 + Math.sin(t * Math.PI * 2 * acCycles + stateRef.current.fluxPhase) * acAmplitude;
        if (i === 0) ctx.moveTo(x, sineY);
        else ctx.lineTo(x, sineY);
      }
      ctx.stroke();
      
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`U₁ = ${primaryVoltage}V`, coreCX - 157, acY2 + 25);
      ctx.fillStyle = '#7c3aed';
      ctx.fillText(`n₁ = ${primaryTurns}匝`, coreCX - 157, acY2 + 42);

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(coreCX + 130, acY1);
      ctx.lineTo(coreCX + 170, acY1);
      ctx.moveTo(coreCX + 130, acY2);
      ctx.lineTo(coreCX + 170, acY2);
      ctx.stroke();
      
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      const secAmplitude = acAmplitude * (secondaryVoltage / primaryVoltage);
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const x = coreCX + 157 - 12.5 + t * 25;
        const sineY = (acY1 + acY2) / 2 + Math.sin(t * Math.PI * 2 * acCycles + stateRef.current.fluxPhase) * secAmplitude;
        if (i === 0) ctx.moveTo(x, sineY);
        else ctx.lineTo(x, sineY);
      }
      ctx.stroke();

      const bulbX = coreCX + 157;
      const bulbY = acY2 + 50;
      const brightness = Math.min(1, secondaryVoltage / 50);
      drawBulb(bulbX, bulbY, isRunning ? brightness : 0.1);
      
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`U₂ = ${secondaryVoltage.toFixed(1)}V`, bulbX, bulbY + 45);
      ctx.fillStyle = '#7c3aed';
      ctx.fillText(`n₂ = ${secondaryTurns}匝`, bulbX, bulbY + 62);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(470, 20, 210, 150, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('变压器原理', 490, 48);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(490, 56);
      ctx.lineTo(660, 56);
      ctx.stroke();
      
      ctx.fillStyle = '#f87171';
      ctx.font = '12px monospace';
      ctx.fillText(`原边电压 U₁ = ${primaryVoltage} V`, 490, 82);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`副边电压 U₂ = ${secondaryVoltage.toFixed(1)} V`, 490, 103);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`匝数比 n₁:n₂ = ${turnsRatio.toFixed(2)}:1`, 490, 124);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`电压比 U₁:U₂ = ${voltageRatio.toFixed(2)}:1`, 490, 145);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 360, 660, 100, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('变压器电压比公式', 40, 388);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(40, 396);
      ctx.lineTo(220, 396);
      ctx.stroke();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.fillText(`U₁ / U₂ = n₁ / n₂`, 40, 422);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`${primaryVoltage} / ${secondaryVoltage.toFixed(1)} ≈ ${primaryTurns} / ${secondaryTurns}`, 40, 444);
      
      ctx.fillStyle = '#fb923c';
      ctx.textAlign = 'right';
      ctx.fillText('理想变压器: 输入功率 = 输出功率', 660, 422);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('P₁ = P₂  →  U₁I₁ = U₂I₂', 660, 444);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;
        stateRef.current.fluxPhase += dt * 4;
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
  }, [isRunning, primaryVoltage, primaryTurns, secondaryTurns, turnsRatio, secondaryVoltage, voltageRatio, onReset]);

  useEffect(() => {
    stateRef.current.time = 0;
    stateRef.current.fluxPhase = 0;
  }, [onReset]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default TransformerSimulation;
