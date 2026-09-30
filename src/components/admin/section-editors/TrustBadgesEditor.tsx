import React, { useState } from "react";
import { Loader2, RotateCcw, Send, Plus, Trash2 } from "lucide-react";
import { updateSection, revertSection } from "@/lib/api";
import { toast } from "sonner";

interface TrustBadgesEditorProps {
  section: any;
  onSaveSuccess: () => void;
  onClose: () => void;
}

export function TrustBadgesEditor({ section, onSaveSuccess, onClose }: TrustBadgesEditorProps) {
  const initial = section.draft_content || section.content || {};
  const [content, setContent] = useState<any>(() => ({
    badge: initial.badge || "TRUST & RELIABILITY",
    pillars: initial.pillars || [
      { title: "25+ Years Legacy", subtitle: "Established in 2001", description: "Supplying luxury residences, villas & commercial landmarks." },
      { title: "100% Certified Grade", subtitle: "Zero Warp & Imperfection", description: "Strict quality-tested European & Indian porcelain slabs." },
      { title: "10M+ Sq.Ft Delivered", subtitle: "All India Network", description: "Trusted by top architects & luxury interior designers." },
      { title: "Insured Consignments", subtitle: "Porter & VRL Cargo", description: "Zero-breakage transit guarantee with separate logistics." },
    ],
  }));

  const [saving, setSaving] = useState(false);

  const handlePillarChange = (idx: number, field: string, val: string) => {
    const updated = [...content.pillars];
    updated[idx] = { ...updated[idx], [field]: val };
    setContent({ ...content, pillars: updated });
  };

  const handleSave = async (publishNow: boolean) => {
    setSaving(true);
    try {
      await updateSection(section.id, { content, publishNow });
      toast.success(publishNow ? "Trust badges published live" : "Draft saved");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to save trust badges", { description: err.message });
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
      <div>
        <label className="block text-[11px] font-medium text-stone-400 mb-1">
          Top Eyebrow Badge
        </label>
        <input
          type="text"
          value={content.badge}
          onChange={(e) => setContent({ ...content, badge: e.target.value })}
          className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2 px-3 text-stone-100 font-mono text-[11px]"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-semibold text-stone-300">
          Trust Metric Pillars ({content.pillars.length})
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.pillars.map((pillar: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-500 font-semibold">
                <span>Pillar #{idx + 1}</span>
              </div>
              <input
                type="text"
                value={pillar.title}
                onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                placeholder="Title (e.g. 25+ Years Legacy)"
                className="w-full rounded-lg border border-stone-700 bg-stone-900 py-1.5 px-2.5 text-stone-100 text-xs font-semibold"
              />
              <input
                type="text"
                value={pillar.subtitle}
                onChange={(e) => handlePillarChange(idx, "subtitle", e.target.value)}
                placeholder="Subtitle (e.g. Established in 2001)"
                className="w-full rounded-lg border border-stone-700 bg-stone-900 py-1.5 px-2.5 text-stone-100 text-xs"
              />
              <textarea
                rows={2}
                value={pillar.description}
                onChange={(e) => handlePillarChange(idx, "description", e.target.value)}
                placeholder="Description copy..."
                className="w-full rounded-lg border border-stone-700 bg-stone-900 py-1.5 px-2.5 text-stone-100 text-[11px]"
              />
            </div>
          ))}
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

export default TrustBadgesEditor;
