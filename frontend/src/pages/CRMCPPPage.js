import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CRMCPPPage = () => {
  const { getAuthHeader } = useAuth();
  const [crmCpp, setCrmCpp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCpp, setEditingCpp] = useState(null);
  const [dataFilter, setDataFilter] = useState('');
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    sponzor: '',
    porosi: '',
    mesazhe: '',
    kosto_blerese: '',
    vlera_shitese: '',
    produkti: '',
    platforma: ''
  });

  useEffect(() => {
    fetchData();
  }, [dataFilter]);

  const fetchData = async () => {
    try {
      const params = dataFilter ? { data_filter: dataFilter } : {};
      const response = await axios.get(`${API}/crm-cpp`, { headers: getAuthHeader(), params });
      setCrmCpp(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCpp) {
        await axios.put(`${API}/crm-cpp/${editingCpp.id}`, formData, { headers: getAuthHeader() });
        toast.success('Entry u përditësua');
      } else {
        await axios.post(`${API}/crm-cpp`, formData, { headers: getAuthHeader() });
        toast.success('Entry u shtua');
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
        await axios.delete(`${API}/crm-cpp/${id}`, { headers: getAuthHeader() });
        toast.success('Entry u fshi');
        fetchData();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingCpp(item);
    setFormData({
      data: item.data,
      sponzor: item.sponzor,
      porosi: item.porosi,
      mesazhe: item.mesazhe,
      kosto_blerese: item.kosto_blerese,
      vlera_shitese: item.vlera_shitese,
      produkti: item.produkti,
      platforma: item.platforma
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      sponzor: '',
      porosi: '',
      mesazhe: '',
      kosto_blerese: '',
      vlera_shitese: '',
      produkti: '',
      platforma: ''
    });
    setEditingCpp(null);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="crm-cpp-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>CRM - CPP</h1>
          <p className="text-gray-600">Cost Per Performance tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-cpp-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCpp ? 'Përditëso Entry' : 'Shto Entry të Ri'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Sponzor (€)</Label>
                  <Input type="number" step="0.01" value={formData.sponzor} onChange={(e) => setFormData({...formData, sponzor: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Porosi (Nr)</Label>
                  <Input type="number" value={formData.porosi} onChange={(e) => setFormData({...formData, porosi: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Mesazhe (Nr)</Label>
                  <Input type="number" value={formData.mesazhe} onChange={(e) => setFormData({...formData, mesazhe: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Kosto Blerse (€)</Label>
                  <Input type="number" step="0.01" value={formData.kosto_blerese} onChange={(e) => setFormData({...formData, kosto_blerese: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Vlera Shitese (€)</Label>
                  <Input type="number" step="0.01" value={formData.vlera_shitese} onChange={(e) => setFormData({...formData, vlera_shitese: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Produkti</Label>
                  <Input value={formData.produkti} onChange={(e) => setFormData({...formData, produkti: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Platforma</Label>
                  <Input value={formData.platforma} onChange={(e) => setFormData({...formData, platforma: e.target.value})} required className="bg-gray-50 border-gray-300" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">{editingCpp ? 'Përditëso' : 'Shto'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-xl p-4">
        <Label className="text-sm text-gray-600 mb-2 block">Filtro sipas periudhës (YYYY-MM)</Label>
        <Input type="month" value={dataFilter} onChange={(e) => setDataFilter(e.target.value)} className="bg-gray-50 border-gray-300 max-w-xs" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">Data</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Sponzor</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Porosi</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">CPO</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Vlera</th>
                <th className="text-right p-3 text-xs font-semibold text-gray-700">Profit</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">Platforma</th>
                <th className="text-center p-3 text-xs font-semibold text-gray-700">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {crmCpp.map((item) => {
                const profit = item.vlera_shitese - item.kosto_blerese - item.sponzor;
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-900">{item.data}</td>
                    <td className="p-3 text-right number-display text-red-600">{parseFloat(item.sponzor).toFixed(2)}€</td>
                    <td className="p-3 text-right text-gray-900 font-medium">{item.porosi}</td>
                    <td className="p-3 text-right number-display text-blue-600">{item.cost_per_order.toFixed(2)}€</td>
                    <td className="p-3 text-right number-display text-green-600">{parseFloat(item.vlera_shitese).toFixed(2)}€</td>
                    <td className={`p-3 text-right number-display font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(2)}€
                    </td>
                    <td className="p-3 text-gray-700">{item.platforma}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Pencil size={14} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {crmCpp.length === 0 && (
          <div className="p-12 text-center text-gray-600">Nuk ka të dhëna</div>
        )}
      </div>
    </div>
  );
};
