import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { TrustBadgesSection } from "@/components/showcase/TrustBadgesSection";
import { ShopByCategorySection } from "@/components/showcase/ShopByCategorySection";
import { FeaturedTilesSection } from "@/components/showcase/FeaturedTilesSection";
import { VideoShowcaseSection } from "@/components/showcase/VideoShowcaseSection";
import { TestimonialsSection } from "@/components/showcase/TestimonialsSection";
import { ShowroomSection } from "@/components/showcase/ShowroomSection";
import { ReelsShowcaseSection } from "@/components/showcase/ReelsShowcaseSection";
import { ContactSection } from "@/components/showcase/ContactSection";
import { Footer } from "@/components/showcase/Footer";
import { CustomCmsSection } from "@/components/showcase/CustomCmsSection";
import { useLenis } from "@/hooks/useLenis";
import { useScrollBatchAnimation } from "@/hooks/useScrollBatch";
import { getPublicSections } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mubarak Tiles & Ceramics — Luxury Tiles, Grand Slabs & Natural Stone" },
      {
        name: "description",
        content:
          "Curating premium 120x240 sintered porcelain slabs, bespoke tile-integrated basins, and imported natural Italian marble for timeless architecture across India.",
      },
      { property: "og:title", content: "Mubarak Tiles & Ceramics — Luxury Tiles & Natural Stone" },
      {
        name: "og:description",
        content:
          "Discover luxury surfaces, grand format slabs, and bespoke sanitaryware crafted for modern villas and commercial projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface SectionItem {
  id: number | string;
  section_key: string;
  section_type: string;
  name?: string;
  content: any;
  sort_order?: number;
}

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: 1, section_key: "hero", section_type: "hero", content: {} },
  { id: 2, section_key: "shop_by_category", section_type: "category_grid", content: {} },
  { id: 4, section_key: "featured_tiles", section_type: "featured_grid", content: {} },
  { id: 6, section_key: "trust_badges", section_type: "trust_badges", content: {} },
  { id: 7, section_key: "video_showcase", section_type: "video_showcase", content: {} },
  { id: 8, section_key: "showroom_reels", section_type: "reels_grid", content: {} },
  { id: 9, section_key: "showroom", section_type: "showroom_info", content: {} },
  { id: 11, section_key: "contact", section_type: "contact_form", content: {} },
];

function Index() {
  useLenis();
  useScrollBatchAnimation();

  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    let isMounted = true;
    getPublicSections("home")
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.sections) && res.sections.length > 0) {
          const activeSections = res.sections.filter(
            (sec: any) =>
              sec.section_key !== "signature_pieces" &&
              sec.section_type !== "signature_grid" &&
              sec.section_key !== "our_process" &&
              sec.section_type !== "process_steps" &&
              sec.section_key !== "faq" &&
              sec.section_type !== "faq_accordion" &&
              sec.section_key !== "testimonials" &&
              sec.section_type !== "testimonials_grid"
          );
          setSections(activeSections);
        }
      })
      .catch(() => {
        // Retain default seed state on network error with zero visual glitch
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const parseContent = (rawContent: any) => {
    if (!rawContent) return {};
    if (typeof rawContent === "string") {
      try {
        return JSON.parse(rawContent);
      } catch {
        return {};
      }
    }
    return rawContent;
  };

  const renderSection = (sec: SectionItem) => {
    const key = sec.section_key;
    const type = sec.section_type;
    const content = parseContent(sec.content);

    if (key === "hero" || type === "hero") {
      return <CinematicHero key={sec.id} content={content} />;
    }
    if (key === "shop_by_category" || key === "categories" || type === "category_grid") {
      return <ShopByCategorySection key={sec.id} content={content} />;
    }
    if (
      key === "quick_sinks" ||
      key === "sinks" ||
      key === "featured_tiles" ||
      key === "featured_products" ||
      key === "best_sellers" ||
      key === "bestsellers" ||
      key === "signature_pieces" ||
      type === "sinks_grid" ||
      type === "featured_grid" ||
      type === "bestsellers_grid" ||
      type === "signature_grid"
    ) {
      return <FeaturedTilesSection key={sec.id} content={content} />;
    }
    if (key === "trust_badges" || key === "trust" || type === "trust_badges") {
      return <TrustBadgesSection key={sec.id} content={content} />;
    }
    if (key === "video_showcase" || key === "video" || type === "video_showcase") {
      return <VideoShowcaseSection key={sec.id} content={content} />;
    }
    if (key === "showroom_reels" || key === "reels" || key === "video_blog" || type === "reels_grid") {
      return <ReelsShowcaseSection key={sec.id} content={content} />;
    }
    if (key === "testimonials" || type === "testimonials_grid") {
      return <TestimonialsSection key={sec.id} content={content} />;
    }
    if (key === "showroom" || type === "showroom_info") {
      return <ShowroomSection key={sec.id} content={content} />;
    }
    if (key === "contact" || type === "contact_form") {
      return <ContactSection key={sec.id} content={content} />;
    }

    // Default / Custom Section Card
    return (
      <CustomCmsSection
        key={sec.id}
        id={sec.id}
        sectionKey={sec.section_key}
        name={sec.name}
        title={content?.title}
        subtitle={content?.subtitle}
        badge={content?.badge}
        image={content?.image}
        videoUrl={content?.video_url}
        ctaText={content?.cta_text}
        ctaLink={content?.cta_link}
        secondaryCtaText={content?.secondary_cta_text}
        secondaryCtaLink={content?.secondary_cta_link}
      />
    );
  };

  return (
    <main className="bg-[color:var(--luxe-bone)] text-[color:var(--luxe-charcoal)] min-h-screen overflow-x-hidden">
      {sections.map((sec) => renderSection(sec))}
      <Footer />
    </main>
  );
}
