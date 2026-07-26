import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const MomentumSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    x1: 100,
    x2: 500,
    v1: 0,
    v2: 0,
    time: 0,
    collided: false,
    initialMomentum: 0,
  });

  const mass1 = params.mass1 || 2;
  const mass2 = params.mass2 || 1;
  const velocity1 = params.velocity1 || 3;
  const velocity2 = params.velocity2 || -2;

  const initialMomentum = mass1 * velocity1 + mass2 * velocity2;
  const ballRadius1 = 15 + mass1 * 5;
  const ballRadius2 = 15 + mass2 * 5;

  useEffect(() => {
    stateRef.current.x1 = 100;
    stateRef.current.x2 = 500;
    stateRef.current.v1 = velocity1;
    stateRef.current.v2 = velocity2;
    stateRef.current.time = 0;
    stateRef.current.collided = false;
    stateRef.current.initialMomentum = initialMomentum;
  }, [mass1, mass2, velocity1, velocity2, initialMomentum, onReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const groundY = height - 100;
    const scale = 50;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, groundY, width, height - groundY);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, groundY, width, 4);

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i - 20, height);
        ctx.stroke();
      }

      const ballY = groundY - Math.max(ballRadius1, ballRadius2) - 5;

      if (stateRef.current.v1 !== 0) {
        const arrowLen = Math.min(Math.abs(stateRef.current.v1) * 15, 80);
        const arrowX = stateRef.current.x1 + (stateRef.current.v1 > 0 ? ballRadius1 + 5 : -ballRadius1 - 5);
        const arrowEndX = arrowX + (stateRef.current.v1 > 0 ? arrowLen : -arrowLen);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrowX, ballY);
        ctx.lineTo(arrowEndX, ballY);
        ctx.stroke();

        const headLen = 10;
        const dir = stateRef.current.v1 > 0 ? 1 : -1;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(arrowEndX, ballY);
        ctx.lineTo(arrowEndX - dir * headLen, ballY - 6);
        ctx.lineTo(arrowEndX - dir * headLen, ballY + 6);
        ctx.closePath();
        ctx.fill();
      }

      if (stateRef.current.v2 !== 0) {
        const arrowLen = Math.min(Math.abs(stateRef.current.v2) * 15, 80);
        const arrowX = stateRef.current.x2 + (stateRef.current.v2 > 0 ? ballRadius2 + 5 : -ballRadius2 - 5);
        const arrowEndX = arrowX + (stateRef.current.v2 > 0 ? arrowLen : -arrowLen);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrowX, ballY);
        ctx.lineTo(arrowEndX, ballY);
        ctx.stroke();

        const headLen = 10;
        const dir = stateRef.current.v2 > 0 ? 1 : -1;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(arrowEndX, ballY);
        ctx.lineTo(arrowEndX - dir * headLen, ballY - 6);
        ctx.lineTo(arrowEndX - dir * headLen, ballY + 6);
        ctx.closePath();
        ctx.fill();
      }

      const ballGradient1 = ctx.createRadialGradient(
        stateRef.current.x1 - 5, ballY - 5, 2,
        stateRef.current.x1, ballY, ballRadius1
      );
      ballGradient1.addColorStop(0, '#60a5fa');
      ballGradient1.addColorStop(1, '#2563eb');
      ctx.fillStyle = ballGradient1;
      ctx.beginPath();
      ctx.arc(stateRef.current.x1, ballY, ballRadius1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('m₁', stateRef.current.x1, ballY + 4);

      const ballGradient2 = ctx.createRadialGradient(
        stateRef.current.x2 - 5, ballY - 5, 2,
        stateRef.current.x2, ballY, ballRadius2
      );
      ballGradient2.addColorStop(0, '#c084fc');
      ballGradient2.addColorStop(1, '#9333ea');
      ctx.fillStyle = ballGradient2;
      ctx.beginPath();
      ctx.arc(stateRef.current.x2, ballY, ballRadius2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7e22ce';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('m₂', stateRef.current.x2, ballY + 4);

      const currentMomentum = mass1 * stateRef.current.v1 + mass2 * stateRef.current.v2;
      const momentum1 = mass1 * stateRef.current.v1;
      const momentum2 = mass2 * stateRef.current.v2;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 280, 200, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('弹性碰撞 · 动量守恒', 35, 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px monospace';
      ctx.fillText('p = m₁v₁ + m₂v₂ = 恒量', 35, 70);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('──────────────────────────', 35, 92);

      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`m₁: ${mass1.toFixed(2)} kg    v₁: ${stateRef.current.v1.toFixed(2)} m/s`, 35, 117);
      ctx.fillText(`p₁: ${momentum1.toFixed(2)} kg·m/s`, 35, 140);

      ctx.fillStyle = '#c084fc';
      ctx.fillText(`m₂: ${mass2.toFixed(2)} kg    v₂: ${stateRef.current.v2.toFixed(2)} m/s`, 35, 165);
      ctx.fillText(`p₂: ${momentum2.toFixed(2)} kg·m/s`, 35, 188);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(width - 220, 20, 200, 120, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('总动量验证', width - 205, 45);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('初始:', width - 205, 70);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${stateRef.current.initialMomentum.toFixed(2)} kg·m/s`, width - 150, 70);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('当前:', width - 205, 95);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`${currentMomentum.toFixed(2)} kg·m/s`, width - 150, 95);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('时间:', width - 205, 120);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${stateRef.current.time.toFixed(2)} s`, width - 150, 120);

      if (stateRef.current.collided) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ 碰撞完成', width / 2, groundY - 60);
      }
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        const state = stateRef.current;

        state.x1 += state.v1 * scale * dt;
        state.x2 += state.v2 * scale * dt;
        state.time += dt;

        const dx = state.x2 - state.x1;
        const minDist = ballRadius1 + ballRadius2;

        if (dx <= minDist && !state.collided) {
          state.collided = true;

          const v1Final = ((mass1 - mass2) * state.v1 + 2 * mass2 * state.v2) / (mass1 + mass2);
          const v2Final = ((mass2 - mass1) * state.v2 + 2 * mass1 * state.v1) / (mass1 + mass2);

          state.v1 = v1Final;
          state.v2 = v2Final;

          state.x1 = (state.x1 + state.x2) / 2 - minDist / 2;
          state.x2 = state.x1 + minDist;
        }

        if (state.x1 - ballRadius1 < 0) {
          state.x1 = ballRadius1;
          state.v1 = Math.abs(state.v1);
        }
        if (state.x1 + ballRadius1 > width) {
          state.x1 = width - ballRadius1;
          state.v1 = -Math.abs(state.v1);
        }
        if (state.x2 - ballRadius2 < 0) {
          state.x2 = ballRadius2;
          state.v2 = Math.abs(state.v2);
        }
        if (state.x2 + ballRadius2 > width) {
          state.x2 = width - ballRadius2;
          state.v2 = -Math.abs(state.v2);
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
  }, [isRunning, mass1, mass2, velocity1, velocity2, initialMomentum, ballRadius1, ballRadius2]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default MomentumSimulation;
