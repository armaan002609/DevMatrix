import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', studentId: '', branch: '', yearOfStudy: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          event_registrations(
            events(*)
          )
        `)
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error(error);
      } else if (data) {
        const mappedProfile = {
          ...data,
          studentId: data.student_id,
          yearOfStudy: data.year_of_study,
          membershipStatus: data.membership_status,
          registeredEvents: data.event_registrations?.map((er: any) => er.events) || []
        };
        setProfile(mappedProfile);
        setEditForm({
          name: data.name,
          studentId: data.student_id,
          branch: data.branch,
          yearOfStudy: data.year_of_study
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Ensure the users row exists if it was missing for some reason
    if (!profile) {
      const { error } = await supabase.from('users').insert([{
        id: user.id,
        email: user.email,
        name: editForm.name,
        student_id: editForm.studentId,
        branch: editForm.branch,
        year_of_study: parseInt(editForm.yearOfStudy)
      }]);
      if (error) alert('Error creating profile: ' + error.message);
      else { setIsEditing(false); fetchProfile(); }
      return;
    }

    const { error } = await supabase.from('users').update({
      name: editForm.name,
      student_id: editForm.studentId,
      branch: editForm.branch,
      year_of_study: parseInt(editForm.yearOfStudy)
    }).eq('id', user.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      setIsEditing(false);
      fetchProfile();
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  if (loading) return <p>Loading profile...</p>;
  
  // If profile is missing, force them to create it
  if (!profile && !isEditing) {
    return (
      <div className="animate-fade-in glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Complete Your Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your basic information is missing. Please fill it out below.</p>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input type="text" className="form-input" value={editForm.studentId} onChange={e => setEditForm({...editForm, studentId: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <input type="text" className="form-input" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Year of Study</label>
            <input type="number" className="form-input" min="1" max="6" value={editForm.yearOfStudy} onChange={e => setEditForm({...editForm, yearOfStudy: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary">Save Profile</button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Profile</h2>
        <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="glass-panel" style={{ marginTop: '24px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input type="text" className="form-input" value={editForm.studentId} onChange={e => setEditForm({...editForm, studentId: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <input type="text" className="form-input" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Year of Study</label>
            <input type="number" className="form-input" min="1" max="6" value={editForm.yearOfStudy} onChange={e => setEditForm({...editForm, yearOfStudy: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
      ) : (
        <div className="glass-panel" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-primary)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {profile?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h3>{profile?.name}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: profile?.membershipStatus === 'active' ? 'rgba(102, 252, 241, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: profile?.membershipStatus === 'active' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.8rem'
                }}>
                  {profile?.membershipStatus === 'active' ? 'Active Member' : 'Inactive'}
                </span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem'
                }}>
                  Role: {profile?.role}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <div>
              <p className="form-label">Student ID</p>
              <p>{profile?.studentId}</p>
            </div>
            <div>
              <p className="form-label">Branch & Year</p>
              <p>{profile?.branch} • Year {profile?.yearOfStudy}</p>
            </div>
          </div>
        </div>
      )}
      
      <h3 style={{ marginTop: '48px' }}>Registered Events</h3>
      {profile?.registeredEvents && profile.registeredEvents.length > 0 ? (
        <div className="grid-cards" style={{ marginTop: '24px' }}>
          {profile.registeredEvents.map((ev: any) => (
             <div key={ev.id || ev._id} className="glass-panel">
               <h4>{ev.title}</h4>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                 {new Date(ev.date).toLocaleDateString()}
               </p>
             </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>You haven't registered for any events yet.</p>
      )}
    </div>
  );
}
