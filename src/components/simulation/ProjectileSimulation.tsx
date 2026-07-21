import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const ProjectileSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    time: 0,
    trajectory: [] as { x: number; y: number }[],
    started: false,
    landed: false,
  });

  const velocity = params.velocity || 20;
  const height = params.height || 50;
  const gravity = params.gravity || 9.8;

  useEffect(() => {
    stateRef.current = {
      x: 0,
      y: height,
      vx: velocity,
      vy: 0,
      time: 0,
      trajectory: [{ x: 0, y: height }],
      started: false,
      landed: false,
    };
  }, [velocity, height, gravity, onReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height_canvas = 480;
    canvas.width = width;
    canvas.height = height_canvas;

    const groundY = height_canvas - 60;
    const startX = 80;
    const scale = Math.min(500 / (velocity * Math.sqrt(2 * height / gravity) + 10), 6);
    const yScale = (groundY - 60) / height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height_canvas);

      const gradient = ctx.createLinearGradient(0, 0, 0, height_canvas);
      gradient.addColorStop(0, '#dbeafe');
      gradient.addColorStop(0.7, '#f0f9ff');
      gradient.addColorStop(1, '#bbf7d0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height_canvas);

      // 云朵
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      [[100, 50, 30], [250, 80, 25], [500, 40, 35], [600, 70, 28]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x as number, y as number, r as number, 0, Math.PI * 2);
        ctx.arc((x as number) + 25, (y as number) - 5, (r as number) * 0.8, 0, Math.PI * 2);
        ctx.arc((x as number) - 20, (y as number) + 5, (r as number) * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // 地面
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, groundY, width, height_canvas - groundY);
      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i + 5, groundY - 8);
        ctx.lineTo(i + 10, groundY);
        ctx.fill();
      }

      // 发射台
      const platformY = groundY - height * yScale;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(startX - 20, platformY, 40, height * yScale);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(startX - 25, platformY - 8, 50, 10);

      // 刻度尺（竖直）
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(20, 60, 20, groundY - 60);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 60, 20, groundY - 60);
      ctx.fillStyle = '#92400e';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      const totalH = height;
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const y = groundY - (i / steps) * totalH * yScale;
        ctx.fillRect(20, y, 8, 2);
        if (i % 2 === 0) {
          ctx.fillText(`${Math.round((i / steps) * totalH)}m`, 45, y + 3);
        }
      }

      // 水平刻度尺
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(startX, groundY + 10, 600, 15);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(startX, groundY + 10, 600, 15);
      ctx.fillStyle = '#92400e';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 10; i++) {
        const x = startX + i * 60;
        ctx.fillRect(x, groundY + 10, 1, 8);
        const dist = (i * 60) / scale;
        ctx.fillText(`${dist.toFixed(0)}m`, x, groundY + 35);
      }

      // 轨迹
      const traj = stateRef.current.trajectory;
      if (traj.length > 1) {
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let i = 0; i < traj.length; i++) {
          const px = startX + traj[i].x * scale;
          const py = groundY - traj[i].y * yScale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 小球
      const ballX = startX + stateRef.current.x * scale;
      const ballY = groundY - stateRef.current.y * yScale;
      
      // 阴影
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(ballX, groundY + 5, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 球
      const ballGrad = ctx.createRadialGradient(ballX - 4, ballY - 4, 2, ballX, ballY, 14);
      ballGrad.addColorStop(0, '#fb923c');
      ballGrad.addColorStop(0.7, '#f97316');
      ballGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 14, 0, Math.PI * 2);
      ctx.fill();

      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(ballX - 4, ballY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // 速度矢量
      if (stateRef.current.started && !stateRef.current.landed) {
        const vScale = 1.5;
        const vx = stateRef.current.vx;
        const vy = stateRef.current.vy;
        
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + vx * vScale, ballY - vy * vScale);
        ctx.stroke();
        
        const arrowAngle = Math.atan2(-vy, vx);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(ballX + vx * vScale, ballY - vy * vScale);
        ctx.lineTo(
          ballX + vx * vScale - 8 * Math.cos(arrowAngle - 0.4),
          ballY - vy * vScale - 8 * Math.sin(arrowAngle - 0.4)
        );
        ctx.lineTo(
          ballX + vx * vScale - 8 * Math.cos(arrowAngle + 0.4),
          ballY - vy * vScale - 8 * Math.sin(arrowAngle + 0.4)
        );
        ctx.fill();
      }

      // 数据面板
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width - 200, 20, 180, 120, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      
      const currentX = stateRef.current.x;
      const currentY = stateRef.current.y;
      const speed = Math.sqrt(stateRef.current.vx ** 2 + stateRef.current.vy ** 2);
      
      ctx.fillText(`水平位移: ${currentX.toFixed(2)} m`, width - 185, 45);
      ctx.fillText(`竖直高度: ${currentY.toFixed(2)} m`, width - 185, 65);
      ctx.fillText(`速度: ${speed.toFixed(2)} m/s`, width - 185, 85);
      ctx.fillText(`时间: ${stateRef.current.time.toFixed(2)} s`, width - 185, 105);
      ctx.fillText(`v₀ = ${velocity} m/s`, width - 185, 125);

      if (!stateRef.current.started && !isRunning) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, width, height_canvas);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('点击"开始"发射小球', width / 2, height_canvas / 2);
      }
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        if (!stateRef.current.started) {
          stateRef.current.started = true;
          stateRef.current.y = height;
          stateRef.current.vx = velocity;
          stateRef.current.vy = 0;
        }
        
        if (!stateRef.current.landed) {
          const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
          lastTime = currentTime;

          const state = stateRef.current;
          
          state.vy -= gravity * dt;
          state.x += state.vx * dt;
          state.y += state.vy * dt;
          state.time += dt;

          state.trajectory.push({ x: state.x, y: state.y });
          if (state.trajectory.length > 500) state.trajectory.shift();

          if (state.y <= 0) {
            state.y = 0;
            state.landed = true;
          }
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
  }, [isRunning, velocity, height, gravity]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default ProjectileSimulation;
