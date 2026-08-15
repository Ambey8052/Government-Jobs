import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LandmarkIcon, LayoutDashboard, LogOut, Menu, ShieldCheck, User, X, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const linkClass = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-navy-50 text-navy-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-navy-800">
          <LandmarkIcon size={24} className="text-brand-600" />
          <span className="text-lg font-bold tracking-tight">SarkariSetu</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink to="/saved" className={linkClass}>
                <Bookmark size={16} /> Saved
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                <User size={16} /> Profile
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={linkClass}>
                  <ShieldCheck size={16} /> Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <button type="button" onClick={handleLogout} className="btn-outline text-sm">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn-accent text-sm">Get Started</Link>
            </>
          )}
        </div>

        <button type="button" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {user ? (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
                <NavLink to="/saved" className={linkClass} onClick={() => setOpen(false)}>Saved</NavLink>
                <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>Profile</NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>
                )}
                <button type="button" onClick={handleLogout} className="btn-outline mt-2 text-sm">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-accent text-sm" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
