import { useState, useMemo } from 'react';
import { 
  Video, 
  Play, 
  X, 
  BookOpen, 
  FlaskConical, 
  Atom,
  Search,
  Filter
} from 'lucide-react';
import { demoVideos } from '../data/demoVideos';
import { categoryLabels, type ExperimentCategory } from '../types/experiment';

const categoryIcons: Record<ExperimentCategory, React.ElementType> = {
  book1: BookOpen,
  book2: BookOpen,
  book3: BookOpen,
  selective1: FlaskConical,
  selective2: FlaskConical,
  selective3: Atom,
};

const VideoLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<ExperimentCategory | 'all'>('all');
  const [currentVideo, setCurrentVideo] = useState<{ title: string; url: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getBilibiliEmbedUrl = (url: string) => {
    const bvMatch = url.match(/\/video\/(BV[a-zA-Z0-9]+)/);
    if (bvMatch) {
      return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&autoplay=1&high_quality=1&danmaku=0`;
    }
    return url;
  };

  const filteredVideos = useMemo(() => {
    let videos = demoVideos;
    
    if (selectedCategory !== 'all') {
      videos = videos.filter(v => v.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      videos = videos.filter(v => v.title.toLowerCase().includes(query));
    }
    
    return videos;
  }, [selectedCategory, searchQuery]);

  const videosByCategory = useMemo(() => {
    const grouped: Record<string, typeof demoVideos> = {};
    filteredVideos.forEach(video => {
      if (!grouped[video.category]) {
        grouped[video.category] = [];
      }
      grouped[video.category].push(video);
    });
    return grouped;
  }, [filteredVideos]);

  const categories: (ExperimentCategory | 'all')[] = ['all', 'book1', 'book2', 'book3', 'selective1', 'selective2', 'selective3'];

  const categoryOrder: ExperimentCategory[] = ['book1', 'book2', 'book3', 'selective1', 'selective2', 'selective3'];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 md:p-10 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Video size={36} className="text-pink-300" />
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              演示实验视频库
            </h2>
          </div>
          <p className="text-purple-100 max-w-2xl">
            精选 49 个高中物理课堂演示实验视频，按教材分册分类整理，方便教师课堂教学使用
          </p>
          
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-2xl font-bold">49</span>
              <span className="text-purple-200 text-sm ml-2">个演示视频</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <span className="text-2xl font-bold">6</span>
              <span className="text-purple-200 text-sm ml-2">册教材覆盖</span>
            </div>
          </div>
        </div>
      </section>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索视频名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter size={18} className="text-gray-500 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? '全部' : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* 视频列表 */}
      <div className="space-y-8">
        {selectedCategory === 'all' ? (
          categoryOrder.map(cat => {
            const catVideos = videosByCategory[cat] || [];
            if (catVideos.length === 0) return null;
            
            const CatIcon = categoryIcons[cat];
            
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-4">
                  <CatIcon size={22} className="text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-800">{categoryLabels[cat]}</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {catVideos.length} 个
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {catVideos.map((video, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentVideo(video)}
                      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Play size={28} className="text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-white text-xs">
                            Bilibili
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                          {video.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video, index) => (
              <div
                key={index}
                onClick={() => setCurrentVideo(video)}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={`https://i0.hdslb.com/bfs/archive/${getBilibiliBvid(video.url)}.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                      <Play size={24} className="text-purple-600 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <Video size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">没有找到相关视频</p>
          </div>
        )}
      </div>

      {/* 视频弹窗 */}
      {currentVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setCurrentVideo(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
              <span className="text-white font-medium">{currentVideo.title}</span>
              <button
                onClick={() => setCurrentVideo(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={getBilibiliEmbedUrl(currentVideo.url)}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen"
                scrolling="no"
                title={currentVideo.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
