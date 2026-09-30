import React, { useState } from "react";
import { Upload, Image as ImageIcon, Loader2, RotateCcw, Send } from "lucide-react";
import { uploadSectionImage, updateSection, revertSection } from "@/lib/api";
import { toast } from "sonner";

interface TextImageEditorProps {
  section: any;
  onSaveSuccess: () => void;
  onClose: () => void;
}

export function TextImageEditor({ section, onSaveSuccess, onClose }: TextImageEditorProps) {
  const initial = section.draft_content || section.content || {};
  const [content, setContent] = useState<any>(() => ({
    title: initial.title || "",
    subtitle: initial.subtitle || "",
    badge: initial.badge || "",
    image: initial.image || "",
    cta_text: initial.cta_text || "",
    cta_link: initial.cta_link || "",
    address: initial.address || "",
    hours: initial.hours || "",
    phone: initial.phone || "",
  }));

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadSectionImage(file);
      if (res.url) {
        setContent((prev: any) => ({ ...prev, image: res.url }));
        toast.success("Image uploaded successfully");
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
      toast.success(publishNow ? "Section published live" : "Draft saved");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to save", { description: err.message });
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

  const isShowroom = section.section_key === "showroom";

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
          Description / Copy
        </label>
        <textarea
          rows={3}
          value={content.subtitle}
          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
          className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 leading-relaxed focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Image Upload Box */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-2.5">
        <label className="block text-[11px] font-semibold text-stone-300">
          Section Image / Featured Visual
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={content.image}
            onChange={(e) => setContent({ ...content, image: e.target.value })}
            placeholder="https://... or /uploads/..."
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
          />
          <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold cursor-pointer transition-colors">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-amber-400" />}
            <span>Upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {content.image && (
          <div className="relative rounded-xl overflow-hidden border border-stone-800 max-h-[140px] aspect-16/9 bg-stone-900">
            <img src={content.image} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Showroom specific fields */}
      {isShowroom && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-stone-800 bg-stone-900/40">
          <div>
            <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Showroom Address</label>
            <input
              type="text"
              value={content.address}
              onChange={(e) => setContent({ ...content, address: e.target.value })}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-1.5 px-2.5 text-stone-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Operating Hours</label>
            <input
              type="text"
              value={content.hours}
              onChange={(e) => setContent({ ...content, hours: e.target.value })}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-1.5 px-2.5 text-stone-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-medium text-stone-400 mb-1">Phone Number</label>
            <input
              type="text"
              value={content.phone}
              onChange={(e) => setContent({ ...content, phone: e.target.value })}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 py-1.5 px-2.5 text-stone-100 text-xs"
            />
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">CTA Label</label>
          <input
            type="text"
            value={content.cta_text}
            onChange={(e) => setContent({ ...content, cta_text: e.target.value })}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">CTA Target URL</label>
          <input
            type="text"
            value={content.cta_link}
            onChange={(e) => setContent({ ...content, cta_link: e.target.value })}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px]"
          />
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

export default TextImageEditor;
