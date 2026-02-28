import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Hyrja u krye me sukses!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f8f9fa' }}>
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#6366f1' }}>
              AVALANT
            </h1>
            <p className="text-lg text-gray-600">Manager</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                data-testid="login-email-input"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#6366f1] focus:ring-[#6366f1]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Fjalëkalimi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                data-testid="login-password-input"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#6366f1] focus:ring-[#6366f1]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white font-semibold py-6 rounded-xl transition-all duration-300"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {loading ? 'Duke u kyçur...' : 'Kyçu'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};