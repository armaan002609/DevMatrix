import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminImages() {
  const { user } = useAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

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
    if (!user || !file) return;
    
    setUploading(true);
    
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
      
      if (uploadError) {
        throw new Error('Error uploading image: ' + uploadError.message);
      }
      
      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);

      // 3. Insert into database
      const { error: dbError } = await supabase.from('images').insert([{
        title, url: publicUrl, description, created_by: user.id
      }]);
      
      if (dbError) throw new Error('Error saving database record: ' + dbError.message);
      
      // Reset form
      setTitle(''); 
      setFile(null); 
      setDescription(''); 
      setIsAdding(false);
      fetchImages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      // Attempt to extract the file path from the URL and delete it from storage
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const galleryIndex = pathParts.indexOf('gallery');
      if (galleryIndex !== -1 && galleryIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(galleryIndex + 1).join('/');
        await supabase.storage.from('gallery').remove([filePath]);
      }
    } catch (e) {
      console.warn("Could not delete file from storage, it might have been an external URL.", e);
    }

    const { error } = await supabase.from('images').delete().eq('id', id);
    if (!error) fetchImages();
    else alert('Error deleting image record: ' + error.message);
  };

  if (loading) return <p>Loading images...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Manage Images</h3>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Upload Image'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginBottom: '24px' }}>
          <h4>Upload New Image</h4>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Image File</label>
            <input 
              type="file" 
              className="form-input" 
              accept="image/*" 
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Image'}
          </button>
        </form>
      )}

      <div className="grid-cards">
        {images.map(img => (
          <div key={img.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={img.url} alt={img.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
            <h4>{img.title}</h4>
            <p style={{ color: 'var(--text-secondary)', flex: 1 }}>{img.description}</p>
            <button className="btn btn-secondary" style={{ marginTop: '16px', borderColor: 'var(--error-color)', color: 'var(--error-color)' }} onClick={() => handleDelete(img.id, img.url)}>Delete</button>
          </div>
        ))}
        {images.length === 0 && !isAdding && <p>No images found.</p>}
      </div>
    </div>
  );
}
