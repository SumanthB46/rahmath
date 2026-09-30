import React, { useState } from "react";
import { Loader2, RotateCcw, Send } from "lucide-react";
import { updateSection, revertSection } from "@/lib/api";
import { toast } from "sonner";

interface CategoryGridEditorProps {
  section: any;
  onSaveSuccess: () => void;
  onClose: () => void;
}

export function CategoryGridEditor({ section, onSaveSuccess, onClose }: CategoryGridEditorProps) {
  const initial = section.draft_content || section.content || {};
  const [content, setContent] = useState<any>(() => ({
    title: initial.title || "CATEGORY",
    badge: initial.badge || "SHOP BY",
    subtitle: initial.subtitle || "Discover our high-end collections crafted with the finest materials and attention to detail.",
    cta_text: initial.cta_text || "VIEW ALL CATEGORIES",
    cta_link: initial.cta_link || "/collections",
  }));

  const [saving, setSaving] = useState(false);

  const handleSave = async (publishNow: boolean) => {
    setSaving(true);
    try {
      await updateSection(section.id, { content, publishNow });
      toast.success(publishNow ? "Category section published live" : "Category draft saved");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to save category section", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm("Revert to previous version?")) return;
    setSaving(true);
    try {
      await revertSection(section.id);
      toast.success("Reverted to previous version");
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
            Top Eyebrow Badge
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
          Editorial Description
        </label>
        <textarea
          rows={3}
          value={content.subtitle}
          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
          className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 leading-relaxed focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">
            CTA Link Label
          </label>
          <input
            type="text"
            value={content.cta_text}
            onChange={(e) => setContent({ ...content, cta_text: e.target.value })}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">
            CTA Link URL
          </label>
          <input
            type="text"
            value={content.cta_link}
            onChange={(e) => setContent({ ...content, cta_link: e.target.value })}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
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

export default CategoryGridEditor;
