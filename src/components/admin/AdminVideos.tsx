import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (!error && data) setVideos(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const { error } = await supabase.from('videos').insert([{
      title, youtube_url: youtubeUrl, description, created_by: user.id
    }]);
    
    if (!error) {
      setTitle(''); setYoutubeUrl(''); setDescription(''); setIsAdding(false);
      fetchVideos();
    } else {
      alert('Error adding video: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (!error) fetchVideos();
    else alert('Error deleting video: ' + error.message);
  };

  // Helper to extract YouTube ID for embed
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <p>Loading videos...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Manage Videos</h3>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Video'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginBottom: '24px' }}>
          <h4>Add New YouTube Video</h4>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">YouTube URL</label>
            <input type="url" className="form-input" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Save Video</button>
        </form>
      )}

      <div className="grid-cards">
        {videos.map(vid => {
          const videoId = getYoutubeId(vid.youtube_url);
          return (
            <div key={vid.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              {videoId ? (
                <iframe 
                  width="100%" 
                  height="200" 
                  src={`https://www.youtube.com/embed/${videoId}`} 
                  title={vid.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ borderRadius: '8px', marginBottom: '16px' }}
                ></iframe>
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: '#333', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a href={vid.youtube_url} target="_blank" rel="noreferrer" style={{ color: 'white' }}>Watch Video</a>
                </div>
              )}
              <h4>{vid.title}</h4>
              <p style={{ color: 'var(--text-secondary)', flex: 1 }}>{vid.description}</p>
              <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => handleDelete(vid.id)}>Delete</button>
            </div>
          );
        })}
        {videos.length === 0 && !isAdding && <p>No videos found.</p>}
      </div>
    </div>
  );
}
