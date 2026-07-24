import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Download, Eye, BookOpen, FileJson, 
  ChevronDown, ChevronUp, Edit3, Search, Upload, 
  X, Check, Filter, RotateCcw, Save
} from 'lucide-react';
import { experiments } from '../data/experiments';
import { useQuestionStore } from '../data/questions';
import type { Question, QuestionType } from '../types/question';
import type { Difficulty } from '../types/experiment';

const STORAGE_KEY = 'physics-lab-custom-questions';
const DELETED_KEY = 'physics-lab-deleted-questions';
const EDITED_KEY = 'physics-lab-edited-questions';

const QuestionManager = () => {
  const { questions: originalQuestions, loading, loadQuestions } = useQuestionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);
  
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DELETED_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  
  const [editedQuestions, setEditedQuestions] = useState<Record<string, Question>>(() => {
    try {
      const saved = localStorage.getItem(EDITED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  const [showForm, setShowForm] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterExp, setFilterExp] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDiff, setFilterDiff] = useState<string>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  
  const [questionType, setQuestionType] = useState<QuestionType>('fill');
  const [experimentId, setExperimentId] = useState(experiments[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [multipleAnswers, setMultipleAnswers] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [knowledgePoints, setKnowledgePoints] = useState('');

  const saveCustomToStorage = (data: Question[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };
  
  const saveDeletedToStorage = (ids: Set<string>) => {
    localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
  };
  
  const saveEditedToStorage = (data: Record<string, Question>) => {
    localStorage.setItem(EDITED_KEY, JSON.stringify(data));
  };

  const allQuestions = useMemo(() => {
    const edited = Object.values(editedQuestions);
    const editedIds = new Set(edited.map(q => q.id));
    const customIds = new Set(customQuestions.map(q => q.id));
    
    const result: Question[] = [];
    
    originalQuestions.forEach(q => {
      if (deletedIds.has(q.id) && !showDeleted) return;
      if (editedIds.has(q.id)) {
        result.push(editedQuestions[q.id]);
      } else {
        result.push(q);
      }
    });
    
    customQuestions.forEach(q => {
      if (deletedIds.has(q.id) && !showDeleted) return;
      result.push(q);
    });
    
    return result;
  }, [originalQuestions, customQuestions, deletedIds, editedQuestions, showDeleted]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (filterExp !== 'all' && q.experimentId !== filterExp) return false;
      if (filterType !== 'all' && q.type !== filterType) return false;
      if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
      if (searchText && !q.content.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [allQuestions, filterExp, filterType, filterDiff, searchText]);

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

  const resetForm = () => {
    setContent('');
    setAnswer('');
    setMultipleAnswers([]);
    setExplanation('');
    setKnowledgePoints('');
    setOptions(['', '', '', '']);
    setEditingId(null);
    setQuestionType('fill');
    setExperimentId(experiments[0].id);
    setDifficulty('medium');
  };

  const buildQuestion = (): Question | null => {
    if (!content.trim()) return null;
    
    const id = editingId || generateId();
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
    
    if (editingId) {
      const isOriginal = originalQuestions.some(oq => oq.id === editingId);
      if (isOriginal) {
        const newEdited = { ...editedQuestions, [editingId]: q };
        setEditedQuestions(newEdited);
        saveEditedToStorage(newEdited);
      } else {
        const newCustom = customQuestions.map(cq => cq.id === editingId ? q : cq);
        setCustomQuestions(newCustom);
        saveCustomToStorage(newCustom);
      }
      alert('题目已更新！');
    } else {
      const newCustom = [...customQuestions, q];
      setCustomQuestions(newCustom);
      saveCustomToStorage(newCustom);
      alert('添加成功！');
    }
    
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setExperimentId(q.experimentId);
    setQuestionType(q.type);
    setDifficulty(q.difficulty);
    setContent(q.content);
    setAnswer(q.type === 'multiple' ? '' : q.answer as string);
    setMultipleAnswers(q.type === 'multiple' ? q.answer as string[] : []);
    setExplanation(q.explanation);
    setKnowledgePoints(q.knowledgePoints.join('、'));
    setOptions(q.options || ['', '', '', '']);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除这道题吗？删除后可在"已删除"中恢复。')) return;
    const newDeleted = new Set(deletedIds).add(id);
    setDeletedIds(newDeleted);
    saveDeletedToStorage(newDeleted);
  };

  const handleRestore = (id: string) => {
    const newDeleted = new Set(deletedIds);
    newDeleted.delete(id);
    setDeletedIds(newDeleted);
    saveDeletedToStorage(newDeleted);
  };

  const handlePermanentDelete = (id: string) => {
    if (!confirm('确定永久删除这道题吗？此操作不可恢复！')) return;
    
    const newCustom = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(newCustom);
    saveCustomToStorage(newCustom);
    
    const newDeleted = new Set(deletedIds);
    newDeleted.delete(id);
    setDeletedIds(newDeleted);
    saveDeletedToStorage(newDeleted);
    
    const newEdited = { ...editedQuestions };
    delete newEdited[id];
    setEditedQuestions(newEdited);
    saveEditedToStorage(newEdited);
  };

  const handleExport = () => {
    const exportData = allQuestions.filter(q => !deletedIds.has(q.id));
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) throw new Error('格式错误');
        
        const count = data.length;
        const choice = confirm(
          `检测到 ${count} 道题目。\n\n` +
          '选择"确定"：替换全部题库（删除现有题目）\n' +
          '选择"取消"：追加到现有题库'
        );
        
        if (choice) {
          setCustomQuestions(data);
          saveCustomToStorage(data);
          const newDeleted = new Set<string>();
          originalQuestions.forEach(q => newDeleted.add(q.id));
          setDeletedIds(newDeleted);
          saveDeletedToStorage(newDeleted);
          setEditedQuestions({});
          saveEditedToStorage({});
          alert(`已替换为 ${count} 道题目！`);
        } else {
          const newCustom = [...customQuestions, ...data];
          setCustomQuestions(newCustom);
          saveCustomToStorage(newCustom);
          alert(`已追加 ${count} 道题目！`);
        }
      } catch (err) {
        alert('导入失败：文件格式不正确，请确保是有效的JSON题库文件。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    filteredQuestions.forEach(q => {
      if (!map[q.experimentId]) map[q.experimentId] = [];
      map[q.experimentId].push(q);
    });
    return map;
  }, [filteredQuestions]);

  const getQuestionStatus = (q: Question) => {
    if (deletedIds.has(q.id)) return 'deleted';
    if (editedQuestions[q.id]) return 'edited';
    if (customQuestions.some(cq => cq.id === q.id)) return 'custom';
    return 'original';
  };

  const handleResetAll = () => {
    if (!confirm('确定恢复所有修改吗？\n\n将恢复被删除的原题、清空所有新增和修改。')) return;
    setCustomQuestions([]);
    setDeletedIds(new Set());
    setEditedQuestions({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DELETED_KEY);
    localStorage.removeItem(EDITED_KEY);
    alert('已恢复原始题库！');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={28} />
          <h1 className="text-2xl font-bold">题库管理</h1>
        </div>
        <p className="text-indigo-100">添加、编辑、删除题目，完成后导出JSON文件替换即可</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium"
          >
            <Plus size={18} />
            新增题目
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium"
          >
            <Upload size={18} />
            导入题库
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition font-medium"
          >
            <Download size={18} />
            导出题库
          </button>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium ml-auto"
          >
            <RotateCcw size={18} />
            恢复原题
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索题目内容..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterExp}
            onChange={(e) => setFilterExp(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全部实验</option>
            {experiments.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全部题型</option>
            <option value="fill">填空题</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
          </select>
          <select
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">适中</option>
            <option value="hard">困难</option>
          </select>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-3 py-2 rounded-lg border transition font-medium ${
              showDeleted 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-white border-slate-300 text-primary-600 hover:bg-slate-50'
            }`}
          >
            <Trash2 size={16} className="inline mr-1" />
            已删除 ({deletedIds.size})
          </button>
        </div>
        <div className="mt-3 text-sm text-primary-500">
          共 {filteredQuestions.length} 道题目
          {showDeleted && <span className="text-red-500 ml-2">（包含已删除）</span>}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary-700 flex items-center gap-2">
              {editingId ? <Edit3 className="text-amber-500" size={20} /> : <Plus className="text-indigo-500" size={20} />}
              {editingId ? '编辑题目' : '添加新题目'}
            </h2>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-primary-400 hover:text-primary-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
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
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
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
                <Save size={18} />
                {editingId ? '保存修改' : '添加题目'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium ml-auto"
                >
                  取消编辑
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
        <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2">
          <FileJson className="text-green-500" size={20} />
          题库列表
          <span className="text-sm font-normal text-primary-500 ml-2">
            （{filteredQuestions.length} 题）
          </span>
        </h2>

        <div className="space-y-6">
          {experiments.map(expItem => {
            const qs = questionsByExperiment[expItem.id] || [];
            if (qs.length === 0) return null;
            return (
              <div key={expItem.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-medium text-primary-700">
                    {expItem.name}
                    <span className="ml-2 text-sm font-normal text-primary-500">（{qs.length} 题）</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {qs.map((q, idx) => {
                    const status = getQuestionStatus(q);
                    const isDeleted = status === 'deleted';
                    return (
                      <div 
                        key={q.id} 
                        className={`px-4 py-3 flex items-start gap-3 ${isDeleted ? 'bg-red-50/50 opacity-60' : 'hover:bg-slate-50'}`}
                      >
                        <span className="text-sm text-primary-400 w-8 flex-shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isDeleted ? 'text-red-700 line-through' : 'text-primary-700'}`}>
                            {q.content}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
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
                            {status === 'custom' && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                新增
                              </span>
                            )}
                            {status === 'edited' && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                已修改
                              </span>
                            )}
                            {status === 'deleted' && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                已删除
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestore(q.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                                title="恢复此题"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(q.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                title="永久删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(q)}
                                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded transition"
                                title="编辑此题"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                title="删除此题"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-primary-400">
              <Search size={48} className="mx-auto mb-3 opacity-50" />
              <p>没有找到匹配的题目</p>
            </div>
          )}
        </div>

        {(customQuestions.length > 0 || deletedIds.size > 0 || Object.keys(editedQuestions).length > 0) && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              ⚠️ 你已修改题库（新增 {customQuestions.length} 题，编辑 {Object.keys(editedQuestions).length} 题，删除 {deletedIds.size} 题），
              记得点击下面的按钮导出 <code className="bg-amber-100 px-1 rounded">questions.json</code>，然后替换掉压缩包里的同名文件哦！
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
