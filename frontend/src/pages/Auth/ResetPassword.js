// src/pages/Auth/ResetPassword.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// (★) postNewPassword의 인자 개수가 늘어났습니다.
import { sendVerificationCode, verifyCode, postNewPassword } from '../../api/auth';
import './ResetPassword.css';

function ResetPassword() {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    
    // 2단계에서 받은 토큰을 저장할 state
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
            // (★) sendVerificationCode 공용 함수 사용
            await sendVerificationCode(email);
            setIsLoading(false);
            setStep(2); 
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "인증번호 전송에 실패했습니다.");
        }
    };

    // 2단계: 인증번호 검증 
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // (★) verifyCode 공용 함수 사용
            const data = await verifyCode(email, code); 
            
            // (★) 응답에서 토큰을 추출하여 state에 저장
            if (data.token) {
                setVerificationToken(data.token);
                setIsLoading(false);
                setStep(3); // 다음 단계로
            } else {
                throw new Error("인증 토큰을 받지 못했습니다. (백엔드 응답 오류)");
            }
        } catch (err) {
            setIsLoading(false);
            // (★) API 호출이 실패하면 토큰이 없으므로 verificationToken 초기화
            setVerificationToken(null); 
            setError(err.message || "인증번호가 올바르지 않습니다.");
        }
    };

    // 3단계: 최종 비밀번호 재설정 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!verificationToken) {
            setError("인증 토큰이 없습니다. 2단계 인증을 다시 시도하세요.");
            setStep(2);
            return;
        }
        
        setIsLoading(true);
        try {
            // (★) API에 password, passwordConfirm, token을 모두 전송
            await postNewPassword(email, password, passwordConfirm, verificationToken);
            setIsLoading(false);
            alert("비밀번호가 재설정되었습니다! 로그인 페이지로 이동합니다.");
            navigate('/login');
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "재설정에 실패했습니다.");
        }
    };

    return (
        <div className="reset-container" style={{maxWidth: '380px', margin: '120px auto'}}>
            <h2>비밀번호 재설정</h2>
            {error && <p className="reset-error">{error}</p>}

            {/* --- 1단계: 이메일 입력 --- */}
            {step === 1 && (
                <form onSubmit={handleSendCode} className="reset-form">
                    <input type="email" className="reset-input" placeholder="가입한 이메일" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                    <button type="submit" disabled={isLoading} className="reset-button">
                        {isLoading ? '전송 중...' : '인증번호 전송'}
                    </button>
                </form>
            )}

            {/* --- 2단계: 인증번호 입력 --- */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="reset-form">
                    <p className="reset-info">{email}(으)로 전송된 인증번호를 입력하세요.</p>
                    <input type="text" className="reset-input" placeholder="인증번호 6자리" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isLoading} />
                    <button type="submit" disabled={isLoading} className="reset-button">
                        {isLoading ? '확인 중...' : '인증번호 검증'}
                    </button>
                </form>
            )}

            {/* --- 3단계: 새 비밀번호 입력 --- */}
            {step === 3 && (
                <form onSubmit={handleSubmit} className="reset-form">
                    <p className="reset-info">새 비밀번호를 입력하세요.</p>
                    <input
                        type="password"
                        className="reset-input"
                        placeholder="새 비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        className="reset-input"
                        placeholder="새 비밀번호 확인"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="reset-button">
                        {isLoading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </form>
            )}

            <div className="reset-links">
                <button onClick={() => navigate('/login')} className="link-button">
                    로그인 페이지로
                </button>
            </div>
        </div>
    );
}

export default ResetPassword;
