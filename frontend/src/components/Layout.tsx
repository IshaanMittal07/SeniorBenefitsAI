import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CloseIcon, HeartIcon, MenuIcon } from './ui/Icons';

const NAV_LINKS = [
  { to: '/profile', label: 'My Profile' },
  { to: '/recommendations', label: 'My Benefits' },
  { to: '/query', label: 'Ask a Question' },
];

const PUBLIC_NAV_LINKS = [{ to: '/query', label: 'Ask a Question' }];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 font-bold transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white'
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-3 text-lg font-bold ${
    isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white'
  }`;

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav aria-label="Main" className="bg-brand-800 text-white print:hidden">
      <div className="container-page flex min-h-[4.5rem] items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 rounded-lg py-2 text-xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400 text-brand-950">
            <HeartIcon size={22} />
          </span>
          <span>Senior Benefits Finder</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {isAuthenticated ? (
            <>
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              {user?.firstName && <span className="ml-3 hidden text-brand-100 lg:inline">Hi, {user.firstName}</span>}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 rounded-lg border-2 border-white/40 px-4 py-1.5 font-bold hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {PUBLIC_NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              <Link to="/login" className="btn ml-2 bg-white text-brand-800 hover:bg-brand-50">
                Sign in
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={28} /> : <MenuIcon size={28} />}
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-white/10 md:hidden">
          <div className="container-page space-y-1 py-3">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={mobileNavLinkClass}>
                    {link.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-4 py-3 text-left text-lg font-bold text-brand-100 hover:bg-white/10 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {PUBLIC_NAV_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={mobileNavLinkClass}>
                    {link.label}
                  </NavLink>
                ))}
                <NavLink to="/login" className={mobileNavLinkClass}>
                  Sign in
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="mt-16 border-t border-slate-200 bg-white print:hidden">
    <div className="container-page flex flex-col gap-4 py-8 text-ink-muted sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xl text-sm">
        This tool gives general guidance only. Always confirm eligibility with the program provider before applying.
      </p>
      <p className="text-sm">
        Questions? Call 1 800 O-Canada:{' '}
        <a href="tel:+18006226232" className="link">
          1-800-622-6232
        </a>
      </p>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen flex-col">
    <a
      href="#main"
      className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-bold text-brand-800 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
    >
      Skip to main content
    </a>
    <NavBar />
    <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
      {children}
    </main>
    <Footer />
  </div>
);
