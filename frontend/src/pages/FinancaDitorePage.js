import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const FinancaDitorePage = () => {
  const { getAuthHeader } = useAuth();
  const [financa, setFinanca] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFinanca, setEditingFinanca] = useState(null);
  const [filterData, setFilterData] = useState('');
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    cash: '',
    banka: '',
    fb_ads: '',
    porosi_krijuar: '',
    porosi_ne_depo: '',
    porosi_ne_dergim: '',
    porosi_dorezuar: '',
    porosi_ne_pritje: '',
    shenime: ''
  });

  useEffect(() => {
    fetchData();
  }, [filterData]);

  const fetchData = async () => {
    try {
      const params = filterData ? { data_filter: filterData } : {};
      const [financaRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/financa-ditore`, { headers: getAuthHeader(), params }),
        axios.get(`${API}/financa-ditore/analytics`, { headers: getAuthHeader() })
      ]);
      setFinanca(financaRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFinanca) {
        await axios.put(`${API}/financa-ditore/${editingFinanca.id}`, formData, { headers: getAuthHeader() });
        toast.success('Financa u përditësua');
      } else {
        await axios.post(`${API}/financa-ditore`, formData, { headers: getAuthHeader() });
        toast.success('Financa u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Gabim në ruajtje');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      try {
        await axios.delete(`${API}/financa-ditore/${id}`, { headers: getAuthHeader() });
        toast.success('Financa u fshi');
        fetchData();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingFinanca(item);
    setFormData({
      data: item.data,
      cash: item.cash,
      banka: item.banka,
      fb_ads: item.fb_ads,
      porosi_krijuar: item.porosi_krijuar,
      porosi_ne_depo: item.porosi_ne_depo,
      porosi_ne_dergim: item.porosi_ne_dergim,
      porosi_dorezuar: item.porosi_dorezuar,
      porosi_ne_pritje: item.porosi_ne_pritje,
      shenime: item.shenime || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      cash: '',
      banka: '',
      fb_ads: '',
      porosi_krijuar: '',
      porosi_ne_depo: '',
      porosi_ne_dergim: '',
      porosi_dorezuar: '',
      porosi_ne_pritje: '',
      shenime: ''
    });
    setEditingFinanca(null);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="financa-ditore-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Financa Ditore</h1>
          <p className="text-gray-600">Tracking ditor i të ardhurave dhe porosive</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-financa-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto Financa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFinanca ? 'Përditëso Financën' : 'Shto Financa të Re'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>Cash (€)</Label>
                  <Input type="number" step="0.01" value={formData.cash} onChange={(e) => setFormData({...formData, cash: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>Bankë (€)</Label>
                  <Input type="number" step="0.01" value={formData.banka} onChange={(e) => setFormData({...formData, banka: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>FB Ads (€)</Label>
                  <Input type="number" step="0.01" value={formData.fb_ads} onChange={(e) => setFormData({...formData, fb_ads: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>Porosinë Krijuar (€)</Label>
                  <Input type="number" step="0.01" value={formData.porosi_krijuar} onChange={(e) => setFormData({...formData, porosi_krijuar: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>Porosi Në Depo (€)</Label>
                  <Input type="number" step="0.01" value={formData.porosi_ne_depo} onChange={(e) => setFormData({...formData, porosi_ne_depo: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>Porosi Në Dërgim (€)</Label>
                  <Input type="number" step="0.01" value={formData.porosi_ne_dergim} onChange={(e) => setFormData({...formData, porosi_ne_dergim: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label>Porosi Dorëzuar (€)</Label>
                  <Input type="number" step="0.01" value={formData.porosi_dorezuar} onChange={(e) => setFormData({...formData, porosi_dorezuar: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Porosi Në Pritje (€)</Label>
                  <Input type="number" step="0.01" value={formData.porosi_ne_pritje} onChange={(e) => setFormData({...formData, porosi_ne_pritje: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Shënime</Label>
                <Textarea value={formData.shenime} onChange={(e) => setFormData({...formData, shenime: e.target.value})} className="bg-gray-50 border-gray-300 text-gray-900" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                {editingFinanca ? 'Përditëso' : 'Shto'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Total Cash</p>
            <p className="text-xl font-bold number-display text-[#6366f1]">{analytics.total_cash.toFixed(2)}€</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Total Bankë</p>
            <p className="text-xl font-bold number-display text-[#6366f1]">{analytics.total_banka.toFixed(2)}€</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Total FB Ads</p>
            <p className="text-xl font-bold number-display text-[#6366f1]">{analytics.total_fb_ads.toFixed(2)}€</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Gjendja Aktuale</p>
            <p className="text-xl font-bold number-display text-[#10b981]">{analytics.gjendja_latest.toFixed(2)}€</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Diferenca Ditore</p>
            <div className="flex items-center gap-2">
              {analytics.diferenca_dite >= 0 ? <TrendingUp size={16} className="text-[#10b981]" /> : <TrendingDown size={16} className="text-[#f43f5e]" />}
              <p className={`text-xl font-bold number-display ${analytics.diferenca_dite >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                {analytics.diferenca_dite.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-4">
        <Label className="text-sm text-gray-600 mb-2 block">Filtro sipas periudhës (YYYY-MM)</Label>
        <Input type="month" value={filterData} onChange={(e) => setFilterData(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 max-w-xs" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">Data</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Cash</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Bankë</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">FB Ads</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Gjendja</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">+/-</th>
                <th className="text-center p-3 text-xs font-semibold text-gray-700">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {financa.map((item, idx) => {
                const diferenca = idx < financa.length - 1 ? item.gjendja_fund_dite - financa[idx + 1].gjendja_fund_dite : 0;
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-900 font-medium">{item.data}</td>
                    <td className="p-3 text-right number-display text-gray-700">{parseFloat(item.cash).toFixed(2)}€</td>
                    <td className="p-3 text-right number-display text-gray-700">{parseFloat(item.banka).toFixed(2)}€</td>
                    <td className="p-3 text-right number-display text-gray-700">{parseFloat(item.fb_ads).toFixed(2)}€</td>
                    <td className="p-3 text-right number-display font-bold text-[#6366f1]">{parseFloat(item.gjendja_fund_dite).toFixed(2)}€</td>
                    <td className="p-3 text-right">
                      <span className={`number-display font-semibold ${diferenca >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {diferenca >= 0 ? '+' : ''}{diferenca.toFixed(2)}€
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleEdit(item)} data-testid={`edit-financa-${item.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil size={14} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} data-testid={`delete-financa-${item.id}`} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {financa.length === 0 && (
          <div className="p-12 text-center text-gray-600">Nuk ka të dhëna</div>
        )}
      </div>
    </div>
  );
};
