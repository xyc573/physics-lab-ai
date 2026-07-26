import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const OilFilmSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    spreadProgress: 1,
  });

  const solutionVolume = params.solutionVolume || 1;
  const concentration = params.concentration || 0.1;
  const oilFilmArea = params.oilFilmArea || 2;

  const oilVolume = solutionVolume * concentration;
  const molecularDiameter = oilVolume / oilFilmArea;

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
      bgGrad.addColorStop(0, '#f0f9ff');
      bgGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const dishCenterX = width / 2 - 80;
      const dishCenterY = height / 2 + 20;
      const dishRadius = 180;

      ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.beginPath();
      ctx.ellipse(dishCenterX, dishCenterY + 8, dishRadius, dishRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(dishCenterX, dishCenterY, dishRadius, dishRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(dishCenterX, dishCenterY, dishRadius, dishRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
      ctx.beginPath();
      ctx.ellipse(dishCenterX, dishCenterY, dishRadius - 5, dishRadius * 0.35 - 2, 0, 0, Math.PI * 2);
      ctx.fill();

      const oilRadius = Math.sqrt(oilFilmArea / Math.PI) * 70;
      const displayRadius = oilRadius * stateRef.current.spreadProgress;

      const oilGrad = ctx.createRadialGradient(
        dishCenterX, dishCenterY - 5, 0,
        dishCenterX, dishCenterY - 5, displayRadius
      );
      oilGrad.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
      oilGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
      oilGrad.addColorStop(0.8, 'rgba(217, 119, 6, 0.5)');
      oilGrad.addColorStop(1, 'rgba(180, 83, 9, 0.3)');

      ctx.fillStyle = oilGrad;
      ctx.beginPath();
      ctx.ellipse(dishCenterX, dishCenterY - 2, displayRadius, displayRadius * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(180, 83, 9, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(dishCenterX, dishCenterY - 2, displayRadius, displayRadius * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
      for (let i = 0; i < rainbowColors.length; i++) {
        const r = displayRadius * (0.3 + i * 0.12);
        ctx.strokeStyle = rainbowColors[i] + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(dishCenterX, dishCenterY - 2, r, r * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('水槽（水面）', dishCenterX, dishCenterY + dishRadius * 0.35 + 25);

      const crossSectionX = width - 140;
      const crossSectionY = 120;
      const crossSectionWidth = 120;
      const crossSectionHeight = 200;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.05)';
      ctx.beginPath();
      ctx.roundRect(crossSectionX - 10, crossSectionY - 30, crossSectionWidth + 20, crossSectionHeight + 50, 8);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('侧视示意图', crossSectionX + crossSectionWidth / 2, crossSectionY - 10);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(crossSectionX, crossSectionY + crossSectionHeight - 10, crossSectionWidth, 10);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fillRect(crossSectionX + 5, crossSectionY + 50, crossSectionWidth - 10, crossSectionHeight - 60);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(crossSectionX + 5, crossSectionY + 50, crossSectionWidth - 10, crossSectionHeight - 60);

      const moleculeLayerY = crossSectionY + 52;
      const moleculeDiameterPx = Math.max(4, Math.min(20, molecularDiameter * 5000));

      ctx.fillStyle = '#f59e0b';
      const moleculeCount = Math.floor((crossSectionWidth - 10) / (moleculeDiameterPx + 2));
      for (let i = 0; i < moleculeCount; i++) {
        const mx = crossSectionX + 5 + i * (moleculeDiameterPx + 2) + moleculeDiameterPx / 2 + 1;
        ctx.beginPath();
        ctx.arc(mx, moleculeLayerY + moleculeDiameterPx / 2, moleculeDiameterPx / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(crossSectionX - 5, moleculeLayerY);
      ctx.lineTo(crossSectionX + crossSectionWidth + 5, moleculeLayerY);
      ctx.moveTo(crossSectionX - 5, moleculeLayerY + moleculeDiameterPx);
      ctx.lineTo(crossSectionX + crossSectionWidth + 5, moleculeLayerY + moleculeDiameterPx);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('d', crossSectionX - 18, moleculeLayerY + moleculeDiameterPx / 2 + 4);

      ctx.fillStyle = '#1e293b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('单分子层', crossSectionX + crossSectionWidth / 2, moleculeLayerY + moleculeDiameterPx + 15);

      const dropperX = dishCenterX - 30;
      const dropperTopY = 30;
      const dropperBottomY = dishCenterY - dishRadius * 0.35 + 10;

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(dropperX - 8, dropperTopY, 16, 60);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dropperX - 8, dropperTopY, 16, 60);

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(dropperX - 8, dropperTopY + 60);
      ctx.lineTo(dropperX + 8, dropperTopY + 60);
      ctx.lineTo(dropperX + 4, dropperTopY + 75);
      ctx.lineTo(dropperX - 4, dropperTopY + 75);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(dropperX - 6, dropperTopY + 10, 12, 45);

      if (isRunning && stateRef.current.spreadProgress < 1) {
        const dropY = dropperTopY + 80 + (stateRef.current.time * 100) % 100;
        if (dropY < dropperBottomY - dropperTopY - 50) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(dropperX, dropperTopY + 80 + dropY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 220, 130, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`溶液体积 V₀ = ${solutionVolume.toFixed(2)} mL`, 35, 45);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`浓度 c = ${(concentration * 100).toFixed(1)}%`, 35, 65);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`油酸体积 V = ${oilVolume.toFixed(4)} mL`, 35, 85);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`油膜面积 S = ${oilFilmArea.toFixed(2)} m²`, 35, 105);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`分子直径 d = ${(molecularDiameter * 1e9).toFixed(1)} nm`, 35, 125);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`= ${(molecularDiameter * 1e10).toFixed(1)} Å`, 35, 145);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 280, height - 80, 260, 60, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('d = V / S', width - 150, height - 45);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('分子直径 = 油酸体积 / 油膜面积', width - 150, height - 28);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;
        stateRef.current.time += dt;

        if (stateRef.current.spreadProgress < 1) {
          stateRef.current.spreadProgress += dt * 0.3;
          if (stateRef.current.spreadProgress > 1) {
            stateRef.current.spreadProgress = 1;
          }
        }
      } else {
        lastTime = currentTime;
      }

      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    stateRef.current.spreadProgress = 0.3;

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, solutionVolume, concentration, oilFilmArea, oilVolume, molecularDiameter]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default OilFilmSimulation;
