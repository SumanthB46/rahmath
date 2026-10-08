import type { CatalogueItem } from "@/routes/catalog";

// Asset imports for high-resolution photography in spreads
import floorImg from "@/assets/solutions/flooring.png";
import wallImg from "@/assets/kajaria-bathroom-desktop.webp";
import porcelainImg from "@/assets/stacked_grey_slabs.png";
import slabImg from "@/assets/marble-slabs-corner-v2.png";
import countertopsImg from "@/assets/solutions/countertops.png";
import sinkImg from "@/assets/exclusive_sinks.png";
import showroomImg from "@/assets/showroom_experience.png";

export interface CatalogSpread {
  id: string;
  title: string;
  subtitle: string;
  pageRange: string;
  url: string;
}

// Pre-load an image into an HTMLImageElement
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Return broken image handle gracefully
      resolve(img);
    };
    img.src = src;
  });
}

// Draw subtle marble veining procedurally if image is loading or as background
function drawMarbleVeining(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dark = false) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.strokeStyle = dark ? "rgba(201, 161, 58, 0.08)" : "rgba(180, 170, 150, 0.15)";
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let cx = x + (i * w) / 5 + Math.sin(i) * 60;
    let cy = y;
    ctx.moveTo(cx, cy);

    while (cy < y + h) {
      cy += 50 + Math.sin(cy * 0.02) * 20;
      cx += Math.cos(cy * 0.015 + i) * 35;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Draw center book spine crease shadow
function drawSpineShadow(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const spineX = width / 2;
  const shadowWidth = 100;
  const grad = ctx.createLinearGradient(spineX - shadowWidth / 2, 0, spineX + shadowWidth / 2, 0);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.35, "rgba(0, 0, 0, 0.08)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.28)");
  grad.addColorStop(0.65, "rgba(0, 0, 0, 0.08)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(spineX - shadowWidth / 2, 0, shadowWidth, height);

  // Fine center gutter hairline
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(spineX, 0);
  ctx.lineTo(spineX, height);
  ctx.stroke();
}

/**
 * Generates an array of luxury architectural 2-page spreads (1760 x 1240 px)
 * for the given catalog item.
 */
export async function generateCatalogSpreads(item: CatalogueItem): Promise<CatalogSpread[]> {
  const WIDTH = 1760;
  const HEIGHT = 1240;
  const HALF_W = WIDTH / 2;

  // Pick category-specific imagery
  const categoryLower = (item.category || item.title || "").toLowerCase();
  let primaryAsset = slabImg;
  let secondaryAsset = countertopsImg;
  let tertiaryAsset = showroomImg;

  if (categoryLower.includes("floor")) {
    primaryAsset = floorImg;
    secondaryAsset = porcelainImg;
    tertiaryAsset = showroomImg;
  } else if (categoryLower.includes("wall")) {
    primaryAsset = wallImg;
    secondaryAsset = floorImg;
    tertiaryAsset = porcelainImg;
  } else if (categoryLower.includes("porcelain")) {
    primaryAsset = porcelainImg;
    secondaryAsset = slabImg;
    tertiaryAsset = floorImg;
  } else if (categoryLower.includes("basin") || categoryLower.includes("sink") || categoryLower.includes("sanitary")) {
    primaryAsset = sinkImg;
    secondaryAsset = countertopsImg;
    tertiaryAsset = showroomImg;
  } else if (categoryLower.includes("grand") || categoryLower.includes("large") || categoryLower.includes("slab")) {
    primaryAsset = slabImg;
    secondaryAsset = porcelainImg;
    tertiaryAsset = countertopsImg;
  }

  // Preload visual assets
  const [coverPhoto, heroPhoto, detailPhoto, showroomPhoto] = await Promise.all([
    preloadImage(item.coverImage || primaryAsset),
    preloadImage(primaryAsset),
    preloadImage(secondaryAsset),
    preloadImage(tertiaryAsset),
  ]);

  const spreads: CatalogSpread[] = [];

  // Helper to create an offscreen canvas
  const makeCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Could not acquire 2D context");
    return { canvas, ctx };
  };

  /* ═════════════════════════════════════════════════════════════════════════
     SPREAD 1: FRONT COVER & INTRODUCTORY BINDING (Pages 00 - 01)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    const { canvas, ctx } = makeCanvas();

    // Left Page: Inside Endpaper (Warm Charcoal / Graphite)
    ctx.fillStyle = "#191816";
    ctx.fillRect(0, 0, HALF_W, HEIGHT);
    drawMarbleVeining(ctx, 0, 0, HALF_W, HEIGHT, true);

    // Left Page Foil Stamp
    ctx.strokeStyle = "rgba(201, 161, 58, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 60, HALF_W - 120, HEIGHT - 120);

    ctx.fillStyle = "#C9A13A";
    ctx.font = "bold 13px monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("MUBARAK TILES & CERAMICS", 100, 160);

    ctx.fillStyle = "#F1EEE7";
    ctx.font = "italic 36px 'Times New Roman', Georgia, serif";
    ctx.fillText("The Architectural Compendium", 100, 240);

    ctx.fillStyle = "#99958C";
    ctx.font = "14px monospace";
    ctx.fillText("EDITION 2026 · MONOLITHIC SURFACES & SLABS", 100, 280);

    ctx.fillStyle = "#7A766E";
    ctx.font = "16px 'Times New Roman', Georgia, serif";
    ctx.fillText("Certified Sintered Porcelain, Natural Marble Blocks", 100, 360);
    ctx.fillText("& Precision Vitrified Architectural Cladding.", 100, 390);

    // Endpaper Spec Seal
    ctx.strokeStyle = "#C9A13A";
    ctx.beginPath();
    ctx.arc(HALF_W / 2, 780, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#C9A13A";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MUBARAK", HALF_W / 2, 765);
    ctx.fillText("EXPORT SPEC", HALF_W / 2, 785);
    ctx.fillText("2026", HALF_W / 2, 805);
    ctx.textAlign = "left";

    // Right Page: Hardcover Front Plate
    ctx.fillStyle = "#121110";
    ctx.fillRect(HALF_W, 0, HALF_W, HEIGHT);

    // Cover Image inset
    if (coverPhoto && coverPhoto.complete && coverPhoto.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(HALF_W + 70, 70, HALF_W - 140, HEIGHT - 380);
      ctx.clip();
      ctx.drawImage(coverPhoto, HALF_W + 70, 70, HALF_W - 140, HEIGHT - 380);

      // Dark gradient overlay on photo
      const photoGrad = ctx.createLinearGradient(0, HEIGHT - 450, 0, HEIGHT - 380);
      photoGrad.addColorStop(0, "rgba(18, 17, 16, 0)");
      photoGrad.addColorStop(1, "rgba(18, 17, 16, 0.95)");
      ctx.fillStyle = photoGrad;
      ctx.fillRect(HALF_W + 70, HEIGHT - 550, HALF_W - 140, 180);
      ctx.restore();
    }

    // Gold frame on cover
    ctx.strokeStyle = "rgba(201, 161, 58, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(HALF_W + 50, 50, HALF_W - 100, HEIGHT - 100);

    // Cover Title Typography
    ctx.fillStyle = "#C9A13A";
    ctx.font = "bold 13px monospace";
    ctx.letterSpacing = "5px";
    ctx.fillText(item.edition || "EDITION 04 · 2026", HALF_W + 90, HEIGHT - 260);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 46px 'Times New Roman', Georgia, serif";
    ctx.fillText(item.title.toUpperCase(), HALF_W + 90, HEIGHT - 195);

    ctx.fillStyle = "#B3AEA4";
    ctx.font = "18px 'Times New Roman', Georgia, serif";
    ctx.fillText(item.subtitle || "Architectural Surface Compendium", HALF_W + 90, HEIGHT - 150);

    ctx.fillStyle = "#C9A13A";
    ctx.font = "12px monospace";
    ctx.fillText(`FORMAT: ${item.format || "120 × 240 CM"} · FINISH: ${item.finish || "SATIN MATTE"}`, HALF_W + 90, HEIGHT - 110);

    drawSpineShadow(ctx, WIDTH, HEIGHT);

    spreads.push({
      id: "spread-1",
      title: item.title,
      subtitle: "Hardcover & Front Plate",
      pageRange: "Cover · Plate 01",
      url: canvas.toDataURL("image/jpeg", 0.92),
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SPREAD 2: EXECUTIVE STATEMENT & SINTERED PORCELAIN MATRIX (Pages 02 - 03)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    const { canvas, ctx } = makeCanvas();

    // Warm Alabaster Paper
    ctx.fillStyle = "#FAF8F3";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMarbleVeining(ctx, 0, 0, WIDTH, HEIGHT, false);

    // Left Page (Page 02)
    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("CHAPTER I · MATERIAL STANDARDS", 90, 110);

    ctx.fillStyle = "#1E1C1A";
    ctx.font = "bold 38px 'Times New Roman', Georgia, serif";
    ctx.fillText("THE ARCHITECTURE", 90, 170);
    ctx.fillText("OF MONOLITHIC SCALE", 90, 215);

    ctx.fillStyle = "#4A463E";
    ctx.font = "16px Georgia, serif";
    const p1 = [
      "In contemporary architecture, the surface is no longer merely a covering;",
      "it is an unbroken spatial continuum. Mubarak architectural surfaces are",
      "forged under 16,000 tonnes of hydraulic pressure and vitrified at 1,280°C,",
      "yielding an ultra-dense sintered body with porosity below 0.02%.",
    ];
    p1.forEach((line, idx) => ctx.fillText(line, 90, 280 + idx * 26));

    // Spec Box 1
    ctx.strokeStyle = "rgba(140, 109, 35, 0.3)";
    ctx.strokeRect(90, 420, HALF_W - 180, 240);
    ctx.fillStyle = "rgba(201, 161, 58, 0.06)";
    ctx.fillRect(90, 420, HALF_W - 180, 240);

    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 12px monospace";
    ctx.fillText("COMPRESSION & MINERAL COMPOSITION", 120, 460);

    ctx.fillStyle = "#2A2825";
    ctx.font = "14px monospace";
    ctx.fillText("• RAW MINERALS: Feldspar, Kaolin, Quartz & Micronized Zirconium", 120, 500);
    ctx.fillText("• FIRING TEMPERATURE: 1,280°C Continuous Roller Kiln Cycle", 120, 530);
    ctx.fillText("• WATER ABSORPTION: < 0.02% (Impermeable to staining agents)", 120, 560);
    ctx.fillText("• FLEXURAL STRENGTH: ≥ 52 N/mm² (Engineered high load-bearing)", 120, 590);
    ctx.fillText("• THERMAL SHOCK: Zero crazing or pigment oxidation under direct sun", 120, 620);

    // Left Page Blueprint Line Diagram
    ctx.strokeStyle = "rgba(100, 90, 75, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, 740);
    ctx.lineTo(HALF_W - 90, 740);
    ctx.stroke();

    ctx.fillStyle = "#7A766E";
    ctx.font = "12px monospace";
    ctx.fillText("TECHNICAL ELEVATION — 9MM, 12MM & 15MM CALIBRATION PROFILES", 90, 780);

    // Draw thickness bars
    const thicknesses = [
      { label: "6mm Façade", h: 8, y: 830 },
      { label: "9mm Floor System", h: 14, y: 880 },
      { label: "12mm Vanity Top", h: 20, y: 940 },
      { label: "15mm Monolithic Island", h: 26, y: 1010 },
    ];
    thicknesses.forEach((t) => {
      ctx.fillStyle = "#D6CFC4";
      ctx.fillRect(90, t.y, 420, t.h);
      ctx.fillStyle = "#3D3933";
      ctx.font = "12px monospace";
      ctx.fillText(t.label, 530, t.y + t.h - 1);
    });

    // Page Number Left
    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.fillText("02 · MUBARAK ARCHITECTURAL SPEC", 90, HEIGHT - 60);

    // Right Page (Page 03) — Hero Photo with Inset Spec
    if (heroPhoto && heroPhoto.complete && heroPhoto.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(HALF_W + 60, 90, HALF_W - 120, HEIGHT - 220);
      ctx.clip();
      ctx.drawImage(heroPhoto, HALF_W + 60, 90, HALF_W - 120, HEIGHT - 220);

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, HEIGHT - 360, 0, HEIGHT - 130);
      grad.addColorStop(0, "rgba(20, 19, 18, 0)");
      grad.addColorStop(1, "rgba(20, 19, 18, 0.92)");
      ctx.fillStyle = grad;
      ctx.fillRect(HALF_W + 60, HEIGHT - 360, HALF_W - 120, 230);
      ctx.restore();

      // Right Page Captions on Image
      ctx.fillStyle = "#C9A13A";
      ctx.font = "bold 12px monospace";
      ctx.fillText("PLATE 03 — INSTALLATION STUDY", HALF_W + 90, HEIGHT - 230);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 26px 'Times New Roman', Georgia, serif";
      ctx.fillText(item.title, HALF_W + 90, HEIGHT - 190);

      ctx.fillStyle = "#E0DCD3";
      ctx.font = "14px Georgia, serif";
      ctx.fillText("Monolithic continuous porcelain span installed with matched 1.5mm joinery.", HALF_W + 90, HEIGHT - 155);
    }

    // Page Number Right
    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText("PAGE 03", WIDTH - 90, HEIGHT - 60);
    ctx.textAlign = "left";

    drawSpineShadow(ctx, WIDTH, HEIGHT);

    spreads.push({
      id: "spread-2",
      title: "Material Standards",
      subtitle: "Compression & Mineral Sintering",
      pageRange: "Pages 02 – 03",
      url: canvas.toDataURL("image/jpeg", 0.92),
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SPREAD 3: CONTINUOUS BOOKMATCH & SURFACE FINISHES (Pages 04 - 05)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    const { canvas, ctx } = makeCanvas();

    ctx.fillStyle = "#FAF8F3";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMarbleVeining(ctx, 0, 0, WIDTH, HEIGHT, false);

    // Left Page (Page 04) — Surface Finishes Index
    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("CHAPTER II · TACTILE SHEEN", 90, 110);

    ctx.fillStyle = "#1E1C1A";
    ctx.font = "bold 36px 'Times New Roman', Georgia, serif";
    ctx.fillText("SURFACE FINISHES & REFLECTANCE", 90, 165);

    const finishes = [
      {
        name: "1. SILK TOUCH VELVET",
        gloss: "12 – 18 Gloss Units",
        desc: "Diffuses ambient light with soft tactile warmth. Ideal for expansive living room flooring and high-traffic circulation.",
      },
      {
        name: "2. CARVED HONED",
        gloss: "8 – 12 Gloss Units",
        desc: "Micro-textured relief etched along authentic vein paths, echoing hand-hewn Italian stone with exceptional slip resistance.",
      },
      {
        name: "3. MIRROR POLISHED",
        gloss: "92 – 98 Gloss Units",
        desc: "Diamond-lapped optical reflection enhancing veining depth and crystal translucency across vertical feature walls.",
      },
      {
        name: "4. BUSH-HAMMERED ARCHITECTURAL",
        gloss: "Tactile Grip (PTV > 38)",
        desc: "Coarse mechanical texture engineered for exterior rain screens, swimming pool surrounds, and commercial thresholds.",
      },
    ];

    finishes.forEach((f, idx) => {
      const y = 240 + idx * 190;
      ctx.fillStyle = "#8C6D23";
      ctx.font = "bold 14px monospace";
      ctx.fillText(f.name, 90, y);

      ctx.fillStyle = "#7A766E";
      ctx.font = "12px monospace";
      ctx.fillText(`[ ${f.gloss} ]`, 90, y + 25);

      ctx.fillStyle = "#3D3933";
      ctx.font = "15px Georgia, serif";
      ctx.fillText(f.desc, 90, y + 55);

      ctx.strokeStyle = "rgba(140, 109, 35, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(90, y + 105);
      ctx.lineTo(HALF_W - 90, y + 105);
      ctx.stroke();
    });

    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.fillText("04 · FINISH INDEX", 90, HEIGHT - 60);

    // Right Page (Page 05) — Continuous Bookmatch Schematic
    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("CONTINUOUS BOOKMATCH CONTINUITY", HALF_W + 90, 110);

    ctx.fillStyle = "#1E1C1A";
    ctx.font = "bold 36px 'Times New Roman', Georgia, serif";
    ctx.fillText("VEIN PATTERN CONTINUITY", HALF_W + 90, 165);

    // 4 Slabs Bookmatch Diagram
    const slabW = 160;
    const slabH = 340;
    const startX = HALF_W + 90;
    const startY = 240;

    const panels = [
      { label: "SLAB A (ORIGINAL)", x: startX, y: startY },
      { label: "SLAB B (MIRROR)", x: startX + slabW + 20, y: startY },
      { label: "SLAB C (INVERT)", x: startX + (slabW + 20) * 2, y: startY },
      { label: "SLAB D (CONTINUUM)", x: startX + (slabW + 20) * 3, y: startY },
    ];

    panels.forEach((p, i) => {
      ctx.strokeStyle = "#8C6D23";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, p.y, slabW, slabH);

      ctx.fillStyle = "rgba(201, 161, 58, 0.08)";
      ctx.fillRect(p.x, p.y, slabW, slabH);

      // Vein lines connecting across panels
      ctx.strokeStyle = "rgba(100, 70, 20, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const mirror = i % 2 === 1;
      ctx.moveTo(mirror ? p.x + slabW : p.x, p.y + 70);
      ctx.bezierCurveTo(p.x + slabW * 0.4, p.y + 160, p.x + slabW * 0.7, p.y + 240, mirror ? p.x : p.x + slabW, p.y + 310);
      ctx.stroke();

      ctx.fillStyle = "#3D3933";
      ctx.font = "11px monospace";
      ctx.fillText(p.label, p.x + 10, p.y + slabH + 25);
    });

    // Inset Detail Visual
    if (detailPhoto && detailPhoto.complete && detailPhoto.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(HALF_W + 90, 660, HALF_W - 180, 440);
      ctx.clip();
      ctx.drawImage(detailPhoto, HALF_W + 90, 660, HALF_W - 180, 440);
      ctx.restore();

      ctx.strokeStyle = "#8C6D23";
      ctx.lineWidth = 1;
      ctx.strokeRect(HALF_W + 90, 660, HALF_W - 180, 440);
    }

    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText("PAGE 05", WIDTH - 90, HEIGHT - 60);
    ctx.textAlign = "left";

    drawSpineShadow(ctx, WIDTH, HEIGHT);

    spreads.push({
      id: "spread-3",
      title: "Finishes & Bookmatching",
      subtitle: "Vein Continuity & Reflectance",
      pageRange: "Pages 04 – 05",
      url: canvas.toDataURL("image/jpeg", 0.92),
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SPREAD 4: ISO/ASTM TESTING MATRIX & JOINERY (Pages 06 - 07)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    const { canvas, ctx } = makeCanvas();

    ctx.fillStyle = "#F7F5EE";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawMarbleVeining(ctx, 0, 0, WIDTH, HEIGHT, false);

    // Left Page (Page 06) — Engineering Testing Matrix
    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("CHAPTER III · STRUCTURAL COMPLIANCE", 90, 110);

    ctx.fillStyle = "#1E1C1A";
    ctx.font = "bold 36px 'Times New Roman', Georgia, serif";
    ctx.fillText("ISO & ASTM COMPLIANCE MATRIX", 90, 165);

    // Testing Table Header
    const tableY = 240;
    const tableW = HALF_W - 180;
    ctx.fillStyle = "#2D2A26";
    ctx.fillRect(90, tableY, tableW, 40);

    ctx.fillStyle = "#FAF8F3";
    ctx.font = "bold 12px monospace";
    ctx.fillText("TEST PROPERTY", 110, tableY + 25);
    ctx.fillText("STANDARD", 360, tableY + 25);
    ctx.fillText("MUBARAK CERTIFIED", 560, tableY + 25);

    const rows = [
      { prop: "Water Absorption", std: "ISO 10545-3", val: "< 0.05% (Impervious)" },
      { prop: "Modulus of Rupture", std: "ISO 10545-4", val: "≥ 52 N/mm²" },
      { prop: "Deep Abrasion Resistance", std: "ISO 10545-6", val: "≤ 135 mm³ (Ultra-durable)" },
      { prop: "Linear Thermal Expansion", std: "ISO 10545-8", val: "6.0 × 10⁻⁶ K⁻¹" },
      { prop: "Thermal Shock Resistance", std: "ISO 10545-9", val: "Unaffected (Zero Crazing)" },
      { prop: "Frost Resistance", std: "ISO 10545-12", val: "100 Freeze-Thaw Cycles (Pass)" },
      { prop: "Chemical Resistance", std: "ISO 10545-13", val: "Class A (Acid & Alkali Proof)" },
      { prop: "Stain Resistance", std: "ISO 10545-14", val: "Class 5 (Highest Cleanability)" },
      { prop: "Surface Hardness (Mohs)", std: "EN 101", val: "Mohs 8 (Resistant to Steel/Key)" },
      { prop: "Pendulum Slip (Wet)", std: "BS 7976-2", val: "PTV > 36 (Low Slip Potential)" },
      { prop: "Volatile Organic (VOC)", std: "CDPH 01350", val: "Zero Emissions (Greenguard)" },
    ];

    rows.forEach((r, idx) => {
      const ry = tableY + 40 + idx * 46;
      ctx.fillStyle = idx % 2 === 0 ? "rgba(255, 255, 255, 0.7)" : "rgba(240, 236, 226, 0.5)";
      ctx.fillRect(90, ry, tableW, 46);

      ctx.fillStyle = "#2D2A26";
      ctx.font = "13px Georgia, serif";
      ctx.fillText(r.prop, 110, ry + 28);

      ctx.fillStyle = "#7A766E";
      ctx.font = "12px monospace";
      ctx.fillText(r.std, 360, ry + 28);

      ctx.fillStyle = "#8C6D23";
      ctx.font = "bold 12px monospace";
      ctx.fillText(r.val, 560, ry + 28);

      ctx.strokeStyle = "rgba(140, 109, 35, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(90, ry, tableW, 46);
    });

    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.fillText("06 · TESTING COMPLIANCE", 90, HEIGHT - 60);

    // Right Page (Page 07) — Joinery & CNC Edge Profiles
    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("CHAPTER IV · CNC FABRICATION", HALF_W + 90, 110);

    ctx.fillStyle = "#1E1C1A";
    ctx.font = "bold 36px 'Times New Roman', Georgia, serif";
    ctx.fillText("JOINERY & EDGE DETAILS", HALF_W + 90, 165);

    const edges = [
      {
        title: "45° MITERED MONOLITHIC JOINT",
        desc: "Beveled 45-degree edge joinery with fiberglass-reinforced backing resin. Delivers the look of a solid quarry block.",
      },
      {
        title: "SHARK-NOSE 12MM REVERSE CHAMFER",
        desc: "Reverse-angled undercut profile providing a floating visual weight for bespoke island counters and vanity basins.",
      },
      {
        title: "EASED 2MM PENCIL BEVEL",
        desc: "Micro-radiused corner preventing edge chipping under rigorous commercial culinary or hospitality impacts.",
      },
      {
        title: "INTEGRATED MONOLITHIC TROUGH DRAIN",
        desc: "Zero-grout sloped floor basin routed with 5-axis waterjet, matching vanity wall veining continuously.",
      },
    ];

    edges.forEach((e, idx) => {
      const ey = 250 + idx * 180;
      ctx.fillStyle = "#8C6D23";
      ctx.font = "bold 13px monospace";
      ctx.fillText(e.title, HALF_W + 90, ey);

      ctx.fillStyle = "#3D3933";
      ctx.font = "15px Georgia, serif";
      ctx.fillText(e.desc, HALF_W + 90, ey + 32);

      // Edge diagram box
      ctx.strokeStyle = "rgba(140, 109, 35, 0.3)";
      ctx.strokeRect(HALF_W + 90, ey + 75, HALF_W - 180, 50);
      ctx.fillStyle = "rgba(201, 161, 58, 0.05)";
      ctx.fillRect(HALF_W + 90, ey + 75, HALF_W - 180, 50);

      ctx.fillStyle = "#7A766E";
      ctx.font = "11px monospace";
      ctx.fillText(`CNC SPECIFICATION // PROFILE 0${idx + 1} // TOLERANCE ±0.2MM`, HALF_W + 110, ey + 105);
    });

    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText("PAGE 07", WIDTH - 90, HEIGHT - 60);
    ctx.textAlign = "left";

    drawSpineShadow(ctx, WIDTH, HEIGHT);

    spreads.push({
      id: "spread-4",
      title: "Testing & Joinery",
      subtitle: "ISO Compliance & Edge Profiles",
      pageRange: "Pages 06 – 07",
      url: canvas.toDataURL("image/jpeg", 0.92),
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SPREAD 5: SHOWROOM EXPERIENCE & HARDCOVER BACK COVER (Pages 08 - Back)
     ═════════════════════════════════════════════════════════════════════════ */
  {
    const { canvas, ctx } = makeCanvas();

    // Left Page (Page 08) — Studio Consultation & Warranty
    ctx.fillStyle = "#FAF8F3";
    ctx.fillRect(0, 0, HALF_W, HEIGHT);
    drawMarbleVeining(ctx, 0, 0, HALF_W, HEIGHT, false);

    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("CHAPTER V · ARCHITECTURAL PARTNERSHIP", 90, 110);

    ctx.fillStyle = "#1E1C1A";
    ctx.font = "bold 36px 'Times New Roman', Georgia, serif";
    ctx.fillText("CONSULTATION & SPECIFICATION", 90, 165);

    if (showroomPhoto && showroomPhoto.complete && showroomPhoto.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(90, 230, HALF_W - 180, 360);
      ctx.clip();
      ctx.drawImage(showroomPhoto, 90, 230, HALF_W - 180, 360);
      ctx.restore();

      ctx.strokeStyle = "#8C6D23";
      ctx.strokeRect(90, 230, HALF_W - 180, 360);
    }

    ctx.fillStyle = "#3D3933";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("The Mubarak Materials Studio welcomes architects, interior", 90, 640);
    ctx.fillText("designers, and developers to inspect monolithic slabs under natural", 90, 670);
    ctx.fillText("daylight before cutting and dispatch. Sample box kits available.", 90, 700);

    // 25 Year Warranty Badge
    ctx.fillStyle = "rgba(201, 161, 58, 0.08)";
    ctx.fillRect(90, 760, HALF_W - 180, 180);
    ctx.strokeStyle = "#8C6D23";
    ctx.strokeRect(90, 760, HALF_W - 180, 180);

    ctx.fillStyle = "#8C6D23";
    ctx.font = "bold 13px monospace";
    ctx.fillText("25-YEAR COMMERCIAL PERFORMANCE WARRANTY", 120, 810);

    ctx.fillStyle = "#4A463E";
    ctx.font = "14px Georgia, serif";
    ctx.fillText("Covers flexural integrity, zero surface crazing, colorfastness against", 120, 845);
    ctx.fillText("harsh sunlight, and permanent stain resistance when installed to spec.", 120, 875);

    ctx.fillStyle = "#99958C";
    ctx.font = "12px monospace";
    ctx.fillText("08 · ARCHITECTURAL WARRANTY", 90, HEIGHT - 60);

    // Right Page (Back Cover)
    ctx.fillStyle = "#121110";
    ctx.fillRect(HALF_W, 0, HALF_W, HEIGHT);
    drawMarbleVeining(ctx, HALF_W, 0, HALF_W, HEIGHT, true);

    ctx.strokeStyle = "rgba(201, 161, 58, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(HALF_W + 60, 60, HALF_W - 120, HEIGHT - 120);

    // Back Cover Center Branding
    ctx.fillStyle = "#C9A13A";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MUBARAK TILES & CERAMICS", HALF_W + HALF_W / 2, 480);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "italic 32px 'Times New Roman', Georgia, serif";
    ctx.fillText("Architectural Surface Compendium", HALF_W + HALF_W / 2, 540);

    ctx.fillStyle = "#99958C";
    ctx.font = "13px monospace";
    ctx.fillText("QUARRY DIRECT · SINTERED PORCELAIN · NATURAL STONE", HALF_W + HALF_W / 2, 600);

    ctx.fillStyle = "#7A766E";
    ctx.font = "14px monospace";
    ctx.fillText("STUDIO & WAREHOUSE: NH-8 HIGH-TRAFFIC HUB", HALF_W + HALF_W / 2, 720);
    ctx.fillText("SPECIFICATION DESK: +91 98765 43210", HALF_W + HALF_W / 2, 755);
    ctx.fillText("WWW.MUBARAKCERAMICS.COM", HALF_W + HALF_W / 2, 790);

    // Barcode serial stamp
    ctx.fillStyle = "#C9A13A";
    ctx.font = "bold 11px monospace";
    ctx.fillText("ISBN 978-0-2026-ARCH-SLAB-4", HALF_W + HALF_W / 2, 980);
    ctx.textAlign = "left";

    drawSpineShadow(ctx, WIDTH, HEIGHT);

    spreads.push({
      id: "spread-5",
      title: "Warranty & Back Cover",
      subtitle: "Studio Provenance & Seal",
      pageRange: "Page 08 · Back Cover",
      url: canvas.toDataURL("image/jpeg", 0.92),
    });
  }

  return spreads;
}
