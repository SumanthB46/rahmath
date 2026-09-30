import React, { useState } from "react";
import { Upload, Video, Image as ImageIcon, Loader2, RotateCcw, Send } from "lucide-react";
import { uploadSectionImage, updateSection, revertSection } from "@/lib/api";
import { toast } from "sonner";

interface VideoShowcaseEditorProps {
  section: any;
  onSaveSuccess: () => void;
  onClose: () => void;
}

export function VideoShowcaseEditor({ section, onSaveSuccess, onClose }: VideoShowcaseEditorProps) {
  const initial = section.draft_content || section.content || {};
  const [content, setContent] = useState<any>(() => ({
    title: initial.title || "Step Inside Our Studio",
    subtitle: initial.subtitle || "Watch full walkthroughs of raw stone slabs, bookmatched backdrops, and illuminated surfaces.",
    badge: initial.badge || "IMMERSIVE EXPERIENCE",
    video_url: initial.video_url || "/assets/npd-compressed.mp4",
    poster_image: initial.poster_image || "",
  }));

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
        toast.success("File uploaded successfully");
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
      await updateSection(section.id, { content, publishNow });
      toast.success(publishNow ? "Video showcase published live" : "Draft saved");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to save video showcase", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm("Revert to previous version?")) return;
    setSaving(true);
    try {
      await revertSection(section.id);
      toast.success("Reverted successfully");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">
            Section Title *
          </label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-serif focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">
            Eyebrow Badge
          </label>
          <input
            type="text"
            value={content.badge}
            onChange={(e) => setContent({ ...content, badge: e.target.value })}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-stone-400 mb-1">
          Subtitle Copy
        </label>
        <textarea
          rows={2}
          value={content.subtitle}
          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
          className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 leading-relaxed focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Video & Poster Inputs */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-3">
        <div>
          <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Video Stream URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={content.video_url}
              onChange={(e) => setContent({ ...content, video_url: e.target.value })}
              placeholder="https://... or /assets/..."
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px]"
            />
            <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-amber-400" />
              <span>Upload Video</span>
              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, "video_url")} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Fallback Poster Image</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={content.poster_image}
              onChange={(e) => setContent({ ...content, poster_image: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px]"
            />
            <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold cursor-pointer">
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Upload Poster</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "poster_image")} />
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
              {content.title || "Video Showcase"}
            </span>
          </div>
        </div>
      </div>

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
              <span>Undo Revert</span>
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

export default VideoShowcaseEditor;
