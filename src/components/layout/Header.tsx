import { Link, useLocation } from 'react-router-dom';
import { Atom, BarChart3, Home, Info } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '实验中心', icon: Home },
    { path: '/analysis', label: '学习分析', icon: BarChart3 },
    { path: '/about', label: '关于', icon: Info },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-primary-100">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
              <Atom size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                悟理智体
              </h1>
              <p className="text-xs text-primary-400 leading-tight">
                PhysicsAI · 高中物理实验智能体
              </p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
