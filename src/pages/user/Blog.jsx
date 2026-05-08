import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ArrowRight, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';





const MOCK_BLOGS = [
  {
    id: 1,
    title: "The Art of Handwoven Sarees: A Heritage Rediscovered",
    subtitle: "FEATURED STORY",
    excerpt: "Explore the intricate journey of traditional weaving techniques that are making a massive comeback in modern fashion wardrobes. From the loom to the modern muse, witness the evolution of heritage.",
    category: "Fashion",
    author: "Maya Sharma",
    date: "May 15, 2026",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    isFeatured: true
  },
  {
    id: 2,
    title: "Sustainable Jewelry: Beauty with a Conscience",
    excerpt: "Why conscious consumerism is the new luxury in the world of handcrafted ornaments and silver jewellery...",
    category: "Lifestyle",
    author: "Arjun Rao",
    date: "May 12, 2026",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
  },
  {
    id: 3,
    title: "Summer Essentials: Staying Cool in Style",
    excerpt: "From breathable cottons to elegant linen blends, here's your guide to navigating the summer heat with grace...",
    category: "Trending",
    author: "Priya Varma",
    date: "May 10, 2026",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80"
  },
  {
    id: 4,
    title: "The Rise of Minimalist Ethnic Wear",
    excerpt: "How less became more in the world of Indian festive dressing and why Gen Z is loving the subtle shift...",
    category: "Fashion",
    author: "Maya Sharma",
    date: "May 08, 2026",
    image: "https://picsum.photos/seed/saree1/800/500"
  },
  {
    id: 5,
    title: "Chanderi: The Fabric of Royalty",
    excerpt: "Discover the lightweight elegance and shimmering textures of Chanderi silk, a favorite of queens and modern fashion icons alike...",
    category: "Heritage",
    author: "Rajesh Kumar",
    date: "May 05, 2026",
    image: "https://picsum.photos/seed/chanderi/800/500"
  },
  {
    id: 6,
    title: "The Block Print Revolution",
    excerpt: "From Jaipur's dusty streets to global runways, how the ancient art of hand-block printing is being reimagined for today...",
    category: "Craft",
    author: "Anita Desai",
    date: "May 02, 2026",
    image: "https://picsum.photos/seed/blockprint/800/500"
  },
  {
    id: 7,
    title: "Jewelry Care 101: Preserving Heritage",
    excerpt: "Practical tips on how to care for your handcrafted silver and gold-plated jewelry so it stays as radiant as the day you bought it...",
    category: "Lifestyle",
    author: "Sanjay Mehta",
    date: "April 28, 2026",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"
  },
  {
    id: 8,
    title: "Varanasi: A Symphony in Silk",
    excerpt: "A deep dive into the spiritual and artistic heart of Banarasi weaving, where every thread tells a thousand-year-old story...",
    category: "Heritage",
    author: "Maya Sharma",
    date: "April 25, 2026",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');


  const [visibleCount, setVisibleCount] = useState(3);

  const latestBlogs = MOCK_BLOGS.filter(b => !b.isFeatured);
  const visibleBlogs = latestBlogs.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(latestBlogs.length);
  };

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
            Our <span className="text-brand-orange">Cultural Essence</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed font-light"
          >
            At MayaSindhu, we celebrate tradition through handcrafted creations made with care, artistry, and authenticity. 
            Every product reflects the beauty of skilled craftsmanship, preserving cultural heritage while bringing timeless elegance into modern lifestyles.
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
                <h3 className="text-2xl font-fashion font-bold tracking-tight">Latest Stories</h3>
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
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-[#C5A059]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-lg">
                          {blog.category || 'Lifestyle'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-gray-400 text-[11px] font-medium mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#C5A059]" />
                          <span>24/04/2026</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#C5A059]" />
                          <span>Expert Writer</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-fashion font-bold leading-tight text-[#1A1A1A] group-hover:text-brand-orange transition-colors mb-3">
                        {blog.title}
                      </h4>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-light mb-4 flex-1">
                        {blog.excerpt}
                      </p>

                      {/* Call to Action */}
                      <div className="border-t border-gray-100 pt-4">
                        <button className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-brand-orange transition-all group/btn">
                          Read Full Article
                          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < latestBlogs.length && (
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
