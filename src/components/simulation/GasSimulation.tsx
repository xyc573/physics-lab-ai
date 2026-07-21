import { useRef, useEffect, useState } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const GasSimulation: React.FC<Props> = ({ params, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const dataPointsRef = useRef<{ v: number; p: number }[]>([]);
  const [showGraph, setShowGraph] = useState<'pv' | 'p1v' | null>(null);

  const volume = params.volume || 100;
  const temperature = params.temperature || 300;
  const moles = params.moles || 0.004;

  const R = 8.314;
  const volumeM3 = volume * 1e-6;
  const pressure = (moles * R * temperature) / volumeM3;
  const pressureKPa = pressure / 1000;

  const particleCount = Math.min(Math.floor(moles * 50000), 200);

  useEffect(() => {
    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const speed = Math.sqrt(temperature / 300) * 2;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 300,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
      });
    }
    particlesRef.current = particles;
  }, [particleCount, temperature, volume]);

  useEffect(() => {
    if (dataPointsRef.current.length === 0 || 
        Math.abs(dataPointsRef.current[dataPointsRef.current.length - 1].v - volume) > 1) {
      dataPointsRef.current.push({ v: volume, p: pressureKPa });
      if (dataPointsRef.current.length > 20) {
        dataPointsRef.current.shift();
      }
    }
  }, [volume, pressureKPa]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const cylinderLeft = 100;
    const cylinderRight = cylinderLeft + (volume / 200) * 350 + 50;
    const cylinderTop = 80;
    const cylinderBottom = 400;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 气缸外壁
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cylinderLeft - 10, cylinderTop, cylinderRight - cylinderLeft + 20, cylinderBottom - cylinderTop);
      
      // 气缸内部（气体区域）
      const gasGrad = ctx.createLinearGradient(cylinderLeft, 0, cylinderRight, 0);
      const tempColor = temperature < 250 ? '#93c5fd' : temperature < 350 ? '#fcd34d' : '#f87171';
      gasGrad.addColorStop(0, `${tempColor}33`);
      gasGrad.addColorStop(0.5, `${tempColor}66`);
      gasGrad.addColorStop(1, `${tempColor}33`);
      ctx.fillStyle = gasGrad;
      ctx.fillRect(cylinderLeft, cylinderTop + 5, cylinderRight - cylinderLeft, cylinderBottom - cylinderTop - 10);

      // 气缸边框
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.strokeRect(cylinderLeft - 10, cylinderTop, cylinderRight - cylinderLeft + 20, cylinderBottom - cylinderTop);

      // 活塞
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cylinderRight - 5, cylinderTop - 20, 15, cylinderBottom - cylinderTop + 40);
      ctx.fillStyle = '#475569';
      ctx.fillRect(cylinderRight + 5, cylinderTop + 50, 30, cylinderBottom - cylinderTop - 100);

      // 粒子
      particlesRef.current.forEach(p => {
        if (p.x >= cylinderLeft && p.x <= cylinderRight && p.y >= cylinderTop && p.y <= cylinderBottom) {
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const hue = 200 - Math.min(speed * 50, 180);
          ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 温度计图标
      const thermoX = cylinderRight + 80;
      const thermoY = cylinderTop + 30;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      
      // 温度计主体
      ctx.beginPath();
      ctx.roundRect(thermoX - 10, thermoY, 20, 200, 10);
      ctx.fill();
      ctx.stroke();
      
      // 温度计底部球
      ctx.beginPath();
      ctx.arc(thermoX, thermoY + 210, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 温度液柱
      const tempHeight = ((temperature - 200) / 200) * 180;
      const tempColor2 = temperature < 250 ? '#3b82f6' : temperature < 350 ? '#f59e0b' : '#ef4444';
      ctx.fillStyle = tempColor2;
      ctx.beginPath();
      ctx.arc(thermoX, thermoY + 210, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(thermoX - 5, thermoY + 200 - tempHeight, 10, tempHeight + 12);
      
      // 温度刻度
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      for (let i = 0; i <= 4; i++) {
        const y = thermoY + 200 - i * 45;
        ctx.fillRect(thermoX + 8, y, 6, 1);
        ctx.fillText(`${200 + i * 50}K`, thermoX + 18, y + 4);
      }

      // 压强计
      const gaugeX = 550;
      const gaugeY = 150;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 压强计刻度
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const angle = -Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
        const inner = i % 2 === 0 ? 30 : 35;
        ctx.beginPath();
        ctx.moveTo(gaugeX + Math.cos(angle) * inner, gaugeY + Math.sin(angle) * inner);
        ctx.lineTo(gaugeX + Math.cos(angle) * 40, gaugeY + Math.sin(angle) * 40);
        ctx.stroke();
      }
      
      // 压强计指针
      const maxPressure = 200;
      const pRatio = Math.min(pressureKPa / maxPressure, 1);
      const needleAngle = -Math.PI * 0.75 + pRatio * Math.PI * 1.5;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gaugeX, gaugeY);
      ctx.lineTo(gaugeX + Math.cos(needleAngle) * 32, gaugeY + Math.sin(needleAngle) * 32);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('kPa', gaugeX, gaugeY + 18);
      ctx.font = '10px sans-serif';
      ctx.fillText('压强计', gaugeX, gaugeY + 65);

      // 数据面板
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 220, 110, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`压强 P = ${pressureKPa.toFixed(1)} kPa`, 35, 45);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`体积 V = ${volume.toFixed(0)} mL`, 35, 65);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`温度 T = ${temperature.toFixed(0)} K`, 35, 85);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`PV = ${(pressureKPa * volume / 1000).toFixed(2)} kPa·L`, 35, 105);
      
      const pV = pressure * volumeM3;
      const nRT = moles * R * temperature;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(`PV/nRT = ${(pV / nRT).toFixed(3)}`, 35, 125);

      // 公式提示
      ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 250, height - 80, 230, 60, 8);
      ctx.fill();
      ctx.fillStyle = '#c2410c';
      ctx.font = 'italic 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('PV = nRT', width - 135, height - 45);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#9a3412';
      ctx.fillText('理想气体状态方程', width - 135, height - 28);

      // P-V 图
      const graphX = width - 250;
      const graphY = 150;
      const graphW = 220;
      const graphH = 140;
      const padding = { top: 20, right: 15, bottom: 25, left: 40 };
      const plotW = graphW - padding.left - padding.right;
      const plotH = graphH - padding.top - padding.bottom;

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.roundRect(graphX, graphY, graphW, graphH, 8);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P-V 图（等温线）', graphX + graphW / 2, graphY + 12);

      const allData = dataPointsRef.current.length > 1 ? dataPointsRef.current : [
        { v: 20, p: (moles * R * temperature) / (20 * 1e-6) / 1000 },
        { v: volume, p: pressureKPa },
        { v: 200, p: (moles * R * temperature) / (200 * 1e-6) / 1000 },
      ];

      const vMin = 20;
      const vMax = 200;
      const pMin = Math.min(...allData.map(d => d.p)) * 0.9;
      const pMax = Math.max(...allData.map(d => d.p)) * 1.1;

      const getX = (v: number) => graphX + padding.left + ((v - vMin) / (vMax - vMin)) * plotW;
      const getY = (p: number) => graphY + padding.top + (1 - (p - pMin) / (pMax - pMin)) * plotH;

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = graphY + padding.top + (i / 4) * plotH;
        ctx.beginPath();
        ctx.moveTo(graphX + padding.left, y);
        ctx.lineTo(graphX + graphW - padding.right, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const v = vMin + (i / steps) * (vMax - vMin);
        const p = (moles * R * temperature) / (v * 1e-6) / 1000;
        const x = getX(v);
        const y = getY(p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(getX(volume), getY(pressureKPa), 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('P', graphX + padding.left - 5, graphY + padding.top - 3);
      ctx.textAlign = 'center';
      ctx.fillText('V', graphX + graphW - padding.right, graphY + graphH - 5);

      // P-1/V 图
      const graph2X = width - 250;
      const graph2Y = 305;
      const graph2W = 220;
      const graph2H = 130;
      const padding2 = { top: 20, right: 15, bottom: 25, left: 40 };
      const plot2W = graph2W - padding2.left - padding2.right;
      const plot2H = graph2H - padding2.top - padding2.bottom;

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.roundRect(graph2X, graph2Y, graph2W, graph2H, 8);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P-1/V 图（正比例）', graph2X + graph2W / 2, graph2Y + 12);

      const invVMin = 1 / vMax;
      const invVMax = 1 / vMin;

      const getX2 = (invV: number) => graph2X + padding2.left + ((invV - invVMin) / (invVMax - invVMin)) * plot2W;
      const getY2 = (p: number) => graph2Y + padding2.top + (1 - (p - pMin) / (pMax - pMin)) * plot2H;

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = graph2Y + padding2.top + (i / 4) * plot2H;
        ctx.beginPath();
        ctx.moveTo(graph2X + padding2.left, y);
        ctx.lineTo(graph2X + graph2W - padding2.right, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pAtMinV = (moles * R * temperature) / (vMin * 1e-6) / 1000;
      const pAtMaxV = (moles * R * temperature) / (vMax * 1e-6) / 1000;
      ctx.moveTo(getX2(invVMax), getY2(pAtMinV));
      ctx.lineTo(getX2(invVMin), getY2(pAtMaxV));
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(getX2(1 / volume), getY2(pressureKPa), 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('P', graph2X + padding2.left - 5, graph2Y + padding2.top - 3);
      ctx.textAlign = 'center';
      ctx.fillText('1/V', graph2X + graph2W - padding2.right, graph2Y + graph2H - 5);
    };

    const animate = () => {
      if (isRunning) {
        const cylinderLeft = 100;
        const cylinderRight = cylinderLeft + (volume / 200) * 350 + 50;
        const cylinderTop = 80;
        const cylinderBottom = 400;

        particlesRef.current.forEach(p => {
          const speedFactor = Math.sqrt(temperature / 300);
          p.x += p.vx * speedFactor;
          p.y += p.vy * speedFactor;

          if (p.x <= cylinderLeft + 4 || p.x >= cylinderRight - 4) {
            p.vx *= -1;
            p.x = Math.max(cylinderLeft + 4, Math.min(cylinderRight - 4, p.x));
          }
          if (p.y <= cylinderTop + 4 || p.y >= cylinderBottom - 4) {
            p.vy *= -1;
            p.y = Math.max(cylinderTop + 4, Math.min(cylinderBottom - 4, p.y));
          }
        });
      }

      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, volume, temperature, moles, pressure, pressureKPa, particleCount]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default GasSimulation;
