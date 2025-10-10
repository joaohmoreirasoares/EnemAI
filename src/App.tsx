import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatPage from '@/pages/Chat';
import NotesPage from '@/pages/Notes';
import CommunityPage from '@/pages/Community';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/community" element={<CommunityPage />} />
      </Route>
      
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;