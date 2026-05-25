import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RequestPage from './pages/RequestPage';
import AcceptPage from './pages/AcceptPage';
import MyRequestsPage from './pages/MyRequestsPage';
import { RegisterPage, LoginPage } from './pages/AuthPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/accept/:requestId" element={<AcceptPage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <p style={{ fontSize: '4rem' }}>🎾</p>
      <h2 style={{ fontSize: '1.5rem', marginTop: '16px', marginBottom: '8px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        That page doesn&apos;t exist. Head back to the home court.
      </p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  );
}

export default App;

