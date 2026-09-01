import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ImageCarousel from '../ImageCarousel';
import { ChevronLeft, ChevronRight, X, Calendar, User as UserIcon } from 'lucide-react';

export default function AdminImages() {
  const { user } = useAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  // New Upload Metadata
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestDesignation, setGuestDesignation] = useState('');
  
  const [uploading, setUploading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestDesignation, setEditGuestDesignation] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  // Manage Preview URLs to prevent memory leaks
  useEffect(() => {
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false });
    if (!error && data) setImages(data);
    setLoading(false);
  };

  const moveFile = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === files.length - 1) return;

    const newFiles = [...files];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    // Swap
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadedUrls: string[] = [];

      // 1. Upload all images to Supabase Storage in the current order
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

      // 2. Insert ONE record into database with all URLs and Metadata
      const { error: dbError } = await supabase.from('images').insert([{
        title: finalTitle, 
        url: uploadedUrls[0], // Keep for backward compatibility
        urls: uploadedUrls, // The new array field
        description, 
        event_date: eventDate || null,
        event_time: eventTime || null,
        guest_name: guestName || null,
        guest_designation: guestDesignation || null,
        created_by: user.id
      }]);
      
      if (dbError) throw new Error('Error saving database record: ' + dbError.message);
      
      // Reset form
      setTitle(''); 
      setFiles([]); 
      setDescription(''); 
      setEventDate('');
      setEventTime('');
      setGuestName('');
      setGuestDesignation('');
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
    setEditTitle(img.title || '');
    setEditDescription(img.description || '');
    setEditEventDate(img.event_date || '');
    setEditEventTime(img.event_time || '');
    setEditGuestName(img.guest_name || '');
    setEditGuestDesignation(img.guest_designation || '');
  };

  const handleEditSubmit = async (id: string) => {
    const { error } = await supabase.from('images').update({
      title: editTitle,
      description: editDescription,
      event_date: editEventDate || null,
      event_time: editEventTime || null,
      guest_name: editGuestName || null,
      guest_designation: editGuestDesignation || null,
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
            />
          </div>
          
          {/* Previews and Rearranging */}
          {previews.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Rearrange Images</label>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
                {previews.map((previewUrl, index) => (
                  <div key={previewUrl} style={{ position: 'relative', width: '120px', flex: '0 0 120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={previewUrl} alt={`Preview ${index}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '4px', background: 'rgba(0,0,0,0.5)' }}>
                      <button 
                        type="button"
                        onClick={() => moveFile(index, 'left')} 
                        disabled={index === 0}
                        style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.3)' : 'white', cursor: index === 0 ? 'default' : 'pointer' }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => removeFile(index)} 
                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveFile(index, 'right')} 
                        disabled={index === previews.length - 1}
                        style={{ background: 'none', border: 'none', color: index === previews.length - 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: index === previews.length - 1 ? 'default' : 'pointer' }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.75rem', textAlign: 'center', padding: '2px 0' }}>
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Event Date (Optional)</label>
              <input 
                type="date" 
                className="form-input" 
                value={eventDate} 
                onChange={e => setEventDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Event Time (Optional)</label>
              <input 
                type="time" 
                className="form-input" 
                value={eventTime} 
                onChange={e => setEventTime(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Guest Name (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. John Doe"
                value={guestName} 
                onChange={e => setGuestName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Guest Designation (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Senior SWE @ Google"
                value={guestDesignation} 
                onChange={e => setGuestDesignation(e.target.value)} 
              />
            </div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="date" className="form-input" value={editEventDate} onChange={e => setEditEventDate(e.target.value)} />
                    <input type="time" className="form-input" value={editEventTime} onChange={e => setEditEventTime(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" className="form-input" value={editGuestName} onChange={e => setEditGuestName(e.target.value)} placeholder="Guest Name" />
                    <input type="text" className="form-input" value={editGuestDesignation} onChange={e => setEditGuestDesignation(e.target.value)} placeholder="Designation" />
                  </div>
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
                  
                  {/* Metadata display */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px', marginBottom: '8px' }}>
                    {(img.event_date || img.event_time) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} /> 
                        {img.event_date ? new Date(img.event_date).toLocaleDateString() : ''}
                        {img.event_date && img.event_time ? ' at ' : ''}
                        {img.event_time ? img.event_time.substring(0, 5) : ''}
                      </span>
                    )}
                    {(img.guest_name) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <UserIcon size={14} /> 
                        {img.guest_name}
                        {img.guest_designation ? ` - ${img.guest_designation}` : ''}
                      </span>
                    )}
                  </div>

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
