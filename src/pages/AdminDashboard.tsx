import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminEvents from '../components/admin/AdminEvents';
import AdminImages from '../components/admin/AdminImages';
import AdminVideos from '../components/admin/AdminVideos';
import AdminBlogs from '../components/admin/AdminBlogs';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'images' | 'videos' | 'blogs' | 'members'>('events');
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'members') {
      supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error(error);
          else setMembers(data || []);
        });
    }
  }, [user, activeTab]);

  if (authLoading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleExport = () => {
    try {
      if (members.length === 0) return;
      
      const headers = ["Name", "Email", "Student ID", "Branch", "Year", "Status", "Joined"];
      const csvRows = [headers.join(",")];

      for (const m of members) {
        csvRows.push([
          `"${m.name}"`,
          `"${m.email}"`,
          `"${m.student_id}"`,
          `"${m.branch}"`,
          m.year_of_study,
          `"${m.membership_status}"`,
          `"${m.created_at}"`
        ].join(","));
      }

      const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'members-export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Admin Dashboard</h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('events')}>Events</button>
        <button className={`btn ${activeTab === 'images' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('images')}>Images</button>
        <button className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('videos')}>Videos</button>
        <button className={`btn ${activeTab === 'blogs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('blogs')}>Blogs</button>
        <button className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('members')}>Members</button>
      </div>

      {activeTab === 'events' && <AdminEvents />}
      {activeTab === 'images' && <AdminImages />}
      {activeTab === 'videos' && <AdminVideos />}
      {activeTab === 'blogs' && <AdminBlogs />}

      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3>Community Members</h3>
            <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
          </div>
          
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Branch</th>
                  <th style={{ padding: '12px' }}>Year</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{m.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{m.email}</td>
                    <td style={{ padding: '12px' }}>{m.branch}</td>
                    <td style={{ padding: '12px' }}>{m.year_of_study}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: m.membership_status === 'active' ? 'var(--accent-primary)' : 'inherit' }}>
                        {m.membership_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No members found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
