import { useRef, useEffect, useState } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const SpringSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    displacement: 0,
    velocity: 0,
    time: 0,
    dataPoints: [] as { t: number; x: number }[],
  });

  const mass = params.mass || 0.1;
  const k = params.k || 50;
  const gravity = params.gravity || 9.8;
  const damping = params.damping || 0.5;

  const equilibrium = (mass * gravity) / k;
  const omega = Math.sqrt(k / mass);

  useEffect(() => {
    if (!isRunning) {
      stateRef.current.displacement = equilibrium;
      stateRef.current.velocity = 0;
      stateRef.current.time = 0;
      stateRef.current.dataPoints = [];
    }
  }, [mass, k, gravity, damping, onReset]);

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

      // 背景
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 支架
      const standX = width / 2;
      const standTopY = 40;
      ctx.fillStyle = '#475569';
      ctx.fillRect(standX - 60, standTopY - 10, 120, 12);
      ctx.fillRect(standX - 4, standTopY, 8, 30);

      // 弹簧
      const springTopY = standTopY + 30;
      const springBottomY = 100 + stateRef.current.displacement * 300 + equilibrium * 300;
      const coils = 12;
      const coilWidth = 20;
      const springLength = springBottomY - springTopY;
      const coilHeight = springLength / coils;

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(standX, springTopY);
      
      for (let i = 0; i < coils; i++) {
        const y = springTopY + i * coilHeight + coilHeight / 2;
        const x = standX + (i % 2 === 0 ? coilWidth / 2 : -coilWidth / 2);
        const cpY = springTopY + i * coilHeight + coilHeight / 4;
        const cpY2 = springTopY + i * coilHeight + coilHeight * 3 / 4;
        
        if (i === 0) {
          ctx.quadraticCurveTo(standX + coilWidth / 2, cpY, standX + coilWidth / 2, y);
        } else {
          ctx.quadraticCurveTo(
            i % 2 === 0 ? coilWidth / 2 : -coilWidth / 2 + standX - standX + standX,
            cpY,
            x,
            y
          );
        }
      }
      
      // 简化的弹簧绘制
      ctx.beginPath();
      ctx.moveTo(standX, springTopY);
      const segments = 20;
      const segHeight = springLength / segments;
      for (let i = 0; i <= segments; i++) {
        const y = springTopY + i * segHeight;
        const xOffset = Math.sin(i * Math.PI * 2) * 15;
        ctx.lineTo(standX + xOffset, y);
      }
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 钩码
      const massY = springBottomY;
      const massSize = 50;
      
      // 钩码主体
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.roundRect(standX - massSize / 2, massY, massSize, massSize * 0.8, 8);
      ctx.fill();
      
      // 钩码高光
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(standX - massSize / 2 + 5, massY + 5, massSize - 10, 8);

      // 钩码上面的钩子
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(standX, massY);
      ctx.lineTo(standX, massY - 12);
      ctx.arc(standX, massY - 15, 5, 0, Math.PI, true);
      ctx.stroke();

      // 刻度尺
      const rulerX = standX + 100;
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(rulerX - 15, 80, 30, 380);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(rulerX - 15, 80, 30, 380);
      
      // 刻度
      ctx.fillStyle = '#92400e';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      for (let i = 0; i <= 10; i++) {
        const y = 80 + i * 38;
        ctx.fillRect(rulerX - 15, y, 10, 2);
        if (i % 2 === 0) {
          ctx.fillText(`${i * 2}cm`, rulerX + 5, y + 3);
        }
      }

      // 平衡位置指示线
      const eqY = 100 + equilibrium * 300 + equilibrium * 300;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(standX - 80, 100 + equilibrium * 300);
      ctx.lineTo(standX + 80, 100 + equilibrium * 300);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('平衡位置', standX + 85, 100 + equilibrium * 300 + 4);

      // 数据显示
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 180, 100, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`位移: ${((stateRef.current.displacement - equilibrium) * 100).toFixed(2)} cm`, 35, 45);
      ctx.fillText(`速度: ${(stateRef.current.velocity * 100).toFixed(2)} cm/s`, 35, 68);
      ctx.fillText(`时间: ${stateRef.current.time.toFixed(2)} s`, 35, 91);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        const state = stateRef.current;
        const x = state.displacement - equilibrium;
        
        const acceleration = (-k / mass) * x - (damping / mass) * state.velocity;
        
        state.velocity += acceleration * dt;
        state.displacement += state.velocity * dt;
        state.time += dt;

        if (state.dataPoints.length < 200) {
          state.dataPoints.push({ t: state.time, x: x });
        } else {
          state.dataPoints.shift();
          state.dataPoints.push({ t: state.time, x: x });
        }
      } else {
        lastTime = currentTime;
      }

      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    if (stateRef.current.displacement === 0) {
      stateRef.current.displacement = equilibrium;
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, mass, k, gravity, damping, equilibrium]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default SpringSimulation;
