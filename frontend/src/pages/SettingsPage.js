import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Download, Database, Shield, HardDrive } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const SettingsPage = () => {
  const { getAuthHeader } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleFullBackup = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/export/full-backup`, {
        headers: getAuthHeader(),
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `avalant_backup_${timestamp}.json`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Backup u shkarkua me sukses!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gabim në eksportimin e backup-it');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Settings
        </h1>
        <p className="text-gray-600">Konfigurimet dhe menaxhimi i sistemit</p>
      </div>

      {/* Backup & Export Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Database size={24} className="text-[#6366f1]" />
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Backup & Export
            </h2>
            <p className="text-sm text-gray-600">Eksporto të gjitha të dhënat e databazës</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Database Backup */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <HardDrive size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Full Database Backup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Eksporto të gjithë databazën në format JSON. Përfshin të gjitha modulet:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 mb-4">
                  <li>• Borxhe</li>
                  <li>• Shpenzime</li>
                  <li>• Financa Ditore</li>
                  <li>• Stock</li>
                  <li>• Fatura</li>
                  <li>• Deklarimet & Pagat</li>
                  <li>• CRM & CRM-CPP</li>
                  <li>• Kursime</li>
                  <li>• Llogaritë Bankare</li>
                  <li>• Përdoruesit</li>
                </ul>
                <Button
                  onClick={handleFullBackup}
                  disabled={exporting}
                  data-testid="full-backup-button"
                  className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Duke eksportuar...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Eksporto Databazën
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Rekomandime</h3>
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Bëj backup rregullisht (javore ose mujore)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Ruaj backup-et në vende të sigurta (cloud storage)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Testo backup-et herë pas here për t'u siguruar që funksionojnë</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>File JSON mund të importohet lehtë në sisteme të tjera</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium mb-1">Format i File-it</p>
              <p className="text-xs text-gray-600">
                Backup file është në format JSON dhe përmban të gjitha të dhënat e strukturuara sipas moduleve. 
                File-i është human-readable dhe mund të hapet me çdo text editor. Password hashes janë të përfshirë por të enkriptuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={24} className="text-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Informacion Sistemi
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-1">Versioni</p>
            <p className="font-bold text-gray-900">AVALANT Manager v1.0</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-1">Database</p>
            <p className="font-bold text-gray-900">MongoDB</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-1">Backup Format</p>
            <p className="font-bold text-gray-900">JSON</p>
          </div>
        </div>
      </div>
    </div>
  );
};
