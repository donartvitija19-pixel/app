import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, AlertTriangle, Wallet } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, color, suffix = '€' }) => (
  <div className="glass glass-hover rounded-xl p-6" data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-zinc-400 mb-2">{title}</p>
        <p className="text-3xl font-bold number-display" style={{ color }}>
          {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
        </p>
      </div>
      <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { getAuthHeader } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`, {
        headers: getAuthHeader()
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Duke ngarkuar...</div>;
  }

  if (!data) {
    return <div className="text-white">Nuk ka të dhëna</div>;
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Dashboard</h1>
        <p className="text-zinc-400">Përmbledhje e gjendjes financiare</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gjendja Totale"
          value={data.gjendja_totale}
          icon={Wallet}
          color="#6366f1"
        />
        <StatCard
          title="Bilanci Aktual"
          value={data.bilanci_aktual}
          icon={data.bilanci_aktual >= 0 ? TrendingUp : TrendingDown}
          color={data.bilanci_aktual >= 0 ? '#10b981' : '#f43f5e'}
        />
        <StatCard
          title="Total Borxhe"
          value={data.total_borxhe}
          icon={AlertTriangle}
          color="#f43f5e"
        />
        <StatCard
          title="Progress Kursime"
          value={data.kursime_progress}
          icon={TrendingUp}
          color="#10b981"
          suffix="%"
        />
      </div>

      {/* Monthly Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-zinc-400 mb-2">Shpenzime Nafte (Muaj)</p>
          <p className="text-2xl font-bold number-display text-yellow-400">
            {data.shpenzime_nafte_muaj.toLocaleString('en-US', { minimumFractionDigits: 2 })}€
          </p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-zinc-400 mb-2">Shpenzime Familjare (Muaj)</p>
          <p className="text-2xl font-bold number-display text-blue-400">
            {data.shpenzime_familjare_muaj.toLocaleString('en-US', { minimumFractionDigits: 2 })}€
          </p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-zinc-400 mb-2">Shpenzime të Papritura</p>
          <p className="text-2xl font-bold number-display text-red-400">
            {data.shpenzime_papritur_count}
          </p>
        </div>
      </div>

      {/* Bank Accounts */}
      {data.banka_accounts && data.banka_accounts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Llogaritë Bankare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.banka_accounts.map((account) => (
              <div key={account.id} className="glass rounded-xl p-6">
                <p className="text-sm text-zinc-400 mb-2">{account.emri_bankes}</p>
                <p className="text-2xl font-bold number-display text-[#6366f1]">
                  {account.bilanci.toLocaleString('en-US', { minimumFractionDigits: 2 })}€
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {data.recent_transactions && data.recent_transactions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Transaksionet e Fundit</h2>
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-zinc-300">Data</th>
                    <th className="text-right p-4 text-sm font-semibold text-zinc-300">Cash</th>
                    <th className="text-right p-4 text-sm font-semibold text-zinc-300">Bankë</th>
                    <th className="text-right p-4 text-sm font-semibold text-zinc-300">FB Ads</th>
                    <th className="text-right p-4 text-sm font-semibold text-zinc-300">Gjendja</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_transactions.map((trans, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{trans.data}</td>
                      <td className="p-4 text-right number-display text-zinc-300">{trans.cash.toFixed(2)}€</td>
                      <td className="p-4 text-right number-display text-zinc-300">{trans.banka.toFixed(2)}€</td>
                      <td className="p-4 text-right number-display text-zinc-300">{trans.fb_ads.toFixed(2)}€</td>
                      <td className="p-4 text-right number-display font-bold text-[#6366f1]">{trans.gjendja_fund_dite.toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};