import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import { Atom, Info } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-lab-bg">
      <Header />
      <main className="container py-6 animate-fade-in">
        <Outlet />
      </main>
      <footer className="border-t border-primary-100 bg-white/50 mt-12">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-sm">
                <Atom size={18} />
              </div>
              <div>
                <p className="font-bold text-primary-700">高中物理实验智能体</p>
                <p className="text-xs text-primary-400">让物理实验学习更高效</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-primary-500">
              <Link to="/about" className="flex items-center gap-1.5 hover:text-primary-600 transition">
                <Info size={16} />
                关于
              </Link>
              <Link to="/manager" className="hover:text-primary-600 transition">
                教师入口
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
