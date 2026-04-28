const fs = require('fs');
const html = \`nimport React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className='bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex flex-col'>
      <header className='bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 shadow-xl shadow-blue-900/5 fixed top-0 w-full z-50 font-manrope antialiased tracking-tight'>
        <div className='max-w-7xl mx-auto flex justify-between items-center px-6 h-20 text-blue-500 dark:text-blue-400'>
          <div className='text-xl font-bold text-slate-50 tracking-tighter'>VolunteerMatch</div>
          <nav className='hidden md:flex items-center gap-8'>
            <a className='text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-300 px-3 py-2 rounded-md' href='#'>Features</a>
            <a className='text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-300 px-3 py-2 rounded-md' href='#'>Solutions</a>
            <a className='text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-300 px-3 py-2 rounded-md' href='#'>Pricing</a>
          </nav>
          <div className='flex items-center gap-4'>
            <button onClick={() => navigate('/login')} className='hidden md:block text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-300 px-4 py-2 rounded-md'>Sign In</button>
            <button onClick={() => navigate('/login')} className='bg-primary-container text-on-primary-container hover:bg-primary-container/90 transition-all duration-300 px-5 py-2.5 rounded-lg font-title-sm text-title-sm'>Get Started</button>
          </div>
        </div>
      </header>

      <main className='flex-grow pt-24 pb-xl px-margin md:px-xl max-w-7xl mx-auto w-full flex flex-col gap-xl'>
        <section className='relative w-full rounded-xl bg-surface-container-lowest border border-surface-variant overflow-hidden flex flex-col items-center text-center justify-center p-lg md:p-xl min-h-[500px] md:min-h-[600px] gap-lg'>
          <div className='absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none'></div>
          <div className='absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-tertiary-container/10 rounded-full blur-[100px] pointer-events-none'></div>
          <div className='relative z-10 flex flex-col items-center gap-md max-w-3xl w-full'>
            <div className='inline-flex items-center gap-sm px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant w-fit'>
              <span className='material-symbols-outlined text-[16px] text-tertiary'>favorite</span>
              <span className='font-label-caps text-label-caps text-on-surface-variant uppercase'>Volunteer Coordination</span>
            </div>
            <h1 className='font-display-lg text-display-lg text-on-surface md:text-[56px] md:leading-[64px] tracking-tight'>Connect with Causes You Care About</h1>
            <p className='font-body-md text-body-md text-on-surface-variant max-w-xl text-lg'>Easily find volunteer opportunities, coordinate events, and track your impact. The simple way to connect volunteers with organizations.</p>
            <div className='flex flex-col sm:flex-row justify-center gap-sm mt-sm'>
              <button onClick={() => navigate('/login')} className='bg-primary text-on-primary font-title-sm text-title-sm px-lg py-3 rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-sm shadow-lg shadow-primary/20'>Get Started<span className='material-symbols-outlined text-[20px]'>arrow_forward</span></button>
              <button onClick={() => navigate('/login')} className='bg-surface-container text-on-surface font-title-sm text-title-sm px-lg py-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors flex items-center justify-center gap-sm'>Learn More</button>
            </div>
          </div>
        </section>

        <section className='flex flex-col gap-lg mt-8'>
          <div className='flex flex-col gap-xs'>
            <h2 className='font-headline-md text-headline-md text-on-surface'>Volunteer Coordination Tools</h2>
            <p className='font-body-md text-body-md text-on-surface-variant'>Simple tools designed for effective community coordination.</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-md md:gap-lg auto-rows-[250px]'>
            <div className='col-span-1 md:col-span-1 md:row-span-2 bg-surface-container rounded-xl border border-surface-variant p-lg flex flex-col gap-md relative overflow-hidden group hover:border-outline transition-colors'>
              <div className='w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center relative z-10 text-primary'>
                <span className='material-symbols-outlined text-[24px]'>group</span>
              </div>
              <div className='flex flex-col gap-xs relative z-10 mt-auto'>
                <h3 className='font-title-sm text-title-sm text-on-surface'>Smart Matching</h3>
                <p className='font-body-sm text-body-sm text-on-surface-variant'>Easily align volunteer skills, availability, and location with mission requirements.</p>
              </div>
            </div>
            <div className='col-span-1 md:col-span-2 bg-surface-container rounded-xl border border-surface-variant p-lg flex flex-col md:flex-row gap-md items-center relative overflow-hidden group hover:border-outline transition-colors'>
              <div className='w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0 text-tertiary'>
                <span className='material-symbols-outlined text-[24px]'>monitoring</span>
              </div>
              <div className='flex flex-col gap-xs'>
                <h3 className='font-title-sm text-title-sm text-on-surface'>Activity Tracking</h3>
                <p className='font-body-sm text-body-sm text-on-surface-variant'>Keep track of deployment status, volunteer hours, and community impact metrics. Visualize your entire operational footprint.</p>
              </div>
              <div className='ml-auto hidden md:block opacity-10 group-hover:opacity-20 transition-opacity'>
                <span className='material-symbols-outlined text-[100px]'>insert_chart</span>
              </div>
            </div>
            <div className='col-span-1 md:col-span-2 bg-surface-container rounded-xl border border-surface-variant p-lg flex flex-col md:flex-row gap-md items-center relative overflow-hidden group hover:border-outline transition-colors'>
              <div className='w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0 text-secondary'>
                <span className='material-symbols-outlined text-[24px]'>public</span>
              </div>
              <div className='flex flex-col gap-xs z-10'>
                <h3 className='font-title-sm text-title-sm text-on-surface'>Community Scale</h3>
                <p className='font-body-sm text-body-sm text-on-surface-variant'>Built to support local community deployments, diverse teams, and organizational standards securely and simply.</p>
              </div>
              <div className='absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4'>
                <span className='material-symbols-outlined text-[180px]'>volunteer_activism</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='w-full border-t border-slate-900 bg-slate-950 font-manrope text-sm font-normal text-blue-500 dark:text-blue-400 mt-auto'>
        <div className='max-w-7xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left border-t border-slate-800/60'>
          <div className='flex flex-col gap-2'>
            <div className='text-lg font-bold text-slate-200'>VolunteerMatch</div>
            <div className='text-slate-500'>© 2026 VolunteerMatch. Volunteer Coordination.</div>
          </div>
          <div className='flex flex-wrap justify-center md:justify-end gap-6'>
            <a className='text-slate-500 hover:text-blue-400 transition-colors hover:underline underline-offset-4' href='#'>Privacy Policy</a>
            <a className='text-slate-500 hover:text-blue-400 transition-colors hover:underline underline-offset-4' href='#'>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
\;
fs.writeFileSync('backend/coordinator-dashboard/src/pages/LandingPage.js', html);