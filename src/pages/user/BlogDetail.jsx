import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Calendar,
  User,
  Clock,
  Link as LinkIcon,
  Eye,
  Loader2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatDate } from '../../utils/dateHelper';
import { useGoBack } from '../../hooks/useGoBack';
import toast from 'react-hot-toast';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogSettings, setBlogSettings] = useState({
    heading: 'Our Cultural Essence',
    subheading: 'Stay updated with the latest news, projects, and insights from MayaSindhu.'
  });
  const hasToasted = useRef(false);

  useEffect(() => {
    let isMounted = true;
    hasToasted.current = false;

    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const cleanId = id.trim();
        const docRef = doc(db, 'blogs', cleanId);
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;

        if (docSnap.exists()) {
          setBlog({ ...docSnap.data(), id: docSnap.id });
        } else {
          if (!hasToasted.current) {
            toast.error("Story not found");
            hasToasted.current = true;
            navigate('/blog', { replace: true });
          }
        }

        const settingsSnap = await getDoc(doc(db, 'blogs', 'blogs_config'));
        if (settingsSnap.exists() && isMounted) {
          setBlogSettings(settingsSnap.data());
        }

        const qRecent = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(4));
        const recentSnap = await getDocs(qRecent);
        const others = recentSnap.docs
          .map(d => ({ ...d.data(), id: d.id }))
          .filter(b => b.id !== cleanId)
          .slice(0, 4);
        setRecentBlogs(others);

      } catch (error) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (blog && blog.title) {
      let displayTitle = blog.title;
      if (displayTitle.length > 50) {
        displayTitle = displayTitle.substring(0, 50) + '...';
      }
      document.title = `${displayTitle} | MayaSindhu`;
    }
  }, [blog]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };



  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
        <p className="text-gray-400 font-fashion text-xl tracking-widest italic">Unfolding the story...</p>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[45vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-fashion font-bold text-white mb-6 tracking-tight drop-shadow-2xl"
          >
            {blogSettings.heading}
          </motion.h1>
          <div className="w-24 h-1 bg-[#C5A059] mx-auto mb-8 rounded-full shadow-lg"></div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md"
          >
            {blogSettings.subheading}
          </motion.p>
        </div>
      </section>

      {/* Yellow HR under top image section */}
      <div className="h-1.5 w-full bg-[#C5A059]"></div>

      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-12 relative z-20">

        {/* Top Navigation */}
        <div className="mb-10 pl-2">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm text-[13px] font-semibold text-gray-500 hover:text-[#C5A059] transition-all group"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            All Posts
          </Link>
        </div>

        {/* Main Outer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* Header Row: Author, Date, Share (Whole Width) */}
          <div className="px-10 py-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-50 shadow-sm">
                <img
                  src={blog.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author || 'Expert'}`}
                  alt="Author"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 leading-none mb-1">{blog.author || 'MayaSindhu'}</h4>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>{formatDate(blog.updatedAt || blog.createdAt)}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span>4 min read</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-100 text-[11px] font-bold text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059]/30 transition-all group"
            >
              <Share2 size={13} className="group-hover:scale-110 transition-transform" />
              Share
            </button>
          </div>

          {/* Full Width HR - Light Tan Color */}
          <hr className="border-t border-[#C5A059]/10" />

          {/* Inner Card Section */}
          <div className="p-6 md:p-10 lg:p-12">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-8 md:p-14">

              <h1 className="text-4xl md:text-[52px] font-bold text-gray-900 mb-10 leading-[1.1] tracking-tight">
                {blog.title}
              </h1>

              <div
                className="blog-content text-gray-700 text-[18px] md:text-[20px] leading-[1.8] space-y-10"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <style jsx="true">{`
                .blog-content p { 
                  margin-bottom: 2rem; 
                  font-family: 'Inter', sans-serif;
                }
                .blog-content h2, .blog-content h3 { 
                  color: #111827; 
                  font-weight: 800;
                  margin-top: 3.5rem;
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                }
                .blog-content h2 { font-size: 32px; }
                .blog-content h3 { font-size: 24px; }
                .blog-content img {
                  border-radius: 2rem;
                  margin: 3rem 0;
                  width: 100%;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }
                .blog-content strong { color: #111827; font-weight: 700; }
                .blog-content ul { list-style-type: disc; margin-left: 2rem; margin-bottom: 2rem; }
                .blog-content li { margin-bottom: 1rem; }
              `}</style>

              {/* Action Footer - Stacked Rows */}
              <div className="mt-16 pt-8 border-t border-gray-50">
                {/* Social Icons Row */}
                <div className="flex items-center gap-6 mb-6">
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    }}
                    className="text-[#1877F2] hover:opacity-80 transition-opacity"
                    title="Share on Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  </button>
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      const text = encodeURIComponent(blog?.title || '');
                      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                    }}
                    className="text-black hover:opacity-80 transition-opacity"
                    title="Share on X (Twitter)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                  </button>
                  <button
                    onClick={() => window.open('https://www.instagram.com/mayasindhu_/', '_blank')}
                    className="text-[#E4405F] hover:opacity-80 transition-opacity"
                    title="Share on Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </button>
                  <button onClick={handleShare} className="text-[#C5A059] hover:opacity-80 transition-opacity" title="Copy Link"><LinkIcon size={18} strokeWidth={2.5} /></button>
                </div>

                {/* Stats Row - Removed views and comments */}

              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Articles Section */}
        {recentBlogs.length > 0 && (
          <section className="mt-24 pb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Recent Articles</h3>
              <Link to="/blog" className="text-[12px] font-bold text-gray-400 hover:text-[#C5A059]">See All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentBlogs.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-500"
                >
                  {/* Card Image Wrapper */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-[#C5A059]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-lg">
                        {item.category || 'Stories'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-gray-400 text-[11px] font-medium mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C5A059]" />
                        <span>{formatDate(item.updatedAt || item.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-[#C5A059]" />
                        <span>{item.author || 'MayaSindhu'}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-fashion font-bold leading-tight text-[#1A1A1A] mb-3">
                      {item.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-light mb-4 flex-1">
                      {item.summary}
                    </p>

                    {/* Call to Action */}
                    <div className="border-t border-gray-100 pt-4">
                      <Link to={`/blog/${item.id}`} className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-brand-orange transition-all group/btn">
                        Read Full Article
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}


      </div>
    </div>
  );
}
