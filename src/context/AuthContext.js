// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
// (★) checkAuthStatus와 apiLogout은 아래에서 사용됩니다.
import { checkAuthStatus, logout as apiLogout } from '../api/auth'; 
import { useNavigate } from 'react-router-dom';

const extractNameFromEmail = (email) => {
    return email.split('@')[0];
};

export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth는 반드시 AuthProvider 안에서 사용해야 합니다.');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 
    const navigate = useNavigate(); 

    useEffect(() => {
        
        // --- (★) 개발 모드 코드를 실제 연동 코드로 대체 (경고 해결) ---
        const checkUserStatus = async () => {
            try {
                // (★) checkAuthStatus 사용
                const currentUser = await checkAuthStatus(); 
                if (currentUser && currentUser.email) { 
                    if (!currentUser.name) { 
                        currentUser.name = extractNameFromEmail(currentUser.email);
                    }
                    setUser(currentUser); 
                } else {
                    setUser(null); 
                }
            } catch (error) {
                console.error("인증 상태 확인 실패:", error.message);
                setUser(null); 
            } finally {
                setIsLoading(false); 
            }
        };
        checkUserStatus(); 
        // --------------------------------------------------------

        /* // (★) 개발 테스트 시, 위의 checkUserStatus()를 주석 처리하고
        //      아래 코드를 대신 사용하세요. (수동 강제 로그인)
        const devEmail = "jiman0919@gmail.com";
        const devName = extractNameFromEmail(devEmail); 
        setUser({ email: devEmail, name: devName, id: "dev-user-01" });
        setIsLoading(false); 
        */

    }, []); 

    const login = (userData) => {
        if (!userData.name && userData.email) {
            userData.name = extractNameFromEmail(userData.email);
        }
        setUser(userData); 
    };

    const logout = async () => {
        try {
            // (★) apiLogout 사용
            await apiLogout(); 
        } catch (error) {
            console.error("로그아웃 API 실패:", error);
        } finally {
            setUser(null);
            navigate('/login'); 
        }
    };
    
    const value = {
        user,
        isLoading,
        login,
        logout
    };
    
    if (isLoading) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: '#f4f7f6',
                fontSize: '16px', color: '#999',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};