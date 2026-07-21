import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Lightbulb, 
  Wrench,
  Check,
  AlertCircle,
  FlaskConical,
  Lamp,
  Sparkles,
  Weight,
  Ruler,
  Circle,
  Clock,
  Zap,
  Battery,
  Gauge,
  Sliders,
  Settings,
  MapPin,
  Pipette,
  Cpu,
  ToggleRight,
  Merge,
  Truck,
  Scale,
  Box,
  Cable,
  RotateCw,
  Scroll,
  Magnet,
  Waves,
  Cylinder,
  Droplet,
  Grid3X3,
  LightbulbIcon,
  BatteryCharging,
  ArrowRightLeft,
  Minus,
  DoorOpen,
  Target,
  TrendingUp,
  Thermometer,
  Sun,
  Square,
  Triangle
} from 'lucide-react';
import { getExperimentById } from '../data/experiments';
import { useLearningStore } from '../store/learningStore';

type TabType = 'connection' | 'principle' | 'equipment';

const iconMap: Record<string, any> = {
  'stand': Lamp,
  'spring': Sparkles,
  'weight': Weight,
  'ruler': Ruler,
  'circle': Circle,
  'clock': Clock,
  'ramp': Triangle,
  'square': Square,
  'battery': Battery,
  'gauge': Gauge,
  'sliders': Sliders,
  'settings': Settings,
  'sun': Sun,
  'map-pin': MapPin,
  'pipette': Pipette,
  'thermometer': Thermometer,
  'cpu': Cpu,
  'toggle-right': ToggleRight,
  'merge': Merge,
  'truck': Truck,
  'scale': Scale,
  'box': Box,
  'cable': Cable,
  'rotate-cw': RotateCw,
  'scroll': Scroll,
  'magnet': Magnet,
  'waves': Waves,
  'cylinder': Cylinder,
  'droplet': Droplet,
  'grid': Grid3X3,
  'lightbulb': LightbulbIcon,
  'battery-charging': BatteryCharging,
  'arrow-right-left': ArrowRightLeft,
  'minus': Minus,
  'gate': DoorOpen,
  'target': Target,
  'trending-up': TrendingUp,
  'zap': Zap,
  'stretch-horizontal': ArrowRightLeft,
  'flask': FlaskConical,
};

const getEquipmentIcon = (iconName: string) => {
  return iconMap[iconName] || FlaskConical;
};

const Preview = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const experiment = getExperimentById(id);
  const markPreviewCompleted = useLearningStore(state => state.markPreviewCompleted);
  const getRecord = useLearningStore(state => state.getRecord);
  
  const [activeTab, setActiveTab] = useState<TabType>('connection');
  const [readSections, setReadSections] = useState<Set<TabType>>(new Set());

  useEffect(() => {
    const record = getRecord(id);
    if (record.previewCompleted) {
      setReadSections(new Set(['connection', 'principle', 'equipment']));
    }
  }, [id, getRecord]);

  if (!experiment) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">实验不存在</p>
      </div>
    );
  }

  const tabs = [
    { id: 'connection' as TabType, label: '初中联系点', icon: Lightbulb },
    { id: 'principle' as TabType, label: '原理讲解', icon: BookOpen },
    { id: 'equipment' as TabType, label: '器材介绍', icon: Wrench },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newRead = new Set(readSections);
    newRead.add(tab);
    setReadSections(newRead);
    
    if (newRead.size === 3) {
      markPreviewCompleted(id);
    }
  };

  const allRead = readSections.size === 3;

  return (
    <div className="space-y-6">
      {/* 返回和标题 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/experiment/${id}`)}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft size={18} />
          返回实验详情
        </button>
        {allRead && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <Check size={18} />
            <span className="text-sm font-medium">预习已完成</span>
          </div>
        )}
      </div>

      {/* 标题卡片 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} />
          <h1 className="text-2xl font-bold">课前预习</h1>
        </div>
        <p className="text-primary-100">{experiment.name}</p>
      </div>

      {/* Tab导航 */}
      <div className="bg-white rounded-xl shadow-soft p-2 flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isRead = readSections.has(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                font-medium text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-primary-100 text-primary-700 shadow-inner' 
                  : 'text-primary-500 hover:bg-primary-50 hover:text-primary-600'
                }
              `}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {isRead && <Check size={14} className="text-green-500" />}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 min-h-[400px] animate-fade-in">
        {activeTab === 'connection' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-700 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Lightbulb className="text-yellow-600" size={22} />
              </div>
              初中物理知识回顾
            </h2>
            <p className="text-primary-500">
              本实验与以下初中物理知识紧密相关，让我们先回顾一下，为高中实验学习打好基础：
            </p>
            <div className="space-y-3">
              {experiment.preview.middleSchoolConnection.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-primary-700 pt-0.5">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-700 mb-1">学习小贴士</p>
                  <p className="text-sm text-blue-600">
                    高中物理实验是在初中基础上的深化和拓展。理解初中相关知识，能帮助你更快掌握高中实验的原理和方法。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'principle' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-primary-700 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="text-blue-600" size={22} />
              </div>
              实验原理详解
            </h2>
            
            {experiment.preview.principles.map((p, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-lg font-bold text-primary-700 border-l-4 border-accent-500 pl-4">
                  {p.title}
                </h3>
                <p className="text-primary-600 leading-relaxed">{p.content}</p>
                
                {p.formulas && p.formulas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary-500">相关公式：</p>
                    <div className="flex flex-wrap gap-3">
                      {p.formulas.map((f, fi) => (
                        <span key={fi} className="formula text-lg">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {p.notes && p.notes.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="font-medium text-amber-700 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      注意事项
                    </p>
                    <ul className="space-y-1.5">
                      {p.notes.map((note, ni) => (
                        <li key={ni} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-700 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Wrench className="text-green-600" size={22} />
              </div>
              实验器材介绍
            </h2>
            <p className="text-primary-500">
              熟悉实验器材是做好实验的第一步，让我们来认识一下本实验需要用到的器材：
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiment.preview.equipment.map((eq, idx) => {
                const IconComponent = getEquipmentIcon(eq.icon);
                return (
                  <div key={idx} className="border border-primary-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="text-primary-600" size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-primary-700 mb-1">{eq.name}</h4>
                        <div className="space-y-1.5 text-sm">
                          <p className="text-primary-500">
                            <span className="font-medium text-primary-600">用途：</span>
                            {eq.purpose}
                          </p>
                          <p className="text-primary-500">
                            <span className="font-medium text-primary-600">用法：</span>
                            {eq.usage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx > 0) handleTabChange(tabs[idx - 1].id);
          }}
          disabled={activeTab === 'connection'}
          className="px-5 py-2.5 rounded-lg text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一节
        </button>
        
        <div className="flex gap-2">
          {tabs.map((tab, idx) => (
            <div
              key={tab.id}
              className={`w-2 h-2 rounded-full transition-all ${
                activeTab === tab.id ? 'bg-primary-600 w-6' : readSections.has(tab.id) ? 'bg-green-400' : 'bg-primary-200'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx < tabs.length - 1) {
              handleTabChange(tabs[idx + 1].id);
            } else {
              navigate(`/experiment/${id}/simulation`);
            }
          }}
          className="px-5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          {activeTab === 'equipment' ? '开始实验模拟 →' : '下一节 →'}
        </button>
      </div>
    </div>
  );
};

export default Preview;
