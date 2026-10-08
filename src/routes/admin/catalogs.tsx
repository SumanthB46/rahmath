import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  FileText,
  Loader2,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  FolderTree,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api, { API_BASE_URL, uploadCatalogPdf, uploadImage } from "@/lib/api";
import { toast } from "sonner";

const resolveMediaUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  if (url.startsWith("/uploads")) return `${backendOrigin}${url}`;
  return url;
};

export const Route = createFileRoute("/admin/catalogs")({
  head: () => ({
    meta: [{ title: "Catalogue Library CMS — Mubarak Admin" }],
  }),
  component: AdminCatalogLibraryPage,
});

interface SectionItem {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  section_image?: string;
  display_order: number;
  is_visible: boolean;
  catalogues?: CatalogItem[];
}

interface CatalogItem {
  id: number;
  title: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  edition?: string;
  pages?: number;
  format?: string;
  finish?: string;
  cover_image?: string;
  pdf_url: string;
  file_size?: string;
  section_id?: number | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  download_count?: number;
  created_at?: string;
}

function AdminCatalogLibraryPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<CatalogItem | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "section" | "catalog"; item: any } | null>(null);

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Section Form Data
  const [sectionForm, setSectionForm] = useState({
    name: "",
    slug: "",
    short_description: "",
    section_image: "",
    display_order: 1,
    is_visible: true,
  });

  // Catalog Form Data
  const [catalogForm, setCatalogForm] = useState({
    section_id: null as number | null,
    title: "",
    slug: "",
    subtitle: "",
    edition: "2026",
    pages: 32,
    format: "120 × 240 cm",
    finish: "Satin Matte & Polish",
    cover_image: "/assets/stacked_grey_slabs.png",
    pdf_url: "",
    file_size: "12.5 MB",
    sort_order: 1,
    is_active: true,
    is_featured: false,
  });

  // Load Library Structure
  const loadLibrary = async () => {
    setLoading(true);
    try {
      const res: any = await api.admin.getCatalogLibraryStructure();
      if (res.data?.sections) {
        setSections(res.data.sections);
      } else {
        // Fallback: fetch sections and catalogs separately
        const secRes: any = await api.admin.getCatalogSections();
        const catRes: any = await api.admin.getCatalogs();
        const rawSecs = secRes.data || secRes.sections || [];
        const rawCats = catRes.data || catRes.catalogs || [];
        const merged = rawSecs.map((s: SectionItem) => ({
          ...s,
          catalogues: rawCats.filter((c: CatalogItem) => c.section_id === s.id),
        }));
        setSections(merged);
      }
    } catch (err: any) {
      toast.error("Failed to load catalog library", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  // Filtered Sections and Books
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections
      .map((sec) => {
        const matchesSection =
          sec.name.toLowerCase().includes(q) ||
          sec.short_description?.toLowerCase().includes(q);
        const filteredCats = (sec.catalogues || []).filter(
          (cat) =>
            cat.title.toLowerCase().includes(q) ||
            cat.subtitle?.toLowerCase().includes(q) ||
            cat.edition?.toLowerCase().includes(q) ||
            cat.pdf_url?.toLowerCase().includes(q)
        );
        if (matchesSection || filteredCats.length > 0) {
          return { ...sec, catalogues: matchesSection ? sec.catalogues : filteredCats };
        }
        return null;
      })
      .filter(Boolean) as SectionItem[];
  }, [sections, searchQuery]);

  // Overall Stats
  const totalCatalogues = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.catalogues?.length || 0), 0);
  }, [sections]);

  const featuredCatalogue = useMemo(() => {
    for (const s of sections) {
      const f = s.catalogues?.find((c) => c.is_featured);
      if (f) return f;
    }
    return null;
  }, [sections]);

  // ── SECTION HANDLERS ──
  const openAddSection = () => {
    setEditingSection(null);
    setSectionForm({
      name: "",
      slug: "",
      short_description: "",
      section_image: "",
      display_order: sections.length + 1,
      is_visible: true,
    });
    setIsSectionModalOpen(true);
  };

  const openEditSection = (sec: SectionItem) => {
    setEditingSection(sec);
    setSectionForm({
      name: sec.name,
      slug: sec.slug,
      short_description: sec.short_description || "",
      section_image: sec.section_image || "",
      display_order: sec.display_order,
      is_visible: sec.is_visible,
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingSection) {
        await api.admin.updateCatalogSection(editingSection.id, sectionForm);
        toast.success(`Section "${sectionForm.name}" updated`);
      } else {
        await api.admin.createCatalogSection(sectionForm);
        toast.success(`Section "${sectionForm.name}" created`);
      }
      setIsSectionModalOpen(false);
      loadLibrary();
    } catch (err: any) {
      toast.error("Failed to save section", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    setSections(newSections);
    try {
      const orderedIds = newSections.map((s) => s.id);
      await api.admin.reorderCatalogSections(orderedIds);
      toast.success("Section order updated");
    } catch (err: any) {
      toast.error("Failed to reorder sections", { description: err.message });
      loadLibrary();
    }
  };

  // ── CATALOGUE HANDLERS ──
  const openAddCatalog = (sectionId?: number) => {
    const secId = sectionId || sections[0]?.id || null;
    const parentSec = sections.find((s) => s.id === secId);
    const existingCount = parentSec?.catalogues?.length || 0;

    setEditingCatalog(null);
    setTargetSectionId(secId);
    setCatalogForm({
      section_id: secId,
      title: "",
      slug: "",
      subtitle: "",
      edition: "2026",
      pages: 32,
      format: "120 × 240 cm",
      finish: "Satin Matte / High Gloss",
      cover_image: "/assets/stacked_grey_slabs.png",
      pdf_url: "",
      file_size: "12.5 MB",
      sort_order: existingCount + 1,
      is_active: true,
      is_featured: false,
    });
    setIsCatalogModalOpen(true);
  };

  const openEditCatalog = (cat: CatalogItem) => {
    setEditingCatalog(cat);
    setTargetSectionId(cat.section_id || null);
    setCatalogForm({
      section_id: cat.section_id || null,
      title: cat.title,
      slug: cat.slug || "",
      subtitle: cat.subtitle || "",
      edition: cat.edition || "2026",
      pages: cat.pages || 32,
      format: cat.format || "120 × 240 cm",
      finish: cat.finish || "Satin Matte / High Gloss",
      cover_image: cat.cover_image || "/assets/stacked_grey_slabs.png",
      pdf_url: cat.pdf_url,
      file_size: cat.file_size || "12.5 MB",
      sort_order: cat.sort_order,
      is_active: cat.is_active,
      is_featured: cat.is_featured,
    });
    setIsCatalogModalOpen(true);
  };

  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogForm.title.trim()) {
      toast.error("Catalogue title is required");
      return;
    }
    if (!catalogForm.pdf_url.trim()) {
      toast.error("Please provide or upload a PDF document for this catalogue");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...catalogForm,
        category: catalogForm.title,
      };

      if (editingCatalog) {
        await api.admin.updateCatalog(editingCatalog.id, payload);
        toast.success(`Catalogue "${catalogForm.title}" updated`);
      } else {
        await api.admin.createCatalog(payload);
        toast.success(`Catalogue "${catalogForm.title}" added to section`);
      }
      setIsCatalogModalOpen(false);
      loadLibrary();
    } catch (err: any) {
      toast.error("Failed to save catalogue", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveCatalog = async (sectionId: number, catIndex: number, direction: "up" | "down") => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec || !sec.catalogues) return;

    const targetIndex = direction === "up" ? catIndex - 1 : catIndex + 1;
    if (targetIndex < 0 || targetIndex >= sec.catalogues.length) return;

    const newCats = [...sec.catalogues];
    const [moved] = newCats.splice(catIndex, 1);
    newCats.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, catalogues: newCats } : s))
    );

    try {
      const orderedIds = newCats.map((c) => c.id);
      await api.admin.reorderCatalogs(orderedIds);
      toast.success("Catalogue order updated");
    } catch (err: any) {
      toast.error("Failed to reorder catalogues", { description: err.message });
      loadLibrary();
    }
  };

  const handleToggleFeatured = async (cat: CatalogItem) => {
    try {
      const newFeatured = !cat.is_featured;
      await api.admin.updateCatalog(cat.id, { is_featured: newFeatured });
      toast.success(
        newFeatured
          ? `"${cat.title}" set as Featured Edition`
          : `Removed "${cat.title}" from Featured Edition`
      );
      loadLibrary();
    } catch (err: any) {
      toast.error("Failed to toggle featured status", { description: err.message });
    }
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const res = await uploadImage(file);
      if (res.success && res.url) {
        setCatalogForm((prev) => ({ ...prev, cover_image: res.url }));
        toast.success("Cover image uploaded successfully");
      }
    } catch (err: any) {
      toast.error("Failed to upload cover image", { description: err.message });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Upload PDF File
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const res = await uploadCatalogPdf(file);
      if (res.success && res.url) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        setCatalogForm((prev) => ({
          ...prev,
          pdf_url: res.url,
          file_size: sizeMb,
        }));
        toast.success(`PDF uploaded: ${file.name} (${sizeMb})`);
      }
    } catch (err: any) {
      toast.error("Failed to upload PDF", { description: err.message });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === "section") {
        await api.admin.deleteCatalogSection(deleteConfirm.item.id);
        toast.success(`Section "${deleteConfirm.item.name}" deleted`);
      } else {
        await api.admin.deleteCatalog(deleteConfirm.item.id);
        toast.success(`Catalogue "${deleteConfirm.item.title}" deleted`);
      }
      setDeleteConfirm(null);
      loadLibrary();
    } catch (err: any) {
      toast.error("Failed to delete item", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Top Header matching recommended wireframe: CATALOGUE LIBRARY + ADD SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <FolderTree className="h-4 w-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                CATALOGUE LIBRARY
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Architectural hierarchy: Section → Catalogue → PDF. Changes reflect automatically on the public Material Library.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLibrary}
              disabled={loading}
              className="p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={openAddSection}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              <Plus className="h-4 w-4 text-amber-400" />
              <span>+ ADD SECTION</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Material Chapters
              </span>
              <span className="text-2xl font-serif font-bold text-stone-900">
                {sections.length}
              </span>
            </div>
            <Layers className="h-6 w-6 text-stone-300" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Total Catalogues
              </span>
              <span className="text-2xl font-serif font-bold text-stone-900">
                {totalCatalogues}
              </span>
            </div>
            <BookOpen className="h-6 w-6 text-stone-300" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-transparent shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold flex items-center gap-1.5 block">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Featured Edition
              </span>
              <span className="text-sm font-medium text-stone-800 line-clamp-1 mt-0.5">
                {featuredCatalogue ? featuredCatalogue.title : "None Selected"}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              Live Showcase
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections, catalogues, or PDF documents..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
          />
        </div>

        {/* ── SECTIONS & CATALOGUES LIST (HIERARCHY TREE) ── */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-500 font-mono">Loading Material Library hierarchy...</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-800">
              No Material Sections Found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              Create your first architectural section (e.g. TILES, SURFACES, SANITARYWARE) to start organizing publications.
            </p>
            <button
              onClick={openAddSection}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-all"
            >
              <Plus className="h-4 w-4 text-amber-400" />
              <span>+ Add Section</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSections.map((sec, secIndex) => {
              const cats = sec.catalogues || [];
              return (
                <div
                  key={sec.id}
                  className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:border-stone-300"
                >
                  {/* Section Bar Header */}
                  <div className="bg-stone-50/80 px-5 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Section Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSection(secIndex, "up")}
                          disabled={secIndex === 0}
                          className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                          title="Move section up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(secIndex, "down")}
                          disabled={secIndex === sections.length - 1}
                          className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                          title="Move section down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-stone-400 font-mono select-none">≡</span>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-base font-serif font-bold text-stone-900 uppercase tracking-wide">
                            {sec.name}
                          </h2>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-600 font-medium">
                            {cats.length} {cats.length === 1 ? "catalogue" : "catalogues"}
                          </span>
                          {!sec.is_visible && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-400 uppercase">
                              Hidden
                            </span>
                          )}
                        </div>
                        {sec.short_description && (
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                            {sec.short_description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddCatalog(sec.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 text-amber-700" />
                        <span>Add Catalogue</span>
                      </button>

                      <button
                        onClick={() => openEditSection(sec)}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
                        title="Edit Section"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirm({ type: "section", item: sec })}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Catalogues Tree inside Section */}
                  <div className="divide-y divide-stone-100">
                    {cats.length === 0 ? (
                      <div className="p-8 text-center bg-stone-50/30">
                        <p className="text-xs text-stone-400 font-mono mb-2">
                          No catalogues added to {sec.name} yet.
                        </p>
                        <button
                          onClick={() => openAddCatalog(sec.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold uppercase tracking-wider"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Add First Catalogue</span>
                        </button>
                      </div>
                    ) : (
                      cats.map((cat, catIndex) => (
                        <div
                          key={cat.id}
                          className="p-4 sm:px-6 hover:bg-stone-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Left: Tree line, Cover Thumbnail, Titles & PDF info */}
                          <div className="flex items-center gap-4">
                            {/* Reorder Up/Down */}
                            <div className="flex flex-col items-center">
                              <button
                                onClick={() => handleMoveCatalog(sec.id, catIndex, "up")}
                                disabled={catIndex === 0}
                                className="p-1 text-stone-300 hover:text-stone-700 disabled:opacity-10 transition-colors"
                                title="Move catalogue up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleMoveCatalog(sec.id, catIndex, "down")}
                                disabled={catIndex === cats.length - 1}
                                className="p-1 text-stone-300 hover:text-stone-700 disabled:opacity-10 transition-colors"
                                title="Move catalogue down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Tree branch indicator */}
                            <span className="text-stone-300 font-mono text-xs select-none hidden sm:inline">
                              {catIndex === cats.length - 1 ? "└──" : "├──"}
                            </span>

                            {/* Cover Thumbnail Preview */}
                            <div className="relative w-12 h-16 rounded-md overflow-hidden bg-stone-900 border border-stone-200 shrink-0 shadow-sm">
                              <img
                                src={cat.cover_image || "/assets/stacked_grey_slabs.png"}
                                alt={cat.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-y-0 left-0 w-1 bg-black/60" />
                            </div>

                            {/* Title & PDF Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-serif font-bold text-stone-900">
                                  {cat.title}
                                </h3>
                                {cat.is_featured && (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300">
                                    <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                                    Featured Edition
                                  </span>
                                )}
                                {!cat.is_active && (
                                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-400 uppercase">
                                    Draft
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-stone-500 line-clamp-1">
                                {cat.subtitle || "Architectural compendium"} · {cat.edition || "2026"} · {cat.pages || 32} pages
                              </p>

                              {/* PDF Link Indicator */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500">
                                  <FileText className="h-3 w-3 text-stone-400" />
                                  <span className="truncate max-w-[220px] sm:max-w-[320px]">
                                    {cat.pdf_url ? cat.pdf_url.split("/").pop() : "No PDF linked"}
                                  </span>
                                </span>
                                {cat.file_size && (
                                  <span className="text-[10px] font-mono text-stone-400">
                                    ({cat.file_size})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0 sm:self-center">
                            {/* Feature Toggle */}
                            <button
                              onClick={() => handleToggleFeatured(cat)}
                              className={`p-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                                cat.is_featured
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  : "hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                              }`}
                              title={cat.is_featured ? "Current Featured Edition" : "Set as Featured Edition"}
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>

                            {/* View Spec / PDF */}
                            {cat.pdf_url && (
                              <a
                                href={resolveMediaUrl(cat.pdf_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                                title="Open PDF document"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditCatalog(cat)}
                              className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteConfirm({ type: "catalog", item: cat })}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-300 hover:text-rose-600 transition-colors"
                              title="Delete Catalogue"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL 1: ADD / EDIT SECTION ── */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl relative my-auto border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 shrink-0 bg-stone-50/70">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 uppercase tracking-tight">
                  {editingSection ? "Edit Catalogue Section" : "Add Catalogue Section"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="section-form" onSubmit={handleSaveSection} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
                {/* Section Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SANITARYWARE, TILES, SURFACES"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-serif uppercase tracking-wider"
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                    Short Description (Editorial Subtitle)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Architectural sanitaryware, monolithic sinks & stone vanities"
                    value={sectionForm.short_description}
                    onChange={(e) => setSectionForm((p) => ({ ...p, short_description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={sectionForm.display_order}
                      onChange={(e) => setSectionForm((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 1 }))}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Visibility
                    </label>
                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sectionForm.is_visible}
                        onChange={(e) => setSectionForm((p) => ({ ...p, is_visible: e.target.checked }))}
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs text-stone-700 font-medium">Visible on library</span>
                    </label>
                  </div>
                </div>
              </form>

              {/* Actions (Always visible pinned footer) */}
              <div className="border-t border-stone-200 px-6 py-4 shrink-0 bg-stone-50/95 backdrop-blur-xs flex items-center justify-end gap-3 shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-bold text-stone-700 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="section-form"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  <span>{editingSection ? "Save Changes" : "Create Section"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 2: ADD / EDIT CATALOGUE ── */}
        {isCatalogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative my-auto border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 shrink-0 bg-stone-50/70">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 uppercase tracking-tight">
                    {editingCatalog ? "Edit Catalogue" : "Add Catalogue"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    The PDF and cover image are separate to maintain rich physical publication aesthetics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="catalog-form" onSubmit={handleSaveCatalog} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
                {/* Parent Section */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                    Parent Material Section *
                  </label>
                  <select
                    value={catalogForm.section_id || ""}
                    onChange={(e) =>
                      setCatalogForm((p) => ({
                        ...p,
                        section_id: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Catalogue Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Catalogue Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bespoke Basins"
                      value={catalogForm.title}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-sm font-serif"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Subtitle / Materials
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Monolithic Integrated Sinks"
                      value={catalogForm.subtitle}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, subtitle: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-200 text-sm"
                    />
                  </div>
                </div>

                {/* Edition & Pages & Format */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Edition
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026 or EDITION 01"
                      value={catalogForm.edition}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, edition: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Pages Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={catalogForm.pages}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, pages: parseInt(e.target.value, 10) || 12 }))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Format / Dims
                    </label>
                    <input
                      type="text"
                      placeholder="120 × 240 cm"
                      value={catalogForm.format}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, format: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs"
                    />
                  </div>
                </div>

                {/* Cover Image Upload (Physical Book Appearance) */}
                <div className="space-y-2 border border-stone-200 rounded-xl p-3.5 bg-stone-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-800 font-bold block">
                        Catalogue Cover Image
                      </label>
                      <span className="text-[11px] text-stone-500">
                        Upload high-res JPG/PNG photograph for the hardcover 3D book
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
                    >
                      {uploadingCover ? (
                        <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                      ) : (
                        <Upload className="h-3 w-3 text-amber-600" />
                      )}
                      <span>Upload Cover</span>
                    </button>
                  </div>

                  {/* Cover Preview & URL input */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-14 rounded overflow-hidden bg-stone-900 border border-stone-300 shrink-0">
                      <img
                        src={catalogForm.cover_image || "/assets/stacked_grey_slabs.png"}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/stacked_grey_slabs.png";
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="/assets/marble-slabs-corner-v2.png or image URL"
                      value={catalogForm.cover_image}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, cover_image: e.target.value }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-700 font-mono"
                    />
                  </div>
                </div>

                {/* PDF Document Upload */}
                <div className="space-y-2 border border-stone-200 rounded-xl p-3.5 bg-stone-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-stone-800 font-bold block">
                        PDF Publication Document *
                      </label>
                      <span className="text-[11px] text-stone-500">
                        The downloadable &amp; interactive PDF document
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf,application/pdf"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingPdf}
                      onClick={() => pdfInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
                    >
                      {uploadingPdf ? (
                        <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                      ) : (
                        <Upload className="h-3 w-3 text-amber-600" />
                      )}
                      <span>Upload PDF</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <FileText className="h-4 w-4 text-stone-400 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="/uploads/catalogs/bespoke-basins.pdf"
                      value={catalogForm.pdf_url}
                      onChange={(e) => setCatalogForm((p) => ({ ...p, pdf_url: e.target.value }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-700 font-mono"
                    />
                  </div>
                </div>

                {/* Featured and Status Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="border border-amber-200 bg-amber-50/40 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold block">
                        Featured Edition
                      </span>
                      <span className="text-[11px] text-amber-700">
                        Display as centerpiece
                      </span>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catalogForm.is_featured}
                        onChange={(e) => setCatalogForm((p) => ({ ...p, is_featured: e.target.checked }))}
                        className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                    </label>
                  </div>

                  <div className="border border-stone-200 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-stone-800 font-bold block">
                        Publish Status
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {catalogForm.is_active ? "Live on public library" : "Saved as Draft"}
                      </span>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catalogForm.is_active}
                        onChange={(e) => setCatalogForm((p) => ({ ...p, is_active: e.target.checked }))}
                        className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

              </form>

              {/* Actions (Always visible pinned footer) */}
              <div className="border-t border-stone-200 px-6 py-4 shrink-0 bg-stone-50/95 backdrop-blur-xs flex items-center justify-end gap-3 shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-bold text-stone-700 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="catalog-form"
                  disabled={saving || uploadingCover || uploadingPdf}
                  className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  <span>{editingCatalog ? "Save Catalogue" : "Add Catalogue"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ── */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div>
                <h4 className="text-base font-serif font-bold text-stone-900">
                  Delete {deleteConfirm.type === "section" ? "Section" : "Catalogue"}?
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-stone-800">
                    "{deleteConfirm.item.name || deleteConfirm.item.title}"
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminCatalogLibraryPage;
