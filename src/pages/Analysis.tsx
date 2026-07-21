import { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  BookOpen,
  PlayCircle,
  Mail,
  XCircle,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, DoughnutController } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { experiments } from '../data/experiments';
import { useQuestionStore } from '../data/questions';
import { useLearningStore } from '../store/learningStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, DoughnutController);

const Analysis = () => {
  const records = useLearningStore(state => state.records);
  const resetProgress = useLearningStore(state => state.resetProgress);
  const { questions, loading: questionsLoading, loadQuestions } = useQuestionStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const totalStats = useMemo(() => {
    const allRecords = Object.values(records);
    let totalQuestions = 0;
    let correctAnswers = 0;
    let completedPreviews = 0;
    let completedSimulations = 0;
    const allWrong: string[] = [];
    
    allRecords.forEach(r => {
      if (r.previewCompleted) completedPreviews++;
      if (r.simulationCompleted) completedSimulations++;
      totalQuestions += r.practiceStats.totalQuestions;
      correctAnswers += r.practiceStats.correctCount;
      allWrong.push(...r.practiceStats.wrongQuestionIds);
    });
    
    return {
      totalExperiments: allRecords.length,
      completedPreviews,
      completedSimulations,
      totalQuestions,
      correctAnswers,
      wrongQuestions: allWrong,
      allRecords,
    };
  }, [records]);

  const allRecords = totalStats.allRecords;
  
  const wrongQuestions = useMemo(() => {
    const wrongIds = totalStats.wrongQuestions;
    return questions.filter(q => wrongIds.includes(q.id));
  }, [totalStats.wrongQuestions, questions]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {};
    allRecords.forEach(record => {
      const exp = experiments.find(e => e.id === record.experimentId);
      if (exp) {
        if (!stats[exp.category]) {
          stats[exp.category] = { total: 0, correct: 0 };
        }
        stats[exp.category].total += record.practiceStats.totalQuestions;
        stats[exp.category].correct += record.practiceStats.correctCount;
      }
    });
    return stats;
  }, [allRecords]);

  const categoryLabels: Record<string, string> = {
    book1: '必修一',
    book2: '必修二',
    book3: '必修三',
    selective1: '选择性必修一',
    selective2: '选择性必修二',
    selective3: '选择性必修三',
  };

  const barChartData = {
    labels: Object.keys(categoryStats).map(k => categoryLabels[k] || k),
    datasets: [
      {
        label: '正确率 (%)',
        data: Object.values(categoryStats).map(s => s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0),
        backgroundColor: 'rgba(46, 104, 171, 0.7)',
        borderColor: '#2e68ab',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const overallData = {
    labels: ['正确', '错误'],
    datasets: [
      {
        data: [totalStats.correctAnswers, totalStats.wrongQuestions.length],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          '#22c55e',
          '#ef4444',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const handleSendReport = () => {
    if (!teacherEmail || !teacherEmail.includes('@')) {
      alert('请输入有效的邮箱地址');
      return;
    }
    setReportSent(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSent(false);
      setTeacherEmail('');
    }, 2000);
  };

  const generateReportText = () => {
    let report = '高中物理实验学习报告\n\n';
    report += `预习完成实验：${totalStats.completedPreviews}/${experiments.length} 个\n`;
    report += `模拟完成实验：${totalStats.completedSimulations}/${experiments.length} 个\n`;
    report += `总练习题数：${totalStats.totalQuestions} 题\n`;
    report += `正确题数：${totalStats.correctAnswers} 题\n`;
    report += `总正确率：${totalStats.totalQuestions > 0 ? Math.round((totalStats.correctAnswers / totalStats.totalQuestions) * 100) : 0}%\n\n`;
    
    report += '各分类正确率：\n';
    Object.entries(categoryStats).forEach(([cat, stat]) => {
      const rate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      report += `  ${categoryLabels[cat] || cat}: ${rate}% (${stat.correct}/${stat.total})\n`;
    });
    
    if (wrongQuestions.length > 0) {
      report += `\n错题（${wrongQuestions.length}道）：\n`;
      wrongQuestions.slice(0, 10).forEach((q, i) => {
        const exp = experiments.find(e => e.id === q.experimentId);
        report += `  ${i + 1}. [${exp?.name || '未知实验'}] ${q.content.substring(0, 50)}...\n`;
      });
    }
    
    return report;
  };

  const handleDownloadReport = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '物理实验学习报告.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (questionsLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={28} />
          <h1 className="text-2xl font-bold">学习数据分析</h1>
        </div>
        <p className="text-blue-100">全面了解你的物理实验学习情况</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-primary-500">预习完成</span>
          </div>
          <p className="text-2xl font-bold text-primary-700">
            {totalStats.completedPreviews}
            <span className="text-base font-normal text-primary-400">/{experiments.length}</span>
          </p>
          <p className="text-xs text-primary-400 mt-1">个实验</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <PlayCircle className="text-orange-600" size={20} />
            </div>
            <span className="text-sm text-primary-500">模拟完成</span>
          </div>
          <p className="text-2xl font-bold text-primary-700">
            {totalStats.completedSimulations}
            <span className="text-base font-normal text-primary-400">/{experiments.length}</span>
          </p>
          <p className="text-xs text-primary-400 mt-1">个实验</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-primary-500">练习题目</span>
          </div>
          <p className="text-2xl font-bold text-primary-700">{totalStats.totalQuestions}</p>
          <p className="text-xs text-primary-400 mt-1">道</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <span className="text-sm text-primary-500">正确率</span>
          </div>
          <p className="text-2xl font-bold text-primary-700">
            {totalStats.totalQuestions > 0 
              ? Math.round((totalStats.correctAnswers / totalStats.totalQuestions) * 100) 
              : 0}%
          </p>
          <p className="text-xs text-primary-400 mt-1">
            正确 {totalStats.correctAnswers} / 共 {totalStats.totalQuestions} 题
          </p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 分类正确率柱状图 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6">
          <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
            <BarChart3 className="text-primary-500" size={20} />
            各分类正确率
          </h3>
          {Object.keys(categoryStats).length > 0 ? (
            <div className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-primary-400">
              <div className="text-center">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                <p>暂无练习数据</p>
                <p className="text-sm">开始练习后这里会显示你的学习数据</p>
              </div>
            </div>
          )}
        </div>

        {/* 整体正确率环形图 */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
            <Target className="text-accent-500" size={20} />
            整体正确率
          </h3>
          {totalStats.totalQuestions > 0 ? (
            <div className="h-56">
              <Doughnut data={overallData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-primary-400">
              <div className="text-center">
                <Target size={32} className="mx-auto mb-2 opacity-50" />
                <p>暂无数据</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 错题本 */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-primary-700 flex items-center gap-2">
            <XCircle className="text-red-500" size={20} />
            错题本
            <span className="text-sm font-normal text-primary-400">
              （共{wrongQuestions.length}道）
            </span>
          </h3>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Download size={16} />
            下载报告
          </button>
        </div>
        
        {wrongQuestions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wrongQuestions.map((q, idx) => {
              const exp = experiments.find(e => e.id === q.experimentId);
              return (
                <div key={q.id} className="p-4 border border-red-100 rounded-xl bg-red-50/50">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary-500 mb-1">
                        <span className="font-medium text-primary-600">{exp?.name}</span>
                        <span className="mx-2">·</span>
                        <span className={
                          q.difficulty === 'easy' ? 'text-green-600' :
                          q.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }>
                          {q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '适中' : '困难'}
                        </span>
                      </p>
                      <p className="text-primary-700 text-sm line-clamp-2">{q.content}</p>
                      <p className="text-xs text-primary-400 mt-2">
                        知识点：{q.knowledgePoints.join('、')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-primary-400">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400" />
            <p className="text-lg font-medium text-primary-600">太棒了！还没有错题</p>
            <p className="text-sm">继续保持，全部答对！</p>
          </div>
        )}
      </div>

      {/* 操作区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 发送给老师 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
              <Mail size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-700 mb-1">发送给老师</h3>
              <p className="text-sm text-blue-600 mb-4">
                一键生成学习报告，发送给老师了解你的学习情况
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                生成并发送报告
              </button>
            </div>
          </div>
        </div>

        {/* 重置进度 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <RotateCcw size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-700 mb-1">重置学习进度</h3>
              <p className="text-sm text-amber-600 mb-4">
                清空所有学习记录，重新开始学习
              </p>
              <button
                onClick={() => {
                  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
                    resetProgress();
                  }
                }}
                className="w-full py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                重置进度
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 发送报告弹窗 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-slide-up">
            {!reportSent ? (
              <>
                <h3 className="text-xl font-bold text-primary-700 mb-4">发送学习报告</h3>
                <p className="text-primary-500 text-sm mb-4">
                  输入老师的邮箱地址，系统将把你的学习报告发送过去。
                </p>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 mb-4"
                />
                <div className="bg-primary-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-primary-500">
                    报告将包含：预习进度、模拟进度、练习正确率、错题列表
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 border border-primary-200 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSendReport}
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    发送报告
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-primary-700 mb-2">发送成功！</h3>
                <p className="text-primary-500">学习报告已发送到老师的邮箱</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
