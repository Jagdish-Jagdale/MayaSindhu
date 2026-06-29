/**
 * File: Blog.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ArrowRight, Calendar, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { formatDate } from '../../utils/dateHelper';

const getYouTubeID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getThumbnail = (blog) => {
  if (blog.type === 'podcast' && blog.podcastLink) {
    const id = getYouTubeID(blog.podcastLink);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return blog.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600';
};

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [settings, setSettings] = useState({
    heading: 'Our Cultural Essence',
    subheading: 'At MayaSindhu, we celebrate tradition through handcrafted creations made with care, artistry, and authenticity.'
  });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    // 1. Fetch Blogs
    const blogsQuery = query(collection(db, 'blogs'), orderBy('updatedAt', 'desc'));
    const unsubBlogs = onSnapshot(blogsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setBlogs(data);
      setLoading(false);
    });

    // 2. Fetch Blog Settings
    const unsubSettings = onSnapshot(doc(db, 'blogs', 'blogs_config'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });

    return () => {
      unsubBlogs();
      unsubSettings();
    };
  }, []);

  const filteredBlogs = blogs.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
        <p className="text-gray-400 font-medium italic tracking-widest">Gathering stories...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-sans font-bold mb-6 tracking-tight"
          >
            {settings.heading.split(' ').map((word, i) => (
              <span key={i} className={i === settings.heading.split(' ').length - 1 ? "text-brand-orange" : ""}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            {settings.subheading}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <input 
              type="text" 
              placeholder="Search for blogs, trends, or stories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-full py-4 px-8 pl-14 shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1536px] mx-auto px-6 lg:px-24 py-20">
        <div className="max-w-5xl mx-auto">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-24">
            
            {/* Latest Blogs Grid */}
            <section>
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-sans font-bold tracking-tight">Latest Stories</h3>
                <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleBlogs.map((blog, idx) => (
                  <motion.div 
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-500"
                  >
                    {/* Card Image Wrapper */}
                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                      <img 
                        src={getThumbnail(blog)} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-[#C5A059]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-lg">
                          {blog.type === 'podcast' ? 'Podcast' : (blog.category || 'Stories')}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-gray-400 text-[11px] font-medium mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#C5A059]" />
                          <span>{formatDate(blog.updatedAt || blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#C5A059]" />
                          <span>{blog.author || 'MayaSindhu'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-fashion font-bold leading-tight text-[#1A1A1A] mb-3">
                        {blog.title}
                      </h4>

                      {/* Summary */}
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-light mb-4 flex-1">
                        {blog.summary}
                      </p>

                      {/* Call to Action */}
                      <div className="border-t border-gray-100 pt-4 mt-auto">
                        {blog.type === 'podcast' && blog.podcastLink ? (
                          <a href={blog.podcastLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-brand-orange transition-all group/btn">
                            Watch Podcast
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        ) : (
                          <Link to={`/blog/${blog.id}`} className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-brand-orange transition-all group/btn">
                            Read Full Article
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredBlogs.length && (
                <div className="mt-20 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    className="px-12 py-4 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-sm uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
                  >
                    Load More Articles
                  </button>
                </div>
              )}
            </section>
          </div>

        </div>
      </div>


    </div>
  );
}
