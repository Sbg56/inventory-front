import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Main } from './pages/MainPage';
import { Inbox } from './pages/Inbox';
import { Starred } from './pages/Starred';

export function Router() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/starred" element={<Starred />} />
                <Route path="/sent" element={<div>Отправленные</div>} />
            </Routes>
        </Layout>
    );
}