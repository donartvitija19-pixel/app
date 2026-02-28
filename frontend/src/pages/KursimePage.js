import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, PiggyBank, TrendingUp, X } from 'lucide-react';
import { Progress } from '../components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const KursimePage = () => {
  const { getAuthHeader } = useAuth();
  const [kursime, setKursime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDepozitimDialogOpen, setIsDepozitimDialogOpen] = useState(false);
  const [selectedKursim, setSelectedKursim] = useState(null);
  const [editingKursim, setEditingKursim] = useState(null);
  const [depozitimVlera, setDepozitimVlera] = useState('');
  const [formData, setFormData] = useState({
    qellimi: '',
    shuma_target: '',
    shuma_aktuale: '0'
  });

  useEffect(() => {
    fetchKursime();
  }, []);

  const fetchKursime = async () => {
    try {
      const response = await axios.get(`${API}/kursime`, { headers: getAuthHeader() });
      setKursime(response.data);
    } catch (error) {
      console.error('Failed to fetch kursime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingKursim) {
        await axios.put(`${API}/kursime/${editingKursim.id}`, formData, { headers: getAuthHeader() });
        toast.success('Kursimi u përditësua');
      } else {
        await axios.post(`${API}/kursime`, formData, { headers: getAuthHeader() });
        toast.success('Kursimi u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchKursime();
    } catch (error) {
      toast.error('Gabim në ruajtje');
    }
  };

  const handleDepozitim = async (status) => {
    try {
      const requestData = {
        kursim_id: selectedKursim.id,
        status: status
      };
      if (status === 'depozituar' && depozitimVlera) {
        requestData.vlera = parseFloat(depozitimVlera);
      }
      
      await axios.post(`${API}/kursime/depozitim`, requestData, { headers: getAuthHeader() });
      toast.success(status === 'depozituar' ? 'Depozitimi u regjistrua' : 'Status u regjistrua');
      setIsDepozitimDialogOpen(false);
      setSelectedKursim(null);
      setDepozitimVlera('');
      fetchKursime();
    } catch (error) {
      toast.error('Gabim në regjistrimin e depozitimit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      try {
        await axios.delete(`${API}/kursime/${id}`, { headers: getAuthHeader() });
        toast.success('Kursimi u fshi');
        fetchKursime();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleEdit = (kursim) => {
    setEditingKursim(kursim);
    setFormData({
      qellimi: kursim.qellimi,
      shuma_target: kursim.shuma_target,
      shuma_aktuale: kursim.shuma_aktuale
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ qellimi: '', shuma_target: '', shuma_aktuale: '0' });
    setEditingKursim(null);
  };

  if (loading) return <div className="text-gray-900">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6" data-testid="kursime-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Kursime</h1>
          <p className="text-gray-600">Tracking i kursimeve personale</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-kursim-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto Kursim
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle>{editingKursim ? 'Përditëso Kursimin' : 'Shto Kursim të Ri'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Qëllimi</Label>
                <Input
                  value={formData.qellimi}
                  onChange={(e) => setFormData({...formData, qellimi: e.target.value})}
                  required
                  data-testid="kursim-qellimi-input"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  placeholder="p.sh. Blerje Veture, Udhëtim, etj."
                />
              </div>
              <div className="space-y-2">
                <Label>Shuma Target (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shuma_target}
                  onChange={(e) => setFormData({...formData, shuma_target: e.target.value})}
                  required
                  data-testid="kursim-target-input"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label>Shuma Aktuale (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shuma_aktuale}
                  onChange={(e) => setFormData({...formData, shuma_aktuale: e.target.value})}
                  data-testid="kursim-aktual-input"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>
              <Button type="submit" data-testid="kursim-submit-button" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                {editingKursim ? 'Përditëso' : 'Shto'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kursime.map((kursim) => {
          const progress = (parseFloat(kursim.shuma_aktuale) / parseFloat(kursim.shuma_target)) * 100;
          const completed = progress >= 100;
          
          return (
            <div key={kursim.id} className="glass rounded-xl p-6 space-y-4" data-testid={`kursim-card-${kursim.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${completed ? 'bg-[#10b981]/20' : 'bg-[#6366f1]/20'}`}>
                    <PiggyBank size={24} className={completed ? 'text-[#10b981]' : 'text-[#6366f1]'} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{kursim.qellimi}</h3>
                    {completed && <span className="text-xs text-[#10b981] font-semibold">✓ Arritur</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(kursim)} data-testid={`edit-kursim-${kursim.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil size={16} className="text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(kursim.id)} data-testid={`delete-kursim-${kursim.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target</span>
                  <span className="number-display font-bold text-gray-900">{parseFloat(kursim.shuma_target).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktuale</span>
                  <span className="number-display font-bold text-[#10b981]">{parseFloat(kursim.shuma_aktuale).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mbetet</span>
                  <span className="number-display font-bold text-[#f43f5e]">
                    {Math.max(0, parseFloat(kursim.shuma_target) - parseFloat(kursim.shuma_aktuale)).toFixed(2)}€
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(100, progress).toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(100, progress)} className="h-2" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSelectedKursim(kursim);
                    setIsDepozitimDialogOpen(true);
                  }}
                  data-testid={`depozitim-button-${kursim.id}`}
                  className="flex-1 bg-[#10b981] hover:bg-[#0f9c72] text-gray-900 gap-2"
                >
                  <TrendingUp size={16} />
                  Shto Depozitim
                </Button>
                <Button
                  onClick={() => handleDepozitim('s_kam_depozituar')}
                  variant="outline"
                  className="flex-1 border-gray-300 text-red-400 hover:bg-red-500/10"
                >
                  <X size={16} className="mr-2" />
                  S'kam depozituar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {kursime.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <PiggyBank size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nuk ka kursime të regjistruara</p>
        </div>
      )}

      <Dialog open={isDepozitimDialogOpen} onOpenChange={setIsDepozitimDialogOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Shto Depozitim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vlera e Depozitimit (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={depozitimVlera}
                onChange={(e) => setDepozitimVlera(e.target.value)}
                required
                data-testid="depozitim-vlera-input"
                className="bg-gray-50 border-gray-300 text-gray-900"
              />
            </div>
            <Button
              onClick={() => handleDepozitim('depozituar')}
              data-testid="confirm-depozitim-button"
              className="w-full bg-[#10b981] hover:bg-[#0f9c72]"
            >
              Konfirmo Depozitimin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
