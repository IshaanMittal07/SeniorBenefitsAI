import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from './services/api';
import { Login } from './pages/Login';
import { ProfileForm } from './components/ProfileForm';
import { Recommendations } from './components/Recommendations';
import { NaturalLanguageQuery } from './components/NaturalLanguageQuery';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!api.isAuthenticated()) {
    return <Login />;
  }
  return <>{children}</>;
};

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = api.isAuthenticated();

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🏥 Senior Benefits
        </Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hover:text-blue-200 transition-colors">
                Profile
              </Link>
              <Link to="/recommendations" className="hover:text-blue-200 transition-colors">
                Recommendations
              </Link>
              <Link to="/query" className="hover:text-blue-200 transition-colors">
                Ask Benefits
              </Link>
              <button onClick={handleLogout} className="hover:text-blue-200 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-200 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/query"
          element={
            <ProtectedRoute>
              <NaturalLanguageQuery />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
