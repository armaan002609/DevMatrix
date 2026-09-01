import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminBlogs() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (!error && data) setBlogs(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const { error } = await supabase.from('blogs').insert([{
      title, slug, content, cover_image_url: coverImageUrl, status, created_by: user.id
    }]);
    
    if (!error) {
      setTitle(''); setSlug(''); setContent(''); setCoverImageUrl(''); setStatus('draft'); setIsAdding(false);
      fetchBlogs();
    } else {
      alert('Error adding blog: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) fetchBlogs();
    else alert('Error deleting blog: ' + error.message);
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  if (loading) return <p>Loading blogs...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Manage Blogs</h3>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Blog'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginBottom: '24px' }}>
          <h4>Create New Blog Post</h4>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} onBlur={generateSlug} required />
          </div>
          <div className="form-group">
            <label className="form-label">URL Slug</label>
            <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Cover Image URL (Optional)</label>
            <input type="url" className="form-input" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} required style={{ backgroundColor: 'var(--bg-main)' }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Content (Markdown supported)</label>
            <textarea className="form-input" value={content} onChange={e => setContent(e.target.value)} required rows={10} />
          </div>
          <button type="submit" className="btn btn-primary">Save Blog Post</button>
        </form>
      )}

      <div className="grid-cards">
        {blogs.map(blog => (
          <div key={blog.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            {blog.cover_image_url && <img src={blog.cover_image_url} alt={blog.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />}
            <h4>{blog.title}</h4>
            <div className="badge"><span className="badge-label">{blog.status}</span></div>
            <p style={{ color: 'var(--text-secondary)', flex: 1, fontSize: '0.9rem' }}>
              {blog.content.substring(0, 100)}...
            </p>
            <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => handleDelete(blog.id)}>Delete</button>
          </div>
        ))}
        {blogs.length === 0 && !isAdding && <p>No blogs found.</p>}
      </div>
    </div>
  );
}
