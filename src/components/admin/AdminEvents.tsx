import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState('draft');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const { error } = await supabase.from('events').insert([{
      title, slug, description, date: new Date(date).toISOString(), venue, status, banner_image_url: bannerImageUrl, created_by: user.id
    }]);
    
    if (!error) {
      setTitle(''); setSlug(''); setDescription(''); setDate(''); setVenue(''); setStatus('draft'); setBannerImageUrl(''); setIsAdding(false);
      fetchEvents();
    } else {
      alert('Error adding event: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) fetchEvents();
    else alert('Error deleting event: ' + error.message);
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Manage Events</h3>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel" style={{ marginBottom: '24px' }}>
          <h4>Create New Event</h4>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} onBlur={generateSlug} required />
          </div>
          <div className="form-group">
            <label className="form-label">URL Slug</label>
            <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input type="datetime-local" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Venue</label>
            <input type="text" className="form-input" value={venue} onChange={e => setVenue(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Banner Image URL (Optional)</label>
            <input type="url" className="form-input" value={bannerImageUrl} onChange={e => setBannerImageUrl(e.target.value)} />
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
            <label className="form-label">Description</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} required rows={4} />
          </div>
          <button type="submit" className="btn btn-primary">Save Event</button>
        </form>
      )}

      <div className="grid-cards">
        {events.map(event => (
          <div key={event.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            {event.banner_image_url && <img src={event.banner_image_url} alt={event.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />}
            <h4>{event.title}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}<br/>
              <strong>Venue:</strong> {event.venue}
            </p>
            <div className="badge" style={{ marginTop: '8px' }}><span className="badge-label">{event.status}</span></div>
            <button className="btn btn-secondary" style={{ marginTop: 'auto' }} onClick={() => handleDelete(event.id)}>Delete</button>
          </div>
        ))}
        {events.length === 0 && !isAdding && <p>No events found.</p>}
      </div>
    </div>
  );
}
