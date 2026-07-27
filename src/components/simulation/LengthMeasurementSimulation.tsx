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
  const instrument = params.instrument || 1;

  const objectLengthMm = objectLength * 10;

  let mainReadingCm = 0;
  let vernierReadingMm = 0;
  let totalReadingCm = 0;
  let precision = '';
  let fixedReadingMm = 0;
  let movableReadingMm = 0;
  let thimbleAlignedIndex = 0;

  if (instrument === 1) {
    const mainVal = Math.floor(objectLengthMm);
    mainReadingCm = mainVal / 10;
    const fractional = objectLengthMm - mainVal;
    const alignedIdx = Math.round(fractional / 0.02);
    vernierReadingMm = alignedIdx * 0.02;
    totalReadingCm = (mainVal + vernierReadingMm) / 10;
    precision = '0.02 mm (50分度)';
  } else if (instrument === 2) {
    fixedReadingMm = Math.floor(objectLengthMm * 2) / 2;
    const fractional = objectLengthMm - fixedReadingMm;
    thimbleAlignedIndex = Math.floor(fractional / 0.01);
    movableReadingMm = fractional;
    totalReadingCm = objectLength;
    precision = '0.001 mm (千分尺)';
  } else if (instrument === 3) {
    mainReadingCm = Math.floor(objectLength * 10) / 10;
    totalReadingCm = objectLength;
    precision = '0.1 mm (估读)';
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const drawBackground = () => {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawDataPanel = (lines: { text: string; color: string }[]) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width - 220, 20, 200, 20 + lines.length * 22, 8);
      ctx.fill();
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      lines.forEach((line, i) => {
        ctx.fillStyle = line.color;
        ctx.fillText(line.text, width - 205, 45 + i * 22);
      });
    };

    const drawVernierCaliper = () => {
      const caliperX = 50;
      const caliperY = 100;
      const caliperWidth = 600;
      const pxPerMm = 10;

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(caliperX, caliperY + 30, caliperWidth, 50, 5);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(caliperX, caliperY + 25, 80, 60);

      ctx.fillStyle = '#334155';
      ctx.fillRect(caliperX, caliperY + 20, 30, 70);

      const sliderX = caliperX + 150 + objectLengthMm * pxPerMm;
      ctx.fillStyle = '#475569';
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

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(mainScaleStartX - 5, mainScaleY - 15, mainScaleEndX - mainScaleStartX + 10, 30);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(mainScaleStartX - 5, mainScaleY - 15, mainScaleEndX - mainScaleStartX + 10, 30);

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
          ctx.textAlign = 'center';
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

      const alignedIndex = Math.round((objectLengthMm - Math.floor(objectLengthMm)) / 0.02);

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

      const mainScaleVal = Math.floor(objectLengthMm);

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
      const magVernierStartX = magStartX + 2 * magPxPerMm + (objectLengthMm - mainScaleVal) * magPxPerMm;

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

      drawDataPanel([
        { text: `主尺读数: ${mainReadingCm.toFixed(1)} cm`, color: '#4ade80' },
        { text: `游标读数: ${vernierReadingMm.toFixed(2)} mm`, color: '#60a5fa' },
        { text: `总读数: ${totalReadingCm.toFixed(3)} cm`, color: '#fbbf24' },
        { text: `精度: ${precision}`, color: '#f472b6' },
      ]);

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

    const drawMicrometer = () => {
      const centerX = 350;
      const centerY = 140;

      ctx.fillStyle = '#f97316';
      const objY = centerY - 80;
      const objWidth = objectLengthMm * 8;
      ctx.fillRect(centerX - objWidth / 2, objY, objWidth, 20);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(centerX - objWidth / 2 + 5, objY + 3, objWidth - 10, 5);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX - objWidth / 2, objY - 10);
      ctx.lineTo(centerX - objWidth / 2, objY + 30);
      ctx.moveTo(centerX + objWidth / 2, objY - 10);
      ctx.lineTo(centerX + objWidth / 2, objY + 30);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('待测物体', centerX, objY - 15);

      const frameLeftX = 100;
      const frameRightX = 600;
      const frameY = centerY;

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(frameLeftX, frameY - 40);
      ctx.lineTo(frameLeftX - 30, frameY);
      ctx.lineTo(frameLeftX, frameY + 40);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(frameLeftX + 15, frameY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(frameLeftX + 15, frameY, 14, 0, Math.PI * 2);
      ctx.fill();

      const anvilX = frameLeftX + 35;
      ctx.fillStyle = '#334155';
      ctx.fillRect(anvilX, frameY - 12, 25, 24);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(anvilX + 20, frameY - 10, 8, 20);

      const spindleStartX = anvilX + 28;
      const spindleEndX = spindleStartX + objectLengthMm * 8;

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(spindleStartX, frameY - 8, spindleEndX - spindleStartX, 16);

      const sleeveX = spindleEndX;
      const sleeveWidth = 120;

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(sleeveX, frameY - 20, sleeveWidth, 40);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(sleeveX, frameY - 20, sleeveWidth, 40);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';

      const fixedScaleStartMm = Math.floor(objectLengthMm - 3);
      const fixedScaleEndMm = fixedScaleStartMm + 12;

      for (let mm = fixedScaleStartMm; mm <= fixedScaleEndMm; mm += 0.5) {
        const offset = (mm - objectLengthMm) * 8;
        const x = sleeveX + 60 + offset;
        if (x < sleeveX + 5 || x > sleeveX + sleeveWidth - 5) continue;

        const isWhole = Number.isInteger(mm);
        const tickH = isWhole ? 15 : 8;

        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, frameY - tickH, 1.5, tickH);

        if (isWhole && mm >= 0) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`${mm}`, x, frameY - tickH - 3);
        }
      }

      const thimbleX = sleeveX + sleeveWidth;
      const thimbleWidth = 80;
      const thimbleRadius = 30;

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(thimbleX, frameY - thimbleRadius, thimbleWidth, thimbleRadius * 2, 5);
      ctx.fill();

      ctx.fillStyle = '#334155';
      for (let i = 0; i < 8; i++) {
        const y = frameY - thimbleRadius + 5 + i * 8;
        ctx.fillRect(thimbleX + 5, y, thimbleWidth - 10, 3);
      }

      ctx.fillStyle = '#dcfce7';
      ctx.fillRect(thimbleX - 3, frameY - 18, 6, 36);
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1;
      ctx.strokeRect(thimbleX - 3, frameY - 18, 6, 36);

      const thimbleRotation = (objectLengthMm - Math.floor(objectLengthMm * 2) / 2) / 0.01;

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(thimbleX, frameY);
      ctx.lineTo(thimbleX + 10, frameY);
      ctx.stroke();

      const ratchetX = thimbleX + thimbleWidth;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(ratchetX, frameY - 15, 35, 30, 5);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(ratchetX + 35, frameY, 8, 0, Math.PI * 2);
      ctx.fill();

      const magnifierX = 100;
      const magnifierY = 280;
      const magnifierWidth = 500;
      const magnifierHeight = 140;

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
      ctx.fillText('🔍 刻度放大图（固定刻度 + 可动刻度）', magnifierX + 15, magnifierY + 22);

      const magFixedY = magnifierY + 55;
      const magStartX = magnifierX + 30;
      const magPxPerMm = 30;

      const fixedVal = Math.floor(objectLengthMm * 2) / 2;

      for (let i = -4; i <= 8; i++) {
        const mm = fixedVal + i * 0.5;
        const x = magStartX + (i + 4) * magPxPerMm * 0.5;
        const isWhole = Number.isInteger(mm);
        const tickH = isWhole ? 18 : 10;

        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, magFixedY - tickH, 2, tickH * 2);

        if (isWhole && mm >= 0) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${mm.toFixed(0)}`, x, magFixedY - tickH - 5);
        }
      }

      const magMovableY = magnifierY + 105;
      const magMovablePxPerDiv = 6;
      const fractionalDiv = movableReadingMm / 0.01;
      const magMovableRefX = magStartX + 4 * magPxPerMm * 0.5;

      for (let i = -12; i <= 20; i++) {
        const div = Math.floor(fractionalDiv) + i;
        const offsetFromRef = div - fractionalDiv;
        const x = magMovableRefX + offsetFromRef * magMovablePxPerDiv;
        const isZero = div % 50 === 0;
        const isFive = div % 5 === 0;
        const tickH = isZero ? 16 : isFive ? 12 : 6;

        ctx.fillStyle = '#166534';
        ctx.fillRect(x, magMovableY - tickH, 1.5, tickH * 2);

        if (isFive && div >= 0 && div < 50) {
          ctx.fillStyle = '#166534';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          const displayVal = ((div % 50) + 50) % 50;
          ctx.fillText(`${displayVal.toFixed(0)}`, x, magMovableY + tickH + 10);
        }
      }

      const refLineX = magMovableRefX;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(refLineX, magFixedY - 22);
      ctx.lineTo(refLineX, magMovableY + 25);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      const estDigit = Math.round((fractionalDiv - Math.floor(fractionalDiv)) * 10);
      ctx.fillText(`基准线 → 第${thimbleAlignedIndex}.${estDigit}格`, refLineX + 8, magFixedY - 5);

      const movableWhole = (thimbleAlignedIndex * 0.01).toFixed(2);
      const movableEstimate = ((movableReadingMm - thimbleAlignedIndex * 0.01) * 1000).toFixed(0);
      drawDataPanel([
        { text: `固定刻度: ${fixedReadingMm.toFixed(1)} mm`, color: '#4ade80' },
        { text: `可动刻度: ${movableWhole} mm`, color: '#60a5fa' },
        { text: `估读位: 0.00${movableEstimate} mm`, color: '#a78bfa' },
        { text: `总读数: ${(totalReadingCm * 10).toFixed(3)} mm`, color: '#fbbf24' },
        { text: `精度: ${precision}`, color: '#f472b6' },
      ]);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(20, height - 65, 360, 45, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('读数方法：固定刻度 + 可动刻度 × 0.01mm（含估读）', 35, height - 42);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px sans-serif';
      ctx.fillText('= 固定刻度(mm) + 可动格数 × 0.01 mm（估读到0.001mm）', 35, height - 25);
    };

    const drawRuler = () => {
      const rulerX = 50;
      const rulerY = 180;
      const rulerWidth = 600;
      const pxPerMm = 6;

      ctx.fillStyle = '#f97316';
      const objStartX = rulerX + 80;
      const objEndX = objStartX + objectLengthMm * pxPerMm;
      ctx.fillRect(objStartX, rulerY - 80, objEndX - objStartX, 30);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(objStartX + 5, rulerY - 77, (objEndX - objStartX) - 10, 8);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(objStartX, rulerY - 95);
      ctx.lineTo(objStartX, rulerY - 45);
      ctx.moveTo(objEndX, rulerY - 95);
      ctx.lineTo(objEndX, rulerY - 45);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('待测物体', (objStartX + objEndX) / 2, rulerY - 100);

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(rulerX, rulerY, rulerWidth, 60);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(rulerX, rulerY, rulerWidth, 60);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';

      const totalMm = Math.floor(rulerWidth / pxPerMm);

      for (let mm = 0; mm <= totalMm; mm++) {
        const x = rulerX + mm * pxPerMm;
        if (x > rulerX + rulerWidth) break;

        const isCm = mm % 10 === 0;
        const isHalfCm = mm % 5 === 0;
        const tickHeight = isCm ? 25 : isHalfCm ? 15 : 8;

        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, rulerY, 1.5, tickHeight);

        if (isCm) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`${mm / 10}`, x + 1, rulerY + 40);
        }
      }

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(objStartX, rulerY - 40);
      ctx.lineTo(objStartX, rulerY + 70);
      ctx.moveTo(objEndX, rulerY - 40);
      ctx.lineTo(objEndX, rulerY + 70);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('起点', objStartX, rulerY + 80);
      ctx.fillText('终点', objEndX, rulerY + 80);

      const magnifierX = 100;
      const magnifierY = 310;
      const magnifierWidth = 500;
      const magnifierHeight = 110;

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
      ctx.fillText('🔍 终点刻度放大图（需估读）', magnifierX + 15, magnifierY + 22);

      const magY = magnifierY + 50;
      const magStartX = magnifierX + 30;
      const magPxPerMm = 25;

      const endMm = objectLengthMm;
      const endMmFloor = Math.floor(endMm);
      const endMmFrac = endMm - endMmFloor;

      for (let i = -5; i <= 15; i++) {
        const mm = endMmFloor + i;
        const x = magStartX + (i + 5) * magPxPerMm;
        const isCm = mm % 10 === 0;
        const isHalf = mm % 5 === 0;
        const tickH = isCm ? 22 : isHalf ? 15 : 8;

        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, magY - tickH, 2, tickH * 2);

        if (isCm) {
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${(mm / 10).toFixed(1)}`, x, magY - tickH - 5);
        }
      }

      const endX = magStartX + (5 + endMmFrac) * magPxPerMm;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(endX, magY - 28);
      ctx.lineTo(endX, magY + 28);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('物体终点', endX + 8, magY - 10);

      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`估读位: ${(endMmFrac * 10).toFixed(1)} mm`, endX + 8, magY + 10);

      drawDataPanel([
        { text: `主尺读数: ${mainReadingCm.toFixed(1)} cm`, color: '#4ade80' },
        { text: `估读位: ${((objectLength - mainReadingCm) * 10).toFixed(1)} mm`, color: '#60a5fa' },
        { text: `总读数: ${totalReadingCm.toFixed(2)} cm`, color: '#fbbf24' },
        { text: `精度: ${precision}`, color: '#f472b6' },
      ]);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(20, height - 65, 340, 45, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('读数方法：准确值 + 估读位（分度值1mm，估读到0.1mm）', 35, height - 42);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px sans-serif';
      ctx.fillText('= 整毫米数 + 估读的0.1mm位', 35, height - 25);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      drawBackground();

      if (instrument === 1) {
        drawVernierCaliper();
      } else if (instrument === 2) {
        drawMicrometer();
      } else if (instrument === 3) {
        drawRuler();
      }

      const instrumentNames: Record<number, string> = {
        1: '游标卡尺（50分度）',
        2: '螺旋测微器（千分尺）',
        3: '刻度尺（毫米分度）',
      };

      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 180, 30, 6);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`📐 ${instrumentNames[instrument] || '测量工具'}`, 32, 40);
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
  }, [isRunning, objectLength, instrument, objectLengthMm, mainReadingCm, vernierReadingMm, totalReadingCm, precision, fixedReadingMm, movableReadingMm, thimbleAlignedIndex]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default LengthMeasurementSimulation;
