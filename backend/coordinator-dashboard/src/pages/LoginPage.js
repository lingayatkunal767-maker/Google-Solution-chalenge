import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseClient';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('admin'); // 'admin' or 'volunteer'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- SIGN IN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Pass token or summary to App.js auth state
        onLogin({
          uid: user.uid, 
          email: user.email,
          displayName: user.displayName || 'User',
          role: role, // In a real app, fetch role from Firestore
        });
        navigate('/');
      } else {
        // --- SIGN UP ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: fullName,
        });

        // Save extra details in Firestore (non-blocking for local emulator issues)
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: fullName,
            role: role,
            createdAt: new Date().toISOString(),
          });
        } catch (firestoreError) {
          console.warn('Firestore profile save skipped:', firestoreError?.message);
        }

        onLogin({
          uid: user.uid, 
          email: user.email,
          displayName: fullName,
          role: role,
        });
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please sign in or use a different email.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#070e1d] flex flex-col items-center justify-center p-6 antialiased font-manrope' style={{ fontFamily: 'Manrope, sans-serif' }}>
      
      {/* Background gradients matching screenshot aesthetic */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full'></div>
        <div className='absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full'></div>
      </div>

      <div className='relative z-10 w-full max-w-[420px] bg-[#111827] rounded-xl border border-slate-800 shadow-2xl p-8 flex flex-col gap-6 text-slate-200'>
        
        {/* Error message bubble */}
        {error && (
          <div className='bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-lg'>
            {error}
          </div>
        )}

        {isLogin ? (
          // ================= SIGN IN VIEW =================
          <>
            <div className='flex flex-col items-center justify-center text-center gap-2 mb-2'>
              <div className='w-10 h-10 rounded-lg bg-[#2e3b5e]/50 border border-[#3e4b70] flex items-center justify-center mb-1'>
                 {/* Replicating the shield icon */}
                 <span className='material-symbols-outlined text-blue-200 text-[20px]'>security</span>
              </div>
              <h1 className='text-[28px] font-bold tracking-tight text-white'>Command Center</h1>
              <p className='text-[#9ba7c4] text-sm font-medium'>Welcome Back</p>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <div className='flex flex-col gap-1.5'>
                <label className='text-[13px] font-semibold text-[#9ba7c4] tracking-wide'>Email Address</label>
                <div className='relative'>
                   <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500'>mail</span>
                   <input 
                      type='email' 
                      placeholder='admin@commandcenter.io' 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className='w-full bg-[#0d1424] border border-[#2e3b5e] text-sm text-slate-200 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600'
                  />
                </div>
              </div>
              
              <div className='flex flex-col gap-1.5'>
                <div className='flex justify-between items-center'>
                    <label className='text-[13px] font-semibold text-[#9ba7c4] tracking-wide'>Password</label>
                    <a href='#' className='text-xs font-medium text-[#7a9bdc] hover:text-blue-300 transition-colors'>Forgot Password?</a>
                </div>
                <div className='relative'>
                   <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500'>lock</span>
                   <input 
                      type='password' 
                      placeholder='â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢' 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className='w-full bg-[#0d1424] border border-[#2e3b5e] text-sm text-slate-200 rounded-lg pl-10 pr-10 py-3 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 tracking-widest'
                  />
                  <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500 hover:text-slate-300'>
                     <span className='material-symbols-outlined'>visibility_off</span>
                  </button>
                </div>
              </div>

              <div className='flex items-center gap-2 mt-[-4px]'>
                  <input 
                    type='checkbox' 
                    id='rememberMe' 
                    className='w-4 h-4 rounded bg-[#0d1424] border-[#2e3b5e] text-blue-500 focus:ring-blue-500 focus:ring-offset-0' 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                  />
                  <label htmlFor='rememberMe' className='text-sm font-medium text-[#9ba7c4] cursor-pointer'>Remember me for 30 days</label>
              </div>
              
              <button 
                type='submit' 
                disabled={loading}
                className='w-full mt-2 bg-gradient-to-r from-[#5a8bfb] to-[#255ce8] text-white font-semibold py-3 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/20'
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <span className='material-symbols-outlined text-[18px]'>arrow_forward</span>}
              </button>
            </form>

            <div className='text-center pt-2'>
                <p className='text-[13px] font-medium text-[#9ba7c4]'>
                  Don't have an account? <button onClick={() => setIsLogin(false)} className='text-white font-bold hover:text-blue-400 transition-colors ml-1'>Sign up</button>
                </p>
            </div>
          </>
        ) : (
          // ================= SIGN UP VIEW =================
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-3'>
              <div className='inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2e3b5e] bg-[#0d1424] w-fit'>
                 <span className='material-symbols-outlined text-blue-200 text-[16px]'>security</span>
                 <span className='text-[13px] font-semibold text-white tracking-wide'>Command Center</span>
              </div>
              <div>
                <h1 className='text-[28px] font-bold tracking-tight text-white mb-2 leading-tight'>Join the Mission</h1>
                <p className='text-[#9ba7c4] text-[14px] font-medium leading-relaxed max-w-[90%]'>
                  Create your account to access enterprise governance tools.
                </p>
              </div>
            </div>

            {/* Role Toggle */}
            <div className='flex p-1.5 bg-[#0d1424] rounded-xl border border-[#2e3b5e] mt-1'>
              <button 
                type='button'
                onClick={() => setRole('admin')} 
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-[#98b7f9] text-[#111827] shadow-sm' : 'text-[#9ba7c4] hover:text-white'}`}
              >
                <span className='material-symbols-outlined text-[18px]'>verified_user</span>
                Admin
              </button>
              <button 
                type='button'
                onClick={() => setRole('volunteer')} 
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role === 'volunteer' ? 'bg-[#98b7f9] text-[#111827] shadow-sm' : 'text-[#9ba7c4] hover:text-white'}`}
              >
                <span className='material-symbols-outlined text-[18px]'>group</span>
                Volunteer
              </button>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-2'>
              <div className='relative'>
                 <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-500'>person</span>
                 <input 
                    type='text' 
                    placeholder='Full Name' 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required 
                    className='w-full bg-[#0d1424] border border-[#2e3b5e] text-sm text-slate-200 rounded-lg pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600'
                />
              </div>

              <div className='relative'>
                 <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-500'>business</span>
                 <input 
                    type='email' 
                    placeholder={role === 'admin' ? 'Organization Email' : 'Email Address'} 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className='w-full bg-[#0d1424] border border-[#2e3b5e] text-sm text-slate-200 rounded-lg pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600'
                />
              </div>
              
              <div className='relative'>
                 <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-500'>lock</span>
                 <input 
                    type='password' 
                    placeholder='Password' 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className='w-full bg-[#0d1424] border border-[#2e3b5e] text-sm text-slate-200 rounded-lg pl-12 pr-10 py-3.5 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600'
                />
              </div>
              
              <button 
                type='submit' 
                disabled={loading}
                className='w-full mt-3 bg-gradient-to-r from-[#5a8bfb] to-[#255ce8] text-white font-semibold py-3.5 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/20'
              >
                {loading ? 'Setting up account...' : 'Create Account'}
                {!loading && <span className='material-symbols-outlined text-[18px]'>arrow_forward</span>}
              </button>
            </form>

            <div className='text-center pt-2'>
                <p className='text-[13px] font-medium text-[#9ba7c4]'>
                  Already have an account? <button onClick={() => setIsLogin(true)} className='text-[#98b7f9] font-medium hover:text-white transition-colors ml-1 leading-snug'>Sign In</button>
                </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Return to Landing Page navigation */}
      <button 
          onClick={() => navigate('/')}
          className='absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors'
        >
        <span className='material-symbols-outlined text-[20px]'>arrow_back</span>
        Return Home
      </button>

    </div>
  );
}
