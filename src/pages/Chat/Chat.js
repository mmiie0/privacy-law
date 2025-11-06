// src/pages/Chat/Chat.js

import React, { useState, useRef, useEffect } from 'react';
import * as chatApi from '../../api/chat';
import './Chat.css';

import { useAuth } from '../../context/AuthContext'; 
import ChatHeader from './ChatHeader';
import ChatSidebar from './ChatSidebar';
import sendIcon from '../../components/send-icon.png';
import botProfileIcon from '../../components/law-icon.png';

// --- 챗 컴포넌트 ---
function Chat() {

    const { user } = useAuth(); 

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isBotThinking, setIsBotThinking] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);

    const chatWindowRef = useRef(null);
    const textareaRef = useRef(null);

    // 컴포넌트 마운트 시, "실제" 대화 목록을 API로 불러옴
    useEffect(() => {
        const loadChatList = async () => {
            try {
                const list = await chatApi.getChatList();
                setChatList(list);
            } catch (error) {
                console.error("대화 목록 로딩 실패:", error);
            }
        };
        
        loadChatList();
    }, []); 

    // 자동 스크롤 effect
    useEffect(() => {
        if (chatWindowRef.current) {
            // (★) 스크롤 시 애니메이션을 더 부드럽게 유지하기 위해
            // 새로운 메시지가 추가될 때마다 스크롤을 부드럽게 내립니다.
            chatWindowRef.current.scrollTo({
                top: chatWindowRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // "불러오기" 함수 (API 호출)
    const handleSelectChat = async (clickedChatId) => {
        if (clickedChatId === selectedChatId) return;

        try {
            const loadedMessages = await chatApi.getChatMessages(clickedChatId);
            setMessages(loadedMessages.map(msg => ({
                ...msg,
                time: new Date(msg.time)
            })));
            setSelectedChatId(clickedChatId);
        } catch (error) {
            console.error("대화 내용 로딩 실패:", error);
            setMessages([
                { id: Date.now(), sender: 'bot', text: '대화 내용을 불러오는 데 실패했습니다.', time: new Date() }
            ]);
        }
    };

    // "새 채팅" 함수 (messages를 비우고 상태 리셋)
    const handleNewChat = () => {
        setSelectedChatId(null);
        setMessages([]);
        setInputMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    // "채팅 삭제" 함수 (API 호출)
    const handleDeleteChat = async (chatId) => {
        console.log("삭제할 채팅 ID:", chatId);
        
        try {
            if (window.confirm("이 대화를 삭제하시겠습니까?")) {
                await chatApi.deleteChat(chatId);
                setChatList(prevList => prevList.filter(chat => chat.id !== chatId));

                if (selectedChatId === chatId) {
                    handleNewChat();
                }
            }
        } catch (error) {
            console.error("삭제 요청 실패:", error);
            alert("대화 삭제에 실패했습니다.");
        }
    };

    // "전송 시 저장" 함수 (API 호출)
    const sendMessage = async () => {
        const messageText = inputMessage.trim();
        if (messageText === '' || isBotThinking) return;

        setIsBotThinking(true);
        
        // (★) 1. 사용자 채팅 먼저 UI에 추가 (await 전에)
        const userMessage = { 
            id: Date.now(), 
            sender: 'user', 
            text: messageText, 
            time: new Date() 
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            let botResponseText = "";
            let currentChatId = selectedChatId; 

            if (currentChatId === null) {
                const response = await chatApi.createNewChat(messageText);
                botResponseText = response.answer;
                
                const newChatId = response.newChatId;
                currentChatId = newChatId; 
                setSelectedChatId(newChatId);
                setChatList(prev => [...prev, { id: newChatId, title: response.newTitle }]);
                
            } else {
                const response = await chatApi.sendMessageToChat(currentChatId, messageText);
                botResponseText = response.answer;
            }

            // (★) 2. 봇 응답 메시지 생성 후 추가
            const botMessage = { 
                id: Date.now() + 1,
                sender: 'bot', 
                text: botResponseText, 
                time: new Date() 
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("API 호출 오류:", error);
            const errorMessage = { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: '죄송합니다. 응답 중 오류가 발생했습니다.', 
                time: new Date() 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsBotThinking(false);
        }
    };

    const submitMessage = () => {
        sendMessage();
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };
    const handleFormSubmit = (e) => { e.preventDefault(); submitMessage(); };
    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(); } };
    const handleTextAreaInput = (e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; };

    const isNewChat = selectedChatId === null && messages.length === 0;

    // --- 렌더링 ---
    return (
        <div className="chat-page-layout">
            <ChatHeader />

            <div className="chat-main-wrapper">
                
                <ChatSidebar 
                    chatList={chatList} 
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatId}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                />

                <main className="chat-content-area">
                    <div className="chat-content-container">

                        <div className="chat-window" ref={chatWindowRef}>
                            
                            {isNewChat ? (
                                <div className="chat-welcome-container">
                                    <h2>안녕하세요. {user ? (user.name || user.email) : '사용자'}님</h2>
                                    <p>무엇을 도와드릴까요? 지금 바로 법률 상담을 시작하세요!</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map(msg => (
                                        // (★) message-row에 애니메이션 클래스 추가
                                        <div 
                                            key={msg.id} 
                                            className={`message-row ${msg.sender}-message-row message-animated`}
                                        >
                                            {msg.sender === 'bot' && (
                                                <img src={botProfileIcon} alt="Bot Profile" className="bot-profile-icon" />
                                            )}
                                            <div className="message-bubble-container">
                                                <p className={`message-bubble ${msg.sender}-bubble`}>{msg.text}</p>
                                                <span className="message-time">
                                                    {new Date(msg.time).toLocaleTimeString('ko-KR', {
                                                        hour: 'numeric', 
                                                        minute: '2-digit', 
                                                        hour12: true
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {isBotThinking && (
                                        <div className="message-row bot-message-row">
                                            <img src={botProfileIcon} alt="Bot Profile" className="bot-profile-icon" />
                                            <p className="message-bubble bot-bubble">생각중...</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <form onSubmit={handleFormSubmit} className="chat-input-container">
                            <textarea
                                ref={textareaRef}
                                placeholder="무엇이든 물어보세요"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onInput={handleTextAreaInput}
                                disabled={isBotThinking}
                                rows="1"
                            />
                            <button type="submit" disabled={isBotThinking}>
                                <img src={sendIcon} alt="전송" className="send-icon-img" />
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Chat;