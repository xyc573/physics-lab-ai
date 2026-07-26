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

      const circuitX = 100;
      const circuitY = 80;
      const circuitW = 280;
      const circuitH = 200;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(circuitX, circuitY + circuitH / 2);
      ctx.lineTo(circuitX + 40, circuitY + circuitH / 2);
      ctx.moveTo(circuitX + 40, circuitY);
      ctx.lineTo(circuitX + 40, circuitY + circuitH / 2 - 15);
      ctx.lineTo(circuitX + 70, circuitY + circuitH / 2 - 15);
      ctx.lineTo(circuitX + 70, circuitY + circuitH / 2 + 15);
      ctx.lineTo(circuitX + 40, circuitY + circuitH / 2 + 15);
      ctx.lineTo(circuitX + 40, circuitY + circuitH);
      ctx.stroke();
      
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', circuitX + 55, circuitY + 25);
      ctx.fillStyle = '#2563eb';
      ctx.fillText('−', circuitX + 55, circuitY + circuitH - 10);
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${sourceVoltage}V`, circuitX + 55, circuitY + circuitH / 2);

      const switchX = circuitX + circuitW / 2;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(switchX - 20, circuitY);
      ctx.lineTo(switchX + 20, circuitY);
      ctx.stroke();
      
      if (state.switchClosed) {
        ctx.beginPath();
        ctx.moveTo(switchX - 15, circuitY);
        ctx.lineTo(switchX + 15, circuitY - 3);
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(switchX - 15, circuitY);
        ctx.lineTo(switchX + 15, circuitY - 25);
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
      }
      
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(switchX - 15, circuitY, 4, 0, Math.PI * 2);
      ctx.arc(switchX + 15, circuitY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('开关', switchX, circuitY - 30);

      const resistorX = circuitX + 180;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(resistorX, circuitY);
      ctx.lineTo(resistorX, circuitY + 35);
      
      const zigzagY = circuitY + 35;
      const zigzagH = 40;
      const zigzagCount = 6;
      const zigzagW = 12;
      ctx.beginPath();
      ctx.moveTo(resistorX - zigzagW / 2, zigzagY);
      for (let i = 0; i < zigzagCount; i++) {
        const y1 = zigzagY + (i + 0.5) * zigzagH / zigzagCount;
        const y2 = zigzagY + (i + 1) * zigzagH / zigzagCount;
        ctx.lineTo(resistorX + zigzagW / 2, y1);
        ctx.lineTo(resistorX - zigzagW / 2, y2);
      }
      ctx.lineTo(resistorX, zigzagY + zigzagH);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(resistorX, circuitY + 75);
      ctx.lineTo(resistorX, circuitY + circuitH);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${params.resistance || 10}kΩ`, resistorX + 25, circuitY + 60);

      const capX = circuitX + circuitW;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(circuitX + 40, circuitY);
      ctx.lineTo(capX - 30, circuitY);
      ctx.moveTo(capX - 30, circuitY - 25);
      ctx.lineTo(capX - 30, circuitY + 25);
      ctx.moveTo(capX - 10, circuitY - 25);
      ctx.lineTo(capX - 10, circuitY + 25);
      ctx.moveTo(capX - 10, circuitY + circuitH / 2 - 30);
      ctx.lineTo(capX - 10, circuitY + circuitH / 2 + 30);
      ctx.moveTo(capX - 30, circuitY + circuitH / 2 - 30);
      ctx.lineTo(capX - 30, circuitY + circuitH / 2 + 30);
      ctx.moveTo(capX - 30, circuitY + circuitH);
      ctx.lineTo(circuitX + 40, circuitY + circuitH);
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${params.capacitance || 100}μF`, capX - 5, circuitY - 35);

      const topPlateX = capX - 30;
      const bottomPlateX = capX - 10;
      const plateTop = circuitY + circuitH / 2 - 28;
      const plateBottom = circuitY + circuitH / 2 + 28;
      
      const chargeRatio = state.voltage / sourceVoltage;
      const maxCharges = 8;
      const chargeCount = Math.floor(chargeRatio * maxCharges);
      
      for (let i = 0; i < chargeCount; i++) {
        const y = plateTop + 8 + i * (plateBottom - plateTop - 16) / maxCharges;
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', topPlateX - 2, y + 3);
      }
      
      for (let i = 0; i < chargeCount; i++) {
        const y = plateTop + 8 + i * (plateBottom - plateTop - 16) / maxCharges;
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('−', bottomPlateX + 2, y + 3);
      }

      if (state.switchClosed && Math.abs(state.current) > 0.001) {
        const currentDir = state.current > 0 ? 1 : -1;
        const electronSpeed = state.time * 50 * currentDir;
        for (let i = 0; i < 5; i++) {
          const offset = ((electronSpeed + i * 50) % 200 + 200) % 200;
          let ex, ey;
          if (offset < 40) {
            ex = circuitX + 40 + offset;
            ey = circuitY;
          } else if (offset < 80) {
            ex = switchX - 20 + (offset - 40);
            ey = circuitY;
          } else if (offset < 120) {
            ex = resistorX;
            ey = circuitY + (offset - 80) * 2;
          } else if (offset < 160) {
            ex = resistorX + (offset - 120) * 0.5;
            ey = circuitY + circuitH;
          } else {
            ex = capX - 30 - (offset - 160) * 1.25;
            ey = circuitY + circuitH;
          }
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const graphX = 420;
      const graphY = 40;
      const graphW = 260;
      const graphH = 200;
      
      ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
      ctx.beginPath();
      ctx.roundRect(graphX, graphY, graphW, graphH, 8);
      ctx.fill();
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX + 35, graphY + 25, graphW - 45, graphH - 50);
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('电压/电流变化曲线', graphX + 10, graphY + 18);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('V/I', graphX + 30, graphY + 30);
      ctx.textAlign = 'left';
      ctx.fillText('t', graphX + graphW - 10, graphY + graphH - 28);
      
      const maxT = Math.max(tau * 5, state.time + 0.5);
      const plotAreaW = graphW - 45;
      const plotAreaH = graphH - 50;
      
      if (state.voltageData.length > 1) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        state.voltageData.forEach((pt, i) => {
          const px = graphX + 35 + (pt.t / maxT) * plotAreaW;
          const py = graphY + 25 + plotAreaH - (pt.v / sourceVoltage) * plotAreaH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      
      if (state.currentData.length > 1) {
        const maxI = sourceVoltage / resistance;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        state.currentData.forEach((pt, i) => {
          const px = graphX + 35 + (pt.t / maxT) * plotAreaW;
          const py = graphY + 25 + plotAreaH - (Math.abs(pt.i) / maxI) * plotAreaH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(graphX + 40, graphY + graphH - 20, 12, 3);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px sans-serif';
      ctx.fillText('电压', graphX + 55, graphY + graphH - 16);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(graphX + 90, graphY + graphH - 20, 12, 3);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('电流', graphX + 105, graphY + graphH - 16);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, 320, 660, 140, 8);
      ctx.fill();
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RC 充放电公式', 40, 345);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(40, 352);
      ctx.lineTo(180, 352);
      ctx.stroke();
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText(`时间常数 τ = R × C = ${params.resistance || 10}kΩ × ${params.capacitance || 100}μF = ${(tau * 1000).toFixed(2)} ms`, 40, 378);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`充电: Uc = U(1 - e^(-t/τ))`, 40, 400);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`     I = (U/R)e^(-t/τ)`, 40, 422);
      
      ctx.fillStyle = '#60a5fa';
      ctx.textAlign = 'right';
      ctx.fillText(`Uc = ${state.voltage.toFixed(2)} V`, 660, 378);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`I = ${(state.current * 1000).toFixed(3)} mA`, 660, 400);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`Q = ${(state.charge * 1000).toFixed(3)} mC`, 660, 422);
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
