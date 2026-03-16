import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Download, Upload, Sparkles } from 'lucide-react';

import { API } from '../lib/api';

export const CRMPage = () => {
  const { getAuthHeader } = useAuth();
  const [crm, setCrm] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrm, setEditingCrm] = useState(null);
  const [formData, setFormData] = useState({
    emri: '',
    mbiemri: '',
    telefon: '',
    adresa: '',
    shenime: ''
  });

  useEffect(() => {
    fetchCrm();
  }, []);

  const fetchCrm = async () => {
    try {
      const response = await axios.get(`${API}/crm`, { headers: getAuthHeader() });
      setCrm(response.data);
    } catch (error) {
      console.error('Failed to fetch crm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrm) {
        await axios.put(`${API}/crm/${editingCrm.id}`, formData, { headers: getAuthHeader() });
        toast.success('Klienti u përditësua');
      } else {
        await axios.post(`${API}/crm`, formData, { headers: getAuthHeader() });
        toast.success('Klienti u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchCrm();
    } catch (error) {
      toast.error('Gabim në ruajtje');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      try {
        await axios.delete(`${API}/crm/${id}`, { headers: getAuthHeader() });
        toast.success('Klienti u fshi');
        fetchCrm();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleClean = async () => {
    if (window.confirm('Jeni i sigurt që doni të fshini duplikatet?')) {
      try {
        const response = await axios.post(`${API}/crm/clean`, {}, { headers: getAuthHeader() });
        toast.success(response.data.message);
        fetchCrm();
      } catch (error) {
        toast.error('Gabim në pastrimin e duplikateve');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/crm/export/csv`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'crm.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Eksporti u krye me sukses');
    } catch (error) {
      toast.error('Gabim në eksport');
    }
  };

  const handleEdit = (item) => {
    setEditingCrm(item);
    setFormData({
      emri: item.emri,
      mbiemri: item.mbiemri,
      telefon: item.telefon,
      adresa: item.adresa || '',
      shenime: item.shenime || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ emri: '', mbiemri: '', telefon: '', adresa: '', shenime: '' });
    setEditingCrm(null);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="crm-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>CRM - Klientët</h1>
          <p className="text-gray-600">Menaxhimi i bazës së klientëve</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleClean} variant="outline" className="border-gray-300" data-testid="clean-crm-button">
            <Sparkles size={16} className="mr-2" />
            Smart Clean
          </Button>
          <Button onClick={handleExport} variant="outline" className="border-gray-300" data-testid="export-crm-button">
            <Download size={16} className="mr-2" />
            Eksporto CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="add-crm-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
                <Plus size={20} />
                Shto Klient
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 text-gray-900">
              <DialogHeader>
                <DialogTitle>{editingCrm ? 'Përditëso Klientin' : 'Shto Klient të Ri'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emri</Label>
                    <Input value={formData.emri} onChange={(e) => setFormData({...formData, emri: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mbiemri</Label>
                    <Input value={formData.mbiemri} onChange={(e) => setFormData({...formData, mbiemri: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Telefon</Label>
                    <Input value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} required className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Adresa</Label>
                    <Input value={formData.adresa} onChange={(e) => setFormData({...formData, adresa: e.target.value})} className="bg-gray-50 border-gray-300" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Shënime</Label>
                    <Textarea value={formData.shenime} onChange={(e) => setFormData({...formData, shenime: e.target.value})} className="bg-gray-50 border-gray-300" rows={3} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">{editingCrm ? 'Përditëso' : 'Shto'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users size={24} className="text-[#6366f1]" />
          <div>
            <p className="text-sm text-gray-600">Total Klientë</p>
            <p className="text-2xl font-bold text-gray-900">{crm.length}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Emri & Mbiemri</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Telefon</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Adresa</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Shënime</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {crm.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-900 font-medium">{item.emri} {item.mbiemri}</td>
                  <td className="p-4 text-gray-700">{item.telefon}</td>
                  <td className="p-4 text-gray-700">{item.adresa || '-'}</td>
                  <td className="p-4 text-gray-600 text-sm">{item.shenime || '-'}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(item)} data-testid={`edit-crm-${item.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil size={16} className="text-gray-600" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} data-testid={`delete-crm-${item.id}`} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {crm.length === 0 && (
          <div className="p-12 text-center text-gray-600">
            Nuk ka klientë të regjistruar
          </div>
        )}
      </div>
    </div>
  );
};
