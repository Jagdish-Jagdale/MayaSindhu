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
  MessageCircle,
  Loader2,
  ChevronRight
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
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        // Fetch recent
        const qRecent = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(4));
        const recentSnap = await getDocs(qRecent);
        const others = recentSnap.docs
          .map(d => ({ ...d.data(), id: d.id }))
          .filter(b => b.id !== cleanId)
          .slice(0, 3);
        setRecentBlogs(others);

      } catch (error) {
        console.error("Error loading blog:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // Real-time comments
    const commentsQuery = query(
      collection(db, 'blogs', id, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      if (isMounted) {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });

    return () => {
      isMounted = false;
      unsubscribeComments();
    };
  }, [id]); // Only re-run when ID changes

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'blogs', id, 'comments'), {
        text: comment,
        author: 'Guest Reader',
        createdAt: serverTimestamp()
      });
      setComment('');
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={blog.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"} 
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-fashion font-bold text-white mb-4 tracking-tight"
          >
            Our Blog
          </motion.h1>
          <div className="w-24 h-1 bg-brand-orange mx-auto mb-6"></div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-200 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-[0.2em]"
          >
            Stay updated with the latest news, projects, and insights from MayaSindhu.
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1000px] mx-auto px-6 -mt-20 relative z-20">
        
        {/* Back Button - Rounded Pill */}
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] hover:bg-brand-orange hover:text-white transition-all mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          All Posts
        </Link>

        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden border border-gray-100"
        >
          {/* Author Header Row */}
          <div className="px-8 md:px-12 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-brand-orange/10">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maya" 
                  alt="Author" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight">{blog.author || 'Expert Writer'}</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  <span>{formatDate(blog.updatedAt || blog.createdAt)}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span>4 min read</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-orange hover:border-brand-orange/20 hover:bg-orange-50 transition-all"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          {/* Blog Content Section - Nested Card Style */}
          <div className="p-4 md:p-8">
            <div className="bg-[#FAF9F6]/30 rounded-[2rem] border border-gray-50 px-8 md:px-16 py-12 md:py-20">
              <h2 className="text-3xl md:text-5xl font-fashion font-bold text-[#1A1A1A] mb-12 leading-tight">
                {blog.title}
              </h2>

              <div 
                className="blog-content text-gray-600 font-light leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <style jsx="true">{`
                .blog-content p { margin-bottom: 1.5rem; }
                .blog-content h1, .blog-content h2, .blog-content h3 { 
                  color: #1A1A1A; 
                  font-family: 'Outfit', sans-serif;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                }
                .blog-content h1 { font-size: 2rem; }
                .blog-content h2 { font-size: 1.5rem; }
                .blog-content ul, .blog-content ol { margin-left: 1.5rem; margin-bottom: 1.5rem; }
                .blog-content li { margin-bottom: 0.5rem; }
              `}</style>
            </div>

            {/* Social Sharing & Stats Footer */}
            <div className="mt-8 px-8 md:px-12 pb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <button className="text-gray-400 hover:text-[#1877F2] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </button>
                  <button className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </button>
                  <button className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </button>
                  <button onClick={handleShare} className="text-gray-400 hover:text-brand-orange transition-colors"><LinkIcon size={20} /></button>
                </div>
                
                <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{blog.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span>{comments.length} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <section className="mt-12">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-fashion font-bold text-[#1A1A1A] mb-8">Comments</h3>
            
            <form onSubmit={handlePostComment} className="space-y-4">
              <textarea 
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#FAF9F6] rounded-2xl p-6 min-h-[150px] text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/5 border border-transparent focus:border-brand-orange/20 transition-all resize-none"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="bg-[#C5A059] hover:bg-[#B48F48] disabled:opacity-50 text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-[#C5A059]/20"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            <div className="mt-12 space-y-8">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`} alt="" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">{c.author}</h5>
                      <span className="text-[10px] text-gray-400 font-bold">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-light">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Articles */}
        {recentBlogs.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-fashion font-bold tracking-tight">Recent Articles</h3>
              <div className="h-px flex-1 bg-gray-200 mx-8 hidden md:block"></div>
              <Link to="/blog" className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange hover:translate-x-1 transition-all flex items-center gap-2">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {recentBlogs.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/blog/${item.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
                      <span>{formatDate(item.updatedAt || item.createdAt)}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>{item.category || 'Stories'}</span>
                    </div>
                    <h4 className="text-xl font-fashion font-bold text-[#1A1A1A] group-hover:text-brand-orange transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
