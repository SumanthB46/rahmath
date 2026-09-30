import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Film,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminReels,
  createAdminReel,
  updateAdminReel,
  deleteAdminReel,
  uploadReelMedia,
  ReelItem,
  API_BASE_URL,
} from "@/lib/api";
import localVideo from "@/assets/npd-compressed.mp4";

export const Route = createFileRoute("/admin/reels")({
  component: AdminReelsPage,
});

type StatusFilter = "all" | "published" | "scheduled" | "draft" | "expired" | "unpublished";

export function AdminReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [counts, setCounts] = useState<any>({ all: 0, published: 0, scheduled: 0, draft: 0, expired: 0, unpublished: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal States
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [previewReel, setPreviewReel] = useState<ReelItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    category: "Showroom",
    tags: "",
    status: "published" as "published" | "draft" | "unpublished",
    publish_now: true,
    publish_at: "",
    expiry_type: "no_expiry" as "end_of_today" | "custom" | "no_expiry",
    expires_at: "",
    sort_order: 0,
  });

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReels = () => {
    setLoading(true);
    getAdminReels({
      status: activeTab !== "all" ? activeTab : undefined,
      search: search || undefined,
      category: categoryFilter !== "All" ? categoryFilter : undefined,
    })
      .then((res: any) => {
        if (res && res.success) {
          setReels(res.reels || []);
          if (res.counts) setCounts(res.counts);
        }
      })
      .catch((err: any) => {
        toast.error("Failed to load reels", { description: err.message });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReels();
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReels();
  };

  const openCreateModal = () => {
    setEditingReel(null);
    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 16);
    
    // Default End of today: 23:59
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 0, 0);
    const formattedEndOfDay = endOfDay.toISOString().slice(0, 16);

    setFormData({
      title: "",
      description: "",
      video_url: "/assets/npd-compressed.mp4",
      thumbnail_url: "/assets/marble-slabs-corner-v2.png",
      category: "Showroom",
      tags: "Showroom, Luxury, Slabs",
      status: "published",
      publish_now: true,
      publish_at: formattedNow,
      expiry_type: "no_expiry",
      expires_at: formattedEndOfDay,
      sort_order: 0,
    });
    setEditorOpen(true);
  };

  const openEditModal = (reel: ReelItem) => {
    setEditingReel(reel);

    let expiryType: "end_of_today" | "custom" | "no_expiry" = "no_expiry";
    let formattedExpires = "";

    if (reel.expires_at) {
      expiryType = "custom";
      try {
        formattedExpires = new Date(reel.expires_at).toISOString().slice(0, 16);
      } catch {}
    }

    let formattedPublish = "";
    if (reel.publish_at) {
      try {
        formattedPublish = new Date(reel.publish_at).toISOString().slice(0, 16);
      } catch {}
    }

    setFormData({
      title: reel.title || "",
      description: reel.description || "",
      video_url: reel.video_url || "",
      thumbnail_url: reel.thumbnail_url || "",
      category: reel.category || "Showroom",
      tags: Array.isArray(reel.tags) ? reel.tags.join(", ") : "",
      status: (reel.status as any) || "published",
      publish_now: !reel.publish_at || new Date(reel.publish_at) <= new Date(),
      publish_at: formattedPublish,
      expiry_type: expiryType,
      expires_at: formattedExpires,
      sort_order: reel.sort_order || 0,
    });
    setEditorOpen(true);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      toast.error("Video file too large", { description: "Please upload videos under 80MB." });
      return;
    }

    setUploadingVideo(true);
    try {
      const res = await uploadReelMedia(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, video_url: res.url }));
        toast.success("Video uploaded successfully");
      }
    } catch (err: any) {
      toast.error("Video upload failed", { description: err.message });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    try {
      const res = await uploadReelMedia(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, thumbnail_url: res.url }));
        toast.success("Thumbnail uploaded successfully");
      }
    } catch (err: any) {
      toast.error("Thumbnail upload failed", { description: err.message });
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) {
      toast.error("Title and video URL are required");
      return;
    }

    setSubmitting(true);
    try {
      let finalPublishAt = null;
      if (!formData.publish_now && formData.publish_at) {
        finalPublishAt = new Date(formData.publish_at).toISOString();
      } else if (formData.publish_now) {
        finalPublishAt = new Date().toISOString();
      }

      let finalExpiresAt: string | null = null;
      if (formData.expiry_type === "end_of_today") {
        const eod = new Date();
        eod.setHours(23, 59, 59, 999);
        finalExpiresAt = eod.toISOString();
      } else if (formData.expiry_type === "custom" && formData.expires_at) {
        finalExpiresAt = new Date(formData.expires_at).toISOString();
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url,
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.status,
        publish_at: finalPublishAt,
        expires_at: finalExpiresAt,
        expiry_preset: formData.expiry_type,
        sort_order: formData.sort_order,
      };

      if (editingReel) {
        await updateAdminReel(editingReel.id, payload);
        toast.success("Reel updated successfully");
      } else {
        await createAdminReel(payload);
        toast.success("Reel created and scheduled successfully");
      }

      setEditorOpen(false);
      fetchReels();
    } catch (err: any) {
      toast.error("Failed to save reel", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (reel: ReelItem) => {
    try {
      const nextStatus = reel.status === "published" ? "unpublished" : "published";
      await updateAdminReel(reel.id, { status: nextStatus });
      toast.success(nextStatus === "published" ? "Reel published" : "Reel unpublished");
      fetchReels();
    } catch (err: any) {
      toast.error("Status update failed", { description: err.message });
    }
  };

  const handleRepublish = async (reel: ReelItem) => {
    try {
      // Republish sets publish_at = NOW() and clears expiry
      await updateAdminReel(reel.id, {
        status: "published",
        publish_at: new Date().toISOString(),
        expires_at: null,
        expiry_preset: "no_expiry",
      });
      toast.success("Reel republished with No Expiry");
      fetchReels();
    } catch (err: any) {
      toast.error("Republish failed", { description: err.message });
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteAdminReel(id);
      toast.success("Reel permanently deleted");
      setDeleteConfirmId(null);
      fetchReels();
    } catch (err: any) {
      toast.error("Delete failed", { description: err.message });
    }
  };

  const resolveVideoUrl = (url: string) => {
    if (!url) return localVideo;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) return url;
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolveThumbUrl = (url?: string) => {
    if (!url) return "/assets/marble-slabs-corner-v2.png";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) return url;
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const renderStatusBadge = (reel: ReelItem) => {
    const dyn = reel.dynamic_status || reel.status;
    switch (dyn) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Published
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 border border-blue-500/25">
            <Clock className="h-2.5 w-2.5 text-blue-600" />
            Scheduled
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-500/30">
            <AlertCircle className="h-2.5 w-2.5 text-amber-700" />
            Auto-Expired
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-stone-200 text-stone-700">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-slate-200 text-slate-700">
            Unpublished
          </span>
        );
    }
  };

  return (
    <AdminLayout pageTitle="Video Blog / Reels CMS">
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                <Film className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-serif font-bold text-stone-900">
                Video Blog &amp; Reels System
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Publish short 9:16 vertical showroom reels with server-side scheduling and automatic time-based expiry.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Create New Reel</span>
          </button>
        </div>

        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
          {(
            [
              { key: "all", label: "All Reels", count: counts.all },
              { key: "published", label: "Published (Live)", count: counts.published },
              { key: "scheduled", label: "Scheduled", count: counts.scheduled },
              { key: "expired", label: "Auto-Expired", count: counts.expired },
              { key: "draft", label: "Drafts", count: counts.draft },
              { key: "unpublished", label: "Unpublished", count: counts.unpublished },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-amber-700 text-amber-900 font-bold bg-white"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                  activeTab === tab.key ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"
                }`}
              >
                {tab.count || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search reels by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-600"
            />
          </form>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-stone-500 font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-stone-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-600 text-stone-800"
            >
              <option value="All">All Categories</option>
              <option value="Marble">Marble</option>
              <option value="New Tiles">New Tiles</option>
              <option value="Showroom">Showroom</option>
              <option value="Collection">Collection</option>
              <option value="Slabs">Slabs</option>
            </select>
          </div>
        </div>

        {/* Reels Card Grid (9:16 Video Format) */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-mono tracking-widest uppercase">Fetching reels...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-stone-200 p-6">
            <Film className="h-10 w-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-serif text-stone-800">No reels found in this view</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Create a new reel or switch tabs to view draft, scheduled, or auto-expired videos.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Reel</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* 9:16 Video Thumbnail Container with Hover Play Trigger */}
                  <div
                    onClick={() => setPreviewReel(reel)}
                    className="relative aspect-[9/16] bg-stone-950 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={resolveThumbUrl(reel.thumbnail_url)}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Top Status & Category Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                      <span className="text-[9px] font-mono tracking-widest uppercase bg-black/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                        {reel.category || "Showroom"}
                      </span>
                      {renderStatusBadge(reel)}
                    </div>

                    {/* Play Button Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-stone-950 transition-all shadow-lg">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Metadata inside thumbnail */}
                    <div className="absolute bottom-2.5 inset-x-2.5 z-10 text-white text-left">
                      <p className="text-xs font-serif font-medium leading-snug line-clamp-2">
                        {reel.title}
                      </p>
                      <div className="flex items-center gap-3 text-[9.5px] font-mono text-stone-300 mt-1">
                        <span>{reel.views_count || 0} views</span>
                        <span>•</span>
                        <span>{reel.likes_count || 0} likes</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Scheduling Info */}
                  <div className="p-3.5 space-y-2.5 text-left border-t border-stone-100">
                    {/* Publishing & Expiry Dates */}
                    <div className="space-y-1 text-[11px] font-mono text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Publish:</span>
                        <span className="font-semibold text-stone-800">
                          {reel.publish_at
                            ? new Date(reel.publish_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Immediate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Expiry:</span>
                        <span
                          className={`font-semibold ${
                            reel.expires_at
                              ? new Date(reel.expires_at) <= new Date()
                                ? "text-amber-800"
                                : "text-emerald-700"
                              : "text-stone-500"
                          }`}
                        >
                          {reel.expires_at
                            ? new Date(reel.expires_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "No Expiry"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-stone-50/70 border-t border-stone-200/70 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewReel(reel)}
                      title="Preview Reel"
                      className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(reel)}
                      title="Edit Reel"
                      className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(reel.id)}
                      title="Delete Reel"
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Contextual Action Button: Republish, Unpublish, or Publish */}
                  {reel.dynamic_status === "expired" ? (
                    <button
                      onClick={() => handleRepublish(reel)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-[10.5px] font-mono uppercase font-semibold transition-colors"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      <span>Republish</span>
                    </button>
                  ) : reel.status === "published" ? (
                    <button
                      onClick={() => handleTogglePublish(reel)}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 text-[10.5px] font-mono uppercase font-medium transition-colors"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTogglePublish(reel)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-mono uppercase font-semibold transition-colors"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT REEL MODAL */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  {editingReel ? "Edit Video Reel" : "Create New Video Reel"}
                </h2>
                <p className="text-xs text-stone-500">
                  Configure vertical video content, timing, and automatic expiry conditions.
                </p>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReel} className="p-6 space-y-5 text-left text-xs text-stone-800 max-h-[75vh] overflow-y-auto">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-stone-700 block">
                    Reel Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latest Italian Marble Slabs"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 bg-white"
                  >
                    <option value="Marble">Marble</option>
                    <option value="New Tiles">New Tiles</option>
                    <option value="Showroom">Showroom</option>
                    <option value="Collection">Collection</option>
                    <option value="Slabs">Slabs</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe slab dimensions, bookmatching details, or showroom installation notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700"
                />
              </div>

              {/* Video Upload & URL */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <Film className="h-4 w-4 text-amber-800" />
                    <span>Vertical Video Source (9:16)</span>
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10.5px] uppercase font-semibold">
                    <Upload className="h-3 w-3" />
                    <span>{uploadingVideo ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Video URL or uploaded path (e.g. /assets/npd-compressed.mp4)"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 font-mono text-[11px]"
                />
                <p className="text-[10px] text-stone-400">
                  Tip: Supports direct MP4/WebM uploads or local assets like /assets/npd-compressed.mp4.
                </p>
              </div>

              {/* Thumbnail / Cover Image */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-800">Cover Thumbnail (Optional)</label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-mono text-[10.5px] uppercase font-semibold">
                    <Upload className="h-3 w-3" />
                    <span>{uploadingThumb ? "Uploading..." : "Upload Cover"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbUpload}
                      disabled={uploadingThumb}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Image URL or uploaded path (e.g. /assets/marble-slabs-corner-v2.png)"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 font-mono text-[11px]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Marble, Italian, Slabs, Villa"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700"
                />
              </div>

              {/* PUBLISH SCHEDULE SECTION */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <label className="font-bold text-stone-900 font-serif text-sm block">
                  Publishing Schedule
                </label>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="publish_timing"
                      checked={formData.publish_now}
                      onChange={() => setFormData({ ...formData, publish_now: true })}
                      className="accent-amber-700"
                    />
                    <span>Publish Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="publish_timing"
                      checked={!formData.publish_now}
                      onChange={() => setFormData({ ...formData, publish_now: false })}
                      className="accent-amber-700"
                    />
                    <span>Schedule for Later</span>
                  </label>
                </div>

                {!formData.publish_now && (
                  <div className="pt-2">
                    <label className="text-stone-500 font-mono text-[11px] block mb-1">
                      Select Date &amp; Time to Go Live:
                    </label>
                    <input
                      type="datetime-local"
                      required={!formData.publish_now}
                      value={formData.publish_at}
                      onChange={(e) => setFormData({ ...formData, publish_at: e.target.value })}
                      className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {/* AUTOMATIC EXPIRY SECTION (Requested 3 Exact Modes) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-900 font-serif text-sm block">
                    Automatic Expiry Policy
                  </label>
                  <span className="text-[10px] text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                    Server-Side Enforced
                  </span>
                </div>

                <p className="text-[11px] text-stone-500">
                  When the expiry deadline is reached, this video will automatically disappear from the website without requiring manual deletion.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Option 1: End of Today */}
                  <div
                    onClick={() => setFormData({ ...formData, expiry_type: "end_of_today" })}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.expiry_type === "end_of_today"
                        ? "border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-xs"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <p className="font-medium text-xs">End of Today</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Today at 11:59 PM</p>
                  </div>

                  {/* Option 2: Custom Expiry */}
                  <div
                    onClick={() => setFormData({ ...formData, expiry_type: "custom" })}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.expiry_type === "custom"
                        ? "border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-xs"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <p className="font-medium text-xs">Custom Expiry</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Specific date &amp; time</p>
                  </div>

                  {/* Option 3: No Expiry */}
                  <div
                    onClick={() => setFormData({ ...formData, expiry_type: "no_expiry" })}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.expiry_type === "no_expiry"
                        ? "border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-xs"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <p className="font-medium text-xs">No Expiry</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Always visible</p>
                  </div>
                </div>

                {formData.expiry_type === "custom" && (
                  <div className="pt-2">
                    <label className="text-stone-500 font-mono text-[11px] block mb-1">
                      Choose Expiry Date &amp; Time:
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-medium text-stone-800">Initial Content Status</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold focus:outline-none focus:border-amber-700"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>

              {/* Modal Submit Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 font-semibold text-stone-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-semibold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting ? "Saving..." : editingReel ? "Update Reel" : "Create & Schedule Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {previewReel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-[360px] h-[80vh] max-h-[640px] rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col justify-between">
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors z-30 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <video
              src={resolveVideoUrl(previewReel.video_url)}
              autoPlay
              loop
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute top-3 left-3 z-20">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-black/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                {previewReel.category || "Showroom"}
              </span>
            </div>

            <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-left text-white mt-auto space-y-1">
              <h3 className="text-sm font-serif font-medium">{previewReel.title}</h3>
              {previewReel.description && (
                <p className="text-[10px] text-stone-300 line-clamp-2">{previewReel.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-stone-200">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Permanently Delete Reel?</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                This will completely remove the video reel and all engagement metrics from the database.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminReelsPage;
