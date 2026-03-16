import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FileText, Download, X } from 'lucide-react';

import { API } from '../lib/api';

export const FaturaPage = () => {
  const { getAuthHeader } = useAuth();
  const [fatura, setFatura] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFatura, setEditingFatura] = useState(null);
  const [activeTab, setActiveTab] = useState('Blerje');
  const [timeFilter, setTimeFilter] = useState('');
  const [produktet, setProduktet] = useState([{ emri: '', sasia: '', cmimi: '' }]);
  const [formData, setFormData] = useState({
    tipi: 'Blerje',
    furnitori: '',
    nui: '',
    nr_fatures: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, timeFilter]);

  const fetchData = async () => {
    try {
      const params = { tipi: activeTab };
      if (timeFilter) params.time_filter = timeFilter;
      
      const [faturaRes, stockRes] = await Promise.all([
        axios.get(`${API}/fatura`, { headers: getAuthHeader(), params }),
        axios.get(`${API}/stock`, { headers: getAuthHeader() })
      ]);
      
      setFatura(faturaRes.data);
      setStock(stockRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        produktet: produktet.map(p => ({
          emri: p.emri,
          sasia: parseFloat(p.sasia),
          cmimi: parseFloat(p.cmimi)
        }))
      };
      
      if (editingFatura) {
        await axios.put(`${API}/fatura/${editingFatura.id}`, submitData, { headers: getAuthHeader() });
        toast.success('Fatura u përditësua');
      } else {
        await axios.post(`${API}/fatura`, submitData, { headers: getAuthHeader() });
        toast.success('Fatura u shtua');
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
        await axios.delete(`${API}/fatura/${id}`, { headers: getAuthHeader() });
        toast.success('Fatura u fshi');
        fetchData();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleExport = async () => {
    try {
      const params = timeFilter ? { time_filter: timeFilter } : {};
      const response = await axios.get(`${API}/fatura/export/excel`, {
        headers: getAuthHeader(),
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fatura.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Eksporti u krye me sukses');
    } catch (error) {
      toast.error('Gabim në eksport');
    }
  };

  const handleEdit = (item) => {
    setEditingFatura(item);
    setFormData({
      tipi: item.tipi,
      furnitori: item.furnitori,
      nui: item.nui || '',
      nr_fatures: item.nr_fatures,
      data: item.data
    });
    setProduktet(item.produktet.map(p => ({ emri: p.emri, sasia: p.sasia.toString(), cmimi: p.cmimi.toString() })));
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tipi: activeTab,
      furnitori: '',
      nui: '',
      nr_fatures: '',
      data: new Date().toISOString().split('T')[0]
    });
    setProduktet([{ emri: '', sasia: '', cmimi: '' }]);
    setEditingFatura(null);
  };

  const addProdukt = () => {
    setProduktet([...produktet, { emri: '', sasia: '', cmimi: '' }]);
  };

  const removeProdukt = (index) => {
    setProduktet(produktet.filter((_, i) => i !== index));
  };

  const updateProdukt = (index, field, value) => {
    const updated = [...produktet];
    updated[index][field] = value;
    setProduktet(updated);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="fatura-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Fatura</h1>
          <p className="text-gray-600">Menaxhimi i faturave të blerjeve dhe shitjeve</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="border-gray-300" data-testid="export-fatura-button">
            <Download size={16} className="mr-2" />
            Eksporto Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="add-fatura-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
                <Plus size={20} />
                Shto Faturë
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFatura ? 'Përditëso Faturën' : 'Shto Faturë të Re'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipi</Label>
                    <Select value={formData.tipi} onValueChange={(value) => setFormData({...formData, tipi: value})}>
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-gray-900">
                        <SelectItem value="Blerje">Blerje</SelectItem>
                        <SelectItem value="Shitje">Shitje</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Furnitori/Biznesi</Label>
                    <Input value={formData.furnitori} onChange={(e) => setFormData({...formData, furnitori: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <Label>NUI (Opsionale)</Label>
                    <Input value={formData.nui} onChange={(e) => setFormData({...formData, nui: e.target.value})} className="bg-gray-50 border-gray-300 text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nr. Faturës</Label>
                    <Input value={formData.nr_fatures} onChange={(e) => setFormData({...formData, nr_fatures: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Data</Label>
                    <Input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Produktet</Label>
                    <Button type="button" onClick={addProdukt} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus size={16} className="mr-1" /> Shto Produkt
                    </Button>
                  </div>
                  {produktet.map((produkt, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="col-span-5 space-y-1">
                        <Label className="text-xs">Emri</Label>
                        <Input value={produkt.emri} onChange={(e) => updateProdukt(index, 'emri', e.target.value)} required className="bg-white border-gray-300" />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Sasia</Label>
                        <Input type="number" value={produkt.sasia} onChange={(e) => updateProdukt(index, 'sasia', e.target.value)} required className="bg-white border-gray-300" />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Çmimi (€)</Label>
                        <Input type="number" step="0.01" value={produkt.cmimi} onChange={(e) => updateProdukt(index, 'cmimi', e.target.value)} required className="bg-white border-gray-300" />
                      </div>
                      <div className="col-span-1">
                        {produktet.length > 1 && (
                          <Button type="button" onClick={() => removeProdukt(index)} size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                  {editingFatura ? 'Përditëso' : 'Shto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger value="Blerje" className="data-[state=active]:bg-white">Blerje</TabsTrigger>
          <TabsTrigger value="Shitje" className="data-[state=active]:bg-white">Shitje</TabsTrigger>
        </TabsList>

        <div className="glass rounded-xl p-4 mt-4">
          <Label className="text-sm text-gray-600 mb-2 block">Filtro sipas periudhës (YYYY-MM)</Label>
          <Input type="month" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 max-w-xs" />
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Nr. Faturës</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Furnitori</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Data</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-700">Vlera</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {fatura.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium">{item.nr_fatures}</td>
                      <td className="p-4 text-gray-700">{item.furnitori}</td>
                      <td className="p-4 text-gray-700">{item.data}</td>
                      <td className="p-4 text-right number-display font-bold text-[#6366f1]">{parseFloat(item.vlera_totale).toFixed(2)}€</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(item)} data-testid={`edit-fatura-${item.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Pencil size={16} className="text-gray-600" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} data-testid={`delete-fatura-${item.id}`} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fatura.length === 0 && (
              <div className="p-12 text-center text-gray-600">
                Nuk ka fatura {activeTab.toLowerCase()}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
