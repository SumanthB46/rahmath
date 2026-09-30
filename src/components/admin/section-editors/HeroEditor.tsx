import React, { useState } from "react";
import { Upload, Video, Image as ImageIcon, Loader2, RotateCcw, Send, Check } from "lucide-react";
import { uploadSectionImage, updateSection, revertSection } from "@/lib/api";
import { toast } from "sonner";

interface HeroEditorProps {
  section: any;
  onSaveSuccess: () => void;
  onClose: () => void;
}

export function HeroEditor({ section, onSaveSuccess, onClose }: HeroEditorProps) {
  const initial = section.draft_content || section.content || {};
  const [content, setContent] = useState<any>(() => {
    return {
      title: initial.title ?? "",
      subtitle: initial.subtitle || "",
      badge: initial.badge || "FLAGSHIP ARCHITECTURAL STUDIO",
      video_url: initial.video_url || "/assets/hero-compressed.mp4",
      poster_image: initial.poster_image || "/assets/hero_poster.webp",
      cta_text: initial.cta_text || "Explore Slabs",
      cta_link: initial.cta_link || "/products",
      secondary_cta_text: initial.secondary_cta_text || "Visit Showroom",
      secondary_cta_link: initial.secondary_cta_link || "#showroom",
    };
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "video_url" | "poster_image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadSectionImage(file);
      if (res.url) {
        setContent((prev: any) => ({ ...prev, [field]: res.url }));
        toast.success(`${field === "video_url" ? "Video" : "Poster image"} uploaded`);
      }
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publishNow: boolean) => {
    setSaving(true);
    try {
      await updateSection(section.id, {
        content,
        publishNow,
      });
      toast.success(publishNow ? "Hero section published live" : "Hero draft saved");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to save hero section", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm("Are you sure you want to revert to the previous version?")) return;
    setSaving(true);
    try {
      await revertSection(section.id);
      toast.success("Hero section reverted to previous version");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Revert failed", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block text-[11px] font-medium text-stone-400 mb-1">
          Hero Headline Title *
        </label>
        <input
          type="text"
          value={content.title}
          onChange={(e) => setContent({ ...content, title: e.target.value })}
          className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2.5 px-3.5 text-stone-100 font-serif text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Video & Media Box */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-300 flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-amber-500" />
            <span>Cinematic Background Video &amp; Poster Fallback</span>
          </span>
          {uploading && (
            <span className="text-[10.5px] text-amber-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading file...
            </span>
          )}
        </div>

        {/* Video Input + File Upload */}
        <div className="space-y-1.5">
          <label className="block text-[10.5px] font-medium text-stone-400">
            Video URL (MP4 / WebM)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={content.video_url}
              onChange={(e) => setContent({ ...content, video_url: e.target.value })}
              placeholder="https://... or /uploads/..."
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
            />
            <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5 text-amber-400" />
              <span>Upload MP4</span>
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "video_url")}
              />
            </label>
          </div>
        </div>

        {/* Poster Image Input + File Upload */}
        <div className="space-y-1.5">
          <label className="block text-[10.5px] font-medium text-stone-400">
            Fallback Poster Image (shown if video fails to load or on mobile data saver)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={content.poster_image}
              onChange={(e) => setContent({ ...content, poster_image: e.target.value })}
              placeholder="https://... or /uploads/..."
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
            />
            <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold cursor-pointer transition-colors">
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "poster_image")}
              />
            </label>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-black aspect-21/9 max-h-[140px]">
          {content.video_url ? (
            content.video_url.includes("vimeo") ? (
              <iframe
                title="vimeo-preview"
                src={content.video_url.includes("?") ? `${content.video_url}&background=1` : `${content.video_url}?background=1`}
                className="w-full h-full object-cover pointer-events-none border-0 opacity-80 scale-125"
                allow="autoplay; fullscreen"
              />
            ) : (
              <video
                src={content.video_url}
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
            )
          ) : (
            <div className="w-full h-full bg-stone-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
            <span className="text-white font-serif font-bold text-xs truncate drop-shadow-md">
              {content.title}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-stone-400">
            Primary CTA Button
          </label>
          <input
            type="text"
            value={content.cta_text}
            onChange={(e) => setContent({ ...content, cta_text: e.target.value })}
            placeholder="Explore Slabs"
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none mb-1"
          />
          <input
            type="text"
            value={content.cta_link}
            onChange={(e) => setContent({ ...content, cta_link: e.target.value })}
            placeholder="/products"
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-stone-400">
            Secondary CTA Button
          </label>
          <input
            type="text"
            value={content.secondary_cta_text}
            onChange={(e) => setContent({ ...content, secondary_cta_text: e.target.value })}
            placeholder="Visit Showroom"
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none mb-1"
          />
          <input
            type="text"
            value={content.secondary_cta_link}
            onChange={(e) => setContent({ ...content, secondary_cta_link: e.target.value })}
            placeholder="#showroom"
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Footer Controls with Draft, Publish & Revert */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-800">
        <div>
          {section.previous_content && (
            <button
              type="button"
              disabled={saving}
              onClick={handleRevert}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-300 text-xs font-semibold py-1.5 px-3 rounded-lg border border-stone-800 hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Undo / Revert Version</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-700 px-3.5 py-2 text-stone-300 hover:bg-stone-800 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold px-4 py-2"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Publish Live</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroEditor;
