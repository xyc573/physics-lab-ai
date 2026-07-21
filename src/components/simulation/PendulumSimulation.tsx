import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const PendulumSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    angle: 0,
    angularVelocity: 0,
    time: 0,
    dataPoints: [] as { t: number; angle: number }[],
  });

  const length = params.length || 1;
  const gravity = params.gravity || 9.8;
  const amplitude = (params.amplitude || 10) * Math.PI / 180;
  const damping = params.damping || 0;

  useEffect(() => {
    stateRef.current.angle = amplitude;
    stateRef.current.angularVelocity = 0;
    stateRef.current.time = 0;
    stateRef.current.dataPoints = [];
  }, [amplitude, length, gravity, damping, onReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const pivotX = width / 2;
    const pivotY = 60;
    const scale = 140;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 支架
      ctx.fillStyle = '#475569';
      ctx.fillRect(pivotX - 100, pivotY - 20, 200, 12);
      ctx.fillRect(pivotX - 6, pivotY - 8, 12, 15);

      // 支点
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx.fill();

      const currentAngle = stateRef.current.angle;
      const bobX = pivotX + Math.sin(currentAngle) * length * scale;
      const bobY = pivotY + Math.cos(currentAngle) * length * scale;

      // 摆线
      const grad = ctx.createLinearGradient(pivotX, pivotY, bobX, bobY);
      grad.addColorStop(0, '#64748b');
      grad.addColorStop(1, '#475569');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // 摆球阴影
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(bobX + 3, bobY + 3, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 摆球
      const ballGrad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 16);
      ballGrad.addColorStop(0, '#fbbf24');
      ballGrad.addColorStop(0.7, '#f59e0b');
      ballGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
      ctx.fill();

      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(bobX - 5, bobY - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // 角度指示弧
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const arcR = 50;
      ctx.arc(pivotX, pivotY, arcR, Math.PI / 2 - currentAngle, Math.PI / 2, currentAngle > 0 ? true : false);
      ctx.stroke();

      // 竖直参考线
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + length * scale + 40);
      ctx.stroke();
      ctx.setLineDash([]);

      // 量角器
      const protractorX = pivotX;
      const protractorY = pivotY + 20;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      
      for (let deg = -45; deg <= 45; deg += 15) {
        const rad = (deg * Math.PI) / 180 + Math.PI / 2;
        const r1 = 55;
        const r2 = deg % 30 === 0 ? 65 : 60;
        ctx.beginPath();
        ctx.moveTo(protractorX + Math.cos(rad) * r1, protractorY + Math.sin(rad) * r1 - 20);
        ctx.lineTo(protractorX + Math.cos(rad) * r2, protractorY + Math.sin(rad) * r2 - 20);
        ctx.stroke();
        if (deg % 30 === 0 && deg !== 0) {
          ctx.fillText(`${deg}°`, protractorX + Math.cos(rad) * 78, protractorY + Math.sin(rad) * 78 - 17);
        }
      }

      // 数据面板
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 200, 100, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      
      const period = 2 * Math.PI * Math.sqrt(length / gravity);
      ctx.fillText(`角度: ${(stateRef.current.angle * 180 / Math.PI).toFixed(2)}°`, 35, 45);
      ctx.fillText(`角速度: ${(stateRef.current.angularVelocity).toFixed(2)} rad/s`, 35, 68);
      ctx.fillText(`周期: ${period.toFixed(2)} s`, 35, 91);

      // 周期公式提示
      ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 220, 20, 200, 60, 8);
      ctx.fill();
      ctx.fillStyle = '#c2410c';
      ctx.font = 'italic 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('T = 2π√(L/g)', width - 120, 50);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#9a3412';
      ctx.fillText('单摆周期公式', width - 120, 68);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        const state = stateRef.current;
        
        const angularAcceleration = -(gravity / length) * Math.sin(state.angle) - damping * state.angularVelocity;
        
        state.angularVelocity += angularAcceleration * dt;
        state.angle += state.angularVelocity * dt;
        state.time += dt;

        if (state.dataPoints.length < 300) {
          state.dataPoints.push({ t: state.time, angle: state.angle });
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
  }, [isRunning, length, gravity, amplitude, damping]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default PendulumSimulation;
