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
// (2) 실제 API 연동 함수 (로그인 상태 확인, 로그아웃)
// ----------------------------------------------------------------

/**
 * [실제 API] 로그인 상태 확인 (GET /check)
 */
export const checkAuthStatus = async () => {
    return apiFetch('/check');
};

/**
 * [실제 API] 로그아웃 (POST /logout)
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

// ----------------------------------------------------------------
// (3) 프론트엔드 테스트를 위한 임시 목업(Mock) 함수들
// ----------------------------------------------------------------

/**
 * [임시 목업] 로그인 API
 */
export async function postLogin(email, password) {
    console.log("[목업 API] 로그인 시도:", email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'jiman0919@gmail.com' && password === '1234') {
        const userName = extractNameFromEmail(email);
        console.log("[목업 API] 로그인 성공!");
        return { 
            id: 1, 
            email: email, 
            name: userName
        };
    } else {
        console.log("[목업 API] 로그인 실패: 아이디/비밀번호 틀림");
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다. (목업)");
    }
}

/**
 * [임시 목업] 최종 회원가입 API
 */
export async function postSignUp(email, password) {
    console.log(`[목업 API] 회원가입 시도: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userName = extractNameFromEmail(email);
    return { 
        id: 2, 
        email: email,
        name: userName
    };
}


// (★) 공용 함수: 인증번호 전송
/**
 * [임시 목업] 인증번호 전송 API (공용)
 */
export async function sendVerificationCode(email) { 
    console.log(`[목업 API] 인증번호 전송 시도: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!email.includes('@')) {
        throw new Error("올바른 이메일 형식이 아닙니다. (목업)");
    }
    console.log(`[목업 API] ${email}로 인증번호 '123456' 전송 (한 척)`);
    return { message: "Verification code sent." };
}

// (★) 공용 함수: 인증번호 검증
/**
 * [임시 목업] 인증번호 검증 API (공용)
 * (테스트용 정답: '123456')
 */
export async function verifyCode(email, code) { 
    console.log(`[목업 API] 인증번호 검증 시도: ${email}, ${code}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (code === '123456') {
        // (★) 비밀번호 재설정을 위해 토큰을 반환합니다.
        return { message: "Code verified.", token: "TEMP_RESET_TOKEN_123456" };
    } else {
        throw new Error("인증번호가 올바르지 않습니다. (목업)");
    }
}

/**
 * [임시 목업] 새 비밀번호 설정 API (토큰 인자 유지)
 */
export async function postNewPassword(email, password, token) {
    console.log(`[목업 API] 새 비밀번호 설정: ${email}, 토큰: ${token}`);
    if (token !== "TEMP_RESET_TOKEN_123456") {
        throw new Error("유효하지 않은 재설정 토큰입니다. (목업)");
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: "Password reset successful." };
}