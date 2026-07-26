import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const AccelerationSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    position: 80,
    velocity: 0,
    time: 0,
    wheelAngle: 0,
  });

  const force = params.force || 50;
  const mass = params.mass || 10;
  const friction = params.friction || 0.2;
  const g = 9.8;

  const frictionForce = friction * mass * g;
  const netForce = Math.max(0, force - frictionForce);
  const acceleration = netForce / mass;

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
      const headLen = 10;
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

    const drawCar = (x: number, y: number, wheelAngle: number) => {
      const carWidth = 90;
      const carHeight = 35;
      const wheelRadius = 14;
      
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(x - carWidth / 2, y - carHeight - wheelRadius, carWidth, carHeight, 6);
      ctx.fill();
      
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.roundRect(x - carWidth / 4, y - carHeight - wheelRadius - 18, carWidth / 2, 18, 4);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x - carWidth / 4 + 3, y - carHeight - wheelRadius - 15, carWidth / 2 - 6, 12);
      
      const wheelPositions = [-carWidth / 3, carWidth / 3];
      wheelPositions.forEach(wx => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(x + wx, y - wheelRadius, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const spokeAngle = wheelAngle + i * Math.PI / 3;
          ctx.beginPath();
          ctx.moveTo(x + wx, y - wheelRadius);
          ctx.lineTo(x + wx + (wheelRadius - 3) * Math.cos(spokeAngle), y - wheelRadius + (wheelRadius - 3) * Math.sin(spokeAngle));
          ctx.stroke();
        }
        
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(x + wx, y - wheelRadius, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const groundY = 380;
      const carY = groundY;
      const carX = stateRef.current.position;

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, groundY, width, height - groundY);
      
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, groundY + 15);
        ctx.lineTo(i + 20, groundY + 15);
        ctx.stroke();
      }

      drawCar(carX, carY, stateRef.current.wheelAngle);

      const forceArrowStart = carX + 45;
      const forceArrowEnd = forceArrowStart + Math.min(force * 1.2, 100);
      drawArrow(forceArrowStart, carY - 30, forceArrowEnd, carY - 30, '#ef4444', 3);
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`F = ${force}N`, forceArrowStart + 5, carY - 38);

      if (frictionForce > 0.1) {
        const frictionArrowEnd = carX - 45;
        const frictionArrowStart = frictionArrowEnd - Math.min(frictionForce * 1.5, 60);
        drawArrow(frictionArrowEnd, carY - 10, frictionArrowStart, carY - 10, '#f97316', 2.5);
        ctx.fillStyle = '#c2410c';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`f = ${frictionForce.toFixed(1)}N`, frictionArrowEnd - 5, carY - 18);
      }

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(460, 20, 220, 220, 8);
      ctx.fill();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('牛顿第二定律', 480, 45);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(480, 52);
      ctx.lineTo(660, 52);
      ctx.stroke();
      
      ctx.fillStyle = '#f87171';
      ctx.fillText(`拉力 F = ${force.toFixed(1)} N`, 480, 75);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`摩擦力 f = ${frictionForce.toFixed(2)} N`, 480, 98);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`合力 F合 = ${netForce.toFixed(2)} N`, 480, 121);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`质量 m = ${mass.toFixed(1)} kg`, 480, 144);
      ctx.fillStyle = '#facc15';
      ctx.fillText(`加速度 a = ${acceleration.toFixed(2)} m/s²`, 480, 167);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`速度 v = ${stateRef.current.velocity.toFixed(2)} m/s`, 480, 190);
      ctx.fillText(`位移 x = ${(stateRef.current.position - 80).toFixed(1)} m`, 480, 213);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 280, 80, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('F合 = ma  →  a = (F - μmg) / m', 160, 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`a = (${force} - ${friction}×${mass}×9.8) / ${mass} = ${acceleration.toFixed(2)} m/s²`, 160, 75);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        stateRef.current.velocity += acceleration * dt;
        stateRef.current.position += stateRef.current.velocity * dt * 20;
        stateRef.current.time += dt;
        stateRef.current.wheelAngle += stateRef.current.velocity * dt * 20 / 14;

        if (stateRef.current.position > 620) {
          stateRef.current.position = 80;
          stateRef.current.velocity = 0;
          stateRef.current.time = 0;
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
  }, [isRunning, force, mass, friction, frictionForce, netForce, acceleration, onReset]);

  useEffect(() => {
    stateRef.current.position = 80;
    stateRef.current.velocity = 0;
    stateRef.current.time = 0;
    stateRef.current.wheelAngle = 0;
  }, [onReset]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default AccelerationSimulation;
