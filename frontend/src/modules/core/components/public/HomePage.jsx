import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Monitor, ArrowRight, Activity, MapPin, Users, LayoutGrid } from 'lucide-react';

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Fetch public dynamic facilities catalogue
    axios.get('/api/resources')
      .then(res => {
        setFacilities(res.data);
      })
      .catch(err => console.error("Could not fetch public facilities", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-in fade-in duration-700">
      {/* Navbar Overlay Base */}
      <nav className="bg-sliit-navy border-b border-white/10 px-8 py-4 flex justify-between items-center text-white relative z-20 shadow-md">
        <div className="font-extrabold text-2xl tracking-tight flex items-center gap-2">
          <span className="text-sliit-orange">SLIIT</span> Courseweb Hub
        </div>
        <div className="flex items-center gap-6">
           <Link to="/resources" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Browse Resources</Link>
           {currentUser ? (
              <Link to="/dashboard" className="text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors">Go to Dashboard</Link>
           ) : (
              <Link to="/login" className="text-sm font-bold bg-sliit-orange hover:bg-orange-600 px-6 py-2 rounded shadow-lg transition-colors">Sign In</Link>
           )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-sliit-navy text-white relative overflow-hidden py-32 px-8 border-b-8 border-sliit-orange">
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="bg-orange-500/20 text-sliit-orange font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase mb-8 inline-block border border-sliit-orange/50 shadow-sm shadow-orange-500/10 active:scale-95 transition-transform cursor-default">
              SLIIT Enterprise Operations Hub
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Seamless Campus <br/><span className="text-sliit-orange">Infrastructure.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-xl leading-relaxed font-medium">
              The smart gateway for University facilities. Discover lecture halls, book advanced computing labs, and report incidents in real-time through our premium enterprise portal.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link to="/resources" className="bg-sliit-orange hover:bg-orange-500 text-white font-black py-5 px-10 rounded-2xl shadow-2xl shadow-orange-500/25 flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 group">
                Explore Catalogue <LayoutGrid className="w-5 h-5 transition-transform group-hover:rotate-12"/>
              </Link>
              {!currentUser && (
                <Link to="/register" className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-black py-5 px-10 rounded-2xl flex items-center gap-2 transition-all backdrop-blur-sm active:scale-95">
                  Student Enrollment
                </Link>
              )}
            </div>
          </div>

          {/* Visual Terminal Widget */}
          <div className="hidden md:flex justify-end p-8" style={{ perspective: '2000px' }}>
             <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-md transform transition-all duration-700 hover:rotate-0" style={{ transform: 'rotateY(-15deg) rotateX(10deg)' }}>
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                  </div>
                  <span className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] ml-4">System Console v4.2.0</span>
                </div>
                <div className="space-y-6 font-mono text-sm">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-emerald-400 font-bold tracking-tight">&gt; Operational Matrix</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black">ACTIVE</span>
                  </div>
                  <div className="flex justify-between text-blue-400 px-2 group">
                    <span className="flex items-center gap-2">
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> 
                      Loaded Facilities
                    </span> 
                    <span className="font-black">{loading ? '...' : facilities.length}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 px-2">
                    <span>&gt; API Connectivity</span> 
                    <span className="font-black">STABLE</span>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 text-slate-500 italic text-[11px] flex items-center gap-3">
                     <div className="w-2 h-4 bg-sliit-orange animate-pulse"></div> Awaiting payload...
                  </div>
                </div>
             </div>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sliit-orange/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sliit-blue/20 rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      {/* Dynamic Catalogue Preview */}
      <section className="max-w-7xl mx-auto py-32 px-8 w-full z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 px-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">University Infrastructure</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Explore the SLIIT campus asset catalogue. From high-performance computing labs to standard lecture halls, all resources are tracked with real-time availability.
            </p>
          </div>
          <Link to="/resources" className="flex items-center gap-3 text-sliit-blue font-black hover:gap-5 transition-all group pb-2 border-b-2 border-transparent hover:border-sliit-blue">
            Launch Full Explorer <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-sliit-orange rounded-full animate-spin"></div>
            <span className="font-black uppercase tracking-widest text-xs text-slate-300">Synchronizing Live Data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {facilities.length > 0 ? facilities.slice(0, 6).map(fac => (
              <div key={fac.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-orange-500/20 transition-all group flex flex-col h-full active:scale-[0.98]">
                <div className={`h-2.5 w-full transition-all group-hover:h-4 ${fac.type === 'LAB' ? 'bg-sliit-blue' : fac.type === 'LECTURE_HALL' ? 'bg-sliit-orange' : 'bg-slate-800'}`}></div>
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-sliit-blue transition-colors leading-tight">{fac.name}</h3>
                    <span className={`px-4 py-1.5 text-[9px] uppercase tracking-widest font-black rounded-full shadow-sm border ${fac.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {fac.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center text-slate-500 text-sm font-bold bg-slate-50 p-4 rounded-2xl group-hover:bg-slate-100/80 transition-colors">
                      <MapPin className="w-5 h-5 mr-4 text-sliit-orange" /> {fac.location || 'Distributed'}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm font-bold bg-slate-50 p-4 rounded-2xl group-hover:bg-slate-100/80 transition-colors">
                      <Users className="w-5 h-5 mr-4 text-sliit-blue" /> {fac.capacity || 'N/A'} Seats Available
                    </div>
                  </div>
                  <Link to="/resources" className="block w-full text-center py-4 bg-slate-900 hover:bg-sliit-navy text-white font-black rounded-xl transition-all shadow-lg shadow-slate-900/20 transform group-hover:-translate-y-1">
                    Book & Request
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-4 border-slate-100 border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
                  <Monitor size={40} />
                </div>
                <p className="text-slate-800 font-black text-xl mb-3 uppercase tracking-tight">Catalogue Offline</p>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">No operational assets were found. Please verify backend connectivity.</p>
              </div>
            )}
          </div>
        )}
      </section>
      
      {/* Premium Footer */}
      <footer className="bg-sliit-navy text-slate-400 py-16 text-center mt-auto border-t-8 border-sliit-orange z-10 relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="font-black text-2xl text-white mb-6 tracking-tighter">
            <span className="text-sliit-orange">SLIIT</span> HUB
          </div>
          <p className="font-bold text-sm mb-4">Developed for Campus Operations & Resource Optimization.</p>
          <p className="text-[11px] opacity-40 uppercase tracking-[0.3em] font-black">© {new Date().getFullYear()} Sri Lanka Institute of Information Technology</p>
        </div>
      </footer>
    </div>
  );
}
