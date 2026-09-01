import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', studentId: '', branch: '', yearOfStudy: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) return <Navigate to="/profile" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            student_id: formData.studentId,
            branch: formData.branch,
            year_of_study: parseInt(formData.yearOfStudy)
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // If email confirmation is enabled, session will be null
      if (data?.user && !data?.session) {
        setSuccessMsg('Registration successful! Please check your email to verify your account before logging in.');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Join the Community</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create an account to register for events and track your membership.</p>
      
      {error && <div style={{ color: '#ff4c4c', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
      {successMsg && <div style={{ color: 'var(--accent-primary)', marginBottom: '16px', fontSize: '0.95rem', padding: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>{successMsg}</div>}
      
      {!successMsg && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} minLength={6} required />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID / Roll Number</label>
            <input type="text" name="studentId" className="form-input" value={formData.studentId} onChange={handleChange} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Branch/Department</label>
              <input type="text" name="branch" className="form-input" value={formData.branch} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select name="yearOfStudy" className="form-input" value={formData.yearOfStudy} onChange={handleChange} required style={{ backgroundColor: 'var(--bg-main)' }}>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', marginBottom: '16px' }}>Register</button>
          
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Log in</Link>
          </div>
        </form>
      )}
      
      {successMsg && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      )}
    </div>
  );
}
