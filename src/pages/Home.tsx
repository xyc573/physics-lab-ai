import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  PlayCircle, 
  PenTool, 
  FlaskConical,
  Zap,
  Sun,
  Thermometer,
  Atom,
  ChevronRight,
  CheckCircle2,
  Circle,
  Filter,
  Sparkles,
  QrCode,
  Settings
} from 'lucide-react';
import { experiments } from '../data/experiments';
import { categoryLabels, difficultyLabels, difficultyColors } from '../types/experiment';
import { useLearningStore } from '../store/learningStore';
import type { ExperimentCategory } from '../types/experiment';

const iconMap: Record<string, React.ElementType> = {
  spring: FlaskConical,
  pendulum: PlayCircle,
  target: PenTool,
  zap: Zap,
  sun: Sun,
  thermometer: Thermometer,
};

const categoryIcons: Record<ExperimentCategory, React.ElementType> = {
  book1: BookOpen,
  book2: BookOpen,
  book3: BookOpen,
  selective1: FlaskConical,
  selective2: FlaskConical,
  selective3: Atom,
};

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<ExperimentCategory | 'all'>('all');
  const getRecord = useLearningStore(state => state.getRecord);
  const records = useLearningStore(state => state.records);
  
  const filteredExperiments = useMemo(() => {
    if (selectedCategory === 'all') return experiments;
    return experiments.filter(exp => exp.category === selectedCategory);
  }, [selectedCategory]);

  const totalStats = useMemo(() => {
    const recordList = Object.values(records);
    let totalQuestions = 0;
    let correctAnswers = 0;
    let completedPreviews = 0;
    let completedSimulations = 0;
    
    recordList.forEach(r => {
      if (r.previewCompleted) completedPreviews++;
      if (r.simulationCompleted) completedSimulations++;
      totalQuestions += r.practiceStats.totalQuestions;
      correctAnswers += r.practiceStats.correctCount;
    });
    
    return { completedPreviews, completedSimulations, totalQuestions, correctAnswers };
  }, [records]);

  const categories: (ExperimentCategory | 'all')[] = ['all', 'book1', 'book2', 'book3', 'selective1', 'selective2', 'selective3'];

  return (
    <div className="space-y-8">
      {/* Hero区域 */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">
            探索物理实验的奥秘
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            从课前预习到虚拟实验，再到高考真题训练，一站式提升你的物理实验能力
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <BookOpen className="mx-auto mb-2 text-accent-300" size={28} />
              <p className="font-semibold">课前预习</p>
              <p className="text-xs text-primary-200 mt-1">原理器材讲解</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <PlayCircle className="mx-auto mb-2 text-accent-300" size={28} />
              <p className="font-semibold">实验模拟</p>
              <p className="text-xs text-primary-200 mt-1">PhET风格交互</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <PenTool className="mx-auto mb-2 text-accent-300" size={28} />
              <p className="font-semibold">高考真题</p>
              <p className="text-xs text-primary-200 mt-1">智能批改解析</p>
            </div>
          </div>
          
          <Link
            to="/manager"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-sm text-white/80 hover:text-white transition"
          >
            <Settings size={16} />
            教师入口 · 题库管理
          </Link>
        </div>
      </section>

      {/* 学习进度概览 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <p className="text-sm text-primary-500 mb-1">实验总数</p>
          <p className="text-3xl font-bold text-primary-700">{experiments.length}</p>
          <p className="text-xs text-primary-400 mt-1">个经典实验</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <p className="text-sm text-primary-500 mb-1">预习完成</p>
          <p className="text-3xl font-bold text-green-600">{totalStats.completedPreviews}</p>
          <p className="text-xs text-primary-400 mt-1">个实验</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <p className="text-sm text-primary-500 mb-1">模拟完成</p>
          <p className="text-3xl font-bold text-accent-500">{totalStats.completedSimulations}</p>
          <p className="text-xs text-primary-400 mt-1">个实验</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <p className="text-sm text-primary-500 mb-1">练习正确率</p>
          <p className="text-3xl font-bold text-primary-600">
            {totalStats.totalQuestions > 0 
              ? Math.round((totalStats.correctAnswers / totalStats.totalQuestions) * 100) 
              : 0}%
          </p>
          <p className="text-xs text-primary-400 mt-1">
            共{totalStats.totalQuestions}题
          </p>
        </div>
      </section>

      {/* 实验列表 */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-primary-700 flex items-center gap-2">
            <FlaskConical className="text-accent-500" size={24} />
            实验列表
          </h3>
        </div>
        
        {/* 分类筛选 */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter size={16} className="text-primary-500" />
          {categories.map(cat => {
            const Icon = cat === 'all' ? FlaskConical : categoryIcons[cat];
            const label = cat === 'all' ? '全部' : categoryLabels[cat];
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-white text-primary-600 hover:bg-primary-50 shadow-soft'
                  }
                `}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        {/* 实验卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperiments.map((exp, index) => {
            const Icon = iconMap[exp.icon] || FlaskConical;
            const record = getRecord(exp.id);
            const progress = [
              record.previewCompleted,
              record.simulationCompleted,
              record.practiceStats.totalQuestions > 0,
            ].filter(Boolean).length;
            
            return (
              <Link
                key={exp.id}
                to={`/experiment/${exp.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnptMC00djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                  <Icon className="text-white/90 relative z-10" size={48} />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColors[exp.difficulty]}`}>
                      {difficultyLabels[exp.difficulty]}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {categoryLabels[exp.category]}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h4 className="font-bold text-primary-700 text-lg mb-2 group-hover:text-primary-600 transition-colors">
                    {exp.name}
                  </h4>
                  <p className="text-sm text-primary-500 mb-4 line-clamp-2">
                    {exp.description}
                  </p>
                  
                  {/* 进度指示 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        i < progress ? (
                          <CheckCircle2 key={i} size={16} className="text-green-500" />
                        ) : (
                          <Circle key={i} size={16} className="text-primary-200" />
                        )
                      ))}
                    </div>
                    <span className="text-sm text-primary-500 flex items-center gap-1 group-hover:text-accent-500 transition-colors">
                      开始学习
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
