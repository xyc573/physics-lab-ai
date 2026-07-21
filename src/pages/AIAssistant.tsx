import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Lightbulb, Target, BookOpen, ChevronRight } from 'lucide-react';
import { useLearningStore } from '../store/learningStore';
import { experiments } from '../data/experiments';
import { useQuestionStore } from '../data/questions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'normal' | 'suggestion';
}

const quickQuestions = [
  { icon: Lightbulb, label: '实验原理讲解', query: '请给我讲一下胡克定律的实验原理' },
  { icon: Target, label: '错题分析建议', query: '分析一下我的错题，给我一些学习建议' },
  { icon: BookOpen, label: '下一步学什么', query: '根据我的学习情况，推荐下一步学习什么实验' },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是「悟理」AI物理实验助手 🤖✨\n\n我可以帮你：\n• 讲解实验原理和知识点\n• 分析错题原因和解题思路\n• 推荐适合你的学习内容\n• 解答物理实验相关问题\n\n有什么想了解的吗？可以点击下方快捷问题，或直接输入你的问题~',
      type: 'normal',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const totalStats = useLearningStore(state => state.getTotalStats());
  const { questions } = useQuestionStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('胡克') || msg.includes('弹簧') || msg.includes('弹力')) {
      return `📚 **胡克定律实验原理讲解**

胡克定律是力学中的基本定律之一，描述了弹簧弹力与形变量之间的关系。

🔬 **核心公式**
F = kx

其中：
• F — 弹簧产生的弹力（N）
• k — 弹簧的劲度系数（N/m），由弹簧本身决定
• x — 弹簧的形变量（m），即伸长或压缩的长度

💡 **实验注意事项**
1. 必须在弹性限度内，胡克定律才成立
2. 读数时视线要与刻度盘垂直，减小视差
3. 测量伸长量时要注意是"伸长量"而非"总长度"
4. 劲度系数k与弹簧的材料、粗细、匝数等因素有关

⚠️ **常见误差来源**
• 弹簧自身重力的影响
• 指针与刻度板间的摩擦
• 读数时的视差

你想了解哪个具体实验呢？我可以给你更详细的讲解~`;
    }
    
    if (msg.includes('错题') || msg.includes('错误') || msg.includes('不会') || msg.includes('建议')) {
      const wrongCount = totalStats.wrongQuestions.length;
      const correctRate = totalStats.totalQuestions > 0 
        ? Math.round((totalStats.correctAnswers / totalStats.totalQuestions) * 100) 
        : 0;
      
      return `📊 **你的学习情况分析**

根据你的学习数据：
• 已练习题目：${totalStats.totalQuestions} 道
• 正确数量：${totalStats.correctAnswers} 道
• 正确率：${correctRate}%
• 错题数量：${wrongCount} 道

💡 **学习建议**

1. **重视错题**：错题是最好的学习资源。建议你把每道错题都认真分析：
   - 是知识点没掌握？
   - 还是审题不仔细？
   - 或者计算失误？

2. **回归课本**：错题涉及的知识点，一定要回到课本和实验原理，把基础打牢。

3. **同类巩固**：找到同类型的题目多练习几道，确保真正掌握。

4. **定期复习**：建议每周回顾一次错题本，避免"一错再错"。

需要我帮你具体分析哪道错题吗？`;
    }
    
    if (msg.includes('推荐') || msg.includes('学什么') || msg.includes('下一步') || msg.includes('学习')) {
      const completed = totalStats.completedPreviews;
      const total = experiments.length;
      
      let recommendation = '';
      if (completed === 0) {
        recommendation = `建议你从**必修第一册**的实验开始学习：
• 长度的测量及其测量工具的选用
• 探究弹簧弹力与形变量的关系
• 探究两个互成角度的力的合成规律

这些是高中物理实验的基础，打好基础后面学起来会更轻松！`;
      } else if (completed < total / 2) {
        recommendation = `你已经完成了 ${completed}/${total} 个实验的预习，很棒！👍

建议你继续学习**必修第二册和第三册**的实验，这些是高考的重点内容。
也可以开始做一些练习题，检验一下学习效果~`;
      } else {
        recommendation = `太厉害了！你已经完成了大部分实验的学习！🎉

建议你：
1. 重点攻克自己觉得困难的实验
2. 多做练习题，特别是高考真题
3. 关注错题，查漏补缺

需要我推荐具体的实验吗？`;
      }
      
      return `🎯 **个性化学习推荐**

${recommendation}

💡 学习小贴士：
• 实验学习三步法：先预习 → 再模拟 → 后练习
• 每个实验至少做3道相关题目
• 错题一定要认真分析原因

有什么具体想了解的实验吗？`;
    }
    
    if (msg.includes('全反射') || msg.includes('折射') || msg.includes('折射率')) {
      return `🔬 **光的折射与全反射**

**折射定律（斯涅尔定律）**
n₁ sin θ₁ = n₂ sin θ₂

• n₁、n₂ 是两种介质的折射率
• θ₁ 是入射角，θ₂ 是折射角

💡 **全反射的条件**（两个，缺一不可）：
1. 光从**光密介质**射向**光疏介质**（n₁ > n₂）
2. 入射角**大于**临界角

**临界角公式**
sin C = n₂ / n₁ = 1/n（从介质射向空气时）

⚠️ **易错点**
• 光从空气→玻璃（光疏→光密）：不会发生全反射！
• 光从玻璃→空气（光密→光疏）：入射角足够大才会全反射

你可以在"测量玻璃的折射率"实验模拟中，切换入射方向，亲身体验全反射现象~`;
    }
    
    if (msg.includes('单摆') || msg.includes('重力加速度')) {
      return `🔬 **单摆实验与重力加速度测量**

**单摆周期公式**
T = 2π√(L/g)

变形得：
g = 4π²L / T²

其中：
• T — 单摆的周期（s）
• L — 摆长（m），= 摆线长 + 小球半径
• g — 重力加速度（m/s²）

💡 **实验注意事项**
1. 摆角要小（< 5°），这样才是简谐运动
2. 摆线要细、轻、不可伸长
3. 摆球要选密度大、体积小的
4. 测量周期时，从平衡位置开始计时更准确
5. 测多次全振动的总时间，除以次数，减小误差

📐 **数据处理方法**
• 图像法：作 T²-L 图像，斜率 = 4π²/g
• 公式法：多组数据取平均值

还有什么想了解的吗？`;
    }
    
    if (msg.includes('牛顿') || msg.includes('加速度') || msg.includes('第二定律')) {
      return `🔬 **探究加速度与力、质量的关系**

**牛顿第二定律**
F = ma

• F — 物体所受的合外力（N）
• m — 物体的质量（kg）
• a — 物体的加速度（m/s²）

🧪 **实验方法：控制变量法**
1. 保持质量不变，探究 a 与 F 的关系
2. 保持力不变，探究 a 与 m 的关系

⚠️ **重要注意事项**
1. **平衡摩擦力**：木板一端垫高，让重力分力平衡摩擦力
2. **小车质量远大于钩码质量**：这样才能近似认为拉力等于钩码重力
3. **先接通电源，再释放小车**：打点计时器的使用规范

📊 **数据处理**
• a-F 图像：过原点的直线（验证正比关系）
• a-1/m 图像：过原点的直线（验证反比关系）

想了解具体哪个实验环节的细节吗？`;
    }
    
    if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('在吗')) {
      return `你好呀！👋 我是「悟理」AI物理实验助手~

我可以帮你：
• 📚 讲解实验原理和知识点
• 📊 分析你的学习情况和错题
• 🎯 推荐适合的学习内容
• 💡 解答物理实验相关问题

想从哪里开始呢？`;
    }
    
    if (msg.includes('谢谢') || msg.includes('感谢') || msg.includes('thanks')) {
      return `不客气！能帮到你我也很开心 😊

学习物理最重要的是：
• 多动手做实验
• 多思考原理
• 多总结错题

加油！你一定能把物理学好的 💪

有任何问题随时来找我~`;
    }

    return `这是个好问题！🤔

关于"${userMessage.length > 20 ? userMessage.substring(0, 20) + '...' : userMessage}"，建议你可以：

1. 📖 回到对应实验的"课前预习"部分，复习原理讲解
2. 🧪 在"实验模拟"中动手操作，直观理解物理过程
3. 📝 通过练习题检验掌握程度

如果你有具体的题目或知识点想问，描述得更详细一点，我可以给你更有针对性的解答！

💡 你也可以试试点击下方的快捷问题~`;
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateResponse(input.trim());
      const aiMsg: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleQuickQuestion = (query: string) => {
    if (isTyping) return;
    setInput(query);
    setTimeout(() => {
      const userMsg: Message = { role: 'user', content: query };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);
      
      setTimeout(() => {
        const response = generateResponse(query);
        const aiMsg: Message = { role: 'assistant', content: response };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 800 + Math.random() * 700);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[500px] flex flex-col bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold flex items-center gap-2">
              悟理AI助手
              <Sparkles size={16} className="text-yellow-300" />
            </h2>
            <p className="text-xs text-indigo-100">你的专属物理实验学习伙伴</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-tr-sm'
                : 'bg-white text-primary-700 shadow-sm rounded-tl-sm border border-slate-100'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content.split('\n').map((line, li) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={li} className="font-bold mt-2 first:mt-0">{line.slice(2, -2)}</p>;
                  }
                  if (line.startsWith('• ')) {
                    return (
                      <p key={li} className="flex items-start gap-1">
                        <ChevronRight size={14} className="flex-shrink-0 mt-1" />
                        <span>{line.slice(2)}</span>
                      </p>
                    );
                  }
                  return <p key={li}>{line || '\u00A0'}</p>;
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-100">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q.query)}
              disabled={isTyping}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-sm text-primary-600 rounded-full transition disabled:opacity-50"
            >
              <q.icon size={14} />
              {q.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center hover:shadow-lg transition disabled:opacity-50 disabled:hover:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
