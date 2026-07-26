import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const MechanicalEnergySimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    height: 0,
    velocity: 0,
    time: 0,
    initialHeight: 0,
  });

  const mass = params.mass || 1;
  const height = params.height || 5;
  const gravity = 9.8;

  const totalEnergy = mass * gravity * height;

  useEffect(() => {
    stateRef.current.height = height;
    stateRef.current.velocity = 0;
    stateRef.current.time = 0;
    stateRef.current.initialHeight = height;
  }, [mass, height, onReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const heightCanvas = 480;
    canvas.width = width;
    canvas.height = heightCanvas;

    const groundY = heightCanvas - 60;
    const scale = 60;
    const rampLeftX = 120;
    const rampRightX = width - 120;
    const rampTopY = groundY - Math.min(height * scale, groundY - 80);

    const draw = () => {
      ctx.clearRect(0, 0, width, heightCanvas);

      const gradient = ctx.createLinearGradient(0, 0, 0, heightCanvas);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, heightCanvas);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, groundY, width, heightCanvas - groundY);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, groundY, width, 4);

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i - 20, heightCanvas);
        ctx.stroke();
      }

      const rampGradient = ctx.createLinearGradient(rampLeftX, rampTopY, rampLeftX, groundY);
      rampGradient.addColorStop(0, '#94a3b8');
      rampGradient.addColorStop(1, '#64748b');
      ctx.fillStyle = rampGradient;
      ctx.beginPath();
      ctx.moveTo(rampLeftX, groundY);
      ctx.lineTo(rampLeftX, rampTopY);
      ctx.lineTo(rampRightX, groundY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rampLeftX, rampTopY);
      ctx.lineTo(rampRightX, groundY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(rampLeftX, rampTopY);
      ctx.lineTo(rampLeftX + 80, rampTopY);
      ctx.stroke();
      ctx.setLineDash([]);

      const dropHeight = stateRef.current.initialHeight - stateRef.current.height;
      const rampLength = Math.sqrt(
        Math.pow(rampRightX - rampLeftX, 2) + Math.pow(groundY - rampTopY, 2)
      );
      const maxDrop = groundY - rampTopY;
      const progress = Math.min(dropHeight * scale / maxDrop, 1);

      const ballX = rampLeftX + progress * (rampRightX - rampLeftX);
      const ballY = rampTopY + progress * (groundY - rampTopY) - 20;

      const ballRadius = 18;
      const ballGradient = ctx.createRadialGradient(
        ballX - 5, ballY - 5, 2,
        ballX, ballY, ballRadius
      );
      ballGradient.addColorStop(0, '#fbbf24');
      ballGradient.addColorStop(1, '#f97316');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (stateRef.current.velocity > 0) {
        const arrowLen = Math.min(stateRef.current.velocity * 8, 60);
        const angle = Math.atan2(groundY - rampTopY, rampRightX - rampLeftX);
        const arrowEndX = ballX + Math.cos(angle) * (ballRadius + arrowLen);
        const arrowEndY = ballY + Math.sin(angle) * (ballRadius + arrowLen);

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ballX + Math.cos(angle) * ballRadius, ballY + Math.sin(angle) * ballRadius);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.stroke();

        const headLen = 10;
        ctx.fillStyle = '#22c55e';
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
      }

      const kineticEnergy = 0.5 * mass * stateRef.current.velocity * stateRef.current.velocity;
      const potentialEnergy = mass * gravity * stateRef.current.height;
      const currentTotalEnergy = kineticEnergy + potentialEnergy;

      const maxBarWidth = 120;
      const barX = width - 160;
      const barStartY = 140;
      const barHeight = 20;
      const barGap = 8;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 200, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('机械能守恒', 35, 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px monospace';
      ctx.fillText('E = Ek + Ep = 恒量', 35, 70);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('───────────────────────', 35, 92);

      ctx.fillStyle = '#22c55e';
      ctx.fillText(`动能 Ek: ${kineticEnergy.toFixed(2)} J`, 35, 117);

      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`势能 Ep: ${potentialEnergy.toFixed(2)} J`, 35, 140);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`总机械能 E: ${currentTotalEnergy.toFixed(2)} J`, 35, 163);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`理论总能量: ${totalEnergy.toFixed(2)} J`, 35, 186);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(width - 200, 20, 180, 100, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('实时数据', width - 185, 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.fillText(`质量 m: ${mass.toFixed(2)} kg`, width - 185, 68);
      ctx.fillText(`高度 h: ${stateRef.current.height.toFixed(2)} m`, width - 185, 91);
      ctx.fillText(`速度 v: ${stateRef.current.velocity.toFixed(2)} m/s`, width - 185, 114);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(barX - 20, barStartY - 25, maxBarWidth + 40, barHeight * 3 + barGap * 2 + 50, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('能量条形图', barX + maxBarWidth / 2, barStartY - 8);

      const ekRatio = Math.min(kineticEnergy / totalEnergy, 1);
      const epRatio = Math.min(potentialEnergy / totalEnergy, 1);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barStartY + barHeight + barGap, maxBarWidth, barHeight);

      ctx.fillStyle = '#22c55e';
      ctx.fillRect(barX, barStartY + barHeight + barGap, maxBarWidth * ekRatio, barHeight);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Ek', barX - 28, barStartY + barHeight + barGap + 14);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barStartY + (barHeight + barGap) * 2, maxBarWidth, barHeight);

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(barX, barStartY + (barHeight + barGap) * 2, maxBarWidth * epRatio, barHeight);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('Ep', barX - 28, barStartY + (barHeight + barGap) * 2 + 14);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`t = ${stateRef.current.time.toFixed(2)}s`, width / 2, groundY - 30);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        const state = stateRef.current;

        if (state.height > 0) {
          const rampAngle = Math.atan2(
            groundY - rampTopY,
            rampRightX - rampLeftX
          );
          const acceleration = gravity * Math.sin(rampAngle);

          state.velocity += acceleration * dt;
          state.height -= state.velocity * dt * (groundY - rampTopY) / 
            Math.sqrt(Math.pow(rampRightX - rampLeftX, 2) + Math.pow(groundY - rampTopY, 2));

          if (state.height <= 0) {
            state.height = 0;
            state.velocity = Math.sqrt(2 * gravity * state.initialHeight);
          }

          state.time += dt;
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
  }, [isRunning, mass, height, gravity, totalEnergy]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default MechanicalEnergySimulation;
