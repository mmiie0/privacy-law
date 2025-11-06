// src/api/url.js

export const BASE_URL = 'http://localhost:8080/api'; 

/**
 * @param {string} endpoint - API 엔드포인트 (예: '/login')
 * @param {object} options - fetch 옵션 (method, headers, body 등)
 */
export async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // (★) httpOnly 쿠키 전송 핵심
        ...options,
    });

    // 1. HTTP 상태 코드가 200 (OK)이 아닌 경우
    if (!response.ok) {
        let errorData = { message: '서버에서 오류가 발생했습니다.' };
        try {
            errorData = await response.json();
        } catch {}
        
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    // 2. 성공 시 JSON 응답 반환 (body가 비어있을 수 있으므로 text()로 먼저 받기)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}