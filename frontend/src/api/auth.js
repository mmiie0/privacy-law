// src/api/auth.js

import { apiFetch } from './url';

// ----------------------------------------------------------------
// (1) 헬퍼 함수
// ----------------------------------------------------------------

// 이메일에서 @ 앞부분을 이름으로 추출하는 헬퍼 함수
const extractNameFromEmail = (email) => {
    return email.split('@')[0];
};

// ----------------------------------------------------------------
// (2) 실제 API 연동 함수
// ----------------------------------------------------------------

/**
 * [실제 API] 1. 로그인 (POST /api/auth/login)
 * (image_c15c1b.png 참조)
 */
export const postLogin = async (email, password) => {
    const response = await apiFetch('/auth/login', { 
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // 백엔드가 이름 필드를 주지 않을 경우 대비 (AuthContext에서 사용됨)
    if (response && !response.name && response.email) {
        response.name = extractNameFromEmail(response.email);
    }
    return response;
};

/**
 * [실제 API] 2. 회원가입 (POST /api/auth/signup)
 * (image_c15bdb.png 참조: password_confirm, token 포함)
 */
export const postSignUp = async (email, password, passwordConfirm, token) => {
    const response = await apiFetch('/auth/signup', { 
        method: 'POST',
        body: JSON.stringify({ 
            email, 
            password, 
            password_confirm: passwordConfirm, 
            token 
        })
    });
    
    if (response && !response.name && response.email) {
        response.name = extractNameFromEmail(response.email);
    }
    return response;
};

/**
 * [실제 API] 3. 인증번호 전송 (POST /api/auth/verification-code/send)
 * (★ 수정: 'purpose' 인자 추가)
 */
export async function sendVerificationCode(email, purpose) { 
    return apiFetch('/auth/verification-code/send', {
        method: 'POST',
        body: JSON.stringify({ 
            email, 
            purpose // (★) "signup" 또는 "resetpassword"
        })
    });
}

/**
 * [실제 API] 4. 인증번호 검증 (POST /api/auth/verification-code/verify)
 * (image_c15ba3.png 참조)
 * (★ 수정: 'purpose' 인자 추가)
 */
export async function verifyCode(email, code, purpose) { 
    const response = await apiFetch('/auth/verification-code/verify', {
        method: 'POST',
        body: JSON.stringify({ 
            email, 
            input_number: code, // (★) API 명세에 따름
            purpose // (★) "signup" 또는 "resetpassword"
        })
    });
    
    // 이 API는 응답으로 토큰을 반환해야 함 (SignUp/ResetPassword 로직 기반)
    if (!response.token) {
        throw new Error("인증은 성공했으나, 후속 처리를 위한 토큰을 받지 못했습니다.");
    }
    return response; 
}

/**
 * [실제 API] 5. 비밀번호 재설정 (POST /api/auth/password/reset)
 * (image_c15bfc.png 참조)
 */
export async function postNewPassword(email, password, passwordConfirm, token) {
    return apiFetch('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            password_confirm: passwordConfirm, // (★) API 명세에 따름
            token
        })
    });
}

/**
 * [실제 API] 6. 로그인 상태 확인 (GET /api/auth/me)
 * (image_c15c3a.png 참조)
 */
export const checkAuthStatus = async () => {
    // (★) /check 대신 /api/auth/me 사용
    return apiFetch('/auth/me');
};


/**
 * [실제 API] 7. 로그아웃 (POST /api/auth/logout)
 * (image_c15c58.png 참조)
 */
export const logout = async () => { 
    try {
        const response = await apiFetch('/auth/logout', { 
            method: 'POST'
        });
        return response;
    } catch (error) {
        console.error("로그아웃 API 에러", error);
        throw error; 
    }
};
