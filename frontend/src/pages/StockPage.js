import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const StockPage = () => {
  const { user, getAuthHeader } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [formData, setFormData] = useState({
    emri_produktit: '',
    sku: '',
    sasia: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${API}/stock`, { headers: getAuthHeader() });
      setStock(response.data);
    } catch (error) {
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStock) {
        await axios.put(`${API}/stock/${editingStock.id}`, formData, { headers: getAuthHeader() });
        toast.success('Produkti u përditësua');
      } else {
        await axios.post(`${API}/stock`, formData, { headers: getAuthHeader() });
        toast.success('Produkti u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchStock();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim në ruajtje');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      try {
        await axios.delete(`${API}/stock/${id}`, { headers: getAuthHeader() });
        toast.success('Produkti u fshi');
        fetchStock();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingStock(item);
    setFormData({
      emri_produktit: item.emri_produktit,
      sku: item.sku,
      sasia: item.sasia
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ emri_produktit: '', sku: '', sasia: '' });
    setEditingStock(null);
  };

  const getStockColor = (sasia) => {
    if (sasia === 0) return '#f43f5e';
    if (sasia < 10) return '#f59e0b';
    return '#10b981';
  };

  if (loading) return <div className="text-white">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="stock-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Stock / Inventari</h1>
          <p className="text-zinc-400">Menaxhimi i produkteve në magazinë</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="add-stock-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
                <Plus size={20} />
                Shto Produkt
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>{editingStock ? 'Përditëso Produktin' : 'Shto Produkt të Ri'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Emri i Produktit</Label>
                  <Input
                    value={formData.emri_produktit}
                    onChange={(e) => setFormData({...formData, emri_produktit: e.target.value})}
                    required
                    data-testid="stock-emri-input"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU (Unique)</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    required
                    disabled={!!editingStock}
                    data-testid="stock-sku-input"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sasia</Label>
                  <Input
                    type="number"
                    value={formData.sasia}
                    onChange={(e) => setFormData({...formData, sasia: e.target.value})}
                    required
                    data-testid="stock-sasia-input"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button type="submit" data-testid="stock-submit-button" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                  {editingStock ? 'Përditëso' : 'Shto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-zinc-300">Produkti</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-300">SKU</th>
                <th className="text-right p-4 text-sm font-semibold text-zinc-300">Sasia</th>
                {isAdmin && <th className="text-center p-4 text-sm font-semibold text-zinc-300">Veprime</th>}
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => {
                const color = getStockColor(item.sasia);
                return (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
                          <Package size={20} style={{ color }} />
                        </div>
                        <span className="text-white font-medium">{item.emri_produktit}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono text-sm">{item.sku}</td>
                    <td className="p-4 text-right">
                      <span className="px-3 py-1 rounded-full text-sm font-bold number-display" style={{ background: `${color}20`, color }}>
                        {item.sasia}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(item)} data-testid={`edit-stock-${item.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Pencil size={16} className="text-zinc-400" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} data-testid={`delete-stock-${item.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {stock.length === 0 && (
          <div className="p-12 text-center text-zinc-400">
            Nuk ka produkte në stock
          </div>
        )}
      </div>
    </div>
  );
};