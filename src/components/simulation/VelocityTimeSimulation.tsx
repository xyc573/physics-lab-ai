import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const VelocityTimeSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    position: 100,
    velocity: 0,
    time: 0,
    wheelAngle: 0,
    tapeDots: [] as { x: number; y: number }[],
    vtData: [] as { t: number; v: number }[],
    lastDotTime: 0,
  });

  const acceleration = params.acceleration || 2;
  const initialVelocity = params.initialVelocity || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const drawCar = (x: number, y: number, wheelAngle: number) => {
      const carWidth = 70;
      const carHeight = 28;
      const wheelRadius = 11;
      
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.roundRect(x - carWidth / 2, y - carHeight - wheelRadius, carWidth, carHeight, 5);
      ctx.fill();
      
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.roundRect(x - carWidth / 4, y - carHeight - wheelRadius - 14, carWidth / 2, 14, 3);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x - carWidth / 4 + 2, y - carHeight - wheelRadius - 12, carWidth / 2 - 4, 10);
      
      const wheelPositions = [-carWidth / 3, carWidth / 3];
      wheelPositions.forEach(wx => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(x + wx, y - wheelRadius, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const spokeAngle = wheelAngle + i * Math.PI * 2 / 5;
          ctx.beginPath();
          ctx.moveTo(x + wx, y - wheelRadius);
          ctx.lineTo(x + wx + (wheelRadius - 2) * Math.cos(spokeAngle), y - wheelRadius + (wheelRadius - 2) * Math.sin(spokeAngle));
          ctx.stroke();
        }
      });
    };

    const drawVtGraph = () => {
      const graphX = 20;
      const graphY = 290;
      const graphW = 300;
      const graphH = 170;
      
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.roundRect(graphX, graphY, graphW, graphH, 6);
      ctx.fill();
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX + 40, graphY + 15, graphW - 55, graphH - 40);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('v', graphX + 35, graphY + 20);
      ctx.textAlign = 'left';
      ctx.fillText('t', graphX + graphW - 10, graphY + graphH - 20);
      
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('v-t 图像', graphX + 10, graphY + 14);
      
      const maxTime = Math.max(10, stateRef.current.time);
      const maxVelocity = Math.max(10, initialVelocity + acceleration * maxTime);
      
      const data = stateRef.current.vtData;
      if (data.length > 1) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, i) => {
          const px = graphX + 40 + (point.t / maxTime) * (graphW - 55);
          const py = graphY + 15 + graphH - 40 - (point.v / maxVelocity) * (graphH - 40);
          
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.stroke();
        
        const last = data[data.length - 1];
        const lx = graphX + 40 + (last.t / maxTime) * (graphW - 55);
        const ly = graphY + 15 + graphH - 40 - (last.v / maxVelocity) * (graphH - 40);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`v₀=${initialVelocity}m/s`, graphX + 45, graphY + graphH - 5);
      ctx.fillText(`a=${acceleration}m/s²`, graphX + 140, graphY + graphH - 5);
    };

    const drawTickerTape = () => {
      const tapeX = 340;
      const tapeY = 300;
      const tapeW = 340;
      const tapeH = 150;
      
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.roundRect(tapeX, tapeY, tapeW, tapeH, 6);
      ctx.fill();
      
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(tapeX + 15, tapeY + 60, tapeW - 30, 30);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(tapeX + 15, tapeY + 60, tapeW - 30, 30);
      
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('打点计时器纸带', tapeX + 15, tapeY + 20);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('点间距变化反映速度变化', tapeX + 15, tapeY + 38);
      
      const dots = stateRef.current.tapeDots;
      dots.forEach((dot, i) => {
        if (dot.x < tapeX + tapeW - 20) {
          ctx.fillStyle = i % 5 === 0 ? '#dc2626' : '#1e293b';
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px monospace';
      ctx.fillText(`v = v₀ + at`, tapeX + 200, tapeY + 25);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`x = v₀t + ½at²`, tapeX + 200, tapeY + 42);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const groundY = 240;
      const carY = groundY;
      const carX = stateRef.current.position;

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, groundY, width, 50);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, groundY + 12);
        ctx.lineTo(i + 15, groundY + 12);
        ctx.stroke();
      }

      drawCar(carX, carY, stateRef.current.wheelAngle);

      const velArrowLen = Math.min(stateRef.current.velocity * 8, 80);
      if (velArrowLen > 5) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const arrowX1 = carX + 35;
        const arrowY = carY - 20;
        const arrowX2 = arrowX1 + velArrowLen;
        ctx.beginPath();
        ctx.moveTo(arrowX1, arrowY);
        ctx.lineTo(arrowX2, arrowY);
        ctx.stroke();
        const headLen = 8;
        ctx.beginPath();
        ctx.moveTo(arrowX2, arrowY);
        ctx.lineTo(arrowX2 - headLen, arrowY - 4);
        ctx.lineTo(arrowX2 - headLen, arrowY + 4);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(450, 20, 230, 130, 8);
      ctx.fill();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`速度 v = ${stateRef.current.velocity.toFixed(2)} m/s`, 470, 48);
      ctx.fillText(`位移 x = ${(stateRef.current.position - 100).toFixed(1)} m`, 470, 70);
      ctx.fillText(`时间 t = ${stateRef.current.time.toFixed(2)} s`, 470, 92);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`加速度 a = ${acceleration.toFixed(2)} m/s²`, 470, 114);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`初速度 v₀ = ${initialVelocity.toFixed(1)} m/s`, 470, 136);

      drawVtGraph();
      drawTickerTape();
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        stateRef.current.time += dt;
        stateRef.current.velocity = initialVelocity + acceleration * stateRef.current.time;
        stateRef.current.position = 100 + (initialVelocity * stateRef.current.time + 0.5 * acceleration * stateRef.current.time * stateRef.current.time) * 5;
        stateRef.current.wheelAngle += stateRef.current.velocity * dt * 5 / 11;

        if (stateRef.current.time - stateRef.current.lastDotTime >= 0.1) {
          stateRef.current.lastDotTime = stateRef.current.time;
          const tapeX = 355;
          stateRef.current.tapeDots.push({
            x: tapeX + stateRef.current.tapeDots.length * 6,
            y: 375,
          });
          if (stateRef.current.tapeDots.length > 50) {
            stateRef.current.tapeDots.shift();
          }
        }

        if (stateRef.current.vtData.length < 300) {
          stateRef.current.vtData.push({ t: stateRef.current.time, v: stateRef.current.velocity });
        }

        if (stateRef.current.position > 650) {
          stateRef.current.position = 100;
          stateRef.current.velocity = initialVelocity;
          stateRef.current.time = 0;
          stateRef.current.wheelAngle = 0;
          stateRef.current.tapeDots = [];
          stateRef.current.vtData = [];
          stateRef.current.lastDotTime = 0;
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
  }, [isRunning, acceleration, initialVelocity, onReset]);

  useEffect(() => {
    stateRef.current.position = 100;
    stateRef.current.velocity = initialVelocity;
    stateRef.current.time = 0;
    stateRef.current.wheelAngle = 0;
    stateRef.current.tapeDots = [];
    stateRef.current.vtData = [];
    stateRef.current.lastDotTime = 0;
  }, [onReset, initialVelocity, acceleration]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default VelocityTimeSimulation;
