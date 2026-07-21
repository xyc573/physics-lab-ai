import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { getExperimentById } from '../data/experiments';
import { useLearningStore } from '../store/learningStore';
import SpringSimulation from '../components/simulation/SpringSimulation';
import PendulumSimulation from '../components/simulation/PendulumSimulation';
import ProjectileSimulation from '../components/simulation/ProjectileSimulation';
import CircuitSimulation from '../components/simulation/CircuitSimulation';
import RefractionSimulation from '../components/simulation/RefractionSimulation';
import GasSimulation from '../components/simulation/GasSimulation';

const simulationComponents: Record<string, React.ComponentType<{ params: Record<string, number>; isRunning: boolean; onReset: () => void; onParamChange?: (key: string, value: number) => void }>> = {
  spring: SpringSimulation,
  pendulum: PendulumSimulation,
  projectile: ProjectileSimulation,
  circuit: CircuitSimulation,
  refraction: RefractionSimulation,
  gas: GasSimulation,
};

const Simulation = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const experiment = getExperimentById(id);
  const markSimulationCompleted = useLearningStore(state => state.markSimulationCompleted);
  const getRecord = useLearningStore(state => state.getRecord);
  
  const record = getRecord(id);
  const simConfig = experiment?.simulation;
  
  const [isRunning, setIsRunning] = React.useState(false);
  const [params, setParams] = React.useState<Record<string, number>>({});
  const [hasInteracted, setHasInteracted] = React.useState(false);

  React.useEffect(() => {
    if (simConfig) {
      setParams(simConfig.initialParams);
    }
  }, [simConfig]);

  if (!experiment || !simConfig) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">实验不存在</p>
      </div>
    );
  }

  const SimulationComp = simulationComponents[simConfig.type];

  const handleParamChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setHasInteracted(true);
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setParams(simConfig.initialParams);
    setIsRunning(false);
    setHasInteracted(true);
  };

  const handleToggleRun = () => {
    setIsRunning(!isRunning);
    setHasInteracted(true);
    if (!record.simulationCompleted) {
      setTimeout(() => markSimulationCompleted(id), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/experiment/${id}`)}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft size={18} />
          返回实验详情
        </button>
        {record.simulationCompleted && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">模拟已完成</span>
          </div>
        )}
      </div>

      {/* 标题 */}
      <div className="bg-gradient-to-r from-accent-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <PlayCircle size={24} />
          <h1 className="text-2xl font-bold">虚拟实验模拟</h1>
        </div>
        <p className="text-orange-100">{experiment.name}</p>
      </div>

      {/* 模拟主区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 模拟画布 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="bg-gradient-to-r from-primary-700 to-primary-800 px-6 py-3 flex items-center justify-between">
              <span className="text-white font-medium">实验台</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleRun}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${isRunning 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    }
                  `}
                >
                  {isRunning ? <Pause size={16} /> : <PlayCircle size={16} />}
                  {isRunning ? '暂停' : '开始'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <RotateCcw size={16} />
                  重置
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-b from-slate-100 to-slate-200 p-4 min-h-[500px] flex items-center justify-center">
              {SimulationComp && params && Object.keys(params).length > 0 && (
                <SimulationComp params={params} isRunning={isRunning} onReset={handleReset} onParamChange={handleParamChange} />
              )}
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-500"></span>
              参数调节
            </h3>
            <div className="space-y-5">
              {Object.entries(simConfig.paramRanges).map(([key, range]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-primary-600">{range.label}</label>
                    <span className="text-sm font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded">
                      {params[key]?.toFixed(key === 'damping' || key === 'gravity' || key === 'moles' ? 2 : 1)}
                      {range.unit || ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    value={params[key] ?? range.min}
                    onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                    className="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-accent-500"
                  />
                  <div className="flex justify-between text-xs text-primary-400 mt-1">
                    <span>{range.min}{range.unit || ''}</span>
                    <span>{range.max}{range.unit || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 实时数据面板 */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              实时数据
            </h3>
            <div className="space-y-3">
              {Object.entries(params).map(([key, value]) => {
                const range = simConfig.paramRanges[key];
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-primary-50 last:border-0">
                    <span className="text-sm text-primary-500">{range?.label || key}</span>
                    <span className="text-sm font-mono font-bold text-primary-700">
                      {value.toFixed(2)} {range?.unit || ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 提示卡片 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <p className="text-sm font-medium text-blue-700 mb-2">💡 实验提示</p>
            <p className="text-sm text-blue-600">
              拖动滑块调节参数，点击"开始"按钮观察实验现象。尝试改变不同参数，观察实验结果的变化规律。
            </p>
            {!hasInteracted && (
              <p className="text-xs text-blue-500 mt-2">
                调节参数并运行模拟即可标记为完成
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
