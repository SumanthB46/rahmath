import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  FileText,
  Save,
  X,
  Send,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inquiries")({
  head: () => ({
    meta: [{ title: "Inquiries & Project Leads — Mubarak Admin" }],
  }),
  component: AdminInquiriesPage,
});

const STATUS_OPTIONS = [
  { id: "all", label: "All Leads" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "in_progress", label: "In Discussion" },
  { id: "converted", label: "Converted / Closed" },
  { id: "archived", label: "Archived" },
];

interface InquiryItem {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  project_type?: string | null;
  message?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Notes & Status Modal
  const [editingInquiry, setEditingInquiry] = useState<InquiryItem | null>(null);
  const [editStatus, setEditStatus] = useState("new");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getInquiries();
      if (res.inquiries) {
        setInquiries(res.inquiries);
      }
    } catch (err: any) {
      toast.error("Failed to load inquiries", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.admin.updateInquiry(id, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      toast.success("Lead status updated");
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message });
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;
    setSaving(true);
    try {
      await api.admin.updateInquiry(editingInquiry.id, {
        status: editStatus,
        notes: editNotes,
      });
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === editingInquiry.id
            ? { ...inq, status: editStatus, notes: editNotes }
            : inq
        )
      );
      toast.success("Inquiry notes saved");
      setEditingInquiry(null);
    } catch (err: any) {
      toast.error("Failed to save notes", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this inquiry record?")) return;
    try {
      await api.admin.deleteInquiry(id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      toast.success("Inquiry deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete inquiry", { description: err.message });
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.phone && inq.phone.toLowerCase().includes(q)) ||
      (inq.project_type && inq.project_type.toLowerCase().includes(q)) ||
      (inq.message && inq.message.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout pageTitle="Inquiries & Project Leads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100">
              Inquiries &amp; Project Leads ({inquiries.length})
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Customer inquiries, architectural project consultation requests, and quotes.
            </p>
          </div>
          <button
            onClick={loadInquiries}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Leads</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-amber-600 text-stone-950 shadow-sm"
                    : "bg-[#161513] text-stone-400 border border-stone-800 hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#161513] border border-stone-800 p-2 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search leads by name, email, phone, or requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2 pl-10 pr-3.5 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="rounded-2xl border border-stone-800 bg-[#161513] overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs text-stone-400 font-mono">Loading Inquiries...</span>
              </div>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <MessageSquare className="mx-auto h-10 w-10 text-stone-600" />
              <div className="text-sm font-semibold text-stone-300">No inquiries found</div>
              <p className="text-xs text-stone-500">
                There are no customer inquiries matching the selected filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-400">
                    <th className="py-3.5 px-4 font-semibold">Lead Contact</th>
                    <th className="py-3.5 px-4 font-semibold">Project Type</th>
                    <th className="py-3.5 px-4 font-semibold">Message &amp; Requirements</th>
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="group hover:bg-stone-900/40 transition-colors">
                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-100 text-sm">{inq.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                          <Mail className="h-3 w-3 text-stone-500 shrink-0" />
                          <span>{inq.email}</span>
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                            <Phone className="h-3 w-3 text-stone-500 shrink-0" />
                            <span>{inq.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Project Type */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-lg bg-stone-800/80 border border-stone-700/80 px-2 py-0.5 text-[11px] text-stone-300 font-medium capitalize">
                          {inq.project_type || "General Inquiry"}
                        </span>
                      </td>

                      {/* Message & Internal Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-stone-300 line-clamp-2 leading-relaxed">
                          {inq.message || <span className="text-stone-500 italic">No message provided.</span>}
                        </p>
                        {inq.notes && (
                          <div className="mt-1.5 text-[10.5px] text-amber-400/90 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded inline-block truncate max-w-full">
                            <strong>Note:</strong> {inq.notes}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-stone-400">
                        <div>{new Date(inq.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {new Date(inq.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={inq.status || "new"}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                          className={`rounded-lg py-1 px-2 text-[11px] font-semibold capitalize border focus:outline-none ${
                            inq.status === "converted"
                              ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
                              : inq.status === "in_progress"
                              ? "bg-blue-950/70 border-blue-800 text-blue-300"
                              : inq.status === "contacted"
                              ? "bg-amber-950/70 border-amber-800 text-amber-300"
                              : inq.status === "archived"
                              ? "bg-stone-900 border-stone-800 text-stone-500"
                              : "bg-purple-950/70 border-purple-800 text-purple-300"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Discussion</option>
                          <option value="converted">Converted</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingInquiry(inq);
                              setEditStatus(inq.status || "new");
                              setEditNotes(inq.notes || "");
                            }}
                            className="rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1 text-xs font-medium transition-colors"
                          >
                            Remarks / Notes
                          </button>
                          <button
                            onClick={() => handleDelete(inq.id)}
                            className="rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 p-1.5 transition-colors border border-red-900/40"
                            title="Delete inquiry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT NOTES & STATUS MODAL */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#161513] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Lead Remarks: {editingInquiry.name}</span>
              </h3>
              <button
                onClick={() => setEditingInquiry(null)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Lead Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 capitalize focus:border-amber-500 focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Discussion</option>
                  <option value="converted">Converted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Staff Notes &amp; Follow-up Actions
                </label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record customer preferences, quotation details, site visit date, or assigned designer..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="rounded-xl border border-stone-700 px-3.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-1.5 text-xs shadow-md transition-all active:scale-95"
                >
                  Save Remarks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
