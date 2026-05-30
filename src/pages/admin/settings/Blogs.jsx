import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Loader2, 
  FileText,
  Save,
  Globe,
  Lock,
  ChevronDown,
  Image as ImageIcon,
  X,
  Camera,
  Calendar,
  User,
  Type,
  Layout,
  Send,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../utils/cloudinary';
import { formatDate } from '../../../utils/dateHelper';
import CustomSelect from '../../../components/common/CustomSelect';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function Blogs() {
  const { isCollapsed } = useAdminUI();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, rowsPerPage]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    summary: '',
    author: 'MayaSindhu',
    date: new Date().toISOString().split('T')[0],
    content: '',
    image: '',
    status: 'published',
    category: 'Stories'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // Section Config State
  const [config, setConfig] = useState({
    heading: 'Our Latest Stories',
    subheading: 'Dive into the world of traditional craftsmanship and contemporary style.'
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [hasConfigChanges, setHasConfigChanges] = useState(false);

  // Load Config & Blogs
  useEffect(() => {
    const configUnsub = onSnapshot(doc(db, 'blogs', 'blogs_config'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    });

    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const blogsUnsub = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setBlogs(blogsData);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load blogs");
    });

    return () => {
      configUnsub();
      blogsUnsub();
    };
  }, []);

  const handleSaveConfig = async () => {
    try {
      setIsSavingConfig(true);
      await setDoc(doc(db, 'blogs', 'blogs_config'), {
        ...config,
        updatedAt: serverTimestamp()
      });
      setHasConfigChanges(false);
      toast.success("Settings updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewBlog(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleCreateBlog = async () => {
    if (!newBlog.title || !newBlog.summary) {
      toast.error("Title and Summary are required");
      return;
    }

    try {
      setIsSavingBlog(true);
      let imageUrl = newBlog.image;

      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile, 'Blogs');
      }

      if (newBlog.id) {
        // UPDATE EXISTING BLOG
        const { id, ...blogData } = newBlog;
        // Remove createdAt to prevent overwriting it
        delete blogData.createdAt; 
        
        // If image changed, delete old one
        const originalBlog = blogs.find(b => b.id === id);
        if (imageUrl !== originalBlog.image && originalBlog.image && originalBlog.image.includes('cloudinary')) {
          await deleteFromCloudinary(originalBlog.image);
        }

        await updateDoc(doc(db, 'blogs', id), {
          ...blogData,
          image: imageUrl,
          updatedAt: serverTimestamp()
        });
        toast.success("Blog updated successfully!");
      } else {
        // CREATE NEW BLOG
        await addDoc(collection(db, 'blogs'), {
          ...newBlog,
          image: imageUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Blog published successfully!");
      }

      setIsModalOpen(false);
      setNewBlog({
        title: '',
        summary: '',
        author: 'MayaSindhu',
        date: new Date().toISOString().split('T')[0],
        content: '',
        image: '',
        status: 'published',
        category: 'Stories'
      });
      setSelectedFile(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save blog");
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;
    try {
      setIsDeleting(true);
      // 1. Delete image from Cloudinary if it exists
      if (blogToDelete.image && blogToDelete.image.includes('cloudinary')) {
        await deleteFromCloudinary(blogToDelete.image);
      }
      
      // 2. Delete document from Firestore
      await deleteDoc(doc(db, 'blogs', blogToDelete.id));
      
      toast.success("Blog removed from system");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Permission denied or system error");
    } finally {
      setIsDeleting(false);
      setBlogToDelete(null);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = (blog.title?.toLowerCase().includes(searchTerm.toLowerCase())) || (blog.category?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Blog Management
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage your collection of brand stories and articles</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              TOTAL RECORDS: {filteredBlogs.length}
            </span>
            <span className="text-gray-200 text-sm">|</span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
              Add Blog
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Section Config Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="px-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Heading</span></div>
            <input 
              type="text"
              value={config.heading}
              onChange={(e) => { setConfig({...config, heading: e.target.value}); setHasConfigChanges(true); }}
              className="w-full bg-gray-50 border-none px-6 py-4 text-[15px] font-bold text-gray-800 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 transition-all outline-none"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subheading</span>
              {hasConfigChanges && !isSavingConfig && (
                <button 
                  onClick={handleSaveConfig}
                  className="bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-sm active:scale-95 animate-in fade-in zoom-in duration-300"
                >
                  Save Settings
                </button>
              )}
            </div>
            <input 
              type="text"
              value={config.subheading}
              onChange={(e) => { setConfig({...config, subheading: e.target.value}); setHasConfigChanges(true); }}
              className="w-full bg-gray-50 border-none px-6 py-4 text-[15px] font-medium text-gray-500 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-md">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input 
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium text-gray-600"
          />
        </div>
        
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center px-3 border-r border-gray-100">
            <CustomSelect
              value={rowsPerPage}
              onChange={(val) => setRowsPerPage(Number(val))}
              options={[
                { value: 5, label: '5 rows' },
                { value: 10, label: '10 rows' },
                { value: 20, label: '20 rows' },
                { value: 50, label: '50 rows' }
              ]}
              className="w-28"
              minimal={true}
              valuePrefix="Rows:"
            />
          </div>
          
          <div className="flex items-center gap-2 px-3 text-[12px] font-semibold text-gray-500 min-w-[180px]">
            <Filter size={14} strokeWidth={2.5} />
            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: 'all', label: 'All Stories' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' }
              ]}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pl-10 pr-4 py-6 text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF]">Blog Post</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF] text-right">Category</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF] text-right">Modified</th>
                <th className="px-10 py-6 text-[14px] font-bold text-[#1BAFAF] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredBlogs.length > 0 ? filteredBlogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((blog, idx) => (
                <tr key={blog.id} className="hover:bg-gray-50/40 transition-colors group cursor-pointer">
                  <td className="pl-10 pr-4 py-6 text-[14px] font-medium text-gray-400">
                    {(idx + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        {blog.image ? (
                          <img src={blog.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={18} className="text-gray-200" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-[14px] font-bold text-gray-900 line-clamp-1">{blog.title || 'Untitled'}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{blog.author || 'MayaSindhu'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <span className="text-[14px] text-gray-500 font-medium">{blog.category || 'Stories'}</span>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
                      {formatDate(blog.updatedAt)}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => {
                           setNewBlog({...blog});
                           setIsModalOpen(true);
                         }}
                         className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all active:scale-90"
                         title="Edit Story"
                       >
                         <Edit2 size={16} strokeWidth={2.5}/>
                       </button>
                       <button 
                         onClick={() => handleDeleteBlog(blog)}
                         className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                         title="Delete Story"
                       >
                         <Trash2 size={16} strokeWidth={2.5}/>
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <FileText size={40} className="text-gray-100" />
                       <p className="text-[14px] font-medium text-gray-400 tracking-wide">No brand stories found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-end px-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <span className="text-[12px] font-semibold text-gray-400">
            Page {currentPage} of {Math.ceil(filteredBlogs.length / rowsPerPage) || 1}
          </span>
          <button
            onClick={() => currentPage < Math.ceil(filteredBlogs.length / rowsPerPage) && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(filteredBlogs.length / rowsPerPage)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Add Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">Create New Story</h2>
                <p className="text-[13px] text-gray-400 font-medium">Share the essence of your tradition and craft</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Info */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 space-y-6 h-full flex flex-col">
                    <div className="flex items-center gap-2 px-1">
                      <Type size={14} className="text-[#1BAFAF]" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Story Essentials</span>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 ml-1">Blog Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter a captivating title..."
                          value={newBlog.title}
                          onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                          className="w-full bg-white border-none px-5 py-3.5 text-[14px] font-semibold text-gray-800 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 ml-1">Story Summary</label>
                          <input 
                            type="text" 
                            placeholder="Brief overview of the story..."
                            value={newBlog.summary}
                            onChange={(e) => setNewBlog({...newBlog, summary: e.target.value})}
                            className="w-full bg-white border-none px-5 py-3.5 text-[14px] font-medium text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 ml-1">Blog Category</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Stories, Culture, Craftsmanship..."
                            value={newBlog.category}
                            onChange={(e) => setNewBlog({...newBlog, category: e.target.value})}
                            className="w-full bg-white border-none px-5 py-3.5 text-[14px] font-bold text-[#1BAFAF] rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 ml-1">Author Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                            <input 
                              type="text" 
                              value={newBlog.author}
                              onChange={(e) => setNewBlog({...newBlog, author: e.target.value})}
                              className="w-full bg-white border-none pl-10 pr-4 py-3.5 text-[13px] font-bold text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 ml-1">Publish Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                            <input 
                              type="date" 
                              value={newBlog.date}
                              onChange={(e) => setNewBlog({...newBlog, date: e.target.value})}
                              className="w-full bg-white border-none pl-10 pr-4 py-3.5 text-[13px] font-bold text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Media */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 space-y-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={14} className="text-[#1BAFAF]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Blog Cover</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-4">
                      <div 
                        className="relative flex-1 rounded-2xl bg-white border-2 border-dashed border-gray-100 hover:border-[#1BAFAF]/30 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group overflow-hidden shadow-sm min-h-[200px]"
                      >
                        {newBlog.image ? (
                          <>
                            <img src={newBlog.image} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-[2px]">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
                                title="Change Image"
                              >
                                <Camera size={20} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewBlog({...newBlog, image: ''});
                                  setSelectedFile(null);
                                }}
                                className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-red-200 transition-all active:scale-95"
                                title="Delete Image"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center gap-3"
                          >
                            <div className="p-3 bg-gray-50 rounded-full group-hover:bg-[#1BAFAF]/5 transition-colors">
                              <Plus size={20} className="text-gray-300 group-hover:text-[#1BAFAF]" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Cover Image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors">
                          <LinkIcon size={14} />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Or paste image link..."
                          value={newBlog.image && newBlog.image.startsWith('blob:') ? '' : newBlog.image}
                          onChange={(e) => {
                            setNewBlog({...newBlog, image: e.target.value});
                            setSelectedFile(null); // Clear file if link is used
                          }}
                          className="w-full bg-white border-none pl-10 pr-4 py-3.5 text-[12px] font-medium text-gray-500 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                        />
                        {newBlog.image && (
                          <button 
                            onClick={() => {
                              setNewBlog({...newBlog, image: ''});
                              setSelectedFile(null);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>

              {/* Multiline Content */}
              <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                 <div className="flex items-center gap-2 px-1">
                    <FileText size={14} className="text-[#1BAFAF]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Story Content</span>
                 </div>
                 <textarea 
                   rows={10}
                   placeholder="Start writing your story here..."
                   value={newBlog.content}
                   onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                   className="w-full bg-white border-none px-6 py-6 text-[14px] font-medium text-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm leading-relaxed resize-none"
                 />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Discard
              </button>
              <div className="flex items-center gap-3">
                <button 
                   onClick={() => {
                     setNewBlog(prev => ({ ...prev, status: 'draft' }));
                     handleCreateBlog();
                   }}
                   className="px-6 py-2.5 text-[13px] font-bold text-gray-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100"
                >
                  Save as Draft
                </button>
                <button 
                  onClick={handleCreateBlog}
                  disabled={isSavingBlog}
                  className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-10 py-3 rounded-2xl text-[14px] font-bold transition-all shadow-xl shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-50"
                >
                  {isSavingBlog ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {isSavingBlog ? 'Publishing...' : 'Publish Blog'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteBlog}
        itemName={blogToDelete?.title || 'this story'}
        loading={isDeleting}
      />
    </div>
  );
}
