import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ImageCarousel from '../ImageCarousel';

export default function AdminImages() {
  const { user } = useAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

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
    if (!user || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadedUrls: string[] = [];

      // 1. Upload all images to Supabase Storage
      for (const currentFile of files) {
        const fileExt = currentFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, currentFile);
        
        if (uploadError) {
          throw new Error(`Error uploading ${currentFile.name}: ` + uploadError.message);
        }
        
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }
      
      // Determine the title
      let finalTitle = title.trim();
      if (!finalTitle) {
        // Fallback to the first filename if no title is provided
        finalTitle = files[0].name.split('.').slice(0, -1).join('.');
      }

      // 2. Insert ONE record into database with all URLs
      const { error: dbError } = await supabase.from('images').insert([{
        title: finalTitle, 
        url: uploadedUrls[0], // Keep for backward compatibility
        urls: uploadedUrls, // The new array field
        description, 
        created_by: user.id
      }]);
      
      if (dbError) throw new Error('Error saving database record: ' + dbError.message);
      
      // Reset form
      setTitle(''); 
      setFiles([]); 
      setDescription(''); 
      setIsAdding(false);
      fetchImages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string, urls: string[] | null) => {
    if (!confirm('Are you sure you want to delete this image post?')) return;
    
    try {
      // Collect all urls to delete
      const allUrls = urls && urls.length > 0 ? urls : [url];
      
      for (const singleUrl of allUrls) {
        if (!singleUrl) continue;
        const urlObj = new URL(singleUrl);
        const pathParts = urlObj.pathname.split('/');
        const galleryIndex = pathParts.indexOf('gallery');
        if (galleryIndex !== -1 && galleryIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(galleryIndex + 1).join('/');
          await supabase.storage.from('gallery').remove([filePath]);
        }
      }
    } catch (e) {
      console.warn("Could not delete file from storage.", e);
    }

    const { error } = await supabase.from('images').delete().eq('id', id);
    if (!error) fetchImages();
    else alert('Error deleting image record: ' + error.message);
  };

  const handleEditClick = (img: any) => {
    setEditingId(img.id);
    setEditTitle(img.title);
    setEditDescription(img.description || '');
  };

  const handleEditSubmit = async (id: string) => {
    const { error } = await supabase.from('images').update({
      title: editTitle,
      description: editDescription
    }).eq('id', id);

    if (error) {
      alert('Error updating image: ' + error.message);
    } else {
      setEditingId(null);
      fetchImages();
    }
  };

  if (loading) return <p>Loading images...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Manage Images</h3>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Upload Image(s)'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginBottom: '24px' }}>
          <h4>Upload New Image Post</h4>
          <div className="form-group">
            <label className="form-label">Post Title (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Hackathon 2026 Gallery" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image File(s)</label>
            <input 
              type="file" 
              className="form-input" 
              accept="image/*" 
              multiple
              onChange={e => {
                if (e.target.files) {
                  setFiles(Array.from(e.target.files));
                }
              }} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea 
              className="form-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading || files.length === 0}>
            {uploading ? `Uploading ${files.length} file(s)...` : `Save Post (${files.length} images)`}
          </button>
        </form>
      )}

      <div className="grid-cards">
        {images.map(img => {
          const imageList = img.urls && img.urls.length > 0 ? img.urls : [img.url];
          
          return (
            <div key={img.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', height: '200px', marginBottom: '16px' }}>
                <ImageCarousel urls={imageList} alt={img.title} />
              </div>
              
              {editingId === img.id ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    placeholder="Title"
                  />
                  <textarea 
                    className="form-input" 
                    value={editDescription} 
                    onChange={e => setEditDescription(e.target.value)} 
                    placeholder="Description"
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => handleEditSubmit(img.id)}>Save</button>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h4>{img.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', flex: 1 }}>{img.description}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleEditClick(img)}>Edit</button>
                    <button className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--error-color)', color: 'var(--error-color)' }} onClick={() => handleDelete(img.id, img.url, img.urls)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {images.length === 0 && !isAdding && <p>No images found.</p>}
      </div>
    </div>
  );
}
