import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, UserCog } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const KontabilistetPage = () => {
  const { getAuthHeader } = useAuth();
  const [kontabilistet, setKontabilistet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    emri: '',
    mbiemri: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchKontabilistet();
  }, []);

  const fetchKontabilistet = async () => {
    try {
      const response = await axios.get(`${API}/kontabilistet`, { headers: getAuthHeader() });
      setKontabilistet(response.data);
    } catch (error) {
      console.error('Failed to fetch kontabilistet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/register`, { ...formData, role: 'kontabilist' }, { headers: getAuthHeader() });
      toast.success('Kontabilisti u shtua me sukses');
      setIsDialogOpen(false);
      resetForm();
      fetchKontabilistet();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim në ruajtje');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt që doni të fshini këtë kontabilist?')) {
      try {
        await axios.delete(`${API}/kontabilistet/${id}`, { headers: getAuthHeader() });
        toast.success('Kontabilisti u fshi');
        fetchKontabilistet();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const resetForm = () => {
    setFormData({ emri: '', mbiemri: '', email: '', password: '' });
  };

  if (loading) return <div className="text-white">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="kontabilistet-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Kontabilistët</h1>
          <p className="text-zinc-400">Menaxhimi i përdoruesve kontabilist</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-kontabilist-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto Kontabilist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Shto Kontabilist të Ri</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Emri</Label>
                <Input
                  value={formData.emri}
                  onChange={(e) => setFormData({...formData, emri: e.target.value})}
                  required
                  data-testid="kontabilist-emri-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Mbiemri</Label>
                <Input
                  value={formData.mbiemri}
                  onChange={(e) => setFormData({...formData, mbiemri: e.target.value})}
                  required
                  data-testid="kontabilist-mbiemri-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  data-testid="kontabilist-email-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Fjalëkalimi</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  data-testid="kontabilist-password-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button type="submit" data-testid="kontabilist-submit-button" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                Shto Kontabilist
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-zinc-300">Emri</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-300">Mbiemri</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-300">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-300">Roli</th>
                <th className="text-center p-4 text-sm font-semibold text-zinc-300">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {kontabilistet.map((kontabilist) => (
                <tr key={kontabilist.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#6366f1]/20">
                        <UserCog size={20} className="text-[#6366f1]" />
                      </div>
                      <span className="text-white font-medium">{kontabilist.emri}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{kontabilist.mbiemri}</td>
                  <td className="p-4 text-zinc-400">{kontabilist.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                      {kontabilist.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button onClick={() => handleDelete(kontabilist.id)} data-testid={`delete-kontabilist-${kontabilist.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {kontabilistet.length === 0 && (
          <div className="p-12 text-center text-zinc-400">
            Nuk ka kontabilistë të regjistruar
          </div>
        )}
      </div>
    </div>
  );
};
