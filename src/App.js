// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; 

// 페이지 컴포넌트들
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp'; 
import ResetPassword from './pages/Auth/ResetPassword';
import Chat from './pages/Chat/Chat';
import DocumentScan from './pages/Document/Document';

function App() {
  return (
    <Routes>
      {/* --- 1. 공개 페이지 --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* --- 2. 보호된 페이지 (로그인 필수) --- */}
      
      <Route 
        path="/chatbot" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/scan" 
        element={
          <ProtectedRoute>
            <DocumentScan />
          </ProtectedRoute>
        } 
      />

      {/* --- 3. 기본 경로 설정 --- */}
      <Route path="*" element={<Navigate to="/chatbot" replace />} />
    </Routes>
  );
}

export default App;