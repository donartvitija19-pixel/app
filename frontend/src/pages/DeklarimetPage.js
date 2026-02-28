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
import { Plus, Pencil, Trash2, FileText, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const DeklarimetPage = () => {
  const { getAuthHeader } = useAuth();
  const [deklarimet, setDeklarimet] = useState([]);
  const [pagat, setPagat] = useState([]);
  const [analytics, setAnalytics] = useState({ TM1: 0, TM2: 0, TM3: 0, TM4: 0 });
  const [pagatAnalytics, setPagatAnalytics] = useState({ total_pagat: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deklarimet');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [deklarimForm, setDeklarimForm] = useState({
    tremujori: 'TM1',
    viti: new Date().getFullYear(),
    vlera_shitese: '',
    data_deklarimit: new Date().toISOString().split('T')[0]
  });

  const [pagaForm, setPagaForm] = useState({
    emri: '',
    mbiemri: '',
    nr_personal: '',
    vlera: '',
    muaji: '',
    viti: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedYear]);

  const fetchData = async () => {
    try {
      if (activeTab === 'deklarimet') {
        const [deklarimetRes, analyticsRes] = await Promise.all([
          axios.get(`${API}/deklarimet`, { headers: getAuthHeader(), params: { viti: selectedYear } }),
          axios.get(`${API}/deklarimet/analytics/${selectedYear}`, { headers: getAuthHeader() })
        ]);
        setDeklarimet(deklarimetRes.data);
        setAnalytics(analyticsRes.data);
      } else {
        const [pagatRes, analyticsRes] = await Promise.all([
          axios.get(`${API}/pagat`, { headers: getAuthHeader(), params: { viti: selectedYear } }),
          axios.get(`${API}/pagat/analytics/${selectedYear}`, { headers: getAuthHeader() })
        ]);
        setPagat(pagatRes.data);
        setPagatAnalytics(analyticsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeklarimSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/deklarimet/${editingItem.id}`, deklarimForm, { headers: getAuthHeader() });
        toast.success('Deklarimi u përditësua');
      } else {
        await axios.post(`${API}/deklarimet`, deklarimForm, { headers: getAuthHeader() });
        toast.success('Deklarimi u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Gabim në ruajtje');
    }
  };

  const handlePagaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/pagat/${editingItem.id}`, pagaForm, { headers: getAuthHeader() });
        toast.success('Paga u përditësua');
      } else {
        await axios.post(`${API}/pagat`, pagaForm, { headers: getAuthHeader() });
        toast.success('Paga u shtua');
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
        const endpoint = activeTab === 'deklarimet' ? 'deklarimet' : 'pagat';
        await axios.delete(`${API}/${endpoint}/${id}`, { headers: getAuthHeader() });
        toast.success(`${activeTab === 'deklarimet' ? 'Deklarimi' : 'Paga'} u fshi`);
        fetchData();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'deklarimet') {
      setDeklarimForm({
        tremujori: item.tremujori,
        viti: item.viti,
        vlera_shitese: item.vlera_shitese,
        data_deklarimit: item.data_deklarimit
      });
    } else {
      setPagaForm({
        emri: item.emri,
        mbiemri: item.mbiemri,
        nr_personal: item.nr_personal,
        vlera: item.vlera,
        muaji: item.muaji,
        viti: item.viti
      });
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setDeklarimForm({
      tremujori: 'TM1',
      viti: new Date().getFullYear(),
      vlera_shitese: '',
      data_deklarimit: new Date().toISOString().split('T')[0]
    });
    setPagaForm({
      emri: '',
      mbiemri: '',
      nr_personal: '',
      vlera: '',
      muaji: '',
      viti: new Date().getFullYear()
    });
    setEditingItem(null);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="deklarimet-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Deklarime & Paga</h1>
          <p className="text-gray-600">Menaxhimi i deklarimeve tatimore dhe pagave</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto {activeTab === 'deklarimet' ? 'Deklarim' : 'Pagë'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Përditëso' : 'Shto'} {activeTab === 'deklarimet' ? 'Deklarim' : 'Pagë'}</DialogTitle>
            </DialogHeader>
            {activeTab === 'deklarimet' ? (
              <form onSubmit={handleDeklarimSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tremujori</Label>
                    <Select value={deklarimForm.tremujori} onValueChange={(value) => setDeklarimForm({...deklarimForm, tremujori: value})}>
                      <SelectTrigger className="bg-gray-50 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="TM1">TM1</SelectItem>
                        <SelectItem value="TM2">TM2</SelectItem>
                        <SelectItem value="TM3">TM3</SelectItem>
                        <SelectItem value="TM4">TM4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Viti</Label>
                    <Input type="number" value={deklarimForm.viti} onChange={(e) => setDeklarimForm({...deklarimForm, viti: parseInt(e.target.value)})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Vlera Shitëse (€)</Label>
                    <Input type="number" step="0.01" value={deklarimForm.vlera_shitese} onChange={(e) => setDeklarimForm({...deklarimForm, vlera_shitese: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Data e Deklarimit</Label>
                    <Input type="date" value={deklarimForm.data_deklarimit} onChange={(e) => setDeklarimForm({...deklarimForm, data_deklarimit: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">{editingItem ? 'Përditëso' : 'Shto'}</Button>
              </form>
            ) : (
              <form onSubmit={handlePagaSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emri</Label>
                    <Input value={pagaForm.emri} onChange={(e) => setPagaForm({...pagaForm, emri: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mbiemri</Label>
                    <Input value={pagaForm.mbiemri} onChange={(e) => setPagaForm({...pagaForm, mbiemri: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Nr. Personal</Label>
                    <Input value={pagaForm.nr_personal} onChange={(e) => setPagaForm({...pagaForm, nr_personal: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Vlera (€)</Label>
                    <Input type="number" step="0.01" value={pagaForm.vlera} onChange={(e) => setPagaForm({...pagaForm, vlera: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Muaji</Label>
                    <Input value={pagaForm.muaji} onChange={(e) => setPagaForm({...pagaForm, muaji: e.target.value})} placeholder="Janar, Shkurt..." required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Viti</Label>
                    <Input type="number" value={pagaForm.viti} onChange={(e) => setPagaForm({...pagaForm, viti: parseInt(e.target.value)})} required className="bg-gray-50 border-gray-300" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">{editingItem ? 'Përditëso' : 'Shto'}</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-xl p-4">
        <Label className="text-sm text-gray-600 mb-2 block">Filtro sipas vitit</Label>
        <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-gray-50 border-gray-300 max-w-xs" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger value="deklarimet" className="data-[state=active]:bg-white">Deklarimet</TabsTrigger>
          <TabsTrigger value="pagat" className="data-[state=active]:bg-white">Pagat</TabsTrigger>
        </TabsList>

        <TabsContent value="deklarimet" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['TM1', 'TM2', 'TM3', 'TM4'].map(tm => (
              <div key={tm} className="glass rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">{tm}</p>
                <p className="text-2xl font-bold number-display text-[#6366f1]">
                  {analytics[tm]?.toFixed(2) || '0.00'}€
                </p>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Tremujori</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Viti</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Vlera Shitëse</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Data Deklarimit</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {deklarimet.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-900 font-medium">{item.tremujori}</td>
                    <td className="p-4 text-gray-700">{item.viti}</td>
                    <td className="p-4 text-right number-display font-bold text-[#6366f1]">{parseFloat(item.vlera_shitese).toFixed(2)}€</td>
                    <td className="p-4 text-gray-700">{item.data_deklarimit}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg">
                          <Pencil size={16} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deklarimet.length === 0 && <div className="p-12 text-center text-gray-600">Nuk ka deklarime</div>}
          </div>
        </TabsContent>

        <TabsContent value="pagat" className="space-y-6 mt-6">
          <div className="glass rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Pagat {selectedYear}</p>
            <p className="text-3xl font-bold number-display text-[#6366f1]">
              {pagatAnalytics.total_pagat?.toFixed(2) || '0.00'}€
            </p>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Emri</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Mbiemri</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Nr. Personal</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Muaji</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Vlera</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {pagat.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-900">{item.emri}</td>
                    <td className="p-4 text-gray-900">{item.mbiemri}</td>
                    <td className="p-4 text-gray-700">{item.nr_personal}</td>
                    <td className="p-4 text-gray-700">{item.muaji}</td>
                    <td className="p-4 text-right number-display font-bold text-[#10b981]">{parseFloat(item.vlera).toFixed(2)}€</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg">
                          <Pencil size={16} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagat.length === 0 && <div className="p-12 text-center text-gray-600">Nuk ka paga</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
