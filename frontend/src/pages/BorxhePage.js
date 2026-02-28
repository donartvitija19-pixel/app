import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getBorxhColor = (tipi) => {
  switch(tipi) {
    case 'CashPlus': return '#ec4899';
    case 'RBKO': return '#f59e0b';
    default: return '#71717a';
  }
};

export const BorxhePage = () => {
  const { getAuthHeader } = useAuth();
  const [borxhe, setBorxhe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBorxh, setEditingBorxh] = useState(null);
  const [formData, setFormData] = useState({
    emri: '',
    shuma_totale: '',
    data_kestit: '',
    tipi: 'Tjera'
  });

  useEffect(() => {
    fetchBorxhe();
  }, []);

  const fetchBorxhe = async () => {
    try {
      const response = await axios.get(`${API}/borxhe`, {
        headers: getAuthHeader()
      });
      setBorxhe(response.data);
    } catch (error) {
      console.error('Failed to fetch borxhe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBorxh) {
        await axios.put(`${API}/borxhe/${editingBorxh.id}`, formData, {
          headers: getAuthHeader()
        });
        toast.success('Borxhi u përditësua me sukses');
      } else {
        await axios.post(`${API}/borxhe`, formData, {
          headers: getAuthHeader()
        });
        toast.success('Borxhi u shtua me sukses');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchBorxhe();
    } catch (error) {
      toast.error('Gabim në ruajtjen e borxhit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt që doni të fshini këtë borxh?')) {
      try {
        await axios.delete(`${API}/borxhe/${id}`, {
          headers: getAuthHeader()
        });
        toast.success('Borxhi u fshi me sukses');
        fetchBorxhe();
      } catch (error) {
        toast.error('Gabim në fshirjen e borxhit');
      }
    }
  };

  const handleEdit = (borxh) => {
    setEditingBorxh(borxh);
    setFormData({
      emri: borxh.emri,
      shuma_totale: borxh.shuma_totale,
      data_kestit: borxh.data_kestit,
      tipi: borxh.tipi
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      emri: '',
      shuma_totale: '',
      data_kestit: '',
      tipi: 'Tjera'
    });
    setEditingBorxh(null);
  };

  if (loading) return <div className="text-white">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="borxhe-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Borxhe</h1>
          <p className="text-zinc-400">Menaxhimi i obligimeve financiare</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="add-borxh-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto Borxh
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>{editingBorxh ? 'Përditëso Borxhin' : 'Shto Borxh të Ri'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Emri</Label>
                <Input
                  value={formData.emri}
                  onChange={(e) => setFormData({...formData, emri: e.target.value})}
                  required
                  data-testid="borxh-emri-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Shuma Totale (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shuma_totale}
                  onChange={(e) => setFormData({...formData, shuma_totale: e.target.value})}
                  required
                  data-testid="borxh-shuma-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Data e Këstit</Label>
                <Input
                  type="date"
                  value={formData.data_kestit}
                  onChange={(e) => setFormData({...formData, data_kestit: e.target.value})}
                  required
                  data-testid="borxh-data-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipi</Label>
                <Select value={formData.tipi} onValueChange={(value) => setFormData({...formData, tipi: value})}>
                  <SelectTrigger data-testid="borxh-tipi-select" className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="CashPlus">CashPlus</SelectItem>
                    <SelectItem value="RBKO">RBKO</SelectItem>
                    <SelectItem value="Tjera">Tjera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" data-testid="borxh-submit-button" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                {editingBorxh ? 'Përditëso' : 'Shto'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {borxhe.map((borxh) => {
          const color = getBorxhColor(borxh.tipi);
          const progress = (borxh.shuma_paguar / borxh.shuma_totale) * 100;
          
          return (
            <div key={borxh.id} className="glass rounded-xl p-6 space-y-4" data-testid={`borxh-card-${borxh.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold inline-block mb-2" style={{ background: `${color}20`, color }}>
                    {borxh.tipi}
                  </div>
                  <h3 className="text-xl font-bold">{borxh.emri}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(borxh)} data-testid={`edit-borxh-${borxh.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Pencil size={16} className="text-zinc-400" />
                  </button>
                  <button onClick={() => handleDelete(borxh.id)} data-testid={`delete-borxh-${borxh.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Shuma Totale</span>
                  <span className="number-display font-semibold">{borxh.shuma_totale.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Shuma Paguar</span>
                  <span className="number-display font-semibold text-[#10b981]">{borxh.shuma_paguar.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Shuma Mbetur</span>
                  <span className="number-display font-semibold text-[#f43f5e]">{borxh.shuma_mbetur.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Data e Këstit</span>
                  <span className="font-medium">{borxh.data_kestit}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%`, background: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {borxhe.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-zinc-400">Nuk ka borxhe të regjistruara</p>
        </div>
      )}
    </div>
  );
};
