// src/pages/Document/Document.js

import React from 'react';
import DocumentHeader from './DocumentHeader';
import DocumentSidebar from './DocumentSidebar';
import './Document.css'; 

function Document() {
    return (
        <div className="doc-page-layout"> {/* (고유한 이름) */}
            <DocumentHeader />
            <div className="doc-main-wrapper"> {/* (고유한 이름) */}
                <DocumentSidebar />
                <main className="doc-content-area"> {/* (고유한 이름) */}
                    <h2>문서 검사 페이지</h2>
                    <p>여기에 문서 업로드 및 검사 UI가 들어갑니다.</p>
                </main>
            </div>
        </div>
    );
}

export default Document;