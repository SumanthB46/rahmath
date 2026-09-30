import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Video,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  X,
  Loader2,
  Layers,
  Sparkles,
  AlertCircle,
  FileEdit,
  History,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminSections, updateSection, reorderSections } from "@/lib/api";
import { toast } from "sonner";

// Import specialized section editors
import { HeroEditor } from "@/components/admin/section-editors/HeroEditor";
import { CategoryGridEditor } from "@/components/admin/section-editors/CategoryGridEditor";
import { TextImageEditor } from "@/components/admin/section-editors/TextImageEditor";
import { TrustBadgesEditor } from "@/components/admin/section-editors/TrustBadgesEditor";
import { ProcessEditor } from "@/components/admin/section-editors/ProcessEditor";
import { VideoShowcaseEditor } from "@/components/admin/section-editors/VideoShowcaseEditor";
import { TestimonialsEditor } from "@/components/admin/section-editors/TestimonialsEditor";
import { FaqEditor } from "@/components/admin/section-editors/FaqEditor";
import { FeaturedTilesEditor } from "@/components/admin/section-editors/FeaturedTilesEditor";

export const Route = createFileRoute("/admin/homepage")({
  head: () => ({
    meta: [{ title: "Homepage CMS & Section Editor — Mubarak Admin" }],
  }),
  component: AdminHomepageCMSPage,
});

function AdminHomepageCMSPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEditorSection, setActiveEditorSection] = useState<any | null>(null);

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await getAdminSections("home");
      if (res.sections) {
        setSections(res.sections);
      }
    } catch (err: any) {
      toast.error("Failed to load sections", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Quick Visibility Toggle with Guard-rail (At least 1 visible)
  const handleToggleVisibility = async (section: any) => {
    const visibleCount = sections.filter((s) => s.is_visible).length;
    if (section.is_visible && visibleCount <= 1) {
      toast.error("Action blocked: At least one section must remain visible on the homepage.");
      return;
    }

    const newStatus = !section.is_visible;
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, is_visible: newStatus } : s))
    );

    try {
      await updateSection(section.id, { is_visible: newStatus });
      toast.success(`${section.name} is now ${newStatus ? "Visible" : "Hidden"} on Homepage`);
    } catch (err: any) {
      toast.error("Failed to toggle visibility", { description: err.message });
      loadSections();
    }
  };

  // Move Section Up/Down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const itemsToSave = newSections.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
    }));

    setSections(newSections.map((s, idx) => ({ ...s, sort_order: idx + 1 })));

    try {
      await reorderSections(itemsToSave);
      toast.success("Homepage section order updated");
    } catch (err: any) {
      toast.error("Failed to reorder", { description: err.message });
      loadSections();
    }
  };

  // Render Specialized Editor in Modal
  const renderEditorContent = () => {
    if (!activeEditorSection) return null;

    const props = {
      section: activeEditorSection,
      onSaveSuccess: loadSections,
      onClose: () => setActiveEditorSection(null),
    };

    switch (activeEditorSection.section_type) {
      case "hero":
        return <HeroEditor {...props} />;
      case "category_grid":
        return <CategoryGridEditor {...props} />;
      case "featured_grid":
      case "bestsellers_grid":
        return <FeaturedTilesEditor {...props} />;
      case "trust_badges":
        return <TrustBadgesEditor {...props} />;
      case "process_steps":
        return <ProcessEditor {...props} />;
      case "video_showcase":
        return <VideoShowcaseEditor {...props} />;
      case "testimonials_grid":
        return <TestimonialsEditor {...props} />;
      case "faq_accordion":
        return <FaqEditor {...props} />;
      case "showroom_info":
      case "contact_form":
      case "text_image":
      default:
        if (
          activeEditorSection.section_key === "featured_tiles" ||
          activeEditorSection.section_key === "best_sellers"
        ) {
          return <FeaturedTilesEditor {...props} />;
        }
        return <TextImageEditor {...props} />;
    }
  };

  return (
    <AdminLayout pageTitle="Homepage CMS &amp; Section Editor">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-100 flex items-center gap-2.5">
              <LayoutGrid className="h-6 w-6 text-amber-500" />
              <span>Homepage Section Manager ({sections.length})</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Live database-driven CMS: edit headlines, upload videos/images, reorder sections, and toggle visibility.
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900/80 hover:bg-stone-800 text-stone-300 px-3.5 py-2 text-xs font-semibold transition-all shadow-xs"
          >
            <span>View Live Site</span>
            <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
          </a>
        </div>

        {/* Section List */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-stone-800 bg-[#161513]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <span className="text-xs text-stone-400 font-mono">Loading Homepage Structure...</span>
            </div>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-stone-800 bg-[#161513]">
            <LayoutGrid className="mx-auto h-10 w-10 text-stone-600" />
            <div className="text-sm font-semibold text-stone-300">No sections found.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => {
              const hasDraft =
                section.draft_content &&
                JSON.stringify(section.draft_content) !== JSON.stringify(section.content);

              return (
                <div
                  key={section.id}
                  className={`rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                    section.is_visible
                      ? "border-stone-800 bg-[#161513] hover:border-stone-700"
                      : "border-stone-800/50 bg-[#131211]/60 opacity-60"
                  }`}
                >
                  {/* Left Column */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-stone-800 border border-stone-700/80 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="h-14 w-20 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                      {section.content?.image || section.content?.poster_image ? (
                        <img
                          src={section.content.image || section.content.poster_image}
                          alt={section.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : section.content?.video_url ? (
                        <Video className="h-6 w-6 text-amber-500" />
                      ) : (
                        <Layers className="h-6 w-6 text-stone-600" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-stone-100 truncate">
                          {section.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700/60">
                          {section.section_key}
                        </span>
                        {section.content?.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {section.content.badge}
                          </span>
                        )}
                        {hasDraft && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50 flex items-center gap-1">
                            <FileEdit className="h-2.5 w-2.5" /> DRAFT
                          </span>
                        )}
                        {!section.is_visible && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/40">
                            HIDDEN
                          </span>
                        )}
                      </div>

                      {section.content?.title && (
                        <p className="text-xs text-amber-200/90 font-serif font-medium truncate">
                          "{section.content.title}"
                        </p>
                      )}

                      {section.content?.subtitle && (
                        <p className="text-[11px] text-stone-400 line-clamp-1">
                          {section.content.subtitle}
                        </p>
                      )}

                      {section.last_edited_by && (
                        <p className="text-[10px] text-stone-500 flex items-center gap-1">
                          <History className="h-2.5 w-2.5" /> Last edit by {section.last_edited_by}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions Bar */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-stone-800/80">
                    <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl p-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(section)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                        section.is_visible
                          ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
                          : "border-stone-700 bg-stone-900 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      {section.is_visible ? (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-stone-500" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveEditorSection(section)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-900/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SPECIALIZED SECTION MODAL EDITOR */}
      {activeEditorSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-[#161513] p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
              <div>
                <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-amber-500" />
                  <span>Edit: {activeEditorSection.name}</span>
                </h3>
                <span className="text-[11px] font-mono text-stone-500">
                  Type: {activeEditorSection.section_type} • Key: {activeEditorSection.section_key}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditorSection(null)}
                className="text-stone-400 hover:text-stone-100 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderEditorContent()}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
