import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Edit2, Trash2, LogIn, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import ResourceModal from './ResourceModal';
import BookingModal from '../../bookings/components/BookingModal';

function resourceStatusLabel(status) {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'OUT_OF_SERVICE') return 'Out of Service';
  return String(status || '').replace(/_/g, ' ');
}

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    axios
      .get(`/api/resources/${id}`)
      .then((res) => {
        setResource(res.data);
      })
      .catch(() => {
        setError('Resource not found or unavailable.');
        setResource(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const getPlaceholderImage = (type) => {
    const images = {
      LECTURE_HALL: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
      LAB: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
      MEETING_ROOM: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200',
      EQUIPMENT: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200',
    };
    return images[type] || images.LECTURE_HALL;
  };

  const handleSave = async (formData) => {
    try {
      await axios.put(`/api/resources/${resource.id}`, formData);
      setIsModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to save resource. Ensure you have Admin permissions.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Decommission this asset permanently?')) return;
    try {
      await axios.delete(`/api/resources/${resource.id}`);
      navigate('/resources');
    } catch (e) {
      console.error(e);
      alert('Delete failed.');
    }
  };

  const onBookingSuccess = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-sliit-orange rounded-full animate-spin mb-4" />
        <span className="font-bold text-sm uppercase tracking-widest">Loading resource…</span>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-slate-600 font-bold mb-6">{error || 'Not found.'}</p>
        <Link to="/resources" className="text-sliit-orange font-black hover:underline">
          Back to catalogue
        </Link>
      </div>
    );
  }

  const active = resource.status === 'ACTIVE';

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative">
      {showToast && (
        <div className="fixed top-24 right-8 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
          <CheckCircle2 size={24} />
          <div>
            <p className="font-black text-sm uppercase tracking-widest">Request sent</p>
            <p className="text-xs opacity-90 font-bold">Awaiting confirmation.</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-600 font-bold mb-8 hover:text-sliit-blue"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="relative h-72 md:h-96">
          <img
            src={resource.imageUrl || getPlaceholderImage(resource.type)}
            alt={resource.name}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute top-6 left-6 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border border-white/30 ${
              active ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {resourceStatusLabel(resource.status)}
          </div>
          {currentUser?.role === 'ADMIN' && (
            <div className="absolute top-6 right-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="p-3 bg-white/95 text-sliit-blue rounded-xl shadow-lg hover:bg-white"
                aria-label="Edit resource"
              >
                <Edit2 size={18} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-3 bg-white/95 text-rose-600 rounded-xl shadow-lg hover:bg-white"
                aria-label="Delete resource"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="p-10 md:p-12">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-black text-sliit-blue uppercase tracking-widest mb-2">
                {String(resource.type || '').replace(/_/g, ' ')}
              </p>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">{resource.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <Clock size={16} className="text-sliit-orange" />
              {resource.availableFrom && resource.availableTo
                ? `${String(resource.availableFrom).substring(0, 5)}–${String(resource.availableTo).substring(0, 5)}`
                : '24/7'}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</span>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <MapPin size={18} className="text-sliit-orange shrink-0" />
                {resource.location || '—'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Capacity</span>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Users size={18} className="text-sliit-blue shrink-0" />
                {resource.capacity ?? '0'} people
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-100">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {resourceStatusLabel(resource.status)}
            </span>
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                disabled={!active}
                className="ml-auto px-10 py-4 bg-slate-900 text-white font-black text-xs rounded-2xl hover:bg-sliit-navy disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {active ? 'Reserve' : 'Unavailable'}
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-auto inline-flex items-center gap-2 px-8 py-4 bg-sliit-orange text-white font-black text-xs rounded-2xl hover:bg-orange-600 uppercase tracking-widest"
              >
                <LogIn size={16} /> Sign in to book
              </Link>
            )}
          </div>
        </div>
      </div>

      <ResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} resource={resource} />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        resource={resource}
        onBookingSuccess={onBookingSuccess}
      />
    </div>
  );
};

export default ResourceDetailPage;
