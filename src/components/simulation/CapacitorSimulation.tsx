import { useEffect, useRef, useState } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
  resetCount?: number;
}

const CapacitorSimulation: React.FC<Props> = ({ params, isRunning, resetCount = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const [mode, setMode] = useState<'charging' | 'discharging'>('charging');
  const stateRef = useRef({
    time: 0,
    voltage: 0,
    current: 0,
    voltageData: [] as { t: number; v: number }[],
    currentData: [] as { t: number; i: number }[],
  });

  // 参数（与实验配置一致：capacitance µF, resistance Ω, voltage V）
  const capacitance = (params.capacitance ?? 100) * 1e-6;
  const resistance = params.resistance ?? 10000;
  const sourceVoltage = params.voltage ?? 12;
  const tau = resistance * capacitance;

  // ---- 重置数据（模式切换、参数调节、点击重置时；暂停/继续不清空曲线）----
  useEffect(() => {
    const s = stateRef.current;
    s.time = 0;
    s.voltage = mode === 'charging' ? 0 : sourceVoltage;
    s.current = mode === 'charging' ? sourceVoltage / resistance : -sourceVoltage / resistance;
    s.voltageData = [{ t: 0, v: s.voltage }];
    s.currentData = [{ t: 0, i: s.current }];
  }, [mode, capacitance, resistance, sourceVoltage, resetCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 700;
    const height = 620;
    canvas.width = width;
    canvas.height = height;

    // roundRect 兼容性 fallback（旧浏览器无此 API）
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    };

    // ---- 电路图绘制（顶部区域）----
    const circuitTop = 40;
    const circuitBottom = 280;
    const circuitLeft = 60;
    const circuitRight = 640;
    const circuitCY = (circuitTop + circuitBottom) / 2;

    const drawCircuit = () => {
      const st = stateRef.current;
      const isCharging = mode === 'charging';

      // 背景
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 导线
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      const battX = circuitLeft + 40;
      const resX = circuitLeft + 200;
      const capX = circuitRight - 140;
      const swX = circuitRight - 60;

      ctx.beginPath();
      ctx.moveTo(battX, circuitTop - 20);
      ctx.lineTo(resX - 30, circuitTop - 20);
      ctx.moveTo(resX + 30, circuitTop - 20);
      ctx.lineTo(capX, circuitTop - 20);
      ctx.moveTo(capX + 40, circuitTop - 20);
      ctx.lineTo(swX, circuitTop - 20);
      ctx.moveTo(swX, circuitTop - 20);
      ctx.lineTo(swX, circuitBottom + 20);
      ctx.lineTo(circuitRight - 30, circuitBottom + 20);
      ctx.moveTo(circuitRight - 30, circuitBottom + 20);
      ctx.lineTo(battX, circuitBottom + 20);
      ctx.lineTo(battX, circuitCY + 30);
      ctx.moveTo(battX, circuitCY - 30);
      ctx.lineTo(battX, circuitTop - 20);
      ctx.stroke();

      // 电池
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(battX - 18, circuitCY - 30);
      ctx.lineTo(battX - 18, circuitCY + 30);
      ctx.moveTo(battX + 18, circuitCY - 30);
      ctx.lineTo(battX + 18, circuitCY + 30);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', battX - 8, circuitCY - 38);
      ctx.fillStyle = '#2563eb';
      ctx.fillText('−', battX + 8, circuitCY - 38);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`E=${sourceVoltage}V`, battX, circuitCY + 52);
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText('直流电源', battX, circuitCY + 66);

      // 电阻
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const rTop = circuitTop - 10;
      const rBot = circuitTop + 30;
      ctx.moveTo(resX - 30, rTop);
      ctx.lineTo(resX - 30, rBot);
      for (let i = 0; i < 6; i++) {
        const x = resX - 25 + i * 10;
        ctx.lineTo(x, rBot - (i % 2 === 0 ? 18 : 0));
      }
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      ctx.fillText('R', resX + 8, rBot + 16);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${(resistance / 1000).toFixed(1)}kΩ`, resX + 8, rBot + 30);

      // 电容
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(capX, circuitTop - 24);
      ctx.lineTo(capX, circuitTop + 24);
      ctx.moveTo(capX + 24, circuitTop - 24);
      ctx.lineTo(capX + 24, circuitTop + 24);
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.font = '14px sans-serif';
      ctx.fillText('C', capX + 12, circuitTop + 48);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${(capacitance * 1e6).toFixed(0)}µF`, capX + 12, circuitTop + 62);

      // 开关（单刀双掷）
      ctx.strokeStyle = isCharging ? '#16a34a' : '#b91c1c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(swX, circuitTop - 20);
      if (isCharging) {
        ctx.lineTo(swX + 28, circuitTop - 52);
      } else {
        ctx.lineTo(swX + 28, circuitBottom + 52);
      }
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(swX + 28, circuitTop - 52, 5, 0, Math.PI * 2);
      ctx.arc(swX + 28, circuitBottom + 52, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(swX, circuitTop - 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText('S', swX + 46, circuitTop - 30);

      // 电容器状态
      const chargeRatio = st.voltage / Math.max(sourceVoltage, 0.01);
      const capColor = `hsl(${120 * chargeRatio}, 65%, 45%)`;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
      ctx.beginPath();
      rr(capX - 60, circuitBottom - 30, 130, 52, 10);
      ctx.fill();
      ctx.fillStyle = capColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Vc = ${st.voltage.toFixed(2)} V`, capX, circuitBottom - 10);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText(`q = ${(st.voltage * capacitance * 1e6).toFixed(1)} µC`, capX, circuitBottom + 8);

      // 模式标签
      ctx.fillStyle = isCharging ? '#16a34a' : '#b91c1c';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(isCharging ? '⚡ 充电中' : '🔋 放电中', swX - 30, circuitTop + 60);

      // 实时读数
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      rr(circuitLeft + 5, circuitTop - 10, 170, 52, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`电压: ${st.voltage.toFixed(2)} V`, circuitLeft + 15, circuitTop + 10);
      ctx.fillText(`电流: ${(st.current * 1000).toFixed(2)} mA`, circuitLeft + 15, circuitTop + 30);
      ctx.textAlign = 'center';
    };

    // ---- 曲线图绘制（底部双图）----
    const chartTop = 310;
    const chartHeight = height - chartTop - 20;
    const chartWidth = (width - 40 - 24) / 2;
    const vChartX = 20;
    const iChartX = 20 + chartWidth + 24;
    const MAX_POINTS = 600;

    const drawChart = (
      x: number,
      y: number,
      w: number,
      h: number,
      title: string,
      unit: string,
      data: { t: number; v: number }[] | { t: number; i: number }[],
      color: string,
      yMax: number,
      symmetric: boolean,
      dataScale = 1,
    ) => {
      // 背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      rr(x, y, w, h, 12);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标题
      ctx.fillStyle = '#1e3a5f';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, x + 12, y + 20);

      // 坐标轴区域
      const ax = x + 45;
      const ay = y + 30;
      const aw = w - 60;
      const ah = h - 60;

      // 网格线 + y 标签
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      const yTicks = 4;
      for (let i = 0; i <= yTicks; i++) {
        const gy = ay + (ah / yTicks) * i;
        ctx.beginPath();
        ctx.moveTo(ax, gy);
        ctx.lineTo(ax + aw, gy);
        ctx.stroke();
        const val = symmetric
          ? yMax - (yMax * 2 / yTicks) * i
          : yMax - (yMax / yTicks) * i;
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), ax - 5, gy + 3);
      }
      // x 轴
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay + ah / (symmetric ? 2 : 1));
      ctx.lineTo(ax + aw, ay + ah / (symmetric ? 2 : 1));
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(unit, ax + aw / 2, ay + ah + 16);

      // 时间标签
      if (data.length > 1) {
        const tMax = data[data.length - 1].t;
        for (let i = 0; i <= 4; i++) {
          const tx = ax + (aw / 4) * i;
          const tv = (tMax / 4) * i;
          ctx.fillText(`${tv.toFixed(1)}s`, tx, ay + ah + 14);
        }
      }

      // 数据线
      if (data.length > 1) {
        const tMax = data[data.length - 1].t || 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const px = ax + (data[i].t / tMax) * aw;
          const point = data[i];
          const dv = ('v' in point ? point.v : point.i) * dataScale;
          let py;
          if (symmetric) {
            py = ay + ah / 2 - (dv / (yMax * 2)) * ah;
          } else {
            py = ay + ah - (dv / yMax) * ah;
          }
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.textAlign = 'center';
    };

    const drawCharts = () => {
      const st = stateRef.current;
      const vMax = Math.max(sourceVoltage, 0.5);
      drawChart(vChartX, chartTop, chartWidth, chartHeight, '📈 电压 - 时间', '电压 (V)', st.voltageData, '#1f6e96', vMax, false, 1);
      const iMax = Math.max(Math.abs(sourceVoltage / resistance) * 1000, 0.2);
      drawChart(iChartX, chartTop, chartWidth, chartHeight, '📊 电流 - 时间', '电流 (mA)', st.currentData, '#b33e3e', iMax, true, 1000);
    };

    // ---- 主循环 ----
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const dtWall = Math.min((currentTime - lastTime) / 1000, 0.03);
      lastTime = currentTime;

      if (isRunning) {
        const st = stateRef.current;
        // 时间自适应：让 5τ 过程在数秒内完成，同时限制 Euler 步长 ≤ 0.1τ 防 overshoot
        const speed = Math.min(50, Math.max(0.2, tau));
        const dtPhys = Math.min(dtWall * speed, tau * 0.1);
        st.time += dtPhys;
        if (mode === 'charging') {
          st.voltage += (sourceVoltage - st.voltage) / tau * dtPhys;
          if (st.voltage >= sourceVoltage) st.voltage = sourceVoltage;
          st.current = (sourceVoltage - st.voltage) / resistance;
        } else {
          st.voltage -= st.voltage / tau * dtPhys;
          if (st.voltage <= 0) st.voltage = 0;
          st.current = -st.voltage / resistance;
        }
        st.voltageData.push({ t: st.time, v: st.voltage });
        st.currentData.push({ t: st.time, i: st.current });
        if (st.voltageData.length > MAX_POINTS) {
          const remove = st.voltageData.length - MAX_POINTS;
          st.voltageData.splice(0, remove);
          st.currentData.splice(0, remove);
        }
      }

      drawCircuit();
      drawCharts();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, mode, resistance, capacitance, sourceVoltage, tau]);

  const switchMode = (m: 'charging' | 'discharging') => {
    if (m === mode) return;
    setMode(m);
  };

  return (
    <div className="relative space-y-3 w-full max-w-[700px]">
      {/* 单刀双掷开关：充电 / 放电 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => switchMode('charging')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
            mode === 'charging'
              ? 'bg-green-600 text-white shadow-md scale-105'
              : 'bg-white text-primary-600 hover:bg-green-50 shadow-soft'
          }`}
        >
          🔌 充电
        </button>
        <button
          onClick={() => switchMode('discharging')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
            mode === 'discharging'
              ? 'bg-red-600 text-white shadow-md scale-105'
              : 'bg-white text-primary-600 hover:bg-red-50 shadow-soft'
          }`}
        >
          🔋 放电
        </button>
        <span className="text-xs text-primary-400">单刀双掷开关 · 点击切换</span>
      </div>
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default CapacitorSimulation;
