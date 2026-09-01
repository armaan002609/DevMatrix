import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Galleries() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setImages(data);
    } else if (error) {
      console.error("Error fetching images:", error);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '64px' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px', marginTop: '32px' }}>
        <div className="badge">
          <span className="badge-label">Media</span>
          Event Galleries
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Captured Moments</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse through the memories and highlights from our past events, hackathons, and socials.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
          Loading galleries...
        </div>
      ) : images.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {images.map(img => (
            <div key={img.id} className="glass-panel card-hover" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', position: 'relative', paddingTop: '75%' }}>
                <img 
                  src={img.url} 
                  alt={img.title} 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{img.title}</h3>
              {img.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flex: 1 }}>{img.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
          <p>No images have been uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
