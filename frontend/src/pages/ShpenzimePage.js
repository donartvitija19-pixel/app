import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Download, Filter } from 'lucide-react';

import { API } from '../lib/api';

export const ShpenzimePage = () => {
  const { getAuthHeader } = useAuth();
  const [shpenzime, setShpenzime] = useState([]);
  const [borxhe, setBorxhe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShpenzim, setEditingShpenzim] = useState(null);
  const [filterKategoria, setFilterKategoria] = useState('');
  const [filterData, setFilterData] = useState('');
  const [formData, setFormData] = useState({
    kategoria: 'Familjare',
    pershkrimi: '',
    shuma: '',
    data: new Date().toISOString().split('T')[0],
    borxh_id: ''
  });

  useEffect(() => {
    fetchData();
  }, [filterKategoria, filterData]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filterKategoria) params.kategoria = filterKategoria;
      if (filterData) params.data_filter = filterData;
      
      const [shpenzimeRes, borxheRes] = await Promise.all([
        axios.get(`${API}/shpenzime`, { headers: getAuthHeader(), params }),
        axios.get(`${API}/borxhe`, { headers: getAuthHeader() })
      ]);
      
      setShpenzime(shpenzimeRes.data);
      setBorxhe(borxheRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (submitData.kategoria !== 'Borgje') {
        delete submitData.borxh_id;
      }
      
      if (editingShpenzim) {
        await axios.put(`${API}/shpenzime/${editingShpenzim.id}`, submitData, { headers: getAuthHeader() });
        toast.success('Shpenzimi u përditësua');
      } else {
        await axios.post(`${API}/shpenzime`, submitData, { headers: getAuthHeader() });
        toast.success('Shpenzimi u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Gabim në ruajtjen e shpenzimit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      try {
        await axios.delete(`${API}/shpenzime/${id}`, { headers: getAuthHeader() });
        toast.success('Shpenzimi u fshi');
        fetchData();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/shpenzime/export/csv`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shpenzime.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Eksporti u krye me sukses');
    } catch (error) {
      toast.error('Gabim në eksport');
    }
  };

  const handleEdit = (shpenzim) => {
    setEditingShpenzim(shpenzim);
    setFormData({
      kategoria: shpenzim.kategoria,
      pershkrimi: shpenzim.pershkrimi,
      shuma: shpenzim.shuma,
      data: shpenzim.data,
      borxh_id: shpenzim.borxh_id || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      kategoria: 'Familjare',
      pershkrimi: '',
      shuma: '',
      data: new Date().toISOString().split('T')[0],
      borxh_id: ''
    });
    setEditingShpenzim(null);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="shpenzime-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Shpenzime</h1>
          <p className="text-gray-600">Tracking i të gjitha daljeve financiare</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="border-gray-300" data-testid="export-shpenzime-button">
            <Download size={16} className="mr-2" />
            Eksporto CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="add-shpenzim-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
                <Plus size={20} />
                Shto Shpenzim
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
              <DialogHeader>
                <DialogTitle>{editingShpenzim ? 'Përditëso Shpenzimin' : 'Shto Shpenzim të Ri'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Select value={formData.kategoria} onValueChange={(value) => setFormData({...formData, kategoria: value})}>
                    <SelectTrigger data-testid="shpenzim-kategoria-select" className="bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-50 border-gray-300 text-gray-900">
                      <SelectItem value="Familjare">Familjare</SelectItem>
                      <SelectItem value="Derivate">Derivate</SelectItem>
                      <SelectItem value="Borgje">Borgje</SelectItem>
                      <SelectItem value="Tjera">Tjera</SelectItem>
                      <SelectItem value="Shpenzim i Papritur">Shpenzim i Papritur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.kategoria === 'Borgje' && (
                  <div className="space-y-2">
                    <Label>Borxhi</Label>
                    <Select value={formData.borxh_id} onValueChange={(value) => setFormData({...formData, borxh_id: value})}>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                        <SelectValue placeholder="Zgjidhni borxhin" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-50 border-gray-300 text-gray-900">
                        {borxhe.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.emri}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Përshkrimi</Label>
                  <Input
                    value={formData.pershkrimi}
                    onChange={(e) => setFormData({...formData, pershkrimi: e.target.value})}
                    required
                    data-testid="shpenzim-pershkrimi-input"
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shuma (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.shuma}
                    onChange={(e) => setFormData({...formData, shuma: e.target.value})}
                    required
                    data-testid="shpenzim-shuma-input"
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    required
                    data-testid="shpenzim-data-input"
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <Button type="submit" data-testid="shpenzim-submit-button" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                  {editingShpenzim ? 'Përditëso' : 'Shto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filtrat</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Kategoria</Label>
            <Select value={filterKategoria || "all"} onValueChange={(val) => setFilterKategoria(val === "all" ? "" : val)}>
              <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                <SelectValue placeholder="Të gjitha" />
              </SelectTrigger>
              <SelectContent className="bg-gray-50 border-gray-300 text-gray-900">
                <SelectItem value="all">Të gjitha</SelectItem>
                <SelectItem value="Familjare">Familjare</SelectItem>
                <SelectItem value="Derivate">Derivate</SelectItem>
                <SelectItem value="Borgje">Borgje</SelectItem>
                <SelectItem value="Tjera">Tjera</SelectItem>
                <SelectItem value="Shpenzim i Papritur">Shpenzim i Papritur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Periudha (YYYY-MM)</Label>
            <Input
              type="month"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="bg-gray-50 border-gray-300 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Data</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Kategoria</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Përshkrimi</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">Shuma</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {shpenzime.map((shpenzim) => (
                <tr key={shpenzim.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-900">{shpenzim.data}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      shpenzim.kategoria === 'Shpenzim i Papritur' ? 'bg-red-500/20 text-red-400' :
                      shpenzim.kategoria === 'Borgje' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {shpenzim.kategoria}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{shpenzim.pershkrimi}</td>
                  <td className="p-4 text-right number-display font-bold text-[#f43f5e]">{parseFloat(shpenzim.shuma).toFixed(2)}€</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(shpenzim)} data-testid={`edit-shpenzim-${shpenzim.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil size={16} className="text-gray-600" />
                      </button>
                      <button onClick={() => handleDelete(shpenzim.id)} data-testid={`delete-shpenzim-${shpenzim.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shpenzime.length === 0 && (
          <div className="p-12 text-center text-gray-600">
            Nuk ka shpenzime të regjistruara
          </div>
        )}
      </div>
    </div>
  );
};