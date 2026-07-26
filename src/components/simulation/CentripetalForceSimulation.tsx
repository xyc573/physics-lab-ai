import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const CentripetalForceSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    angle: 0,
    time: 0,
  });

  const mass = params.mass || 1;
  const radius = params.radius || 2;
  const angularVelocity = params.angularVelocity || 2;

  const centripetalForce = mass * radius * angularVelocity * angularVelocity;
  const linearVelocity = radius * angularVelocity;
  const period = (2 * Math.PI) / angularVelocity;

  useEffect(() => {
    if (!isRunning) {
      stateRef.current.angle = 0;
      stateRef.current.time = 0;
    }
  }, [mass, radius, angularVelocity, onReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const scale = 80;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const drawRadius = radius * scale;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, drawRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      const ballX = centerX + drawRadius * Math.cos(stateRef.current.angle);
      const ballY = centerY + drawRadius * Math.sin(stateRef.current.angle);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(ballX, ballY);
      ctx.stroke();

      const toCenterX = centerX - ballX;
      const toCenterY = centerY - ballY;
      const len = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
      const arrowLen = Math.min(60, drawRadius * 0.6);
      const arrowEndX = ballX + (toCenterX / len) * arrowLen;
      const arrowEndY = ballY + (toCenterY / len) * arrowLen;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();

      const headLen = 12;
      const angle = Math.atan2(toCenterY, toCenterX);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(
        arrowEndX - headLen * Math.cos(angle - Math.PI / 6),
        arrowEndY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowEndX - headLen * Math.cos(angle + Math.PI / 6),
        arrowEndY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      const ballRadius = 18;
      const ballGradient = ctx.createRadialGradient(ballX - 5, ballY - 5, 2, ballX, ballY, ballRadius);
      ballGradient.addColorStop(0, '#fbbf24');
      ballGradient.addColorStop(1, '#f97316');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('F', (ballX + arrowEndX) / 2, (ballY + arrowEndY) / 2 - 8);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 240, 180, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('向心力公式', 35, 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px monospace';
      ctx.fillText('F = mrω²', 35, 70);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('────────────────────', 35, 90);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`向心力 F: ${centripetalForce.toFixed(2)} N`, 35, 115);
      ctx.fillText(`线速度 v: ${linearVelocity.toFixed(2)} m/s`, 35, 138);
      ctx.fillText(`周期 T: ${period.toFixed(3)} s`, 35, 161);
      ctx.fillText(`时间 t: ${stateRef.current.time.toFixed(2)} s`, 35, 184);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(width - 200, 20, 180, 100, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('参数', width - 185, 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.fillText(`质量 m: ${mass.toFixed(2)} kg`, width - 185, 68);
      ctx.fillText(`半径 r: ${radius.toFixed(2)} m`, width - 185, 91);
      ctx.fillText(`角速度 ω: ${angularVelocity.toFixed(2)} rad/s`, width - 185, 114);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        stateRef.current.angle += angularVelocity * dt;
        stateRef.current.time += dt;

        if (stateRef.current.angle > Math.PI * 2) {
          stateRef.current.angle -= Math.PI * 2;
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
  }, [isRunning, mass, radius, angularVelocity, centripetalForce, linearVelocity, period]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default CentripetalForceSimulation;
