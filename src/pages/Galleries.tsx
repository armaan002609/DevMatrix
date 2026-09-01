import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ImageCarousel from '../components/ImageCarousel';
import { Calendar, User as UserIcon } from 'lucide-react';

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
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '24px' 
        }}>
          {images.map(img => {
            const imageList = img.urls && img.urls.length > 0 ? img.urls : [img.url];
            
            return (
              <div key={img.id} className="glass-panel card-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', position: 'relative', paddingTop: '75%' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <ImageCarousel urls={imageList} alt={img.title} />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{img.title}</h3>
                
                {/* Metadata display */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  {(img.event_date || img.event_time) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--accent-primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                      <Calendar size={14} /> 
                      {img.event_date ? new Date(img.event_date).toLocaleDateString() : ''}
                      {img.event_date && img.event_time ? ' at ' : ''}
                      {img.event_time ? img.event_time.substring(0, 5) : ''}
                    </span>
                  )}
                  {(img.guest_name) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                      <UserIcon size={14} /> 
                      {img.guest_name}
                      {img.guest_designation ? ` - ${img.guest_designation}` : ''}
                    </span>
                  )}
                </div>

                {img.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flex: 1, marginTop: '8px' }}>{img.description}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
          <p>No images have been uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
