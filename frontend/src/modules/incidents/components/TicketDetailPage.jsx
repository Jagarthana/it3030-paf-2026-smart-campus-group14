import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  Clock,
  User as UserIcon,
  Send,
  Pencil,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';

function nextStatusChoices(current, role, isAssignee, isAdmin) {
  if (current === 'CLOSED' || current === 'REJECTED') return [];
  if (isAdmin) {
    switch (current) {
      case 'OPEN':
        return ['IN_PROGRESS', 'REJECTED'];
      case 'IN_PROGRESS':
        return ['RESOLVED', 'REJECTED'];
      case 'RESOLVED':
        return ['CLOSED'];
      default:
        return [];
    }
  }
  if (role === 'TECHNICIAN' && isAssignee) {
    switch (current) {
      case 'OPEN':
        return ['IN_PROGRESS'];
      case 'IN_PROGRESS':
        return ['RESOLVED'];
      case 'RESOLVED':
        return ['CLOSED'];
      default:
        return [];
    }
  }
  return [];
}

const TicketDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [assignId, setAssignId] = useState('');
  const [statusTarget, setStatusTarget] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    axios
      .get(`/api/tickets/${id}`)
      .then((res) => {
        setTicket(res.data);
        setResolutionNotes(res.data.resolutionNotes || '');
      })
      .catch((err) => {
        setError(err.response?.status === 403 ? 'Not allowed to view this ticket.' : 'Ticket not found.');
        setTicket(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      axios
        .get('/api/tickets/assignable-technicians')
        .then((res) => setTechnicians(res.data))
        .catch(() => setTechnicians([]));
    }
  }, [currentUser?.role]);

  const isAssignee =
    ticket?.assignee != null &&
    currentUser != null &&
    Number(ticket.assignee.id) === Number(currentUser.id);
  const isAdmin = currentUser?.role === 'ADMIN';

  const statusOptions = useMemo(
    () =>
      ticket
        ? nextStatusChoices(ticket.status, currentUser?.role, isAssignee, isAdmin)
        : [],
    [ticket, currentUser?.role, isAssignee, isAdmin]
  );

  const canPostComment = ticket && currentUser;

  const updateStatus = async () => {
    if (!statusTarget) return;
    if (statusTarget === 'REJECTED' && !rejectReason.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`/api/tickets/${id}/status`, {
        status: statusTarget,
        reason: statusTarget === 'REJECTED' ? rejectReason.trim() : undefined,
        resolutionNotes: resolutionNotes.trim() || undefined
      });
      setStatusTarget('');
      setRejectReason('');
      load();
    } catch (e) {
      const m = e.response?.data;
      alert(typeof m === 'string' ? m : 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const assignTech = async () => {
    if (!assignId) return;
    setActionLoading(true);
    try {
      await axios.put(`/api/tickets/${id}/assign`, { technicianId: Number(assignId) });
      setAssignId('');
      load();
    } catch (e) {
      const m = e.response?.data;
      alert(typeof m === 'string' ? m : 'Assign failed');
    } finally {
      setActionLoading(false);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setActionLoading(true);
    try {
      await axios.post(`/api/tickets/${id}/comments`, { content: commentText.trim() });
      setCommentText('');
      load();
    } catch (e) {
      const m = e.response?.data;
      alert(typeof m === 'string' ? m : 'Failed to add comment');
    } finally {
      setActionLoading(false);
    }
  };

  const saveEdit = async (commentId) => {
    if (!editText.trim()) return;
    setActionLoading(true);
    try {
      await axios.put(`/api/tickets/${id}/comments/${commentId}`, { content: editText.trim() });
      setEditingId(null);
      load();
    } catch (e) {
      alert('Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/api/tickets/${id}/comments/${commentId}`);
      load();
    } catch {
      alert('Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center text-slate-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <p className="text-rose-600 font-bold mb-4">{error || 'Not found'}</p>
        <Link to="/incidents" className="text-sliit-blue font-bold">
          ← Back to incidents
        </Link>
      </div>
    );
  }

  const events = [...(ticket.statusEvents || [])].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-sliit-blue"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-extrabold text-slate-400">#{ticket.id}</p>
            <h1 className="text-2xl font-black text-slate-900">{ticket.resource?.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {ticket.category} · {ticket.priority} priority · Reporter: {ticket.reporter?.name}
            </p>
          </div>
          <span className="px-4 py-2 rounded-full text-xs font-black uppercase border bg-slate-50">{ticket.status.replace(/_/g, ' ')}</span>
        </div>
        <p className="text-slate-800 whitespace-pre-wrap font-medium border-t border-slate-100 pt-6">{ticket.description}</p>
        {ticket.rejectionReason && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-bold">
            Rejection reason: {ticket.rejectionReason}
          </div>
        )}
        {ticket.resolutionNotes && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 text-sm">
            <span className="font-black uppercase text-xs text-emerald-700">Resolution notes</span>
            <p className="mt-1 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
          </div>
        )}
        {ticket.assignee && (
          <p className="mt-4 text-sm font-bold text-slate-600 flex items-center gap-2">
            <UserIcon size={16} /> Assigned to {ticket.assignee.name}
          </p>
        )}
      </div>

      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-sliit-orange" /> Attachments
          </h2>
          <div className="flex flex-wrap gap-4">
            {ticket.attachments.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                <img src={url} alt="" className="h-32 w-auto rounded-lg border border-slate-200 object-cover hover:opacity-90" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-sliit-blue" /> Status timeline
        </h2>
        <ul className="space-y-4 border-l-2 border-slate-200 ml-2 pl-6">
          {events.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[1.4rem] top-1 w-3 h-3 rounded-full bg-sliit-orange border-2 border-white shadow" />
              <p className="text-xs font-bold text-slate-400">
                {ev.at ? format(new Date(ev.at), 'MMM d, yyyy h:mm a') : ''}
              </p>
              <p className="font-bold text-slate-800">
                {ev.fromStatus ? ev.fromStatus.replace(/_/g, ' ') : 'Start'} → {ev.toStatus.replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-slate-600">By {ev.actor?.name || '—'}</p>
              {ev.note && <p className="text-sm text-slate-500 mt-1">{ev.note}</p>}
            </li>
          ))}
        </ul>
      </div>

      {(isAdmin || (currentUser?.role === 'TECHNICIAN' && isAssignee)) && statusOptions.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
          <h2 className="font-black text-sliit-orange">Status update</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Next status</label>
              <select
                className="bg-white text-slate-900 rounded-lg px-3 py-2 font-bold border-0"
                value={statusTarget}
                onChange={(e) => setStatusTarget(e.target.value)}
              >
                <option value="">Select…</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            {statusTarget === 'REJECTED' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-400 mb-1">Reason</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-slate-900 font-medium"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Required for rejection"
                />
              </div>
            )}
            {(statusTarget === 'RESOLVED' || statusTarget === 'CLOSED') && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-400 mb-1">Resolution notes</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-slate-900 font-medium"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            )}
            <button
              type="button"
              disabled={actionLoading || !statusTarget}
              onClick={updateStatus}
              className="px-6 py-2 bg-sliit-orange font-black rounded-lg hover:bg-orange-500 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-wrap gap-4 items-end">
          <div>
            <h2 className="font-black text-slate-900 mb-2">Assign technician</h2>
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 font-bold"
              value={assignId}
              onChange={(e) => setAssignId(e.target.value)}
            >
              <option value="">Select technician…</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={actionLoading || !assignId}
            onClick={assignTech}
            className="px-6 py-2 bg-sliit-blue text-white font-black rounded-lg hover:bg-sliit-navy disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-black text-lg text-slate-900 mb-4">Comments</h2>
        {canPostComment && (
          <form onSubmit={postComment} className="flex gap-2 mb-8">
            <input
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 font-medium"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-sliit-orange text-white rounded-lg font-black flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={18} /> Post
            </button>
          </form>
        )}
        <ul className="space-y-4">
          {(ticket.comments || []).map((c) => {
            const mine =
              c.author != null &&
              currentUser != null &&
              Number(c.author.id) === Number(currentUser.id);
            return (
              <li key={c.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      {c.author?.name} · {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : ''}
                      {c.updatedAt ? ' · edited' : ''}
                    </p>
                    {editingId === c.id ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          className="flex-1 border rounded px-2 py-1 font-medium"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <button type="button" className="text-sm font-bold text-emerald-600" onClick={() => saveEdit(c.id)}>
                          Save
                        </button>
                        <button type="button" className="text-sm font-bold text-slate-500" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="mt-1 text-slate-800 whitespace-pre-wrap">{c.content}</p>
                    )}
                  </div>
                  {mine && editingId !== c.id && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        className="p-2 text-slate-500 hover:text-sliit-blue"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.content);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="p-2 text-slate-500 hover:text-rose-600" onClick={() => deleteComment(c.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TicketDetailPage;
