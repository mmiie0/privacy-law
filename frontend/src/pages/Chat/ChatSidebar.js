// src/pages/Chat/ChatSidebar.js

import React from 'react';
import './Chat.css';
import deleteIcon from '../../components/delete-icon.png';

function ChatSidebar({ chatList, onSelectChat, selectedChatId, onNewChat, onDeleteChat }) {

    // (★) 삭제 확인창 로직으로 수정
    const handleDeleteClick = (e, chatId) => {
        e.stopPropagation(); // 부모 클릭 이벤트(채팅 선택) 방지
        
        // (★) window.confirm이 true(확인)일 때만 onDeleteChat 실행
        if (window.confirm("이 대화를 삭제하시겠습니까?")) {
            onDeleteChat(chatId);
        }
    };

    return (
        <aside className="main-sidebar">
            <div className="sidebar-header">
                <h3>대화 목록</h3>
            </div>

            <button className="new-chat-button" onClick={onNewChat}>
                + 새 채팅 시작하기
            </button>

            <ul className="chat-list">
                
                {chatList.map(chat => (
                    <li 
                        key={chat.id} 
                        className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
                    >
                        <button
                            onClick={() => onSelectChat(chat.id)}
                            className="chat-item-title-button"
                        >
                            {chat.title}
                        </button>
                        
                        <button
                            onClick={(e) => handleDeleteClick(e, chat.id)}
                            className="chat-item-delete-button"
                        >
                            <img src={deleteIcon} alt="삭제" className="delete-icon-img" />
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default ChatSidebar;