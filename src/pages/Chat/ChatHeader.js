// src/pages/Chat/ChatHeader.js

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { useNavigate } from 'react-router-dom'; // (★) 제거: navigate는 Context에서 처리
import './Chat.css'; 

import bellIcon from '../../components/bell-icon.png';
// import profileIcon from '../../components/profile-icon.png';

function ChatHeader() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const navigate = useNavigate(); // (★) 제거

    // 기존의 로그아웃 로직 (window.confirm 포함)
    const handleLogout = async () => {
        // (★) 확인창을 띄우고, '취소'를 누르면 함수 종료
        if (!window.confirm("정말 로그아웃 하시겠습니까?")) {
            return;
        }

        try {
            // Context의 logout 함수는 이미 API 호출과 navigate를 포함하고 있습니다.
            await logout(); 
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };
    
    // 아코디언 메뉴 열기/닫기 토글 함수
    const handleMenuToggle = (e) => {
        e.stopPropagation(); 
        setIsMenuOpen(prev => !prev);
    };

    // 메뉴 항목 클릭 핸들러 (경로 이동 없이 기능만 구현)
    const handleMenuItemClick = (e, type) => {
        e.stopPropagation(); 
        console.log(`${type} 메뉴 클릭됨`);
        setIsMenuOpen(false); 
    };

    return (
        <header className="main-header">
            <div className="header-left">
                <div 
                    className={`app-logo-container ${isMenuOpen ? 'open' : ''}`}
                    onClick={handleMenuToggle}
                >
                    <span className="app-logo">PrivacyLaw AI</span>
                    <span className={`accordion-arrow ${isMenuOpen ? 'up' : 'down'}`}>▼</span>
                    
                    <div className="module-dropdown">
                        <button 
                            className="module-item active"
                            onClick={(e) => handleMenuItemClick(e, '챗봇')}
                        >
                            💬 챗봇 (현재)
                        </button>
                        <div className="module-separator"></div> 
                        <button 
                            className="module-item"
                            onClick={(e) => handleMenuItemClick(e, '문서 검사')}
                        >
                            📄 문서 검사
                        </button>
                    </div>
                </div>
            </div>
            <div className="header-right">
                {user && (
                    <>
                        {/* (★) user.name 표시 */}
                        <span style={{ fontSize: '14px', color: '#333', marginRight: '10px' }}>
                            {user.name}님
                        </span>
                        
                        <button className="icon-button notification-button">
                            <img src={bellIcon} alt="알림" className="header-icon" />
                            <span className="badge">2</span>
                        </button>
                        
                        <button onClick={handleLogout} className="logout-button">
                            로그아웃
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

export default ChatHeader;