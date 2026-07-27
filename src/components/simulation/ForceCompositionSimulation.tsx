import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const ForceCompositionSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    animProgress: 1,
  });

  const force1 = params.force1 || 50;
  const force2 = params.force2 || 30;
  const angle = (params.angle || 60) * Math.PI / 180;

  const scale = 3;
  const originX = 200;
  const originY = 320;

  const f1x = force1 * scale;
  const f1y = 0;
  const f2x = force2 * scale * Math.cos(angle);
  const f2y = -force2 * scale * Math.sin(angle);
  const fx = f1x + f2x;
  const fy = f1y + f2y;
  const resultant = Math.sqrt(force1 * force1 + force2 * force2 + 2 * force1 * force2 * Math.cos(angle));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, lineWidth: number) => {
      const headLen = 12;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const progress = stateRef.current.animProgress;

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(originX, originY - 200);
      ctx.lineTo(originX, originY + 100);
      ctx.moveTo(originX - 100, originY);
      ctx.lineTo(originX + 400, originY);
      ctx.stroke();
      ctx.setLineDash([]);

      const f1EndX = originX + f1x * progress;
      const f1EndY = originY + f1y * progress;
      drawArrow(originX, originY, f1EndX, f1EndY, '#3b82f6', 4);
      
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`F₁ = ${force1}N`, originX + f1x / 2, originY + 25);

      const f2EndX = originX + f2x * progress;
      const f2EndY = originY + f2y * progress;
      drawArrow(originX, originY, f2EndX, f2EndY, '#f97316', 4);
      
      ctx.fillStyle = '#c2410c';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`F₂ = ${force2}N`, originX + f2x / 2 - 20, originY + f2y / 2 - 10);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      
      ctx.beginPath();
      ctx.moveTo(f1EndX, f1EndY);
      ctx.lineTo(f1EndX + f2x * progress, f1EndY + f2y * progress);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(f2EndX, f2EndY);
      ctx.lineTo(f2EndX + f1x * progress, f2EndY + f1y * progress);
      ctx.stroke();
      
      ctx.setLineDash([]);

      const resultEndX = originX + fx * progress;
      const resultEndY = originY + fy * progress;
      drawArrow(originX, originY, resultEndX, resultEndY, '#22c55e', 5);
      
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`F合 = ${resultant.toFixed(1)}N`, resultEndX + 30, resultEndY - 10);

      if (angle > 0.01) {
        const arcRadius = 50;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(originX, originY, arcRadius, 0, -angle, true);
        ctx.stroke();
        
        const labelAngle = -angle / 2;
        const labelX = originX + (arcRadius + 20) * Math.cos(labelAngle);
        const labelY = originY + (arcRadius + 20) * Math.sin(labelAngle);
        ctx.fillStyle = '#7c3aed';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`θ = ${(params.angle || 60).toFixed(0)}°`, labelX, labelY);
      }

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(460, 20, 220, 200, 8);
      ctx.fill();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('力的合成数据', 480, 45);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(480, 52);
      ctx.lineTo(660, 52);
      ctx.stroke();
      
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`F₁ = ${force1.toFixed(1)} N`, 480, 75);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`F₂ = ${force2.toFixed(1)} N`, 480, 98);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`θ = ${(params.angle || 60).toFixed(1)}°`, 480, 121);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`F合 = ${resultant.toFixed(2)} N`, 480, 144);
      
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '11px monospace';
      ctx.fillText('公式: F合 = √(F₁²+F₂²+2F₁F₂cosθ)', 480, 175);
      ctx.fillText(`     = √(${force1}²+${force2}²+2×${force1}×${force2}×cos${(params.angle || 60).toFixed(0)}°)`, 480, 195);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;
        stateRef.current.animProgress = Math.min(stateRef.current.animProgress + dt * 0.8, 1);
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
  }, [isRunning, force1, force2, angle, f1x, f1y, f2x, f2y, fx, fy, resultant, params.angle, onReset]);

  useEffect(() => {
    stateRef.current.animProgress = 0;
  }, [params.force1, params.force2, params.angle]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default ForceCompositionSimulation;
