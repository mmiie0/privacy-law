// src/pages/Document/DocumentHeader.js

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Document.css'; 

// (★수정) bellIcon만 import 합니다.
import bellIcon from '../../components/bell-icon.png';
// import userIcon from '../../components/user-icon.png'; (삭제)

function DocumentHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="doc-header"> 
            <div className="doc-header-left">
                <span className="doc-app-logo">PrivacyLaw AI</span>
            </div>
            <div className="doc-header-right">
                {user && (
                    <>
                        <button className="doc-icon-button">
                            <img src={bellIcon} alt="알림" className="header-icon" />
                            <span className="doc-badge">1</span>
                        </button>

                        {/* (★삭제) 프로필 아이콘 버튼 삭제 */}
                        
                        <button onClick={handleLogout} className="doc-logout-button">
                            로그아웃
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

export default DocumentHeader;