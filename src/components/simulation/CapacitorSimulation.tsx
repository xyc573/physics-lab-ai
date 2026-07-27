import { useRef, useEffect } from 'react';

interface Props {
  params: Record<string, number>;
  isRunning: boolean;
  onReset: () => void;
}

const CapacitorSimulation: React.FC<Props> = ({ params, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    time: 0,
    voltage: 0,
    current: 0,
    charge: 0,
    voltageData: [] as { t: number; v: number }[],
    currentData: [] as { t: number; i: number }[],
    switchClosed: false,
    phase: 'charging' as 'charging' | 'discharging',
  });

  const capacitance = (params.capacitance || 100) * 1e-6;
  const resistance = (params.resistance || 10) * 1e3;
  const sourceVoltage = params.voltage || 12;

  const tau = resistance * capacitance;

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

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const state = stateRef.current;
      const isCharging = state.phase === 'charging';

      const circuitLeft = 80;
      const circuitRight = 380;
      const circuitTop = 50;
      const circuitBottom = 250;
      const circuitCX = (circuitLeft + circuitRight) / 2;
      const circuitCY = (circuitTop + circuitBottom) / 2;

      const batteryX = circuitLeft;
      const batteryY = circuitCY;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(batteryX - 15, batteryY - 35);
      ctx.lineTo(batteryX - 15, batteryY - 8);
      ctx.moveTo(batteryX + 15, batteryY - 35);
      ctx.lineTo(batteryX + 15, batteryY - 8);
      ctx.moveTo(batteryX - 15, batteryY + 8);
      ctx.lineTo(batteryX - 15, batteryY + 35);
      ctx.moveTo(batteryX + 15, batteryY + 8);
      ctx.lineTo(batteryX + 15, batteryY + 35);
      ctx.moveTo(batteryX - 25, batteryY);
      ctx.lineTo(batteryX - 15, batteryY);
      ctx.moveTo(batteryX + 15, batteryY);
      ctx.lineTo(batteryX + 25, batteryY);
      ctx.stroke();
      
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', batteryX - 5, batteryY - 45);
      ctx.fillStyle = '#2563eb';
      ctx.fillText('−', batteryX + 5, batteryY - 45);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`E=${sourceVoltage}V`, batteryX, batteryY - 58);
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText('直流电源', batteryX, batteryY + 55);

      const switchX = circuitCX - 20;
      const switchY = circuitTop - 5;
      const switchTopY = circuitTop - 25;
      const switchBottomY = circuitBottom + 5;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(switchX, switchY, 5, 0, Math.PI * 2);
      ctx.arc(switchX - 25, switchTopY, 4, 0, Math.PI * 2);
      ctx.arc(switchX + 25, switchTopY, 4, 0, Math.PI * 2);
      ctx.arc(switchX - 25, switchBottomY, 4, 0, Math.PI * 2);
      ctx.arc(switchX + 25, switchBottomY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = state.switchClosed ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (isCharging) {
        ctx.moveTo(switchX, switchY);
        ctx.lineTo(switchX - 22, switchTopY + 3);
      } else {
        ctx.moveTo(switchX, switchY);
        ctx.lineTo(switchX - 22, switchBottomY - 3);
      }
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('充电', switchX - 25, switchTopY - 10);
      ctx.fillText('放电', switchX - 25, switchBottomY + 18);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('S', switchX + 8, switchY + 4);

      const resistorX = circuitRight;
      const resistorY = circuitCY;
      const zigzagH = 50;
      const zigzagCount = 6;
      const zigzagW = 16;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(resistorX, resistorY - zigzagH / 2);
      ctx.lineTo(resistorX - zigzagW / 2, resistorY - zigzagH / 2 + zigzagH / (zigzagCount * 2));
      for (let i = 0; i < zigzagCount; i++) {
        const y1 = resistorY - zigzagH / 2 + (i + 0.5) * zigzagH / zigzagCount;
        const y2 = resistorY - zigzagH / 2 + (i + 1) * zigzagH / zigzagCount;
        ctx.lineTo(resistorX + zigzagW / 2, y1);
        ctx.lineTo(resistorX - zigzagW / 2, y2);
      }
      ctx.lineTo(resistorX, resistorY + zigzagH / 2);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`R=${params.resistance || 10}kΩ`, resistorX + 20, resistorY + 5);

      const capX = circuitCX + 30;
      const capY = circuitBottom + 55;
      const plateW = 55;
      const plateGap = 16;
      
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(capX - plateW / 2, capY - plateGap / 2);
      ctx.lineTo(capX + plateW / 2, capY - plateGap / 2);
      ctx.moveTo(capX - plateW / 2, capY + plateGap / 2);
      ctx.lineTo(capX + plateW / 2, capY + plateGap / 2);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`C=${params.capacitance || 100}μF`, capX + 55, capY + 5);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(batteryX, circuitTop - 10);
      ctx.lineTo(batteryX, circuitTop);
      ctx.lineTo(switchX + 25, circuitTop);
      ctx.lineTo(switchX + 25, switchTopY);
      ctx.moveTo(switchX - 25, switchBottomY);
      ctx.lineTo(switchX - 25, capY + plateGap / 2);
      ctx.lineTo(capX - plateW / 2, capY + plateGap / 2);
      ctx.moveTo(capX - plateW / 2, capY - plateGap / 2);
      ctx.lineTo(resistorX, capY - plateGap / 2);
      ctx.lineTo(resistorX, resistorY + zigzagH / 2);
      ctx.moveTo(resistorX, resistorY - zigzagH / 2);
      ctx.lineTo(resistorX, switchBottomY);
      ctx.lineTo(switchX + 25, switchBottomY);
      ctx.moveTo(switchX - 25, switchTopY);
      ctx.lineTo(switchX - 25, circuitTop);
      ctx.lineTo(batteryX - 30, circuitTop);
      ctx.lineTo(batteryX - 30, batteryY + 35);
      ctx.stroke();

      const chargeRatio = state.voltage / sourceVoltage;
      const maxCharges = 10;
      const chargeCount = Math.floor(chargeRatio * maxCharges);
      
      for (let i = 0; i < chargeCount; i++) {
        const x = capX - plateW / 2 + 8 + i * (plateW - 16) / maxCharges;
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', x, capY - plateGap / 2 - 6);
      }
      
      for (let i = 0; i < chargeCount; i++) {
        const x = capX - plateW / 2 + 8 + i * (plateW - 16) / maxCharges;
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('−', x, capY + plateGap / 2 + 12);
      }

      if (state.switchClosed && Math.abs(state.current) > 0.001) {
        const speed = state.time * 70;
        const pathLen = 700;
        const dir = isCharging ? 1 : 1;
        
        for (let i = 0; i < 7; i++) {
          const offset = ((speed * dir + i * (pathLen / 7)) % pathLen + pathLen) % pathLen;
          let ex, ey;
          
          if (offset < 50) {
            const t = offset / 50;
            ex = batteryX;
            ey = circuitTop - 10 + t * 10;
          } else if (offset < 140) {
            const t = (offset - 50) / 90;
            ex = batteryX + t * (switchX + 25 - batteryX);
            ey = circuitTop;
          } else if (offset < 170) {
            const t = (offset - 140) / 30;
            ex = switchX + 25;
            ey = circuitTop - t * (circuitTop - switchTopY);
          } else if (offset < 210) {
            const t = (offset - 170) / 40;
            ex = switchX + 25 - t * 50;
            ey = switchTopY;
          } else if (offset < 270) {
            const t = (offset - 210) / 60;
            ex = switchX - 25;
            ey = switchTopY + t * (capY - plateGap / 2 - switchTopY);
          } else if (offset < 350) {
            const t = (offset - 270) / 80;
            ex = switchX - 25 + t * (capX - plateW / 2 - (switchX - 25));
            ey = capY + plateGap / 2;
          } else if (offset < 450) {
            const t = (offset - 350) / 100;
            ex = capX - plateW / 2 + t * (resistorX - (capX - plateW / 2));
            ey = capY - plateGap / 2;
          } else if (offset < 510) {
            const t = (offset - 450) / 60;
            ex = resistorX;
            ey = capY - plateGap / 2 - t * (capY - plateGap / 2 - (resistorY + zigzagH / 2));
          } else if (offset < 570) {
            const t = (offset - 510) / 60;
            ex = resistorX;
            ey = resistorY - zigzagH / 2 + t * (switchBottomY - (resistorY - zigzagH / 2));
          } else {
            const t = (offset - 570) / 130;
            ex = switchX + 25 - t * (switchX + 25 - (batteryX - 30));
            ey = switchBottomY;
          }
          
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const graph1X = 20;
      const graph1Y = 320;
      const graph1W = 320;
      const graph1H = 150;
      const padding1 = { top: 25, right: 15, bottom: 28, left: 45 };
      const plot1W = graph1W - padding1.left - padding1.right;
      const plot1H = graph1H - padding1.top - padding1.bottom;

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.roundRect(graph1X, graph1Y, graph1W, graph1H, 8);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#166534';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('电压-时间曲线 (U-t)', graph1X + graph1W / 2, graph1Y + 15);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = graph1Y + padding1.top + (i / 4) * plot1H;
        ctx.beginPath();
        ctx.moveTo(graph1X + padding1.left, y);
        ctx.lineTo(graph1X + graph1W - padding1.right, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 5; i++) {
        const x = graph1X + padding1.left + (i / 5) * plot1W;
        ctx.beginPath();
        ctx.moveTo(x, graph1Y + padding1.top);
        ctx.lineTo(x, graph1Y + graph1H - padding1.bottom);
        ctx.stroke();
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(graph1X + padding1.left, graph1Y + padding1.top, plot1W, plot1H);

      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Uc', graph1X + padding1.left - 5, graph1Y + padding1.top - 3);
      ctx.textAlign = 'center';
      ctx.fillText('0', graph1X + padding1.left - 12, graph1Y + graph1H - padding1.bottom + 4);
      ctx.fillText(sourceVoltage.toFixed(0) + 'V', graph1X + padding1.left - 12, graph1Y + padding1.top + 4);
      ctx.fillText('t', graph1X + graph1W - padding1.right, graph1Y + graph1H - 8);

      const maxT = Math.max(tau * 5, state.time + 0.1);
      const getX1 = (t: number) => graph1X + padding1.left + (t / maxT) * plot1W;
      const getY1 = (v: number) => graph1Y + padding1.top + plot1H - (v / sourceVoltage) * plot1H;

      if (state.voltageData.length > 1) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        state.voltageData.forEach((pt, i) => {
          const px = getX1(pt.t);
          const py = getY1(pt.v);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      ctx.fillStyle = '#22c55e';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('● Uc(t)', graph1X + padding1.left + 10, graph1Y + padding1.top + 15);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(isCharging ? '充电: Uc = E(1-e^(-t/τ))' : '放电: Uc = E·e^(-t/τ)', graph1X + padding1.left + 10, graph1Y + padding1.top + 30);

      const graph2X = 360;
      const graph2Y = 320;
      const graph2W = 320;
      const graph2H = 150;
      const padding2 = { top: 25, right: 15, bottom: 28, left: 45 };
      const plot2W = graph2W - padding2.left - padding2.right;
      const plot2H = graph2H - padding2.top - padding2.bottom;

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.roundRect(graph2X, graph2Y, graph2W, graph2H, 8);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#9a3412';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('电流-时间曲线 (I-t)', graph2X + graph2W / 2, graph2Y + 15);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const zeroY2 = graph2Y + padding2.top + plot2H / 2;
      for (let i = 0; i <= 4; i++) {
        const y = graph2Y + padding2.top + (i / 4) * plot2H;
        ctx.beginPath();
        ctx.moveTo(graph2X + padding2.left, y);
        ctx.lineTo(graph2X + graph2W - padding2.right, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 5; i++) {
        const x = graph2X + padding2.left + (i / 5) * plot2W;
        ctx.beginPath();
        ctx.moveTo(x, graph2Y + padding2.top);
        ctx.lineTo(x, graph2Y + graph2H - padding2.bottom);
        ctx.stroke();
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(graph2X + padding2.left, graph2Y + padding2.top, plot2W, plot2H);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(graph2X + padding2.left, zeroY2);
      ctx.lineTo(graph2X + graph2W - padding2.right, zeroY2);
      ctx.stroke();
      ctx.setLineDash([]);

      const maxI = sourceVoltage / resistance;
      ctx.fillStyle = '#475569';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('I', graph2X + padding2.left - 5, graph2Y + padding2.top - 3);
      ctx.fillText('+' + (maxI * 1000).toFixed(0) + 'mA', graph2X + padding2.left - 5, graph2Y + padding2.top + 8);
      ctx.fillText('0', graph2X + padding2.left - 5, zeroY2 + 3);
      ctx.fillText('-' + (maxI * 1000).toFixed(0) + 'mA', graph2X + padding2.left - 5, graph2Y + graph2H - padding2.bottom - 2);
      ctx.textAlign = 'center';
      ctx.fillText('t', graph2X + graph2W - padding2.right, graph2Y + graph2H - 8);

      const getX2 = (t: number) => graph2X + padding2.left + (t / maxT) * plot2W;
      const getY2 = (i: number) => zeroY2 - (i / maxI) * (plot2H / 2);

      if (state.currentData.length > 1) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        state.currentData.forEach((pt, i) => {
          const px = getX2(pt.t);
          const py = getY2(pt.i);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      ctx.fillStyle = '#f97316';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('● I(t)', graph2X + padding2.left + 10, graph2Y + padding2.top + 15);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(isCharging ? '充电: I = I0·e^(-t/τ)' : '放电: I = -I0·e^(-t/τ)', graph2X + padding2.left + 10, graph2Y + padding2.top + 30);

      ctx.fillStyle = 'rgba(124, 58, 237, 0.1)';
      ctx.beginPath();
      ctx.roundRect(420, 20, 260, 45, 6);
      ctx.fill();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#5b21b6';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`时间常数 τ = RC = ${(tau * 1000).toFixed(2)} ms`, 550, 48);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(420, 75, 260, 230, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RC 充放电参数', 440, 100);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(440, 108);
      ctx.lineTo(660, 108);
      ctx.stroke();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText(`电源 E = ${sourceVoltage.toFixed(1)} V`, 440, 132);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`电阻 R = ${params.resistance || 10} kΩ`, 440, 152);
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`电容 C = ${params.capacitance || 100} μF`, 440, 172);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`τ = RC = ${(tau * 1000).toFixed(2)} ms`, 440, 192);
      
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(440, 208);
      ctx.lineTo(660, 208);
      ctx.stroke();
      
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`Uc = ${state.voltage.toFixed(2)} V`, 440, 232);
      ctx.fillStyle = '#f97316';
      ctx.fillText(`I = ${(state.current * 1000).toFixed(3)} mA`, 440, 252);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Q = ${(state.charge * 1000).toFixed(3)} mC`, 440, 272);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`状态: ${isCharging ? '充电中 ⚡' : '放电中 🔋'}`, 440, 295);
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isRunning) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.03);
        lastTime = currentTime;

        if (!stateRef.current.switchClosed && stateRef.current.time > 0.5) {
          stateRef.current.switchClosed = true;
          stateRef.current.time = 0;
        }

        if (stateRef.current.switchClosed) {
          stateRef.current.time += dt;
          const t = stateRef.current.time;
          
          if (stateRef.current.phase === 'charging') {
            stateRef.current.voltage = sourceVoltage * (1 - Math.exp(-t / tau));
            stateRef.current.current = (sourceVoltage / resistance) * Math.exp(-t / tau);
            stateRef.current.charge = capacitance * stateRef.current.voltage;
          } else {
            stateRef.current.voltage = sourceVoltage * Math.exp(-t / tau);
            stateRef.current.current = -(sourceVoltage / resistance) * Math.exp(-t / tau);
            stateRef.current.charge = capacitance * stateRef.current.voltage;
          }

          if (stateRef.current.voltageData.length < 500) {
            stateRef.current.voltageData.push({ t: stateRef.current.time, v: stateRef.current.voltage });
            stateRef.current.currentData.push({ t: stateRef.current.time, i: stateRef.current.current });
          }

          if (t > tau * 5 && stateRef.current.phase === 'charging') {
            stateRef.current.phase = 'discharging';
            stateRef.current.time = 0;
            stateRef.current.voltage = sourceVoltage;
            stateRef.current.charge = capacitance * sourceVoltage;
            stateRef.current.voltageData = [{ t: 0, v: sourceVoltage }];
            stateRef.current.currentData = [{ t: 0, i: -sourceVoltage / resistance }];
          }
          
          if (t > tau * 5 && stateRef.current.phase === 'discharging') {
            stateRef.current.phase = 'charging';
            stateRef.current.time = 0;
            stateRef.current.voltage = 0;
            stateRef.current.charge = 0;
            stateRef.current.voltageData = [{ t: 0, v: 0 }];
            stateRef.current.currentData = [{ t: 0, i: sourceVoltage / resistance }];
          }
        } else {
          stateRef.current.time += dt;
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
  }, [isRunning, capacitance, resistance, sourceVoltage, tau, params.capacitance, params.resistance, params.voltage, onReset]);

  useEffect(() => {
    stateRef.current.time = 0;
    stateRef.current.voltage = 0;
    stateRef.current.current = 0;
    stateRef.current.charge = 0;
    stateRef.current.voltageData = [];
    stateRef.current.currentData = [];
    stateRef.current.switchClosed = false;
    stateRef.current.phase = 'charging';
  }, [onReset, params.capacitance, params.resistance, params.voltage]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="rounded-xl shadow-inner bg-white max-w-full" />
    </div>
  );
};

export default CapacitorSimulation;
