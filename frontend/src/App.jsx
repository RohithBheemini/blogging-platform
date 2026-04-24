import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home       from './pages/Home';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Write      from './pages/Write';
import PostDetail from './pages/PostDetail';
import MyPosts    from './pages/MyPosts';
import Profile    from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/posts/:id"   element={<PostDetail />} />

            {/* Protected */}
            <Route path="/write"  element={<ProtectedRoute><Write /></ProtectedRoute>} />
            <Route path="/write/:id" element={<ProtectedRoute><Write /></ProtectedRoute>} />
            <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
            <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
