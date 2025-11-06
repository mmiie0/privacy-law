// src/pages/Auth/SignUp.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerificationCode, verifyCode, postSignUp } from '../../api/auth';
import './SignUp.css'; 

function SignUp() {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    
    // (★추가) 2단계에서 받은 토큰을 저장할 state
    const [verificationToken, setVerificationToken] = useState(null); 
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 1단계: 인증번호 전송
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await sendVerificationCode(email);
            setIsLoading(false);
            setStep(2); 
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "인증번호 전송에 실패했습니다.");
        }
    };

    // 2단계: 인증번호 검증 (★수정)
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // (★) API를 호출하고 응답(data)을 받음
            const data = await verifyCode(email, code);
            
            // (★) 응답에서 토큰을 추출하여 state에 저장
            if (data.token) {
                setVerificationToken(data.token);
                setIsLoading(false);
                setStep(3); // 다음 단계로
            } else {
                throw new Error("인증 토큰을 받지 못했습니다.");
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "인증번호가 올바르지 않습니다.");
        }
    };

    // 3단계: 최종 회원가입 (★수정)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!verificationToken) {
            setError("인증 토큰이 없습니다. 2단계 인증을 다시 시도하세요.");
            setStep(2);
            return;
        }
        
        setIsLoading(true);
        try {
            // (★) API에 passwordConfirm과 token을 함께 전송
            await postSignUp(email, password, passwordConfirm, verificationToken);
            setIsLoading(false);
            alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
            navigate('/login');
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "회원가입에 실패했습니다.");
        }
    };

    const handleGoBack = () => {
        if (step > 1) {
            setStep(step - 1); 
            setError('');
        } else {
            navigate('/login');
        }
    };
    return (
        <div className="signup-container" style={{maxWidth: '380px', margin: '120px auto'}}>
            <h2>회원가입</h2>
            {error && <p className="signup-error">{error}</p>}

            {/* --- 1단계: 이메일 입력 --- */}
            {step === 1 && (
                <form onSubmit={handleSendCode} className="signup-form">
                    {/* ... (input, button 동일) ... */}
                    <input type="email" className="signup-input" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                    <button type="submit" disabled={isLoading} className="signup-button">
                        {isLoading ? '전송 중...' : '인증번호 전송'}
                    </button>
                </form>
            )}

            {/* --- 2단계: 인증번호 입력 --- */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="signup-form">
                    {/* ... (input, button 동일) ... */}
                    <p className="signup-info">{email}(으)로 전송된 인증번호를 입력하세요.</p>
                    <input type="text" className="signup-input" placeholder="인증번호 6자리" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isLoading} />
                    <button type="submit" disabled={isLoading} className="signup-button">
                        {isLoading ? '확인 중...' : '인증번호 검증'}
                    </button>
                </form>
            )}

            {/* --- 3단계: 비밀번호 입력 (★수정) --- */}
            {step === 3 && (
                <form onSubmit={handleSubmit} className="signup-form">
                    <p className="signup-info">이메일: {email}</p>
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="비밀번호 확인"
                        value={passwordConfirm} // (★) passwordConfirm state와 연결
                        onChange={(e) => setPasswordConfirm(e.target.value)} // (★)
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="signup-button">
                        {isLoading ? '가입 중...' : '회원가입 완료'}
                    </button>
                </form>
            )}

            <div className="signup-links">
                {/* ... (뒤로가기 버튼 동일) ... */}
                <button onClick={handleGoBack} className="link-button">
                    {step > 1 ? '뒤로가기' : '로그인 페이지로'}
                </button>
            </div>
        </div>
    );
}

export default SignUp;