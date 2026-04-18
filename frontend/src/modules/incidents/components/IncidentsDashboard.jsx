import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import { AlertTriangle, MessageSquare, Image as ImageIcon, Paperclip, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { Link } from 'react-router-dom';

const IncidentsDashboard = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    resourceId: '',
    category: 'Hardware',
    priority: 'MEDIUM',
    description: '',
    files: []
  });

  useEffect(() => {
    axios.get('/api/resources').then((res) => setResources(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchTickets();
  }, [currentUser?.role]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const endpoint =
        currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN'
          ? '/api/tickets'
          : '/api/tickets/my';
      const res = await axios.get(endpoint);
      let list = res.data;
      if (currentUser?.role === 'TECHNICIAN') {
        const uid = Number(currentUser.id);
        list = list.filter(
          (t) => !t.assignee || Number(t.assignee.id) === uid
        );
      }
      setTickets(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const next = [...form.files, ...picked].slice(0, 3);
    setForm({ ...form, files: next });
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setForm({ ...form, files: form.files.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.resourceId || !form.description.trim()) {
      setFormError('Select a resource and describe the issue.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        resourceId: Number(form.resourceId),
        category: form.category,
        priority: form.priority,
        description: form.description.trim()
      };
      const res = await axios.post('/api/tickets', payload);
      const ticketId = res.data.id;
      if (form.files.length > 0) {
        const fd = new FormData();
        form.files.forEach((f) => fd.append('files', f));
        await axios.post(`/api/tickets/${ticketId}/attachments`, fd);
      }
      setForm({
        resourceId: '',
        category: 'Hardware',
        priority: 'MEDIUM',
        description: '',
        files: []
      });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      const msg = err.response?.data;
      setFormError(typeof msg === 'string' ? msg : 'Could not submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'IN_PROGRESS':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'RESOLVED':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'CLOSED':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'REJECTED':
        return 'text-rose-700 bg-rose-100 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      <div className={`w-full md:w-1/3 transition-all ${showForm ? 'block' : 'hidden md:block'}`}>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
          <h2 className="text-xl font-extrabold text-sliit-blue mb-6 flex items-center gap-2">
            <AlertTriangle className="text-sliit-orange" /> Report incident
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {formError && (
              <div className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3">{formError}</div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Resource / location</label>
              <select
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-sliit-orange focus:border-sliit-orange p-2.5 border font-bold"
                value={form.resourceId}
                onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
                required
              >
                <option value="">Select resource…</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-sliit-orange focus:border-sliit-orange p-2.5 border font-bold"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Facility">Facility</option>
                  <option value="Network">Network</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                <select
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-sliit-orange focus:border-sliit-orange p-2.5 border font-bold"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows="4"
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-sliit-orange focus:border-sliit-orange p-2.5 border font-bold"
                placeholder="Describe the issue in detail…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Images (max 3)</label>
              <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} disabled={form.files.length >= 3} />
                <ImageIcon className="mb-2 text-slate-400" size={24} />
                <span className="text-sm font-bold">Add images ({form.files.length}/3)</span>
              </label>
              <ul className="mt-2 space-y-1">
                {form.files.map((f, i) => (
                  <li key={i} className="flex justify-between text-sm font-medium text-slate-600">
                    <span className="truncate">{f.name}</span>
                    <button type="button" className="text-rose-600 font-bold" onClick={() => removeFile(i)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sliit-orange text-white font-extrabold rounded-lg hover:bg-orange-600 transition-colors shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
              Submit ticket
            </button>
          </form>
        </div>
      </div>

      <div className="w-full md:w-2/3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Incident tracker</h1>
          <button
            type="button"
            className="md:hidden px-4 py-2 bg-sliit-navy text-white font-bold rounded-lg hover:bg-sliit-blue transition-colors"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'View tickets' : '+ Report'}
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-lg animate-pulse">Loading tickets…</div>
        ) : (
          <div className="space-y-6">
            {tickets.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
                No tickets yet.
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-extrabold text-slate-400">#{ticket.id}</span>
                        <h3 className="text-xl font-bold text-slate-900">{ticket.resource?.name || 'Resource'}</h3>
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        Reported by {ticket.reporter?.name || '—'} on{' '}
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') : '—'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full border shadow-sm ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded shadow-sm border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} priority
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 mb-4 whitespace-pre-wrap font-medium line-clamp-4">
                    {ticket.description}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-sliit-orange" /> {ticket.comments?.length ?? 0} comments
                      </span>
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Paperclip size={16} className="text-slate-400" /> {ticket.attachments.length} files
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/incidents/${ticket.id}`}
                      className="px-4 py-2 text-sliit-blue bg-slate-100 font-extrabold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsDashboard;
