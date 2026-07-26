import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const SensorSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    ledFlicker: 0,
  });

  const lightIntensity = params.lightIntensity || 50;
  const threshold = params.threshold || 50;

  const isLedOn = lightIntensity < threshold;
  const isRelayOn = isLedOn;
  const isTransistorOn = isLedOn;

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

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f0fdf4');
      bgGrad.addColorStop(1, '#dcfce7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const lightX = 100;
      const lightY = 120;

      if (isRunning) {
        const ambientIntensity = lightIntensity / 100;
        const lightRadius = 60 + ambientIntensity * 80;
        const lightGrad = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, lightRadius);
        lightGrad.addColorStop(0, `rgba(254, 240, 138, ${0.3 + ambientIntensity * 0.5})`);
        lightGrad.addColorStop(0.5, `rgba(253, 224, 71, ${0.2 + ambientIntensity * 0.3})`);
        lightGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(lightX, lightY, lightRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(lightX, lightY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + stateRef.current.time * 0.5;
        const innerR = 30;
        const outerR = 38 + (lightIntensity / 100) * 10;
        ctx.beginPath();
        ctx.moveTo(lightX + Math.cos(angle) * innerR, lightY + Math.sin(angle) * innerR);
        ctx.lineTo(lightX + Math.cos(angle) * outerR, lightY + Math.sin(angle) * outerR);
        ctx.stroke();
      }

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('光源', lightX, lightY + 55);

      const ldrX = 100;
      const ldrY = 280;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lightX, lightY + 60);
      ctx.lineTo(lightX, ldrY - 35);
      ctx.stroke();

      const zigzagY = ldrY - 35;
      const zigzagCount = 6;
      const zigzagWidth = 20;
      const zigzagHeight = 8;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < zigzagCount; i++) {
        const sx = lightX - zigzagWidth / 2 + (i / zigzagCount) * zigzagWidth;
        const sy = zigzagY - 20 + Math.sin(stateRef.current.time * 3 + i) * 2;
        const ex = sx + zigzagWidth / zigzagCount;
        const ey = sy + (i % 2 === 0 ? zigzagHeight : -zigzagHeight);
        if (i === 0) {
          ctx.moveTo(sx, sy);
        }
        ctx.lineTo(ex, ey);
      }
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(ldrX - 25, ldrY - 20, 50, 40);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(ldrX - 25, ldrY - 20, 50, 40);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(ldrX, ldrY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ldrX + Math.cos(angle) * 14, ldrY + Math.sin(angle) * 14);
        ctx.lineTo(ldrX + Math.cos(angle) * 18, ldrY + Math.sin(angle) * 18);
        ctx.stroke();
      }

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('光敏电阻', ldrX, ldrY + 35);
      ctx.fillStyle = '#475569';
      ctx.font = '9px sans-serif';
      ctx.fillText('(LDR)', ldrX, ldrY + 48);

      const comparatorX = 300;
      const comparatorY = 200;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ldrX + 25, ldrY);
      ctx.lineTo(comparatorX - 30, ldrY);
      ctx.lineTo(comparatorX - 30, comparatorY - 15);
      ctx.lineTo(comparatorX - 20, comparatorY - 15);
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('输入+', comparatorX - 25, comparatorY - 22);

      const potY = 350;
      const potX = 180;

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(potX - 20, potY - 15, 40, 30);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(potX - 20, potY - 15, 40, 30);

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(potX, potY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      const wiperAngle = -Math.PI / 2 + (threshold / 100) * Math.PI;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(potX, potY);
      ctx.lineTo(potX + Math.cos(wiperAngle) * 12, potY + Math.sin(wiperAngle) * 12);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('阈值调节', potX, potY + 28);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(potX, potY - 15);
      ctx.lineTo(potX, comparatorY + 15);
      ctx.lineTo(comparatorX - 20, comparatorY + 15);
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('输入-', comparatorX - 25, comparatorY + 25);

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(comparatorX - 20, comparatorY - 25);
      ctx.lineTo(comparatorX + 25, comparatorY);
      ctx.lineTo(comparatorX - 20, comparatorY + 25);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', comparatorX - 8, comparatorY - 8);
      ctx.fillText('−', comparatorX - 8, comparatorY + 12);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('比较器', comparatorX + 2, comparatorY + 45);

      const transistorX = 450;
      const transistorY = 200;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(comparatorX + 25, comparatorY);
      ctx.lineTo(transistorX - 30, comparatorY);
      ctx.lineTo(transistorX - 30, transistorY);
      ctx.lineTo(transistorX - 15, transistorY);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('基极', transistorX - 22, transistorY - 8);

      ctx.fillStyle = isTransistorOn ? '#22c55e' : '#94a3b8';
      ctx.beginPath();
      ctx.rect(transistorX - 15, transistorY - 20, 20, 40);
      ctx.fill();
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.strokeRect(transistorX - 15, transistorY - 20, 20, 40);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(transistorX - 15, transistorY - 12);
      ctx.lineTo(transistorX - 22, transistorY - 12);
      ctx.moveTo(transistorX - 15, transistorY + 12);
      ctx.lineTo(transistorX - 22, transistorY + 12);
      ctx.moveTo(transistorX + 5, transistorY);
      ctx.lineTo(transistorX - 15, transistorY - 8);
      ctx.lineTo(transistorX - 15, transistorY + 8);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('三极管', transistorX - 5, transistorY + 45);

      const relayX = 550;
      const relayY = 120;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(transistorX + 5, transistorY - 10);
      ctx.lineTo(transistorX + 30, transistorY - 10);
      ctx.lineTo(transistorX + 30, relayY);
      ctx.lineTo(relayX - 25, relayY);
      ctx.stroke();

      ctx.fillStyle = isRelayOn ? '#22c55e' : '#94a3b8';
      ctx.fillRect(relayX - 25, relayY - 20, 50, 40);
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.strokeRect(relayX - 25, relayY - 20, 50, 40);

      ctx.strokeStyle = isRelayOn ? '#166534' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(relayX - 15, relayY - 12, 30, 24);
      ctx.stroke();

      if (isRelayOn) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(relayX + 20, relayY - 15, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(relayX + 20, relayY - 15, 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('继电器', relayX, relayY + 35);

      const ledX = 580;
      const ledY = 300;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(relayX + 25, relayY + 10);
      ctx.lineTo(relayX + 40, relayY + 10);
      ctx.lineTo(relayX + 40, ledY - 30);
      ctx.lineTo(ledX, ledY - 30);
      ctx.stroke();

      if (isLedOn) {
        const ledGlow = 0.5 + Math.sin(stateRef.current.time * 5) * 0.2;
        const glowGrad = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, 50);
        glowGrad.addColorStop(0, `rgba(239, 68, 68, ${ledGlow})`);
        glowGrad.addColorStop(0.5, `rgba(239, 68, 68, ${ledGlow * 0.5})`);
        glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 50, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isLedOn ? '#ef4444' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(ledX, ledY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = isLedOn ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(ledX - 5, ledY - 5, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(ledX - 8, ledY + 15, 16, 8);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ledX, ledY + 23);
      ctx.lineTo(ledX, ledY + 45);
      ctx.lineTo(ledX - 80, ledY + 45);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(ledX - 100, ledY + 35, 20, 20);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(ledX - 100, ledY + 35, 20, 20);
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', ledX - 90, ledY + 50);
      ctx.fillText('电源', ledX - 90, ledY + 70);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 200, 110, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`光强: ${lightIntensity.toFixed(0)}%`, 35, 45);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`阈值: ${threshold.toFixed(0)}%`, 35, 65);
      ctx.fillStyle = isLedOn ? '#4ade80' : '#f87171';
      ctx.fillText(`LED状态: ${isLedOn ? '亮' : '灭'}`, 35, 85);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`比较结果: ${lightIntensity < threshold ? '光强<阈值' : '光强≥阈值'}`, 35, 105);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`继电器: ${isRelayOn ? '吸合' : '断开'}`, 35, 125);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 280, height - 75, 260, 55, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('光控原理：光强↓ → 光敏电阻↑ → 比较器输出→三极管→继电器→LED亮', width - 150, height - 45);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('光强低于阈值时LED点亮，高于阈值时熄灭', width - 150, height - 28);

      const barX = width - 180;
      const barY = 160;
      const barWidth = 25;
      const barHeight = 200;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.roundRect(barX - 10, barY - 20, barWidth + 20, barHeight + 40, 6);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      const lightBarHeight = (lightIntensity / 100) * barHeight;
      const lightGrad = ctx.createLinearGradient(barX, barY + barHeight, barX, barY + barHeight - lightBarHeight);
      lightGrad.addColorStop(0, '#fbbf24');
      lightGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(barX, barY + barHeight - lightBarHeight, barWidth, lightBarHeight);

      const thresholdY = barY + barHeight - (threshold / 100) * barHeight;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(barX - 5, thresholdY);
      ctx.lineTo(barX + barWidth + 5, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('阈值', barX + barWidth + 10, thresholdY + 4);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('光强指示', barX + barWidth / 2, barY - 8);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;
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
  }, [isRunning, lightIntensity, threshold, isLedOn, isRelayOn, isTransistorOn]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default SensorSimulation;
