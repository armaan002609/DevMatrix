import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Calendar from '../components/Calendar';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('date', { ascending: true });
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '80px', marginTop: '16px' }}>
        <div className="badge">
          <span className="badge-label">NEW</span>
          Join the DevMatrix Ecosystem &rarr;
        </div>
        <h1 style={{ marginBottom: '16px', fontSize: '4.5rem', lineHeight: '1.1', maxWidth: '1000px' }}>
          Full-Stack Software Development<br />
          &amp; Product Engineering.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '900px', marginBottom: '40px', fontWeight: 400 }}>
          Our mission is to establish a collaborative software innovation ecosystem where students design, develop, deploy, and maintain real-world software solutions. We are here to foster innovation, drive entrepreneurship, and make meaningful open-source contributions.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '14px 32px', flex: '1 1 auto' }}>JOIN THE TEAM</button>
          <button className="btn btn-secondary" style={{ padding: '14px 32px', flex: '1 1 auto' }}>VIEW PROJECTS</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.6, borderBottom: '1px solid var(--border-color)', paddingBottom: '48px', marginBottom: '48px', filter: 'grayscale(100%)' }}>
        {/* Placeholder for the logo marquee row */}
        <h3 style={{ margin: 0 }}>SOPHOS</h3>
        <h3 style={{ margin: 0 }}>Canva</h3>
        <h3 style={{ margin: 0 }}>databricks</h3>
        <h3 style={{ margin: 0 }}>reddit</h3>
        <h3 style={{ margin: 0 }}>snowflake</h3>
        <h3 style={{ margin: 0 }}>intercom</h3>
        <h3 style={{ margin: 0 }}>Dropbox</h3>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Events &amp; Schedule</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>See what's happening this month.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
        {/* Calendar Side */}
        <div style={{ flex: '1 1 300px' }}>
          <Calendar events={events} />
        </div>

        {/* Events Side */}
        <div style={{ flex: '2 1 300px' }}>
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No upcoming events right now. Check back later!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {events.map((event) => (
                <Link to={`/events/${event.slug}`} key={event.id} className="glass-panel card-hover" style={{ display: 'flex', gap: '24px', textDecoration: 'none', flexWrap: 'wrap' }}>
                  <div style={{ 
                    width: '180px', 
                    minWidth: '180px',
                    flexGrow: 1,
                    height: '140px', 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    backgroundImage: `url(${event.bannerImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--text-heading)' }}>{event.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px' }}>
                      📍 {event.venue}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {event.tags?.map((tag: string) => (
                        <span key={tag} style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 12px', 
                          borderRadius: '9999px', 
                          backgroundColor: 'var(--accent-secondary)',
                          color: 'var(--accent-primary)'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
