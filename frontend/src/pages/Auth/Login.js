// src/pages/Auth/Login.js

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { postLogin } from '../../api/auth';          
import './Login.css'; 

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth(); 

    const from = location.state?.from?.pathname || "/chatbot";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. (목업) API 호출
            const userData = await postLogin(email, password);

            // 2. 전역 상태에 사용자 정보 저장
            login(userData);
            
            // 3. 챗봇 페이지로 이동
            navigate(from, { replace: true }); 

        } catch (err) {
            setError(err.message || '로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" >
            <h2>로그인</h2>
            <form onSubmit={handleSubmit} className="login-form">
                
                <input
                    type="email"
                    className="login-input"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                <input
                    type="password"
                    className="login-input"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                {error && <p className="login-error">{error}</p>}
                
                <button type="submit" disabled={isLoading} className="login-button">
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>
            </form>

            <div className="login-links">
                <button onClick={() => navigate('/signup')} className="link-button">
                    회원가입
                </button>
                <button onClick={() => navigate('/reset-password')} className="link-button">
                    비밀번호 재설정
                </button>
            </div>
        </div>
    );
}

export default Login;