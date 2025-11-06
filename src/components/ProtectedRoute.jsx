// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext'; // 'React 메모리' 접근 훅
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // 1. 'React 메모리'에서 현재 user 상태를 가져옴
    const { user } = useAuth();
    // 2. 현재 페이지 위치(경로)를 기억
    const location = useLocation();

    // 3. user가 null이면 (비로그인)
    if (!user) {
        // 로그인 페이지로 튕겨냄
        // (state: location) -> 로그인 성공 후 원래 가려던 이 페이지(location)로 다시 돌려보내기 위함
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 4. user가 있으면 (로그인)
    // 요청한 자식 컴포넌트(Dashboard 등)를 그대로 보여줌
    return children;
}

export default ProtectedRoute;