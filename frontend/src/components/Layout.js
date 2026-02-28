import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  Calendar, 
  Package, 
  FileText, 
  Users, 
  PiggyBank,
  UserCog,
  Landmark,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Settings
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, path, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={onClick}
      data-testid={`nav-${path.replace('/', '')}`}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-[#6366f1] text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <div className="text-gray-900 text-lg">Duke ngarkuar...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isAdmin = user.role === 'admin';

  const adminRoutes = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Borxhe', path: '/borxhe' },
    { icon: Receipt, label: 'Shpenzime', path: '/shpenzime' },
    { icon: Calendar, label: 'Financa Ditore', path: '/financa-ditore' },
    { icon: Landmark, label: 'Llogaritë Bankare', path: '/banka-accounts' },
  ];

  const sharedRoutes = [
    { icon: Package, label: 'Stock', path: '/stock' },
    { icon: FileText, label: 'Fatura', path: '/fatura' },
    { icon: FileText, label: 'Deklarime & Paga', path: '/deklarimet' },
  ];

  const adminOnlyRoutes = [
    { icon: Users, label: 'CRM', path: '/crm' },
    { icon: TrendingUp, label: 'CRM - CPP', path: '/crm-cpp' },
    { icon: PiggyBank, label: 'Kursime', path: '/kursime' },
    { icon: UserCog, label: 'Kontabilistët', path: '/kontabilistet' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-button"
          className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-900"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40 transition-transform duration-300 lg:translate-x-0 shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#6366f1' }}>
              AVALANT
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manager</p>
            <div className="mt-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500">Përdorues</p>
              <p className="text-sm font-medium text-gray-900">{user.emri} {user.mbiemri}</p>
              <p className="text-xs text-[#6366f1] capitalize">{user.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {isAdmin && adminRoutes.map((route) => (
              <NavItem
                key={route.path}
                {...route}
                onClick={() => {
                  navigate(route.path);
                  setSidebarOpen(false);
                }}
              />
            ))}

            {sharedRoutes.map((route) => (
              <NavItem
                key={route.path}
                {...route}
                onClick={() => {
                  navigate(route.path);
                  setSidebarOpen(false);
                }}
              />
            ))}

            {isAdmin && adminOnlyRoutes.map((route) => (
              <NavItem
                key={route.path}
                {...route}
                onClick={() => {
                  navigate(route.path);
                  setSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              data-testid="logout-button"
              className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
            >
              <LogOut size={20} />
              <span>Dil</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};