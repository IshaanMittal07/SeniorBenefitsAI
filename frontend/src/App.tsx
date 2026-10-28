import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import api from './services/api';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { ProfileForm } from './components/ProfileForm';
import { Recommendations } from './components/Recommendations';
import { NaturalLanguageQuery } from './components/NaturalLanguageQuery';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!api.isAuthenticated()) {
    return <Login />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
