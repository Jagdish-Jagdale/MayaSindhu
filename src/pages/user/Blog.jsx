import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight, Mail, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOG_CATEGORIES = [
  'Fashion', 'Electronics', 'Lifestyle', 'Beauty', 'Offers', 'Trending'
];

const POPULAR_TAGS = [
  'Sale', 'New Arrival', 'Summer', 'Winter', 'Trend', 'Premium'
];

const MOCK_BLOGS = [
  {
    id: 1,
    title: "The Art of Handwoven Sarees: A Heritage Rediscovered",
    excerpt: "Explore the intricate journey of traditional weaving techniques that are making a massive comeback in modern fashion wardrobes...",
    category: "Fashion",
    author: "Maya Sharma",
    date: "May 15, 2026",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    isFeatured: true
  },
  {
    id: 2,
    title: "Sustainable Jewelry: Beauty with a Conscience",
    excerpt: "Why conscious consumerism is the new luxury in the world of handcrafted ornaments and silver jewellery...",
    category: "Lifestyle",
    author: "Arjun Rao",
    date: "May 12, 2026",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    title: "Summer Essentials: Staying Cool in Style",
    excerpt: "From breathable cottons to elegant linen blends, here's your guide to navigating the summer heat with grace...",
    category: "Trending",
    author: "Priya Varma",
    date: "May 10, 2026",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 4,
    title: "The Rise of Minimalist Ethnic Wear",
    excerpt: "How less became more in the world of Indian festive dressing and why Gen Z is loving the subtle shift...",
    category: "Fashion",
    author: "Maya Sharma",
    date: "May 08, 2026",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const featuredBlog = MOCK_BLOGS.find(b => b.isFeatured);
  const latestBlogs = MOCK_BLOGS.filter(b => !b.isFeatured);

  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-fashion font-bold mb-6 tracking-tight"
          >
            Latest Fashion & <span className="text-brand-orange">Shopping Blogs</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Insights into the world of heritage, craftsmanship, and modern style trends curated just for the modern muse.
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
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-24">
            
            {/* Featured Blog */}
            {featuredBlog && (
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-[#F9F9F9] rounded-[3rem] overflow-hidden p-4 md:p-8">
                  <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden">
                    <img 
                      src={featuredBlog.image} 
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4 md:p-6 space-y-6">
                    <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                      Featured Story
                    </span>
                    <h2 className="text-3xl md:text-4xl font-fashion font-bold leading-tight group-hover:text-brand-orange transition-colors">
                      {featuredBlog.title}
                    </h2>
                    <p className="text-gray-500 leading-relaxed text-lg">
                      {featuredBlog.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-400 font-medium border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-brand-orange" />
                        <span>{featuredBlog.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-orange" />
                        <span>{featuredBlog.date}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-orange transition-all active:scale-95 shadow-lg shadow-black/10">
                      Read More <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Latest Blogs Grid */}
            <section>
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-fashion font-bold tracking-tight">Latest Stories</h3>
                <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {latestBlogs.map((blog, idx) => (
                  <motion.div 
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 relative shadow-sm">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 px-2">
                      <h4 className="text-xl font-fashion font-bold leading-snug group-hover:text-brand-orange transition-colors">
                        {blog.title}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <button className="text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/btn">
                        Read Story <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-20 flex justify-center items-center gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-90">
                  <ChevronLeft size={20} />
                </button>
                {[1, 2, 3].map(page => (
                  <button 
                    key={page}
                    className={`w-12 h-12 rounded-full text-xs font-bold transition-all ${page === 1 ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
                <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-90">
                  <ChevronRight size={20} />
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 space-y-16">
            
            {/* Categories */}
            <div className="bg-[#F9F9F9] rounded-[2.5rem] p-10">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-brand-orange rounded-full"></div>
                Categories
              </h4>
              <div className="space-y-4">
                {BLOG_CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between py-2 text-sm font-medium transition-all ${selectedCategory === cat ? 'text-brand-orange' : 'text-gray-400 hover:text-[#1A1A1A]'}`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] bg-white px-2 py-1 rounded-md shadow-sm">12</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-brand-orange rounded-full"></div>
                Popular Tags
              </h4>
              <div className="flex flex-wrap gap-3">
                {POPULAR_TAGS.map(tag => (
                  <button 
                    key={tag}
                    className="px-5 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-brand-orange hover:text-white transition-all border border-transparent"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Sidebar */}
            <div className="bg-[#1A1A1A] rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-orange/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-6 text-center">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-brand-orange" size={24} />
                </div>
                <h4 className="text-xl font-fashion font-bold">Stay Inspired</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Join our community to receive the latest style updates and exclusive offers.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-sm focus:outline-none focus:border-brand-orange transition-all"
                  />
                  <button className="w-full bg-brand-orange text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1A] transition-all">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Footer CTA */}
      <section className="bg-[#F0F7FF] py-32 text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-fashion font-bold tracking-tight">
            Ready to find your <span className="text-brand-orange">next treasure?</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Experience the blend of tradition and modernity in our latest collections.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-4 bg-[#1A1A1A] text-white px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-orange transition-all shadow-2xl active:scale-95"
          >
            Start Shopping Today <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
