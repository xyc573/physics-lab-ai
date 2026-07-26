import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const InterferenceSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
  });

  const wavelength = params.wavelength || 550;
  const slitDistance = params.slitDistance || 0.5;
  const screenDistance = params.screenDistance || 100;

  const wavelengthNm = wavelength;
  const slitDistanceMm = slitDistance;
  const screenDistanceCm = screenDistance;

  const deltaX = (screenDistanceCm * 10 * wavelengthNm * 1e-6) / slitDistanceMm;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const wavelengthToColor = (wl: number): string => {
      let r = 0, g = 0, b = 0;
      if (wl >= 380 && wl < 440) {
        r = -(wl - 440) / (440 - 380);
        g = 0;
        b = 1;
      } else if (wl >= 440 && wl < 490) {
        r = 0;
        g = (wl - 440) / (490 - 440);
        b = 1;
      } else if (wl >= 490 && wl < 510) {
        r = 0;
        g = 1;
        b = -(wl - 510) / (510 - 490);
      } else if (wl >= 510 && wl < 580) {
        r = (wl - 510) / (580 - 510);
        g = 1;
        b = 0;
      } else if (wl >= 580 && wl < 645) {
        r = 1;
        g = -(wl - 645) / (645 - 580);
        b = 0;
      } else if (wl >= 645 && wl <= 780) {
        r = 1;
        g = 0;
        b = 0;
      }
      return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const lightSourceX = 60;
      const lightSourceY = height / 2;

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(lightSourceX, lightSourceY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('光源', lightSourceX, lightSourceY + 45);

      const singleSlitX = 160;
      const singleSlitY = height / 2;
      const singleSlitHeight = 50;

      ctx.fillStyle = '#334155';
      ctx.fillRect(singleSlitX - 5, singleSlitY - singleSlitHeight - 60, 10, 60);
      ctx.fillRect(singleSlitX - 5, singleSlitY + singleSlitHeight, 10, 60);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(singleSlitX - 5, singleSlitY - singleSlitHeight - 60, 10, 60);
      ctx.strokeRect(singleSlitX - 5, singleSlitY + singleSlitHeight, 10, 60);

      ctx.fillStyle = '#1e293b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('单缝', singleSlitX, singleSlitY + singleSlitHeight + 75);

      const slitX = 290;
      const slitY = height / 2;
      const slitGap = slitDistanceMm * 80;
      const slitWidth = 8;
      const slitHeight = 100;

      ctx.fillStyle = '#334155';
      ctx.fillRect(slitX - 5, slitY - slitHeight - slitGap / 2, 10, slitHeight);
      ctx.fillRect(slitX - 5, slitY + slitGap / 2, 10, slitHeight);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(slitX - 5, slitY - slitHeight - slitGap / 2, 10, slitHeight);
      ctx.strokeRect(slitX - 5, slitY + slitGap / 2, 10, slitHeight);

      ctx.fillStyle = '#1e293b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('双缝', slitX, slitY + slitGap / 2 + slitHeight + 18);

      const screenX = 620;
      const screenTop = 60;
      const screenBottom = height - 60;
      const screenHeight = screenBottom - screenTop;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(screenX - 8, screenTop, 16, screenHeight);

      const fringeScale = screenHeight / 8;
      const centerY = screenTop + screenHeight / 2;

      for (let y = screenTop; y < screenBottom; y++) {
        const relY = (y - centerY) / fringeScale;
        const pathDiff = (slitDistanceMm * 1e-3 * relY * 1e-2) / (screenDistanceCm * 1e-2);
        const phase = (pathDiff / (wavelengthNm * 1e-9)) * Math.PI * 2;
        const intensity = Math.cos(phase / 2) ** 2;

        const baseColor = wavelengthToColor(wavelengthNm);
        const match = baseColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
        if (match) {
          const r = Math.floor(parseInt(match[1]) * intensity);
          const g = Math.floor(parseInt(match[2]) * intensity);
          const b = Math.floor(parseInt(match[3]) * intensity);
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }
        ctx.fillRect(screenX - 6, y, 12, 1);
      }

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX - 8, screenTop, 16, screenHeight);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('光屏', screenX, screenBottom + 20);

      const waveSpeed = 2;
      const wavePhase = stateRef.current.time * waveSpeed;
      const numWavefronts = 8;
      const waveSpacing = 30;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < numWavefronts; i++) {
        const offset = ((wavePhase + i * waveSpacing) % (waveSpacing * numWavefronts));
        const x = lightSourceX + offset;
        if (x < singleSlitX - 10) {
          ctx.beginPath();
          ctx.arc(lightSourceX, lightSourceY, offset, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }
      }

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 10; i++) {
        const offset = ((wavePhase + i * 25) % (slitX - singleSlitX));
        const r = offset;
        if (r > 0 && r < slitX - singleSlitX) {
          ctx.beginPath();
          ctx.arc(singleSlitX, singleSlitY, r, -Math.PI / 4, Math.PI / 4);
          ctx.stroke();
        }
      }

      const slit1Y = slitY - slitGap / 2 + slitHeight / 2;
      const slit2Y = slitY + slitGap / 2 + slitHeight / 2;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const offset = ((wavePhase + i * 20) % (screenX - slitX));
        const r = offset;
        if (r > 0 && r < screenX - slitX) {
          ctx.beginPath();
          ctx.arc(slitX, slit1Y, r, -Math.PI / 4, Math.PI / 4);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(slitX, slit2Y, r, -Math.PI / 4, Math.PI / 4);
          ctx.stroke();
        }
      }

      const labelY1 = slit1Y;
      const labelY2 = slit2Y;

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(slitX + 20, labelY1);
      ctx.lineTo(slitX + 40, labelY1);
      ctx.moveTo(slitX + 20, labelY2);
      ctx.lineTo(slitX + 40, labelY2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(slitX + 30, labelY1);
      ctx.lineTo(slitX + 30, labelY2);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`d=${slitDistanceMm.toFixed(2)}mm`, slitX + 45, (labelY1 + labelY2) / 2 + 4);

      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(slitX, height - 30);
      ctx.lineTo(screenX, height - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#059669';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`L=${screenDistanceCm.toFixed(0)}cm`, (slitX + screenX) / 2, height - 18);

      const fringeY = centerY + deltaX * fringeScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(screenX + 20, centerY);
      ctx.lineTo(screenX + 40, centerY);
      ctx.moveTo(screenX + 20, fringeY);
      ctx.lineTo(screenX + 40, fringeY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX + 30, centerY);
      ctx.lineTo(screenX + 30, fringeY);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Δx`, screenX + 45, (centerY + fringeY) / 2 + 4);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 200, 105, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`波长 λ = ${wavelengthNm.toFixed(0)} nm`, 35, 45);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`缝间距 d = ${slitDistanceMm.toFixed(2)} mm`, 35, 65);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`屏距离 L = ${screenDistanceCm.toFixed(0)} cm`, 35, 85);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`条纹间距 Δx = ${(deltaX * 10).toFixed(2)} mm`, 35, 105);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 260, height - 75, 240, 55, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Δx = Lλ / d', width - 140, height - 42);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('双缝干涉条纹间距公式', width - 140, height - 25);
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
  }, [isRunning, wavelength, slitDistance, screenDistance, deltaX]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default InterferenceSimulation;
