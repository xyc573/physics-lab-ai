import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const InductionSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    magnetX: 120,
    magnetVelocity: 0,
    direction: 1,
    fluxChangeRate: 0,
    inducedEmf: 0,
    lastFlux: 0,
  });

  const magnetSpeed = params.magnetSpeed || 50;
  const coilTurns = params.coilTurns || 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const coilCenterX = 400;
    const coilCenterY = 240;
    const coilWidth = 120;
    const coilHeight = 100;

    const drawMagnet = (x: number, y: number) => {
      const magnetW = 120;
      const magnetH = 40;
      
      const nPoleGrad = ctx.createLinearGradient(x - magnetW / 2, y - magnetH / 2, x, y + magnetH / 2);
      nPoleGrad.addColorStop(0, '#dc2626');
      nPoleGrad.addColorStop(1, '#fca5a5');
      ctx.fillStyle = nPoleGrad;
      ctx.beginPath();
      ctx.roundRect(x - magnetW / 2, y - magnetH / 2, magnetW / 2, magnetH, [8, 0, 0, 8]);
      ctx.fill();
      
      const sPoleGrad = ctx.createLinearGradient(x, y - magnetH / 2, x + magnetW / 2, y + magnetH / 2);
      sPoleGrad.addColorStop(0, '#93c5fd');
      sPoleGrad.addColorStop(1, '#2563eb');
      ctx.fillStyle = sPoleGrad;
      ctx.beginPath();
      ctx.roundRect(x, y - magnetH / 2, magnetW / 2, magnetH, [0, 8, 8, 0]);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', x - magnetW / 4, y + 6);
      ctx.fillText('S', x + magnetW / 4, y + 6);
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - magnetW / 2, y - magnetH / 2, magnetW, magnetH);
    };

    const drawCoil = () => {
      const turnCount = Math.min(Math.floor(coilTurns / 10), 8);
      const turnSpacing = coilWidth / (turnCount + 1);
      
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < turnCount; i++) {
        const x = coilCenterX - coilWidth / 2 + (i + 1) * turnSpacing;
        ctx.beginPath();
        ctx.ellipse(x, coilCenterY, 8, coilHeight / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(coilCenterX - coilWidth / 2 - 5, coilCenterY - coilHeight / 2 + 10);
      ctx.lineTo(coilCenterX - coilWidth / 2 - 15, coilCenterY - coilHeight / 2 + 10);
      ctx.lineTo(coilCenterX - coilWidth / 2 - 15, coilCenterY + coilHeight / 2 + 30);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(coilCenterX + coilWidth / 2 + 5, coilCenterY - coilHeight / 2 + 10);
      ctx.lineTo(coilCenterX + coilWidth / 2 + 15, coilCenterY - coilHeight / 2 + 10);
      ctx.lineTo(coilCenterX + coilWidth / 2 + 15, coilCenterY + coilHeight / 2 + 30);
      ctx.stroke();
      
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(coilCenterX - coilWidth / 2 - 15, coilCenterY + coilHeight / 2 + 45, 5, 0, Math.PI * 2);
      ctx.arc(coilCenterX + coilWidth / 2 + 15, coilCenterY + coilHeight / 2 + 45, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawFieldLines = (magnetX: number, magnetY: number) => {
      const dist = Math.abs(magnetX - coilCenterX);
      const intensity = Math.max(0, 1 - dist / 250);
      
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + intensity * 0.5})`;
      ctx.lineWidth = 1.5;
      
      const numLines = 6;
      for (let i = 0; i < numLines; i++) {
        const offsetY = -35 + i * 14;
        const startX = magnetX + 60;
        const startY = magnetY + offsetY;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        const midX = (startX + coilCenterX - coilWidth / 2) / 2;
        const midY = startY + (i - numLines / 2) * 8;
        
        ctx.quadraticCurveTo(midX, midY, coilCenterX - coilWidth / 2, coilCenterY + offsetY * 0.8);
        ctx.stroke();
      }
      
      for (let i = 0; i < numLines; i++) {
        const offsetY = -35 + i * 14;
        const startX = magnetX - 60;
        const startY = magnetY + offsetY;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX - 30, magnetY, startX - 40 - i * 3, magnetY + offsetY * 0.5);
        ctx.stroke();
      }
    };

    const drawGalvanometer = () => {
      const gx = 580;
      const gy = 200;
      const gr = 55;
      
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.arc(gx, gy, gr + 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.stroke();
      
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, gr - 8, startAngle, endAngle);
      ctx.stroke();
      
      for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (i / 10) * (endAngle - startAngle);
        const innerR = i === 5 ? gr - 20 : gr - 14;
        const x1 = gx + Math.cos(angle) * innerR;
        const y1 = gy + Math.sin(angle) * innerR;
        const x2 = gx + Math.cos(angle) * (gr - 8);
        const y2 = gy + Math.sin(angle) * (gr - 8);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = i === 5 || i === 0 || i === 10 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      const maxEmf = 5;
      const emfRatio = Math.max(-1, Math.min(1, stateRef.current.inducedEmf / maxEmf));
      const needleAngle = Math.PI * 1.5 + emfRatio * Math.PI * 0.75;
      const needleLength = gr - 18;
      
      ctx.strokeStyle = '#dc2626';
      ctx.fillStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(
        gx + Math.cos(needleAngle) * needleLength,
        gy + Math.sin(needleAngle) * needleLength
      );
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(gx, gy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('灵敏电流计', gx, gy + gr + 5);
      ctx.fillStyle = '#dc2626';
      ctx.font = '10px monospace';
      ctx.fillText(`ε = ${stateRef.current.inducedEmf.toFixed(2)} V`, gx, gy + gr + 20);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText('−', gx - gr + 10, gy + 15);
      ctx.fillText('0', gx, gy - gr + 20);
      ctx.fillText('+', gx + gr - 10, gy + 15);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (isRunning) {
        drawFieldLines(stateRef.current.magnetX, 240);
      }

      drawCoil();
      drawMagnet(stateRef.current.magnetX, 240);
      drawGalvanometer();

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(coilCenterX - coilWidth / 2 - 15, coilCenterY + coilHeight / 2 + 30);
      ctx.lineTo(coilCenterX - coilWidth / 2 - 15, coilCenterY + coilHeight / 2 + 60);
      ctx.lineTo(520, coilCenterY + coilHeight / 2 + 60);
      ctx.lineTo(520, 200);
      ctx.moveTo(coilCenterX + coilWidth / 2 + 15, coilCenterY + coilHeight / 2 + 30);
      ctx.lineTo(coilCenterX + coilWidth / 2 + 15, coilCenterY + coilHeight / 2 + 60);
      ctx.lineTo(640, coilCenterY + coilHeight / 2 + 60);
      ctx.lineTo(640, 200);
      ctx.stroke();

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 350, 660, 110, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('法拉第电磁感应定律', 40, 378);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(40, 386);
      ctx.lineTo(220, 386);
      ctx.stroke();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.fillText(`感应电动势 ε = n × ΔΦ/Δt`, 40, 412);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`     = ${coilTurns} × ${stateRef.current.fluxChangeRate.toFixed(3)} Wb/s`, 40, 434);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`     = ${stateRef.current.inducedEmf.toFixed(2)} V`, 40, 454);
      
      ctx.fillStyle = '#fb923c';
      ctx.textAlign = 'right';
      ctx.fillText(`磁通量变化率: ΔΦ/Δt = ${stateRef.current.fluxChangeRate.toFixed(4)} Wb/s`, 660, 412);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`线圈匝数: n = ${coilTurns} 匝`, 660, 434);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`磁铁速度: v = ${Math.abs(stateRef.current.magnetVelocity).toFixed(1)} px/s`, 660, 454);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;

        stateRef.current.magnetVelocity = stateRef.current.direction * magnetSpeed;
        stateRef.current.magnetX += stateRef.current.magnetVelocity * dt;

        if (stateRef.current.magnetX > 480) {
          stateRef.current.magnetX = 480;
          stateRef.current.direction = -1;
        }
        if (stateRef.current.magnetX < 120) {
          stateRef.current.magnetX = 120;
          stateRef.current.direction = 1;
        }

        const distFromCoil = coilCenterX - stateRef.current.magnetX;
        const flux = 10 / (1 + Math.abs(distFromCoil) / 80);
        stateRef.current.fluxChangeRate = Math.abs((flux - stateRef.current.lastFlux) / dt);
        stateRef.current.lastFlux = flux;

        stateRef.current.inducedEmf = coilTurns * stateRef.current.fluxChangeRate * 0.01;
        
        if (distFromCoil < 0) {
          stateRef.current.inducedEmf = -stateRef.current.inducedEmf;
        }
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
  }, [isRunning, magnetSpeed, coilTurns, onReset]);

  useEffect(() => {
    stateRef.current.time = 0;
    stateRef.current.magnetX = 150;
    stateRef.current.magnetVelocity = 0;
    stateRef.current.direction = 1;
    stateRef.current.fluxChangeRate = 0;
    stateRef.current.inducedEmf = 0;
    stateRef.current.lastFlux = 0;
  }, [onReset]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default InductionSimulation;
