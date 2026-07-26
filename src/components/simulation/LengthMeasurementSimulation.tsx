import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const LengthMeasurementSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
  });

  const objectLength = params.objectLength || 2.42;

  const mainReading = Math.floor(objectLength * 10) / 10;
  const vernierReading = Math.round((objectLength - mainReading) * 1000 / 0.02) * 0.02;
  const totalReading = mainReading + vernierReading / 10;

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
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const caliperX = 50;
      const caliperY = 100;
      const caliperWidth = 600;
      const caliperHeight = 120;

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(caliperX, caliperY + 30, caliperWidth, 50, 5);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(caliperX, caliperY + 25, 80, 60);

      ctx.fillStyle = '#334155';
      ctx.fillRect(caliperX, caliperY + 20, 30, 70);

      ctx.fillStyle = '#475569';
      const sliderX = caliperX + 150 + objectLength * 100;
      ctx.fillRect(sliderX - 5, caliperY + 15, 70, 80);
      ctx.fillStyle = '#334155';
      ctx.fillRect(sliderX + 50, caliperY + 20, 20, 70);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(sliderX + 60, caliperY + 85, 40, 15);

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(sliderX + 5, caliperY + 5, 50, 12, 4);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      const objStartX = caliperX + 30;
      const objEndX = sliderX + 50;
      ctx.fillRect(objStartX, caliperY - 40, objEndX - objStartX, 25);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(objStartX + 5, caliperY - 37, (objEndX - objStartX) - 10, 6);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(objStartX, caliperY - 50);
      ctx.lineTo(objStartX, caliperY + 10);
      ctx.moveTo(objEndX, caliperY - 50);
      ctx.lineTo(objEndX, caliperY + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('待测物体', (objStartX + objEndX) / 2, caliperY - 55);

      const mainScaleY = caliperY + 40;
      const mainScaleStartX = caliperX + 85;
      const mainScaleEndX = caliperX + caliperWidth - 20;
      const pxPerMm = 10;

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(mainScaleStartX - 5, mainScaleY - 15, mainScaleEndX - mainScaleStartX + 10, 30);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(mainScaleStartX - 5, mainScaleY - 15, mainScaleEndX - mainScaleStartX + 10, 30);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';

      const mainScaleStartMm = 0;
      const mainScaleEndMm = 50;

      for (let mm = mainScaleStartMm; mm <= mainScaleEndMm; mm++) {
        const x = mainScaleStartX + mm * pxPerMm;
        if (x > mainScaleEndX) break;

        const isCm = mm % 10 === 0;
        const isHalfCm = mm % 5 === 0;
        const tickHeight = isCm ? 12 : isHalfCm ? 8 : 5;

        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, mainScaleY - tickHeight, 1.5, tickHeight * 2);

        if (isCm) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`${mm / 10}`, x, mainScaleY - 18);
        }
      }

      const vernierScaleY = caliperY + 65;
      const vernierStartX = sliderX + 5;
      const vernierDivisions = 50;
      const vernierPxPerDiv = (pxPerMm * 49) / vernierDivisions;

      ctx.fillStyle = '#dcfce7';
      ctx.fillRect(vernierStartX - 5, vernierScaleY - 12, vernierDivisions * vernierPxPerDiv + 10, 25);
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1;
      ctx.strokeRect(vernierStartX - 5, vernierScaleY - 12, vernierDivisions * vernierPxPerDiv + 10, 25);

      const alignedIndex = Math.round((objectLength * 10 - Math.floor(objectLength * 10)) * 50);

      for (let i = 0; i <= vernierDivisions; i++) {
        const x = vernierStartX + i * vernierPxPerDiv;
        const isZero = i === 0;
        const isFive = i % 5 === 0;
        const isTen = i % 10 === 0;
        const tickHeight = isZero ? 14 : isTen ? 10 : isFive ? 7 : 4;

        const isAligned = i === alignedIndex;

        ctx.fillStyle = isAligned ? '#dc2626' : '#166534';
        ctx.fillRect(x, vernierScaleY - tickHeight, 1.5, tickHeight * 2);

        if (isZero) {
          ctx.fillStyle = '#166534';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('0', x, vernierScaleY - 15);
        } else if (isTen) {
          ctx.fillStyle = '#166534';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${i / 10}`, x, vernierScaleY - 15);
        }
      }

      const zeroLineX = vernierStartX;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(zeroLineX, mainScaleY - 18);
      ctx.lineTo(zeroLineX, mainScaleY + 18);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('0线', zeroLineX, mainScaleY - 22);

      const magnifierX = 100;
      const magnifierY = 280;
      const magnifierWidth = 500;
      const magnifierHeight = 120;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(magnifierX, magnifierY, magnifierWidth, magnifierHeight, 10);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🔍 刻度放大图', magnifierX + 15, magnifierY + 22);

      const magMainY = magnifierY + 55;
      const magStartX = magnifierX + 30;
      const magPxPerMm = 25;

      const mainScaleVal = Math.floor(objectLength * 10);

      for (let i = -2; i <= 12; i++) {
        const mm = mainScaleVal + i;
        const x = magStartX + (i + 2) * magPxPerMm;
        const isCm = mm % 10 === 0;
        const isHalf = mm % 5 === 0;
        const tickH = isCm ? 18 : isHalf ? 12 : 6;

        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, magMainY - tickH, 2, tickH * 2);

        if (isCm) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${(mm / 10).toFixed(0)}`, x, magMainY - tickH - 5);
        }
      }

      const magVernierY = magnifierY + 85;
      const magVernierPxPerDiv = (magPxPerMm * 49) / 50;
      const magVernierStartX = magStartX + 2 * magPxPerMm + (objectLength * 10 - mainScaleVal) * magPxPerMm;

      for (let i = 0; i <= 20; i++) {
        const x = magVernierStartX + i * magVernierPxPerDiv;
        const isZero = i === 0;
        const isFive = i % 5 === 0;
        const isTen = i % 10 === 0;
        const tickH = isZero ? 16 : isTen ? 12 : isFive ? 8 : 5;
        const isAligned = i === alignedIndex;

        ctx.fillStyle = isAligned ? '#dc2626' : '#166534';
        ctx.fillRect(x, magVernierY - tickH, 2, tickH * 2);

        if (isZero || isTen) {
          ctx.fillStyle = '#166534';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${i}`, x, magVernierY + tickH + 12);
        }
      }

      const alignX = magVernierStartX + alignedIndex * magVernierPxPerDiv;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(alignX, magMainY - 20);
      ctx.lineTo(alignX, magVernierY + 25);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`第 ${alignedIndex} 格对齐`, alignX + 8, magMainY - 5);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width - 220, 20, 200, 100, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`主尺读数: ${mainReading.toFixed(1)} cm`, width - 205, 45);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`游标读数: ${(vernierReading * 0.1).toFixed(2)} mm`, width - 205, 65);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`总读数: ${totalReading.toFixed(3)} cm`, width - 205, 85);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`精度: 0.02 mm (50分度)`, width - 205, 105);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(20, height - 65, 320, 45, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('读数方法：主尺读数 + 游标对齐格数 × 精度', 35, height - 42);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px sans-serif';
      ctx.fillText('= 主尺(mm) + 对齐格数 × 0.02 mm', 35, height - 25);
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
  }, [isRunning, objectLength, mainReading, vernierReading, totalReading]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default LengthMeasurementSimulation;
