import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, Shield, Info, Eye, EyeOff, Key, UserPlus, ClipboardList, ArrowLeft } from 'lucide-react';
import { UserRole, User as UserType } from '../types';

interface AuthViewProps {
  onBackToLanding: () => void;
  onLoginSuccess: (user: UserType) => void;
  language: 'id' | 'en';
  initialRolePreset?: UserRole;
}

export const AuthView: React.FC<AuthViewProps> = ({ 
  onBackToLanding, 
  onLoginSuccess, 
  language,
  initialRolePreset
}) => {
  const isEn = language === 'en';
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [selectedRoleForNewAccount, setSelectedRoleForNewAccount] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const handleDemoPresetLogin = (role: UserRole) => {
    let mockUser: UserType;
    switch(role) {
      case 'super_admin':
        mockUser = {
          id: 'super-admin-01',
          name: isEn ? 'Dr. Clara Lumina (CEO)' : 'Dr. Clara Lumina (Medis Utama)',
          username: 'superadmin',
          role: 'super_admin',
          createdAt: new Date(2026, 0, 1).toISOString()
        };
        break;
      case 'admin':
        mockUser = {
          id: 'admin-01',
          name: isEn ? 'Nurse Amelia (Consultant)' : 'Suster Amelia (Anotator)',
          username: 'consultant',
          role: 'admin',
          createdAt: new Date(2026, 2, 15).toISOString()
        };
        break;
      case 'user':
      default:
        mockUser = {
          id: 'client-clara',
          name: isEn ? 'Clara (VIP Client)' : 'Clara (Klien Primer)',
          username: 'client',
          role: 'user',
          createdAt: new Date(2026, 4, 10).toISOString()
        };
        break;
    }
    
    // Save active session in local storage for refresh safety
    localStorage.setItem('lumina-active-user', JSON.stringify(mockUser));
    onLoginSuccess(mockUser);
  };

  // Preset filling or trigger on mount based on landing parameters
  React.useEffect(() => {
    if (initialRolePreset) {
      handleDemoPresetLogin(initialRolePreset);
    }
  }, [initialRolePreset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username || !password) {
      setFormError(isEn ? 'All fields are required' : 'Mohon lengkapi semua baris input');
      return;
    }

    if (isSignUp && !displayName) {
      setFormError(isEn ? 'Please specify your full name' : 'Mohon tuliskan nama lengkap Anda');
      return;
    }

    // Retrieve custom accounts from localStorage
    const savedAccountsRaw = localStorage.getItem('lumina-custom-users') || '[]';
    const savedAccounts: UserType[] = JSON.parse(savedAccountsRaw);

    if (isSignUp) {
      const isUsernameTaken = savedAccounts.some(acc => acc.username.toLowerCase() === username.toLowerCase()) || 
                              ['superadmin', 'consultant', 'client'].includes(username.toLowerCase());
      if (isUsernameTaken) {
        setFormError(isEn ? 'Username already taken' : 'Username sudah terdaftar atau digunakan sistem');
        return;
      }

      const newAccount: UserType = {
        id: `custom-user-${Date.now()}`,
        name: displayName,
        username: username.toLowerCase().trim(),
        role: selectedRoleForNewAccount,
        createdAt: new Date().toISOString()
      };

      savedAccounts.push(newAccount);
      localStorage.setItem('lumina-custom-users', JSON.stringify(savedAccounts));
      
      // Auto log in with newly created custom account
      localStorage.setItem('lumina-active-user', JSON.stringify(newAccount));
      onLoginSuccess(newAccount);
    } else {
      // Login Check
      // First, check presets
      const lowerUser = username.toLowerCase().trim();
      if (lowerUser === 'superadmin' && password === 'admin123') {
        handleDemoPresetLogin('super_admin');
        return;
      }
      if (lowerUser === 'consultant' && password === 'nurse123') {
        handleDemoPresetLogin('admin');
        return;
      }
      if (lowerUser === 'client' && password === 'clara123') {
        handleDemoPresetLogin('user');
        return;
      }

      // Second, check custom accounts
      const matchedUser = savedAccounts.find(acc => acc.username === lowerUser);
      if (matchedUser && password === '123') { // Simple default testing password '123'
        localStorage.setItem('lumina-active-user', JSON.stringify(matchedUser));
        onLoginSuccess(matchedUser);
      } else {
        setFormError(isEn 
          ? 'Invalid credentials. Hint: use presets or password "123" for custom accounts' 
          : 'Kombinasi sandi keliru. Gunakan Preset Instan atau ketik "123" untuk sandi buatan baru'
        );
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden min-h-[500px]">
      
      {/* Left Form Panel */}
      <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
        
        {/* Back Button */}
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-pink-500 font-bold tracking-tight mb-6 transition-colors self-start"
          id="btn-auth-back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isEn ? 'Back to Landing' : 'Kembali ke Gerbang'}
        </button>

        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-lg text-slate-900">
              Lumina<span className="text-pink-500">Aesthetic</span>
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isSignUp 
              ? (isEn ? 'Create Professional ID' : 'Daftar Akun Baru') 
              : (isEn ? 'Access Care Platform' : 'Akses Portal Estetika')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            {isSignUp 
              ? (isEn ? 'Register custom roles to see dashboard capabilities.' : 'Pilih peran dan buat sandi khusus untuk mensimulasikan dasbor.') 
              : (isEn ? 'Specify clinic credential profiles or log instantly using sandbox templates.' : 'Gunakan akun demo di sebelah kanan atau buat akun kustom Anda.')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {formError && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[11px] font-bold">
                ⚠️ {formError}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">
                  {isEn ? 'Full Name' : 'Nama Lengkap'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Clara Rosabella" 
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-semibold"
                    id="input-auth-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isSignUp ? 'clararosa' : 'superadmin / consultant / client'} 
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-semibold font-mono"
                  id="input-auth-username"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">
                {isEn ? 'Access Password' : 'Kata Sandi'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Use "123" as target password' : '••••••••'} 
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-semibold font-mono"
                  id="input-auth-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">
                  {isEn ? 'Assigned Sandbox Role' : 'Peran Akses Buatan'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['user', 'admin', 'super_admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRoleForNewAccount(r)}
                      className={`py-2 text-[10px] font-black uppercase rounded-lg border tracking-wider transition-all ${selectedRoleForNewAccount === r ? 'bg-pink-550 border-pink-500 bg-pink-50 text-pink-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-slate-900/10 active:scale-[0.98] transform"
              id="btn-auth-submit"
            >
              {isSignUp ? (isEn ? 'Register Sandbox ID' : 'Proses Daftar') : (isEn ? 'Verify Clinic Badge' : 'Masuk Sistem')}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormError('');
              setUsername('');
              setPassword('');
              setDisplayName('');
            }}
            className="text-[11px] text-pink-500 hover:text-pink-600 font-extrabold transition-colors cursor-pointer"
            id="btn-auth-toggle"
          >
            {isSignUp 
              ? (isEn ? 'Already have clinic roles? Log In' : 'Sudah memiliki akses terdaftar? Masuk') 
              : (isEn ? 'Don\'t have accounts? Create Custom Account & Role' : 'Belum memiliki akun? Daftarkan Akun Baru')}
          </button>
        </div>
      </div>

      {/* Right Presets Panel */}
      <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 flex flex-col justify-between">
        <div>
          <h3 className="text-xs uppercase font-black text-slate-400 mb-4 tracking-widest flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            Sandbox Quick Access
          </h3>
          <p className="text-[10.5px] text-slate-400 leading-normal font-semibold mb-6">
            {isEn 
              ? 'Skip password matching. Tap any role badge to instantly inject profiles and view customized panels.'
              : 'Klik sekali pada lencana untuk langsung menyuntikkan profil tanpa perlu mengetik kata sandi.'}
          </p>

          <div className="space-y-4">
            {[
              {
                role: 'super_admin' as UserRole,
                name: isEn ? 'Dr. Clara Lumina' : 'Dr. Clara Lumina',
                title: isEn ? 'Clinical Director' : 'Super Admin Utama',
                passInfo: 'Password: admin123',
                bg: 'bg-white hover:border-pink-300'
              },
              {
                role: 'admin' as UserRole,
                name: isEn ? 'Nurse Amelia' : 'Suster Amelia',
                title: isEn ? 'Aesthetic Consultant' : 'Konsultan Estetika',
                passInfo: 'Password: nurse123',
                bg: 'bg-white hover:border-indigo-300'
              },
              {
                role: 'user' as UserRole,
                name: isEn ? 'Clara Rosabella' : 'Klien Clara',
                title: isEn ? 'VIP Patient' : 'Pengguna Biasa / Klien',
                passInfo: 'Password: clara123',
                bg: 'bg-white hover:border-emerald-300'
              }
            ].map((p, idx) => (
              <div 
                key={idx}
                onClick={() => handleDemoPresetLogin(p.role)}
                className={`p-4 ${p.bg} border border-slate-200 rounded-2xl cursor-pointer shadow-sm transition-all hover:shadow hover:scale-102 flex flex-col justify-between`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight">{p.name}</h4>
                    <span className="text-[9.5px] font-semibold text-slate-400">{p.title}</span>
                  </div>
                  <span className="text-[8.5px] font-mono uppercase bg-slate-100 text-slate-500 border border-slate-200/50 px-1.5 py-0.5 rounded">
                    {p.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400/80 mt-2 border-t border-slate-100 pt-1.5">
                  <span>ID: {p.role === 'super_admin' ? '@superadmin' : p.role === 'admin' ? '@consultant' : '@client'}</span>
                  <span className="text-pink-500/80 font-bold">{p.passInfo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200/60 flex gap-2 items-start text-stone-400">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[9.5px] font-semibold leading-normal">
            {isEn 
              ? 'All credentials exist inside local storage sandbox keys. To reset, clear your browser state or log out.'
              : 'Semua draf tersimpan lokal. Perubahan atau penghapusan akan tersinkronisasi lurus di bawah akun Anda.'}
          </p>
        </div>
      </div>

    </div>
  );
};
