import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Landmark } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const BankaAccountsPage = () => {
  const { getAuthHeader } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    emri_bankes: '',
    bilanci: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API}/banka-accounts`, { headers: getAuthHeader() });
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await axios.put(`${API}/banka-accounts/${editingAccount.id}`, formData, { headers: getAuthHeader() });
        toast.success('Llogaria u përditësua');
      } else {
        await axios.post(`${API}/banka-accounts`, formData, { headers: getAuthHeader() });
        toast.success('Llogaria u shtua');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      toast.error('Gabim në ruajtje');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      try {
        await axios.delete(`${API}/banka-accounts/${id}`, { headers: getAuthHeader() });
        toast.success('Llogaria u fshi');
        fetchAccounts();
      } catch (error) {
        toast.error('Gabim në fshirje');
      }
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      emri_bankes: account.emri_bankes,
      bilanci: account.bilanci
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ emri_bankes: '', bilanci: '' });
    setEditingAccount(null);
  };

  if (loading) return <div className="text-white">Duke ngarkuar...</div>;

  const totalBilanci = accounts.reduce((sum, acc) => sum + parseFloat(acc.bilanci || 0), 0);

  return (
    <div className="space-y-6" data-testid="banka-accounts-page">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Llogaritë Bankare</h1>
          <p className="text-zinc-400">Menaxhimi i llogarive bankare</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-account-button" className="bg-[#6366f1] hover:bg-[#5558e3] gap-2">
              <Plus size={20} />
              Shto Llogari
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Përditëso Llogarinë' : 'Shto Llogari të Re'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Emri i Bankës</Label>
                <Input
                  value={formData.emri_bankes}
                  onChange={(e) => setFormData({...formData, emri_bankes: e.target.value})}
                  required
                  data-testid="account-emri-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="p.sh. BKT, ProCredit, Raiffeisen"
                />
              </div>
              <div className="space-y-2">
                <Label>Bilanci (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.bilanci}
                  onChange={(e) => setFormData({...formData, bilanci: e.target.value})}
                  required
                  data-testid="account-bilanci-input"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button type="submit" data-testid="account-submit-button" className="w-full bg-[#6366f1] hover:bg-[#5558e3]">
                {editingAccount ? 'Përditëso' : 'Shto'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Landmark size={24} className="text-[#6366f1]" />
          <p className="text-sm text-zinc-400">Totali i Llogarive</p>
        </div>
        <p className="text-4xl font-bold number-display text-[#6366f1]">
          {totalBilanci.toLocaleString('en-US', { minimumFractionDigits: 2 })}€
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="glass rounded-xl p-6 space-y-4" data-testid={`account-card-${account.id}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#6366f1]/20">
                  <Landmark size={24} className="text-[#6366f1]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{account.emri_bankes}</h3>
                  <p className="text-xs text-zinc-500">Llogari Bankare</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(account)} data-testid={`edit-account-${account.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Pencil size={16} className="text-zinc-400" />
                </button>
                <button onClick={() => handleDelete(account.id)} data-testid={`delete-account-${account.id}`} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-zinc-400 mb-2">Bilanci Aktual</p>
              <p className="text-3xl font-bold number-display text-[#10b981]">
                {parseFloat(account.bilanci).toLocaleString('en-US', { minimumFractionDigits: 2 })}€
              </p>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Landmark size={48} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">Nuk ka llogari bankare të regjistruara</p>
        </div>
      )}
    </div>
  );
};
