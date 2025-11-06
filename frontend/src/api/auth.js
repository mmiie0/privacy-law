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
// (2) 실제 API 연동 함수 (백엔드와 통신)
// ----------------------------------------------------------------

/**
 * [실제 API] 1. 로그인 (POST /api/auth/login)
 */
export const postLogin = async (email, password) => {
    // API 호출
    const response = await apiFetch('/auth/login', { 
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // 백엔드가 이름 필드를 주지 않을 경우 대비 (AuthContext에서 사용됨)
    if (!response.name) {
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
    
    // 백엔드가 이름 필드를 주지 않을 경우 대비
    if (!response.name) {
        response.name = extractNameFromEmail(response.email);
    }
    return response;
};

/**
 * [실제 API] 3. 인증번호 전송 (POST /api/auth/verification-code/send)
 * (회원가입, 비밀번호 재설정 공용)
 */
export const sendVerificationCode = async (email) => {
    // API 호출 (엔드포인트는 image_c15ba3.png와 image_c15c58.png의 경로를 조합하여 추론)
    return apiFetch('/auth/verification-code/send', { 
        method: 'POST',
        body: JSON.stringify({ email })
    });
};

/**
 * [실제 API] 4. 인증번호 검증 (POST /api/auth/verification-code/verify)
 * (image_c15ba3.png 참조)
 * (성공 시, 3단계에 사용할 'token'을 응답으로 받을 것으로 가정)
 */
export async function verifyCode(email, code) { 
    // input_number는 백엔드 요청 바디 키를 따라 추정
    const response = await apiFetch('/auth/verification-code/verify', {
        method: 'POST',
        body: JSON.stringify({ 
            email, 
            input_number: code // image_c15ba3.png에서 input_number 사용
        })
    });
    
    // response가 토큰을 포함하고 있다고 가정
    if (!response.token) {
        // 토큰이 없으면 후속 재설정/회원가입 단계가 불가능하므로 오류 처리
        throw new Error("인증은 성공했으나, 후속 처리를 위한 토큰을 받지 못했습니다.");
    }
    return response; 
}

/**
 * [실제 API] 5. 비밀번호 재설정 (POST /api/auth/password/reset)
 * (image_c15bfc.png 참조)
 */
export async function postNewPassword(email, password, passwordConfirm, token) {
    // API 호출
    const response = await apiFetch('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ 
            email, 
            password, 
            password_confirm: passwordConfirm, // image_c15bfc.png 참조
            token // image_c15bfc.png 참조
        })
    });
    return response;
}

/**
 * [실제 API] 6. 로그인 상태 확인 (GET /api/auth/me)
 * (image_c15c3a.png 참조 - /check 대신 /auth/me 사용)
 */
export const checkAuthStatus = async () => {
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
