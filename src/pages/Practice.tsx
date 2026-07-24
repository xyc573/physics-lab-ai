import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PenTool, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Lightbulb,
  AlertCircle,
  Target
} from 'lucide-react';
import { getExperimentById } from '../data/experiments';
import { difficultyLabels, difficultyColors } from '../types/experiment';
import { useQuestionStore, getQuestionsByExperimentId } from '../data/questions';
import { useLearningStore } from '../store/learningStore';
import type { Difficulty } from '../types/experiment';
import type { Question } from '../types/question';

const parseFillAnswers = (answerStr: string): string[] => {
  if (!answerStr) return [];
  
  let cleaned = answerStr.trim();
  
  // 移除开头的题目编号，如 "1．"、"2." 等
  cleaned = cleaned.replace(/^\d+[．.]\s*/, '');
  
  // 尝试匹配 (1)xxx (2)xxx 格式
  // 先检查是否有 (1) 这样的标记
  if (/\(\d+\)/.test(cleaned)) {
    const parts: string[] = [];
    // 用 (数字) 分割
    const splitParts = cleaned.split(/\(\d+\)/);
    // 第一个元素通常是空的或前缀，跳过
    for (let i = 1; i < splitParts.length; i++) {
      const trimmed = splitParts[i].trim();
      if (trimmed) {
        parts.push(trimmed);
      }
    }
    if (parts.length > 0) {
      return parts;
    }
  }
  
  // 否则直接按空格分隔
  return cleaned.split(/\s+/).filter(Boolean);
};

const Practice = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const experiment = getExperimentById(id);
  const { questions: allQuestions, loading: questionsLoading, loadQuestions } = useQuestionStore();
  const recordPracticeResult = useLearningStore(state => state.recordPracticeResult);
  const getRecord = useLearningStore(state => state.getRecord);
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const experimentQuestions = getQuestionsByExperimentId(id, allQuestions);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const questions = useMemo(() => {
    if (selectedDifficulty === 'all') return experimentQuestions;
    return experimentQuestions.filter(q => q.difficulty === selectedDifficulty);
  }, [experimentQuestions, selectedDifficulty]);

  const currentQuestion: Question | undefined = questions[currentIndex];
  const record = getRecord(id);

  useEffect(() => {
    const adjustFormulas = () => {
      if (!contentRef.current) return;
      const images = contentRef.current.querySelectorAll('.question-html img.formula-inline');
      images.forEach(img => {
        const htmlImg = img as HTMLImageElement;
        if (htmlImg.naturalWidth > 500) {
          htmlImg.classList.add('formula-block');
        }
      });
    };

    const timer = setTimeout(adjustFormulas, 300);
    const images = contentRef.current?.querySelectorAll('.question-html img.formula-inline');
    images?.forEach(img => {
      (img as HTMLImageElement).addEventListener('load', adjustFormulas);
    });

    return () => {
      clearTimeout(timer);
      images?.forEach(img => {
        (img as HTMLImageElement).removeEventListener('load', adjustFormulas);
      });
    };
  }, [currentQuestion?.id, showExplanation]);

  if (!experiment) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">实验不存在</p>
      </div>
    );
  }

  if (questionsLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-primary-500 mb-4">加载题目中...</p>
      </div>
    );
  }

  const handleSelectOption = (questionId: string, option: string) => {
    if (submitted[questionId]) return;
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    if (question.type === 'single') {
      setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    } else if (question.type === 'multiple') {
      setUserAnswers(prev => {
        const current = (prev[questionId] as string[]) || [];
        if (current.includes(option)) {
          return { ...prev, [questionId]: current.filter(o => o !== option) };
        } else {
          return { ...prev, [questionId]: [...current, option].sort() };
        }
      });
    }
  };

  const handleFillInput = (questionId: string, value: string) => {
    if (submitted[questionId]) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const userAnswer = userAnswers[questionId];
    let isCorrect = false;
    let partiallyCorrect = false;
    let correctCount = 0;
    let totalCount = 0;
    
    if (question.type === 'fill') {
      const userAnswersArr = (userAnswer as string)?.trim().split(/\s+/).filter(Boolean) || [];
      const correctAnswersArr = parseFillAnswers(question.answer as string);
      totalCount = correctAnswersArr.length || 1;
      
      if (totalCount === 0 || correctAnswersArr.length === 0) {
        isCorrect = (userAnswer as string)?.trim() === question.answer;
        correctCount = isCorrect ? 1 : 0;
        totalCount = 1;
      } else {
        const minLen = Math.min(userAnswersArr.length, correctAnswersArr.length);
        for (let i = 0; i < minLen; i++) {
          if (userAnswersArr[i].trim() === correctAnswersArr[i].trim()) {
            correctCount++;
          }
        }
        isCorrect = correctCount === totalCount && userAnswersArr.length === correctAnswersArr.length;
        partiallyCorrect = correctCount > 0 && !isCorrect;
      }
    } else if (question.type === 'single') {
      isCorrect = userAnswer === question.answer;
      correctCount = isCorrect ? 1 : 0;
      totalCount = 1;
    } else if (question.type === 'multiple') {
      const correctSet = new Set(question.answer as string[]);
      const userSet = new Set((userAnswer as string[]) || []);
      totalCount = correctSet.size;
      
      correctSet.forEach(ans => {
        if (userSet.has(ans)) correctCount++;
      });
      
      const wrongSelections = [...userSet].filter(ans => !correctSet.has(ans)).length;
      isCorrect = correctCount === totalCount && wrongSelections === 0;
      partiallyCorrect = correctCount > 0 && !isCorrect;
    }
    
    setSubmitted(prev => ({ ...prev, [questionId]: true }));
    setShowExplanation(prev => ({ ...prev, [questionId]: true }));
    recordPracticeResult(id, questionId, isCorrect, question.difficulty);
  };

  const isCorrect = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return false;
    const userAnswer = userAnswers[questionId];
    
    if (question.type === 'fill') {
      const userAnswersArr = (userAnswer as string)?.trim().split(/\s+/).filter(Boolean) || [];
      const correctAnswersArr = parseFillAnswers(question.answer as string);
      if (correctAnswersArr.length === 0) {
        return (userAnswer as string)?.trim() === question.answer;
      }
      if (userAnswersArr.length !== correctAnswersArr.length) return false;
      for (let i = 0; i < correctAnswersArr.length; i++) {
        if (userAnswersArr[i].trim() !== correctAnswersArr[i].trim()) return false;
      }
      return true;
    } else if (question.type === 'single') {
      return userAnswer === question.answer;
    } else {
      const correct = (question.answer as string[]).sort().join(',');
      const user = ((userAnswer as string[]) || []).sort().join(',');
      return correct === user;
    }
  };

  const getCorrectInfo = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return { correctCount: 0, totalCount: 0, isPartiallyCorrect: false, details: [] as { user: string; correct: string; isCorrect: boolean }[] };
    const userAnswer = userAnswers[questionId];
    let correctCount = 0;
    let totalCount = 0;
    let details: { user: string; correct: string; isCorrect: boolean }[] = [];
    
    if (question.type === 'fill') {
      const userAnswersArr = (userAnswer as string)?.trim().split(/\s+/).filter(Boolean) || [];
      const correctAnswersArr = parseFillAnswers(question.answer as string);
      totalCount = correctAnswersArr.length || 1;
      
      if (correctAnswersArr.length === 0) {
        const correct = (userAnswer as string)?.trim() === question.answer;
        if (correct) correctCount = 1;
        details = [{ user: (userAnswer as string) || '', correct: question.answer as string, isCorrect: correct }];
      } else {
        const minLen = Math.min(userAnswersArr.length, correctAnswersArr.length);
        for (let i = 0; i < minLen; i++) {
          const correct = userAnswersArr[i].trim() === correctAnswersArr[i].trim();
          if (correct) correctCount++;
          details.push({ user: userAnswersArr[i], correct: correctAnswersArr[i], isCorrect: correct });
        }
        for (let i = minLen; i < correctAnswersArr.length; i++) {
          details.push({ user: '', correct: correctAnswersArr[i], isCorrect: false });
        }
        for (let i = minLen; i < userAnswersArr.length; i++) {
          details.push({ user: userAnswersArr[i], correct: '', isCorrect: false });
        }
      }
    } else if (question.type === 'single') {
      correctCount = isCorrect(questionId) ? 1 : 0;
      totalCount = 1;
    } else if (question.type === 'multiple') {
      const correctSet = new Set(question.answer as string[]);
      const userSet = new Set((userAnswer as string[]) || []);
      totalCount = correctSet.size;
      correctSet.forEach(ans => { if (userSet.has(ans)) correctCount++; });
    }
    
    return {
      correctCount,
      totalCount,
      isPartiallyCorrect: correctCount > 0 && correctCount < totalCount,
      details
    };
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted({});
    setShowExplanation({});
    setCurrentIndex(0);
  };

  const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];
  const diffLabels: Record<string, string> = { all: '全部', ...difficultyLabels };

  const correctCount = Object.keys(submitted).filter(id => submitted[id] && isCorrect(id)).length;
  const totalSubmitted = Object.keys(submitted).length;

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
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-700 transition-colors"
        >
          <RotateCcw size={18} />
          重新开始
        </button>
      </div>

      {/* 标题 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <PenTool size={24} />
          <h1 className="text-2xl font-bold">高考真题练习</h1>
        </div>
        <p className="text-green-100">{experiment.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 题目区域 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 难度筛选 */}
          <div className="bg-white rounded-xl shadow-soft p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-primary-600">难度筛选：</span>
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setCurrentIndex(0);
                  }}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${selectedDifficulty === diff
                      ? 'bg-primary-600 text-white'
                      : diff === 'all'
                        ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        : `${difficultyColors[diff as Difficulty]} hover:opacity-80`
                    }
                  `}
                >
                  {diffLabels[diff]}
                </button>
              ))}
            </div>
          </div>

          {/* 题目卡片 */}
          {currentQuestion ? (
            <div ref={contentRef} className="bg-white rounded-2xl shadow-soft p-6 md:p-8 animate-fade-in">
              {/* 题目头部 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[currentQuestion.difficulty]}`}>
                      {difficultyLabels[currentQuestion.difficulty]}
                    </span>
                    <span className="ml-2 text-sm text-primary-500">
                      {currentQuestion.type === 'single' ? '单选题' : currentQuestion.type === 'multiple' ? '多选题' : '填空题'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-primary-500">
                  {currentIndex + 1} / {questions.length}
                </div>
              </div>

              {/* 题目内容 */}
              <div 
                className="text-lg text-primary-700 leading-relaxed mb-6 question-html"
                dangerouslySetInnerHTML={{ __html: currentQuestion.contentHtml || currentQuestion.content }}
              />

              {/* 题目配图 */}
              {currentQuestion.images && currentQuestion.images.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-4 justify-center">
                  {currentQuestion.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`题目配图${idx + 1}`}
                      className="max-h-64 object-contain rounded-lg border border-primary-100 shadow-sm hover:shadow-md transition-shadow cursor-zoom-in"
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* 选项 */}
              {currentQuestion.options && (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    const isSelected = currentQuestion.type === 'single'
                      ? userAnswers[currentQuestion.id] === optionLetter
                      : (userAnswers[currentQuestion.id] as string[] || []).includes(optionLetter);
                    
                    const isSubmitted = submitted[currentQuestion.id];
                    const correctAnswer = currentQuestion.answer;
                    const isCorrectOption = currentQuestion.type === 'single'
                      ? correctAnswer === optionLetter
                      : (correctAnswer as string[]).includes(optionLetter);
                    
                    let optionStyle = 'border-primary-200 hover:border-primary-400 hover:bg-primary-50';
                    if (isSelected && !isSubmitted) {
                      optionStyle = 'border-primary-500 bg-primary-50';
                    }
                    if (isSubmitted) {
                      if (isCorrectOption) {
                        optionStyle = 'border-green-500 bg-green-50';
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = 'border-red-500 bg-red-50';
                      }
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestion.id, optionLetter)}
                        disabled={isSubmitted}
                        className={`
                          w-full text-left p-4 rounded-xl border-2 transition-all
                          flex items-center gap-3
                          ${optionStyle}
                          ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}
                        `}
                      >
                        <span className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                          ${isSelected && !isSubmitted ? 'bg-primary-500 text-white' : ''}
                          ${isSubmitted && isCorrectOption ? 'bg-green-500 text-white' : ''}
                          ${isSubmitted && isSelected && !isCorrectOption ? 'bg-red-500 text-white' : ''}
                          ${!isSelected && !isSubmitted ? 'bg-primary-100 text-primary-600' : ''}
                        `}>
                          {optionLetter}
                        </span>
                        <span className="text-primary-700 flex-1">{option}</span>
                        {isSubmitted && isCorrectOption && (
                          <CheckCircle2 className="text-green-500" size={20} />
                        )}
                        {isSubmitted && isSelected && !isCorrectOption && (
                          <XCircle className="text-red-500" size={20} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 填空题输入 */}
              {currentQuestion.type === 'fill' && (
                <div className="mb-6">
                  {(() => {
                    const correctArr = parseFillAnswers(currentQuestion.answer as string);
                    const blankCount = correctArr.length || 1;
                    const userArr = ((userAnswers[currentQuestion.id] as string) || '').trim().split(/\s+/).filter(Boolean);
                    const info = getCorrectInfo(currentQuestion.id);
                    
                    return (
                      <>
                        <div className="mb-3 flex items-center gap-2 text-sm text-primary-600 bg-blue-50 px-3 py-2 rounded-lg">
                          <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />
                          <span>本题共 <span className="font-bold text-blue-600">{blankCount}</span> 个空，请用 <span className="font-mono font-bold text-blue-600">空格</span> 分隔多个答案</span>
                        </div>
                        <input
                          type="text"
                          value={(userAnswers[currentQuestion.id] as string) || ''}
                          onChange={(e) => handleFillInput(currentQuestion.id, e.target.value)}
                          disabled={submitted[currentQuestion.id]}
                          placeholder={`请输入${blankCount}个答案，用空格分隔...`}
                          className={`
                            w-full px-4 py-3 rounded-xl border-2 text-lg
                            focus:outline-none focus:ring-2 focus:ring-primary-300
                            ${submitted[currentQuestion.id]
                              ? isCorrect(currentQuestion.id)
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-primary-200 focus:border-primary-500'
                            }
                          `}
                        />
                        {submitted[currentQuestion.id] && info.details && info.details.length > 1 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-primary-700">答题详情：</p>
                            {info.details.map((d, i) => (
                              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${d.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${d.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                  <span className="text-white text-xs font-bold">{i + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-primary-500">你的答案：</span>
                                    <span className={`font-medium ${d.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                      {d.user || <span className="italic text-red-400">（未填）</span>}
                                    </span>
                                  </div>
                                  {!d.isCorrect && (
                                    <div className="flex items-center gap-2 text-sm mt-1">
                                      <span className="text-primary-500">正确答案：</span>
                                      <span className="font-medium text-green-700">{d.correct || <span className="italic">（空）</span>}</span>
                                    </div>
                                  )}
                                </div>
                                {d.isCorrect ? (
                                  <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
                                ) : (
                                  <XCircle className="text-red-500 flex-shrink-0" size={18} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {submitted[currentQuestion.id] && (
                          <div className="mt-3 text-sm text-primary-600">
                            <p className="mb-1 font-medium">正确答案：</p>
                            <div className="font-bold text-green-600 bg-green-50 p-3 rounded-lg question-html">
                              <div dangerouslySetInnerHTML={{ __html: currentQuestion.answerHtml || currentQuestion.answer }} />
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* 提交按钮 */}
              {!submitted[currentQuestion.id] && (
                <button
                  onClick={() => handleSubmit(currentQuestion.id)}
                  disabled={!userAnswers[currentQuestion.id] || (Array.isArray(userAnswers[currentQuestion.id]) && (userAnswers[currentQuestion.id] as string[]).length === 0)}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交答案
                </button>
              )}

              {/* 结果反馈 */}
              {submitted[currentQuestion.id] && (() => {
                const correct = isCorrect(currentQuestion.id);
                const info = getCorrectInfo(currentQuestion.id);
                const isPartial = info.isPartiallyCorrect;
                
                let bgClass = 'bg-red-50 border-red-200';
                let iconColor = 'text-red-500';
                let titleText = '回答错误';
                let descText = '不要灰心，看看解析学习一下吧~';
                let Icon = XCircle;
                
                if (correct) {
                  bgClass = 'bg-green-50 border-green-200';
                  iconColor = 'text-green-500';
                  titleText = '回答正确！';
                  descText = '你已经掌握了这个知识点，继续加油！';
                  Icon = CheckCircle2;
                } else if (isPartial) {
                  bgClass = 'bg-amber-50 border-amber-200';
                  iconColor = 'text-amber-500';
                  titleText = `部分正确（${info.correctCount}/${info.totalCount}）`;
                  descText = '不错！部分答对了，继续努力，看看解析巩固一下~';
                  Icon = AlertCircle;
                }
                
                return (
                  <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 border ${bgClass}`}>
                    <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={22} />
                    <div>
                      <p className={`font-medium ${correct ? 'text-green-700' : isPartial ? 'text-amber-700' : 'text-red-700'}`}>
                        {titleText}
                      </p>
                      <p className={`text-sm ${correct ? 'text-green-600' : isPartial ? 'text-amber-600' : 'text-red-600'}`}>
                        {descText}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* 解析 */}
              {showExplanation[currentQuestion.id] && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-blue-500 flex-shrink-0 mt-0.5" size={22} />
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-700 mb-2">解析</h4>
                      <div className="text-blue-600 mb-3 leading-relaxed question-html">
                        <div dangerouslySetInnerHTML={{ __html: currentQuestion.explanationHtml || currentQuestion.explanation }} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-blue-500 font-medium">知识点：</span>
                        {currentQuestion.knowledgePoints.map((kp, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            {kp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
              <AlertCircle className="mx-auto text-primary-300 mb-4" size={48} />
              <p className="text-primary-500">当前难度暂无题目</p>
            </div>
          )}

          {/* 导航按钮 */}
          {questions.length > 0 && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
                上一题
              </button>
              
              {/* 进度条 */}
              <div className="flex-1 mx-6">
                <div className="flex gap-1 justify-center">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`
                        w-6 h-2 rounded-full transition-all cursor-pointer
                        ${idx === currentIndex ? 'bg-primary-600' : ''}
                        ${submitted[q.id] ? (isCorrect(q.id) ? 'bg-green-400' : 'bg-red-400') : 'bg-primary-200'}
                      `}
                      onClick={() => setCurrentIndex(idx)}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                下一题
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 练习进度 */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h3 className="font-bold text-primary-700 mb-4 flex items-center gap-2">
              <Target size={20} className="text-accent-500" />
              本次练习
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-500">总题数</span>
                <span className="text-lg font-bold text-primary-700">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-500">已作答</span>
                <span className="text-lg font-bold text-blue-600">{totalSubmitted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-500">正确</span>
                <span className="text-lg font-bold text-green-600">{correctCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-500">正确率</span>
                <span className="text-lg font-bold text-accent-500">
                  {totalSubmitted > 0 ? Math.round((correctCount / totalSubmitted) * 100) : 0}%
                </span>
              </div>
            </div>
            
            {totalSubmitted > 0 && (
              <div className="mt-4 pt-4 border-t border-primary-100">
                <div className="h-3 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(correctCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 错题提示 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <p className="text-sm font-medium text-amber-700 mb-2">💡 学习建议</p>
            <p className="text-sm text-amber-600">
              做错的题目会自动记录到错题本，你可以在"学习分析"页面查看和复习所有错题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
