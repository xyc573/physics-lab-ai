import { useRef, useEffect, useState } from 'react';

interface Medium {
  name: string;
  n: number;
  color: string;
}

const MEDIA: Medium[] = [
  { name: '空气', n: 1.00, color: '#dbeafe' },
  { name: '水', n: 1.33, color: '#bae6fd' },
  { name: '玻璃', n: 1.50, color: '#93c5fd' },
  { name: '水晶', n: 1.55, color: '#818cf8' },
  { name: '钻石', n: 2.42, color: '#c084fc' },
];

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
  onParamChange?: (key: string, value: number) => void;
}

const RefractionSimulation: React.FC<Props> = ({ params, onParamChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  
  const incidentAngleDeg = params.incidentAngle || 30;
  const topMediumIdx = Math.floor(params.topMedium || 0);
  const bottomMediumIdx = Math.floor(params.bottomMedium || 2);
  const incidentFromBottom = params.incidentFromBottom || 0;
  
  const topMedium = MEDIA[Math.min(Math.max(topMediumIdx, 0), MEDIA.length - 1)];
  const bottomMedium = MEDIA[Math.min(Math.max(bottomMediumIdx, 0), MEDIA.length - 1)];
  
  const n1 = incidentFromBottom ? bottomMedium.n : topMedium.n;
  const n2 = incidentFromBottom ? topMedium.n : bottomMedium.n;
  
  const incidentAngle = (incidentAngleDeg * Math.PI) / 180;
  
  let hasTotalReflection = false;
  let refractedAngle = 0;
  let criticalAngle = 0;
  
  if (n1 > n2) {
    criticalAngle = Math.asin(n2 / n1);
    hasTotalReflection = incidentAngle > criticalAngle;
  }
  
  if (!hasTotalReflection) {
    const sinRefracted = (n1 * Math.sin(incidentAngle)) / n2;
    if (sinRefracted <= 1) {
      refractedAngle = Math.asin(sinRefracted);
    } else {
      hasTotalReflection = true;
    }
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

    const centerX = width / 2;
    const centerY = height / 2;
    const rayLength = 200;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 上方介质
      const topGrad = ctx.createLinearGradient(0, 0, 0, centerY);
      topGrad.addColorStop(0, topMedium.color);
      topGrad.addColorStop(1, topMedium.color + 'dd');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, centerY);

      // 下方介质
      const botGrad = ctx.createLinearGradient(0, centerY, 0, height);
      botGrad.addColorStop(0, bottomMedium.color + '99');
      botGrad.addColorStop(1, bottomMedium.color + '66');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, centerY, width, height - centerY);

      // 分界面
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // 介质标签
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${topMedium.name} n₁ = ${topMedium.n.toFixed(2)}`, 30, 40);
      ctx.fillText(`${bottomMedium.name} n₂ = ${bottomMedium.n.toFixed(2)}`, 30, centerY + 30);

      // 法线
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 200);
      ctx.lineTo(centerX, centerY + 200);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('法线', centerX + 8, centerY - 180);

      // 入射光线方向
      const incidentDir = incidentFromBottom ? -1 : 1; // -1从下往上，1从上往下
      const incidentEndX = centerX - Math.sin(incidentAngle) * rayLength;
      const incidentEndY = centerY - incidentDir * Math.cos(incidentAngle) * rayLength;
      
      const incidentGrad = ctx.createLinearGradient(incidentEndX, incidentEndY, centerX, centerY);
      incidentGrad.addColorStop(0, '#fbbf24');
      incidentGrad.addColorStop(1, '#f59e0b');
      
      ctx.strokeStyle = incidentGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(incidentEndX, incidentEndY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // 入射光箭头
      const arrowSize = 12;
      const arrowAngle = Math.atan2(centerY - incidentEndY, centerX - incidentEndX);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      const midX = (incidentEndX + centerX) / 2;
      const midY = (incidentEndY + centerY) / 2;
      ctx.moveTo(midX + Math.cos(arrowAngle) * arrowSize, midY + Math.sin(arrowAngle) * arrowSize);
      ctx.lineTo(midX + Math.cos(arrowAngle + 2.5) * arrowSize, midY + Math.sin(arrowAngle + 2.5) * arrowSize);
      ctx.lineTo(midX + Math.cos(arrowAngle - 2.5) * arrowSize, midY + Math.sin(arrowAngle - 2.5) * arrowSize);
      ctx.fill();

      // 入射角弧线
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const arcR = 50;
      if (incidentFromBottom) {
        ctx.arc(centerX, centerY, arcR, Math.PI / 2 - incidentAngle, Math.PI / 2, false);
      } else {
        ctx.arc(centerX, centerY, arcR, -Math.PI / 2 - incidentAngle, -Math.PI / 2, false);
      }
      ctx.stroke();
      
      ctx.fillStyle = '#059669';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const labelAngleBase = incidentFromBottom ? Math.PI / 2 : -Math.PI / 2;
      const labelAngle = labelAngleBase - incidentAngle / 2;
      ctx.fillText(`θ₁ = ${incidentAngleDeg.toFixed(0)}°`, centerX + Math.cos(labelAngle) * 70, centerY + Math.sin(labelAngle) * 70 + 4);

      // 反射光线
      const reflectAngle = incidentAngle;
      const reflectEndX = centerX + Math.sin(reflectAngle) * rayLength;
      const reflectEndY = centerY - incidentDir * Math.cos(reflectAngle) * rayLength;
      
      ctx.strokeStyle = hasTotalReflection ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = hasTotalReflection ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(reflectEndX, reflectEndY);
      ctx.stroke();

      // 折射光线
      if (!hasTotalReflection) {
        const refractEndX = centerX + Math.sin(refractedAngle) * rayLength;
        const refractEndY = centerY + incidentDir * Math.cos(refractedAngle) * rayLength;
        
        const refractGrad = ctx.createLinearGradient(centerX, centerY, refractEndX, refractEndY);
        refractGrad.addColorStop(0, '#f59e0b');
        refractGrad.addColorStop(1, '#d97706');
        
        ctx.strokeStyle = refractGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(refractEndX, refractEndY);
        ctx.stroke();

        // 折射光箭头
        const refractArrowAngle = Math.atan2(refractEndY - centerY, refractEndX - centerX);
        const refractMidX = (centerX + refractEndX) / 2;
        const refractMidY = (centerY + refractEndY) / 2;
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(
          refractMidX + Math.cos(refractArrowAngle) * arrowSize,
          refractMidY + Math.sin(refractArrowAngle) * arrowSize
        );
        ctx.lineTo(
          refractMidX + Math.cos(refractArrowAngle + 2.5) * arrowSize,
          refractMidY + Math.sin(refractArrowAngle + 2.5) * arrowSize
        );
        ctx.lineTo(
          refractMidX + Math.cos(refractArrowAngle - 2.5) * arrowSize,
          refractMidY + Math.sin(refractArrowAngle - 2.5) * arrowSize
        );
        ctx.fill();

        // 折射角弧线
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (incidentFromBottom) {
          ctx.arc(centerX, centerY, 60, -Math.PI / 2, -Math.PI / 2 + refractedAngle, false);
        } else {
          ctx.arc(centerX, centerY, 60, Math.PI / 2 - refractedAngle, Math.PI / 2, true);
        }
        ctx.stroke();
        
        ctx.fillStyle = '#7c3aed';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        const refractLabelBase = incidentFromBottom ? -Math.PI / 2 : Math.PI / 2;
        const refractLabelAngle = refractLabelBase + refractedAngle / 2;
        ctx.fillText(
          `θ₂ = ${((refractedAngle * 180) / Math.PI).toFixed(1)}°`,
          centerX + Math.cos(refractLabelAngle) * 85,
          centerY + Math.sin(refractLabelAngle) * 85 + 4
        );
      } else {
        // 全反射提示
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ 全反射现象 ✨', centerX + 120, centerY + 80);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#b91c1c';
        ctx.fillText(`临界角: ${((criticalAngle * 180) / Math.PI).toFixed(1)}°`, centerX + 120, centerY + 105);
        ctx.fillText(`（光密→光疏，n₁>n₂）`, centerX + 120, centerY + 125);
      }

      // 数据面板
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width - 230, 20, 210, 120, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`入射角 θ₁ = ${incidentAngleDeg.toFixed(1)}°`, width - 215, 45);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(hasTotalReflection ? '全反射!' : `折射角 θ₂ = ${((refractedAngle * 180) / Math.PI).toFixed(1)}°`, width - 215, 65);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`n₁ = ${n1.toFixed(2)}  n₂ = ${n2.toFixed(2)}`, width - 215, 85);
      ctx.fillStyle = '#fbbf24';
      const ratio = hasTotalReflection ? '-' : (Math.sin(incidentAngle) / Math.sin(refractedAngle)).toFixed(3);
      ctx.fillText(`sinθ₁/sinθ₂ = ${ratio}`, width - 215, 105);
      ctx.fillStyle = n1 > n2 ? '#f87171' : '#60a5fa';
      ctx.fillText(n1 > n2 ? '光密 → 光疏（可全反射）' : '光疏 → 光密（无全反射）', width - 215, 125);

      // 公式提示
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.roundRect(20, height - 80, 300, 60, 8);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('n₁ sin θ₁ = n₂ sin θ₂', 170, height - 45);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('折射定律（斯涅尔定律）', 170, height - 28);
    };

    const animate = () => {
      draw();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [incidentAngleDeg, topMedium, bottomMedium, incidentFromBottom, incidentAngle, refractedAngle, hasTotalReflection, criticalAngle, n1, n2]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
      
      {onParamChange && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">上方介质</label>
            <select
              value={topMediumIdx}
              onChange={(e) => onParamChange('topMedium', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {MEDIA.map((m, i) => (
                <option key={i} value={i}>{m.name} (n={m.n.toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">下方介质</label>
            <select
              value={bottomMediumIdx}
              onChange={(e) => onParamChange('bottomMedium', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {MEDIA.map((m, i) => (
                <option key={i} value={i}>{m.name} (n={m.n.toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!incidentFromBottom}
                onChange={(e) => onParamChange('incidentFromBottom', e.target.checked ? 1 : 0)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-slate-700">从下方介质入射（观察全反射可选这个）</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefractionSimulation;
