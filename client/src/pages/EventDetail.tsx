import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchEvent();
  }, [slug]);

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>← Back to Events</Link>
      
      {event.bannerImageUrl && (
        <div style={{ 
          width: '100%', 
          height: '300px', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderRadius: '16px', 
          marginBottom: '32px',
          backgroundImage: `url(${event.bannerImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
      )}
      
      <h1>{event.title}</h1>
      
      <div style={{ display: 'flex', gap: '24px', margin: '24px 0', padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
        <div>
          <p className="form-label">Date</p>
          <p>{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <div>
          <p className="form-label">Venue</p>
          <p>{event.venue}</p>
        </div>
        {event.capacity && (
          <div>
            <p className="form-label">Capacity</p>
            <p>{event.registeredCount} / {event.capacity}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {event.tags?.map((tag: string) => (
          <span key={tag} style={{ 
            fontSize: '0.85rem', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)'
          }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '48px', whiteSpace: 'pre-wrap' }}>
        {event.description}
      </div>

      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '16px' }}>Join this event</h3>
        {event.registrationType === 'external' && event.externalRegistrationUrl ? (
          <a href={event.externalRegistrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Register Here
          </a>
        ) : (
          <button className="btn btn-primary">Register Now</button>
        )}
      </div>
    </div>
  );
}
