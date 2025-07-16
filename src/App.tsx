import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kambing from './pages/Kambing';
import Kandang from './pages/Kandang';
import Vaksin from './pages/Vaksin';
import Vaksinisasi from './pages/Vaksinisasi';
import History from './pages/History';
import Settings from './pages/Settings';
import DashboardLayout from './components/Layout/DashboardLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle PWA install prompt
    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or banner
      const installBanner = document.createElement('div');
      installBanner.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: #16a34a; color: white; padding: 12px; border-radius: 8px; z-index: 1000; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <span style="font-size: 14px;">Install Sistem Ternak sebagai aplikasi</span>
          <div>
            <button id="install-btn" style="background: white; color: #16a34a; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px; cursor: pointer; font-size: 12px;">Install</button>
            <button id="dismiss-btn" style="background: transparent; color: white; border: 1px solid white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Nanti</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(installBanner);
      
      document.getElementById('install-btn')?.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
          document.body.removeChild(installBanner);
        });
      });
      
      document.getElementById('dismiss-btn')?.addEventListener('click', () => {
        document.body.removeChild(installBanner);
      });
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
           position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
               fontSize: '14px',
               borderRadius: '8px',
               boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="kambing" element={<Kambing />} />
              <Route path="kandang" element={<Kandang />} />
              <Route path="vaksin" element={<Vaksin />} />
              <Route path="vaksinisasi" element={<Vaksinisasi />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;