import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select(`
              *,
              event_registrations(
                events(*)
              )
            `)
            .eq('id', user.id)
            .single();

          if (error) {
            console.error(error);
          } else if (data) {
            // Map event_registrations to a flat array of events
            const mappedProfile = {
              ...data,
              studentId: data.student_id,
              yearOfStudy: data.year_of_study,
              membershipStatus: data.membership_status,
              registeredEvents: data.event_registrations?.map((er: any) => er.events) || []
            };
            setProfile(mappedProfile);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Error loading profile.</p>;

  return (
    <div className="animate-fade-in">
      <h2>My Profile</h2>
      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
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
            {profile.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3>{profile.name}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
            <span style={{ 
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px', 
              borderRadius: '20px', 
              backgroundColor: profile.membershipStatus === 'active' ? 'rgba(102, 252, 241, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              color: profile.membershipStatus === 'active' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.8rem'
            }}>
              {profile.membershipStatus === 'active' ? 'Active Member' : 'Inactive'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <div>
            <p className="form-label">Student ID</p>
            <p>{profile.studentId}</p>
          </div>
          <div>
            <p className="form-label">Branch & Year</p>
            <p>{profile.branch} • Year {profile.yearOfStudy}</p>
          </div>
        </div>
      </div>
      
      <h3 style={{ marginTop: '48px' }}>Registered Events</h3>
      {profile.registeredEvents && profile.registeredEvents.length > 0 ? (
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
