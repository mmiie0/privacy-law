// src/api/chat.js

import { apiFetch } from './url'; 

/**
 * (GET /chats)
 * 대화 목록 불러오기
 */
export const getChatList = async () => {
    return apiFetch('/chats');
};

/**
 * (GET /chats/{chatId})
 * 특정 대화 메시지 불러오기
 */
export const getChatMessages = async (chatId) => {
    return apiFetch(`/chats/${chatId}`);
};

/**
 * (POST /chats/new)
 * 새 대화 생성
 */
export const createNewChat = async (firstMessage) => {
    return apiFetch('/chats/new', { 
        method: 'POST',
        body: JSON.stringify({ message: firstMessage }) 
    });
};

/**
 * (POST /chats/{chatId}/message)
 * 기존 대화에 메시지 전송
 */
export const sendMessageToChat = async (chatId, message) => {
    return apiFetch(`/chats/${chatId}/message`, { 
        method: 'POST',
        body: JSON.stringify({ message: message }) 
    });
};

/**
 * (DELETE /chats/{chatId})
 * 대화 삭제
 */
export const deleteChat = async (chatId) => {
    return apiFetch(`/chats/${chatId}`, {
        method: 'DELETE'
    });
};