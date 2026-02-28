import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BorxhePage } from './pages/BorxhePage';
import { ShpenzimePage } from './pages/ShpenzimePage';
import { FinancaDitorePage } from './pages/FinancaDitorePage';
import { StockPage } from './pages/StockPage';
import { BankaAccountsPage } from './pages/BankaAccountsPage';
import { KursimePage } from './pages/KursimePage';
import { KontabilistetPage } from './pages/KontabilistetPage';

// Placeholder components for remaining pages
const FaturaPage = () => <div className="text-white text-2xl p-8">Fatura Page - Coming Soon</div>;
const DeklarimetPage = () => <div className="text-white text-2xl p-8">Deklarimet & Pagat Page - Coming Soon</div>;
const CRMPage = () => <div className="text-white text-2xl p-8">CRM Page - Coming Soon</div>;
const CRMCPPPage = () => <div className="text-white text-2xl p-8">CRM-CPP Page - Coming Soon</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="borxhe" element={<BorxhePage />} />
            <Route path="shpenzime" element={<ShpenzimePage />} />
            <Route path="financa-ditore" element={<FinancaDitorePage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="fatura" element={<FaturaPage />} />
            <Route path="deklarimet" element={<DeklarimetPage />} />
            <Route path="crm" element={<CRMPage />} />
            <Route path="crm-cpp" element={<CRMCPPPage />} />
            <Route path="kursime" element={<KursimePage />} />
            <Route path="kontabilistet" element={<KontabilistetPage />} />
            <Route path="banka-accounts" element={<BankaAccountsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
