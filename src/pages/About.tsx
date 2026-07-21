import { useState, useEffect } from 'react';
import { 
  Atom, BookOpen, Layers, PenTool, TrendingUp, 
  QrCode, Sparkles, FlaskConical
} from 'lucide-react';
import { useQuestionStore } from '../data/questions';
import QRCode from 'qrcode';

const About = () => {
  const { questions } = useQuestionStore();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const url = window.location.href.split('#')[0] + '#/';
    setCurrentUrl(url);
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    }).then(dataUrl => {
      setQrDataUrl(dataUrl);
    }).catch(err => {
      console.error('生成二维码失败:', err);
    });
  }, []);

  const features = [
    { icon: BookOpen, title: '课前预习', desc: '原理讲解、器材介绍、初中知识衔接' },
    { icon: Layers, title: '实验模拟', desc: 'PhET风格交互式虚拟实验，参数自由调节' },
    { icon: PenTool, title: '高考精练', desc: '真实题库，智能批改，详细解析' },
    { icon: TrendingUp, title: '学习分析', desc: '数据可视化，错题追踪，学情报告' },
    { icon: FlaskConical, title: '教师管理', desc: '可视化题库管理，一键导出更新' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Atom size={36} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">高中物理实验智能体</h1>
              <p className="text-primary-200 mt-1">Physics Lab Learning Assistant</p>
            </div>
          </div>
          
          <p className="text-lg text-primary-100 max-w-2xl leading-relaxed">
            专为高中物理实验学习打造的交互式学习平台，
            提供课前预习、虚拟实验、高考精练、学情分析等全流程学习支持，
            让物理实验学习更高效、更有趣。
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="text-center">
            <h3 className="text-lg font-bold text-primary-700 mb-4 flex items-center justify-center gap-2">
              <QrCode size={20} className="text-primary-500" />
              扫码访问智能体
            </h3>
            <div className="inline-block p-4 bg-white rounded-xl border-2 border-primary-200 shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="访问二维码" className="w-52 h-52" />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center">
                  <QrCode size={200} className="text-slate-300 animate-pulse" />
                </div>
              )}
            </div>
          </div>
          
          <div className="max-w-sm">
            <h4 className="font-bold text-primary-700 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-accent-500" />
              访问方式
            </h4>
            <div className="space-y-3 text-sm text-primary-600">
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="font-medium text-primary-700 mb-1">方式一：扫码访问</p>
                <p className="text-primary-500">使用手机扫描左侧二维码，即可在手机上访问</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="font-medium text-primary-700 mb-1">方式二：复制链接</p>
                <p className="text-primary-500 font-mono text-xs break-all">{currentUrl}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-amber-700 text-xs">
                  💡 提示：需在同一局域网内访问。部署到公网服务器后可直接扫码访问。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-soft p-6 md:p-8">
        <h2 className="text-xl font-bold text-primary-700 mb-6">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white mb-3">
                <f.icon size={20} />
              </div>
              <h3 className="font-bold text-primary-700 mb-1">{f.title}</h3>
              <p className="text-sm text-primary-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">开始你的物理实验学习之旅</h2>
            <p className="text-primary-200">共 21 个经典实验 · {questions.length} 道精选真题</p>
          </div>
          <a 
            href="#/" 
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition font-bold"
          >
            <BookOpen size={20} />
            立即开始学习
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
