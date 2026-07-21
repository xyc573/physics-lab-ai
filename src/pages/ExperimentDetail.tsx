import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  PlayCircle, 
  PenTool, 
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Zap,
  Sun,
  Thermometer,
  Atom
} from 'lucide-react';
import { getExperimentById } from '../data/experiments';
import { categoryLabels, difficultyLabels, difficultyColors } from '../types/experiment';
import { useLearningStore } from '../store/learningStore';
import type { ExperimentCategory } from '../types/experiment';

const categoryIcons: Record<ExperimentCategory, React.ElementType> = {
  book1: BookOpen,
  book2: BookOpen,
  book3: BookOpen,
  selective1: FlaskConical,
  selective2: FlaskConical,
  selective3: Atom,
};

const ExperimentDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const experiment = getExperimentById(id);
  const getRecord = useLearningStore(state => state.getRecord);
  
  if (!experiment) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">实验不存在</p>
        <button onClick={() => navigate('/')} className="text-accent-500 hover:underline">
          返回首页
        </button>
      </div>
    );
  }

  const record = getRecord(id);
  const CatIcon = categoryIcons[experiment.category];

  const modules = [
    {
      title: '课前预习',
      description: '初中知识回顾、实验原理讲解、器材介绍',
      icon: BookOpen,
      link: `/experiment/${id}/preview`,
      completed: record.previewCompleted,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: '实验模拟',
      description: 'PhET风格交互式虚拟实验，动手操作',
      icon: PlayCircle,
      link: `/experiment/${id}/simulation`,
      completed: record.simulationCompleted,
      color: 'from-accent-500 to-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: '高考真题',
      description: '分难度练习、智能批改、详细解析',
      icon: PenTool,
      link: `/experiment/${id}/practice`,
      completed: record.practiceStats.totalQuestions > 0,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-primary-500 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft size={18} />
        返回实验列表
      </button>

      {/* 实验头部 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <CatIcon size={28} />
            <span className="px-3 py-1 rounded-full bg-white/20 text-sm backdrop-blur-sm">
              {categoryLabels[experiment.category]}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${difficultyColors[experiment.difficulty]}`}>
              {difficultyLabels[experiment.difficulty]}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-3 font-display">{experiment.name}</h1>
          <p className="text-primary-100 max-w-2xl">{experiment.description}</p>
        </div>
      </div>

      {/* 三个学习模块 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.title}
              to={mod.link}
              className="group relative bg-white rounded-2xl p-6 shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${mod.bgColor} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <Icon size={26} />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary-700 group-hover:text-primary-600 transition-colors">
                    {mod.title}
                  </h3>
                  {mod.completed && (
                    <CheckCircle2 className="text-green-500" size={20} />
                  )}
                </div>
                
                <p className="text-sm text-primary-500 mb-4">{mod.description}</p>
                
                <div className={`text-sm font-medium ${mod.textColor} flex items-center gap-1`}>
                  进入学习
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 学习进度 */}
      <div className="bg-white rounded-xl p-6 shadow-soft">
        <h3 className="font-bold text-primary-700 mb-4">学习进度</h3>
        <div className="space-y-4">
          {modules.map(mod => {
            const percentage = mod.completed ? 100 : 0;
            return (
              <div key={mod.title}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-primary-600">{mod.title}</span>
                  <span className="text-sm text-primary-500">{percentage}%</span>
                </div>
                <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${mod.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail;
