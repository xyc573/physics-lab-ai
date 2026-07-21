import { useState, useMemo } from 'react';
import { Plus, Trash2, Download, Eye, BookOpen, FileJson, ChevronDown, ChevronUp } from 'lucide-react';
import { experiments } from '../data/experiments';
import { useQuestionStore } from '../data/questions';
import type { Question, QuestionType } from '../types/question';
import type { Difficulty } from '../types/experiment';

const QuestionManager = () => {
  const { questions: originalQuestions, loadQuestions } = useQuestionStore();
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  
  const [questionType, setQuestionType] = useState<QuestionType>('fill');
  const [experimentId, setExperimentId] = useState(experiments[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [multipleAnswers, setMultipleAnswers] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [knowledgePoints, setKnowledgePoints] = useState('');

  const allQuestions = useMemo(() => {
    return [...originalQuestions, ...customQuestions];
  }, [originalQuestions, customQuestions]);

  const difficultyLabels: Record<Difficulty, string> = {
    easy: '简单',
    medium: '适中',
    hard: '困难',
  };

  const typeLabels: Record<QuestionType, string> = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
  };

  const generateId = () => {
    const rand = Math.random().toString(36).substring(2, 8);
    return `${experimentId}-${difficulty}-custom-${rand}`;
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
  };

  const buildQuestion = (): Question | null => {
    if (!content.trim()) return null;
    
    const id = generateId();
    const contentHtml = `<p>${escapeHtml(content)}</p>`;
    const answerHtml = `<p>${escapeHtml(answer)}</p>`;
    const explanationHtml = explanation ? `<p>${escapeHtml(explanation)}</p>` : '';
    const kpList = knowledgePoints
      .split(/[,，、]/)
      .map(s => s.trim())
      .filter(Boolean);

    const q: Question = {
      id,
      experimentId,
      type: questionType,
      difficulty,
      content: content.trim(),
      contentHtml,
      answer: questionType === 'multiple' ? multipleAnswers : answer,
      answerHtml,
      explanation: explanation.trim(),
      explanationHtml,
      knowledgePoints: kpList,
      images: [],
      hasFormula: false,
    };

    if (questionType === 'single' || questionType === 'multiple') {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) return null;
      q.options = validOptions;
    }

    return q;
  };

  const handleAdd = () => {
    const q = buildQuestion();
    if (!q) {
      alert('请填写完整的题目内容！');
      return;
    }
    setCustomQuestions(prev => [...prev, q]);
    setContent('');
    setAnswer('');
    setMultipleAnswers([]);
    setExplanation('');
    setKnowledgePoints('');
    setOptions(['', '', '', '']);
    alert('添加成功！题目已添加到列表中，记得最后导出JSON文件哦。');
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除这道题吗？')) return;
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(allQuestions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    const q = buildQuestion();
    if (q) {
      setPreviewQuestion(q);
    } else {
      alert('请先填写题目内容！');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('至少需要2个选项！');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const toggleMultipleAnswer = (opt: string) => {
    if (multipleAnswers.includes(opt)) {
      setMultipleAnswers(multipleAnswers.filter(a => a !== opt));
    } else {
      setMultipleAnswers([...multipleAnswers, opt]);
    }
  };

  const exp = experiments.find(e => e.id === experimentId);

  const questionsByExperiment = useMemo(() => {
    const map: Record<string, Question[]> = {};
    allQuestions.forEach(q => {
      if (!map[q.experimentId]) map[q.experimentId] = [];
      map[q.experimentId].push(q);
    });
    return map;
  }, [allQuestions]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={28} />
          <h1 className="text-2xl font-bold">题库管理</h1>
        </div>
        <p className="text-indigo-100">添加、编辑题目，完成后导出JSON文件替换即可</p>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowForm(!showForm)}
        >
          <h2 className="text-lg font-bold text-primary-700 flex items-center gap-2">
            <Plus className="text-indigo-500" size={20} />
            添加新题目
          </h2>
          {showForm ? <ChevronUp size={20} className="text-primary-400" /> : <ChevronDown size={20} className="text-primary-400" />}
        </div>

        {showForm && (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-600 mb-1">所属实验</label>
                <select
                  value={experimentId}
                  onChange={(e) => setExperimentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {experiments.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-600 mb-1">题型</label>
                <select
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value as QuestionType);
                    setMultipleAnswers([]);
                    setAnswer('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="fill">填空题</option>
                  <option value="single">单选题</option>
                  <option value="multiple">多选题</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-600 mb-1">难度</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">简单</option>
                  <option value="medium">适中</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-600 mb-1">题目内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入题目内容，填空题用 _______ 表示空格..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            {(questionType === 'single' || questionType === 'multiple') && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-primary-600">选项（{options.length}个）</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`选项 ${String.fromCharCode(65 + i)} 的内容`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => removeOption(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="删除此选项"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + 添加选项
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-primary-600 mb-1">
                {questionType === 'multiple' ? '正确答案（点击选择）' : questionType === 'single' ? '正确答案（选项字母）' : '正确答案（多个空用空格分隔）'}
              </label>
              {questionType === 'multiple' ? (
                <div className="flex flex-wrap gap-2">
                  {options.filter(o => o.trim()).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => toggleMultipleAnswer(String.fromCharCode(65 + i))}
                      className={`px-4 py-2 rounded-lg border-2 transition font-medium ${
                        multipleAnswers.includes(String.fromCharCode(65 + i))
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                  ))}
                </div>
              ) : questionType === 'single' ? (
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                  placeholder="例如：C"
                  maxLength={1}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-bold"
                />
              ) : (
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="多个空的答案用空格分隔，例如：3.0 小于 增大"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-600 mb-1">答案解析（可选）</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="请输入答案解析..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-600 mb-1">知识点（可选，用逗号分隔）</label>
              <input
                type="text"
                value={knowledgePoints}
                onChange={(e) => setKnowledgePoints(e.target.value)}
                placeholder="例如：胡克定律, 弹簧弹力, 劲度系数"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                <Eye size={18} />
                预览效果
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <Plus size={18} />
                添加题目
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium ml-auto"
              >
                <Download size={18} />
                导出 questions.json
              </button>
            </div>
          </div>
        )}
      </div>

      {previewQuestion && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2">
            <Eye className="text-indigo-500" size={20} />
            题目预览
          </h2>
          <div className="p-5 bg-indigo-50 rounded-lg">
            <p className="text-sm text-primary-500 mb-2">
              {exp?.name} · {difficultyLabels[previewQuestion.difficulty]} · {typeLabels[previewQuestion.type]}
            </p>
            <p className="text-primary-800 leading-relaxed whitespace-pre-wrap">{previewQuestion.content}</p>
            {(previewQuestion.type === 'single' || previewQuestion.type === 'multiple') && previewQuestion.options && (
              <div className="mt-4 space-y-2">
                {previewQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-white border-2 border-indigo-300 flex items-center justify-center text-sm font-medium text-indigo-600 flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-primary-700">{opt}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-indigo-200">
              <p className="text-sm font-medium text-green-700 mb-1">✅ 正确答案：
                {previewQuestion.type === 'multiple' 
                  ? (previewQuestion.answer as string[]).join('、')
                  : previewQuestion.answer}
              </p>
              {previewQuestion.explanation && (
                <p className="text-sm text-primary-600 mt-2">💡 解析：{previewQuestion.explanation}</p>
              )}
              {previewQuestion.knowledgePoints && previewQuestion.knowledgePoints.length > 0 && (
                <p className="text-xs text-primary-500 mt-2">📚 知识点：{previewQuestion.knowledgePoints.join('、')}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setPreviewQuestion(null)}
            className="mt-4 text-sm text-primary-500 hover:text-primary-700"
          >
            关闭预览
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileJson className="text-green-500" size={20} />
            当前题库（共 {allQuestions.length} 题）
          </span>
          <span className="text-sm font-normal text-primary-500">
            原有 {originalQuestions.length} 题 + 新增 {customQuestions.length} 题
          </span>
        </h2>

        <div className="space-y-6">
          {experiments.map(exp => {
            const qs = questionsByExperiment[exp.id] || [];
            if (qs.length === 0) return null;
            return (
              <div key={exp.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-medium text-primary-700">
                    {exp.name}
                    <span className="ml-2 text-sm font-normal text-primary-500">（{qs.length} 题）</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {qs.map((q, idx) => (
                    <div key={q.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50">
                      <span className="text-sm text-primary-400 w-8 flex-shrink-0">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary-700 truncate">{q.content}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            {typeLabels[q.type]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {difficultyLabels[q.difficulty]}
                          </span>
                          {q.id.includes('custom') && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              新增
                            </span>
                          )}
                        </div>
                      </div>
                      {q.id.includes('custom') && (
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                          title="删除此题"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {customQuestions.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ 你已添加 {customQuestions.length} 道新题目，记得点击下面的按钮导出 <code className="bg-yellow-100 px-1 rounded">questions.json</code>，然后替换掉压缩包里的同名文件哦！
            </p>
            <button
              onClick={handleExport}
              className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Download size={18} />
              下载 questions.json
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionManager;
