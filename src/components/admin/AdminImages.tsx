import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminImages() {
  const { user } = useAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false });
    if (!error && data) setImages(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const { error } = await supabase.from('images').insert([{
      title, url, description, created_by: user.id
    }]);
    
    if (!error) {
      setTitle(''); setUrl(''); setDescription(''); setIsAdding(false);
      fetchImages();
    } else {
      alert('Error adding image: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    const { error } = await supabase.from('images').delete().eq('id', id);
    if (!error) fetchImages();
    else alert('Error deleting image: ' + error.message);
  };

  if (loading) return <p>Loading images...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Manage Images</h3>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Image'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginBottom: '24px' }}>
          <h4>Add New Image URL</h4>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input type="url" className="form-input" value={url} onChange={e => setUrl(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Save Image</button>
        </form>
      )}

      <div className="grid-cards">
        {images.map(img => (
          <div key={img.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={img.url} alt={img.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
            <h4>{img.title}</h4>
            <p style={{ color: 'var(--text-secondary)', flex: 1 }}>{img.description}</p>
            <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
        {images.length === 0 && !isAdding && <p>No images found.</p>}
      </div>
    </div>
  );
}
