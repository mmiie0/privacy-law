// src/pages/Document/DocumentSidebar.js

import React from 'react';
import './Document.css'; // (Document.css를 바라봄)

function DocumentSidebar() {
    // 임시 검사 내역 데이터
    const recentScans = [
        { id: 1, title: '프로젝트 A 계약서.pdf' },
        { id: 2, title: '프로젝트 B 이용약관.docx' },
    ];

    return (
        <aside className="doc-sidebar"> {/* (클래스 이름 변경) */}
            <div className="doc-sidebar-header">
                <h3>최근 검사 내역</h3>
            </div>
            <ul className="doc-list"> {/* (클래스 이름 변경) */}
                {recentScans.map(scan => (
                    <li key={scan.id} className="doc-list-item">
                        <button className="doc-list-button">
                            {scan.title}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default DocumentSidebar;