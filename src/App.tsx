import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, User as UserIcon, LogOut, Settings } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import EventDetail from './pages/EventDetail';

function App() {
  const { user, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <Router>
      <div className="container">
        <nav className="navbar" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'} alt="DevMatrix Logo" style={{ height: '64px' }} />
              </Link>
              <div className="nav-links hidden-mobile" style={{ display: 'flex', gap: '24px' }}>
              <div className="nav-item">
                <Link to="/" style={{ color: 'var(--accent-primary)' }}>Events ▾</Link>
                <div className="mega-menu">
                  <Link to="/" className="mega-card mega-card-large">
                    <h3>Hackathons</h3>
                    <p>Join our massive weekend events and build the future.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Workshops</h3>
                    <p>Learn new skills from industry experts.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Socials</h3>
                  </Link>
                  <Link to="/" className="mega-card mega-card-light">
                    <h3>Upcoming Calendar</h3>
                    <p>View all scheduled events for this semester.</p>
                  </Link>
                </div>
              </div>
              
              <div className="nav-item">
                <Link to="/">Images ▾</Link>
                <div className="mega-menu" style={{ left: '-300px' }}>
                  <Link to="/" className="mega-card mega-card-large">
                    <h3>Event Galleries</h3>
                    <p>Browse through high-quality photos from past events.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Member Spotlights</h3>
                    <p>See our community in action.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Projects</h3>
                  </Link>
                  <Link to="/" className="mega-card mega-card-light">
                    <h3>Submit Media</h3>
                    <p>Have photos to share? Upload them here.</p>
                  </Link>
                </div>
              </div>

              <div className="nav-item">
                <Link to="/">Videos ▾</Link>
                <div className="mega-menu" style={{ left: '-400px' }}>
                  <Link to="/" className="mega-card mega-card-large">
                    <h3>Tech Talks</h3>
                    <p>Watch recordings of our guest speakers and panels.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Tutorials</h3>
                    <p>Step-by-step video guides.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Shorts</h3>
                  </Link>
                  <Link to="/" className="mega-card mega-card-light">
                    <h3>YouTube Channel</h3>
                    <p>Subscribe for the latest updates.</p>
                  </Link>
                </div>
              </div>

              <div className="nav-item">
                <Link to="/">Blogs ▾</Link>
                <div className="mega-menu" style={{ left: '-500px' }}>
                  <Link to="/" className="mega-card mega-card-large">
                    <h3>Engineering Blog</h3>
                    <p>Deep dives into the architecture and software we build.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Articles</h3>
                    <p>Thoughts and insights.</p>
                  </Link>
                  <Link to="/" className="mega-card mega-card-small">
                    <h3>Community News</h3>
                  </Link>
                  <Link to="/" className="mega-card mega-card-light">
                    <h3>Write for Us</h3>
                    <p>Share your knowledge with the community.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-links hidden-mobile">
            {user ? (
              <div className="profile-dropdown-container">
                <button className="profile-avatar-btn">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" />
                  ) : (
                    user.name?.charAt(0) || <UserIcon size={20} />
                  )}
                </button>
                <div className="profile-dropdown-menu">
                  <div style={{ padding: '8px 16px', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">
                      <Settings size={18} /> Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item">
                    <UserIcon size={18} /> Edit Profile
                  </Link>
                  <button onClick={toggleTheme} className="dropdown-item">
                    {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
                  </button>
                  <div className="dropdown-divider"></div>
                  <button onClick={logout} className="dropdown-item" style={{ color: 'var(--accent-primary)' }}>
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
                <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
                <Link to="/register" className="btn btn-primary">JOIN THE TEAM</Link>
              </>
            )}
          </div>
          
          <button 
            className="btn btn-secondary show-mobile-flex" 
            style={{ display: 'none', padding: '8px' }} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="mobile-menu-container show-mobile-flex" style={{ display: 'none' }}>
              <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Events</Link>
              <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Images</Link>
              <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Videos</Link>
              <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                {user ? (
                  <>
                    {user.role === 'admin' && <Link to="/admin" className="btn btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>}
                    <Link to="/profile" className="btn btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                    <button onClick={toggleTheme} className="btn btn-secondary">
                      {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    </button>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn btn-secondary" style={{ color: 'var(--accent-primary)' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                    <Link to="/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>JOIN THE TEAM</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <footer style={{ marginTop: '120px', borderTop: '1px solid var(--border-color)', paddingTop: '64px', paddingBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '64px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <img src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'} alt="DevMatrix Logo" style={{ height: '40px', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '300px', lineHeight: '1.6' }}>
                Building the future of full-stack software development and product engineering.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Ecosystem</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Events</Link>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Projects</Link>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Open Source</Link>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Hackathons</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Engineering Blog</Link>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Documentation</Link>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Brand Assets</Link>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Community Guidelines</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Connect</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <a href="#" style={{ color: 'var(--text-secondary)' }}>LinkedIn</a>
                <a href="#" style={{ color: 'var(--text-secondary)' }}>GitHub</a>
                <a href="#" style={{ color: 'var(--text-secondary)' }}>Instagram</a>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '32px', color: 'var(--text-secondary)', fontSize: '0.9rem', gap: '16px' }}>
            <p>&copy; {new Date().getFullYear()} DevMatrix. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link to="/" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
              <Link to="/" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
