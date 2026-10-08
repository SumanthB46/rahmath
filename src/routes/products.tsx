import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { GlassNav } from "@/components/hero/GlassNav";
import { Footer } from "@/components/showcase/Footer";
import { LoginSignupModal } from "@/components/auth/LoginSignupModal";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchaseCard } from "@/components/products/ProductPurchaseCard";
import { ProductDetails } from "@/components/products/ProductDetails";
import { TileCalculatorData } from "@/components/products/TileQuantityCalculator";
import { useAuth } from "@/hooks/useAuth";
import { useLenis } from "@/hooks/useLenis";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  Search,
  X,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ShoppingBag,
  ArrowRight,
  Filter,
  Truck,
  CreditCard,
  Building2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getPublicProducts, getPublicCategories, API_BASE_URL } from "@/lib/api";

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  category_name?: string;
  subcategory_name?: string;
  price: number;
  discount_price?: number;
  size?: string;
  finish?: string;
  material?: string;
  thickness?: string;
  color?: string;
  pieces_per_box?: number;
  sqft_per_box?: number;
  stock_quantity?: number;
  unit?: string; // 'box' | 'slab' | 'piece'
  images?: string[];
  description?: string;
  technical_specs?: Record<string, any>;
}

interface ProductsSearchParams {
  id?: number | string;
  category?: string;
  application?: string;
  collection?: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  product_count?: number;
  subcategories?: { id: number; name: string; slug: string; is_active: boolean }[];
}

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductsSearchParams => {
    return {
      id: search.id ? String(search.id) : undefined,
      category: search.category ? String(search.category) : undefined,
      application: search.application ? String(search.application) : undefined,
      collection: search.collection ? String(search.collection) : undefined,
    };
  },
  head: ({ match }) => {
    const search = match.search;
    const space = search.application || search.category || search.collection;
    const title = space
      ? `${space} Tiles — Mubarak Tiles & Ceramics`
      : "Tile Products & Architectural Slabs — Mubarak Tiles & Ceramics";
    return {
      meta: [
        { title },
        {
          name: "description",
          content:
            "Browse our curated collection of vitrified tiles, grand format slabs, porcelain surfaces, and sanitaryware added by Mubarak Tiles & Ceramics.",
        },
      ],
    };
  },
  component: ProductsPage,
});

function ProductsPage() {
  useLenis();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [dbProducts, setDbProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSpace, setActiveSpace] = useState<string>(searchParams.application || "all");
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.category || "all");

  // Always reset scroll to the top of the page when landing on Products or switching params
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, [searchParams.id, searchParams.category, searchParams.application, searchParams.collection]);

  // Dynamic coverage details state
  const [detailCalc, setDetailCalc] = useState<TileCalculatorData>({
    boxes: 1,
    totalPieces: 1,
    totalSqft: 15.5,
    extraSqft: 0,
    totalPrice: 0,
    isValidStock: true,
  });

  // Checkout modal & Auth states
  const [checkoutPayload, setCheckoutPayload] = useState<{
    product: ProductItem;
    boxes: number;
    totalPieces: number;
    totalSqft: number;
    totalPrice: number;
  } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{
    product: ProductItem;
    boxes: number;
    totalPieces: number;
    totalSqft: number;
    totalPrice: number;
  } | null>(null);

  // Form details in checkout modal
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("Bengaluru");
  const [shippingState, setShippingState] = useState("Karnataka");
  const [shippingPincode, setShippingPincode] = useState("560001");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderCompletedResult, setOrderCompletedResult] = useState<{ orderNumber: string; total: number } | null>(null);

  // Autofill user info in checkout modal
  useEffect(() => {
    if (user) {
      if (!recipientName && user.name) setRecipientName(user.name);
      if (!recipientEmail && user.email) setRecipientEmail(user.email);
      if (!recipientPhone && user.mobile) setRecipientPhone(user.mobile);
    }
  }, [user]);

  // Load products and categories from API
  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes] = await Promise.all([
        getPublicProducts({ limit: 200 }),
        getPublicCategories(),
      ]);

      if (prodRes && prodRes.success && Array.isArray(prodRes.products)) {
        setDbProducts(prodRes.products);
      } else {
        setDbProducts([]);
      }

      if (catRes && catRes.success && Array.isArray(catRes.categories)) {
        setCategories(catRes.categories);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error("Failed to load catalog data:", err);
      setError(err?.message || "Unable to load products. Please check connection.");
      setDbProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Filter products for Catalog view
  const filteredProducts = useMemo(() => {
    let list = dbProducts;

    if (activeSpace && activeSpace !== "all") {
      const q = activeSpace.toLowerCase();
      list = list.filter((p) => {
        const text = `${p.name} ${p.subcategory_name || ""} ${p.category_name || ""} ${p.description || ""}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (activeCategory && activeCategory !== "all") {
      const catKey = activeCategory.toLowerCase();
      list = list.filter((p) => {
        const catName = (p.category_name || "").toLowerCase();
        const subName = (p.subcategory_name || "").toLowerCase();
        return (
          catName === catKey ||
          subName === catKey ||
          catName.includes(catKey) ||
          subName.includes(catKey)
        );
      });
    }

    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        `${p.name} ${p.sku} ${p.brand || ""} ${p.size || ""} ${p.finish || ""}`.toLowerCase().includes(sq)
      );
    }

    return list;
  }, [dbProducts, activeSpace, activeCategory, searchQuery]);

  // Find currently active product if `id` search param is present
  const selectedProduct = useMemo(() => {
    if (!searchParams.id) return null;
    return dbProducts.find((p) => String(p.id) === String(searchParams.id)) || null;
  }, [searchParams.id, dbProducts]);

  const handleOpenProduct = (prodId: number | string) => {
    navigate({
      to: "/products",
      search: {
        id: prodId,
        application: activeSpace !== "all" ? activeSpace : undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
      } as any,
    });
  };

  const handleBackToCatalog = () => {
    navigate({
      to: "/products",
      search: {
        application: activeSpace !== "all" ? activeSpace : undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
      } as any,
    });
  };

  // Add to Cart / Checkout Trigger from Purchase Card
  const handleConfirmPurchase = (calc: TileCalculatorData, product: ProductItem) => {
    const payload = {
      product,
      boxes: calc.boxes,
      totalPieces: calc.totalPieces,
      totalSqft: calc.totalSqft,
      totalPrice: calc.totalPrice,
    };

    // Add to global cart
    addToCart({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || "/assets/marble-slabs-corner-v2.png",
      price: Number(product.price),
      quantity: calc.boxes,
      unit: product.unit || "box",
      specs: `${calc.boxes} ${product.unit === "piece" ? "Piece(s)" : "Box(es)"} · ${calc.totalSqft} Sq.ft`,
      dimensions: product.size,
      totalSqft: calc.totalSqft,
      category: product.category_name,
    });

    if (!isAuthenticated) {
      setPendingCheckout(payload);
      setAuthModalOpen(true);
    } else {
      setCheckoutPayload(payload);
      setOrderCompletedResult(null);
    }
  };

  // Called when Auth succeeds
  const handleAuthSuccess = () => {
    if (pendingCheckout) {
      setCheckoutPayload(pendingCheckout);
      setPendingCheckout(null);
      setOrderCompletedResult(null);
    }
  };

  // Submit checkout order to backend
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPayload) return;

    if (!recipientName || !recipientEmail || !recipientPhone || !shippingAddress) {
      toast.error("Please fill in all required delivery address fields.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const { product, boxes } = checkoutPayload;
      const price = Number(product.price);

      const orderPayload = {
        customer_name: recipientName,
        customer_email: recipientEmail,
        customer_phone: recipientPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_pincode: shippingPincode,
        notes: orderNotes || undefined,
        items: [
          {
            product_id: product.id > 1000 ? null : product.id,
            product_name: product.name,
            product_image: product.images?.[0] || null,
            sku: product.sku,
            price: price,
            quantity: boxes,
            unit: product.unit || "box",
          },
        ],
      };

      const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      }).then((r) => r.json());

      if (res.success) {
        toast.success(`Order ${res.order_number} confirmed!`, {
          description: "Product payment confirmed. Logistics desk will coordinate transport details.",
        });
        setOrderCompletedResult({
          orderNumber: res.order_number,
          total: res.product_total,
        });
      } else {
        throw new Error(res.message || "Failed to complete checkout.");
      }
    } catch (err: any) {
      toast.error(err.message || "Order submission failed. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <main className="bg-[#FAF9F5] text-stone-900 min-h-screen pt-20">
      <GlassNav />

      {/* Top Banner & Breadcrumb Navigation */}
      <div className="bg-white border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium overflow-x-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-semibold uppercase tracking-wider transition-colors shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
            <button
              onClick={handleBackToCatalog}
              className="hover:text-stone-900 transition-colors shrink-0 cursor-pointer font-semibold"
            >
              Products
            </button>
            {selectedProduct && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
                <span className="text-stone-400 shrink-0">{selectedProduct.category_name || "Floor Tiles"}</span>
                <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
                <span className="text-stone-800 font-serif truncate max-w-[200px] sm:max-w-xs">
                  {selectedProduct.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!selectedProduct && (
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search tiles, SKU, size..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-4 py-1.5 rounded-full border border-stone-300 bg-stone-50 text-xs focus:outline-none focus:border-amber-700"
                />
              </div>
            )}

            <Link
              to="/sinks"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-800/30 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
            >
              <span>Sinks &amp; Basins</span>
            </Link>

            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-stone-300 bg-stone-100/80 text-stone-800 text-xs font-semibold uppercase tracking-wider hover:bg-stone-200 transition-colors shrink-0"
            >
              PDF Catalogues <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* VIEW A: PRODUCT DETAILS PAGE (When a product is selected) */}
      {selectedProduct ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-6">
            <button
              onClick={handleBackToCatalog}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Products Catalog
            </button>
          </div>

          {/* Desktop 60% / 40% Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 60%: Product Gallery */}
            <div className="lg:col-span-7 space-y-6">
              <ProductGallery
                images={selectedProduct.images}
                productName={selectedProduct.name}
                brand={selectedProduct.brand}
                size={selectedProduct.size}
                hasStock={(selectedProduct.stock_quantity || 0) > 0}
              />
            </div>

            {/* Right 40%: Compact Purchase Card */}
            <div className="lg:col-span-5">
              <ProductPurchaseCard
                name={selectedProduct.name}
                sku={selectedProduct.sku}
                brand={selectedProduct.brand}
                categoryName={selectedProduct.category_name}
                price={Number(selectedProduct.price)}
                unit={selectedProduct.unit}
                stockQuantity={selectedProduct.stock_quantity}
                piecesPerBox={selectedProduct.pieces_per_box}
                sqftPerBox={Number(selectedProduct.sqft_per_box || 15.5)}
                onConfirmPurchase={(calc) => handleConfirmPurchase(calc, selectedProduct)}
                onCalcChange={(calc) => setDetailCalc(calc)}
              />
            </div>
          </div>

          {/* Collapsible Product Details, Coverage & Specifications */}
          <ProductDetails
            sku={selectedProduct.sku}
            name={selectedProduct.name}
            brand={selectedProduct.brand}
            material={selectedProduct.material}
            dimensions={selectedProduct.size}
            finish={selectedProduct.finish}
            thickness={selectedProduct.thickness}
            color={selectedProduct.color}
            unit={selectedProduct.unit}
            description={selectedProduct.description}
            piecesPerBox={selectedProduct.pieces_per_box}
            sqftPerBox={Number(selectedProduct.sqft_per_box || 15.5)}
            selectedBoxes={detailCalc.boxes || 1}
            totalCoverage={detailCalc.totalSqft || Number(selectedProduct.sqft_per_box || 15.5)}
          />
        </div>
      ) : (
        /* VIEW B: COMPACT CATALOG LISTING VIEW (Browse & Filter) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10.5px] font-bold tracking-[0.24em] text-amber-800 uppercase font-mono block mb-1">
                  MUBARAK TILES &amp; CERAMICS CATALOG
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 tracking-tight">
                  {activeSpace !== "all" ? `${activeSpace} Tiles` : "Architectural Tiles & Slabs"}
                </h1>
              </div>

              {(activeSpace !== "all" || activeCategory !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveSpace("all");
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Clear Filters
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-2xl">
              {activeSpace !== "all"
                ? `Showing curated tile products for ${activeSpace.toLowerCase()} spaces. Click any product to calculate required area, whole boxes and place your order.`
                : "Explore our export-grade vitrified slabs, porcelain surfaces, and ceramic wall tiles. Click on any design to view full specifications and box coverage."}
            </p>
          </div>

          {/* Dynamic Filter Bar: Categories from Database */}
          <div className="mb-8 space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-amber-700" />
                <span>Categories</span>
              </div>
              {categories.length > 0 && (
                <span className="text-[11px] font-mono text-stone-400 font-normal lowercase">
                  {categories.length} categories active
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setActiveSpace("all");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === "all" && activeSpace === "all"
                    ? "bg-stone-900 text-white font-semibold shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                All Products ({dbProducts.length})
              </button>

              {categories.map((cat) => {
                const isSelected =
                  activeCategory === String(cat.id) ||
                  activeCategory.toLowerCase() === cat.name.toLowerCase() ||
                  activeCategory.toLowerCase() === cat.slug.toLowerCase() ||
                  activeSpace.toLowerCase() === cat.name.toLowerCase();

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setActiveSpace("all");
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-stone-900 text-white font-semibold shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {typeof cat.product_count === "number" && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? "bg-stone-700 text-white" : "bg-stone-200/80 text-stone-600"
                        }`}
                      >
                        {cat.product_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Product Listing Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-3">
              <span className="font-semibold text-stone-800">
                Showing {filteredProducts.length} Product{filteredProducts.length === 1 ? "" : "s"}
              </span>
              <span>Click any card to calculate box quantity</span>
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-stone-200/80 my-4">
                <Loader2 className="h-10 w-10 text-amber-700 animate-spin mx-auto" />
                <p className="text-sm font-medium text-stone-600">Loading catalog from database...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50/70 border border-red-200 rounded-3xl p-10 text-center space-y-4 my-6">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button
                  onClick={loadCatalogData}
                  className="px-5 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 my-8">
                <Package className="h-12 w-12 text-stone-300 mx-auto stroke-1" />
                <h3 className="text-lg font-serif font-bold text-stone-800">No matching products found</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  No tiles match your current filter. Try choosing another category or clearing your search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredProducts.map((prod) => {
                  const hasStock = (prod.stock_quantity || 0) > 0;
                  const unitLabel = (prod.unit || "box").toLowerCase();

                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleOpenProduct(prod.id)}
                      className="group bg-white rounded-3xl border border-stone-200/90 hover:border-amber-500/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative w-full aspect-[4/3] rounded-2xl bg-stone-100 border border-stone-200/80 overflow-hidden flex items-center justify-center mb-3.5">
                          {prod.images && prod.images.length > 0 ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-stone-400 space-y-1.5 bg-gradient-to-br from-stone-100 to-stone-200/70 w-full h-full">
                              <Layers className="h-9 w-9 text-amber-700 stroke-1" />
                              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-700 text-center font-serif">
                                {prod.brand || "Mubarak Luxury"}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">{prod.size || "Standard Slab"}</span>
                            </div>
                          )}

                          {/* Top Stock Badge */}
                          <div className="absolute top-3 left-3">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs ${
                                hasStock
                                  ? "bg-emerald-100/90 text-emerald-800 border border-emerald-300"
                                  : "bg-stone-200 text-stone-600"
                              }`}
                            >
                              {hasStock ? "In Stock" : "On Request"}
                            </span>
                          </div>

                          {/* Brand Tag Top Right */}
                          {prod.brand && (
                            <div className="absolute top-3 right-3">
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-stone-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full">
                                {prod.brand}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & SKU */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono uppercase">
                            <span>SKU: {prod.sku}</span>
                            <span>{prod.category_name || "Floor Tiles"}</span>
                          </div>

                          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight leading-snug group-hover:text-amber-900 transition-colors">
                            {prod.name}
                          </h3>

                          {prod.description && (
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed pt-0.5">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        {/* Compact Dimensions & Finish Grid */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                            <span className="text-[10px] text-stone-400 font-medium block uppercase">Dimensions</span>
                            <span className="font-semibold text-stone-800 text-xs">{prod.size || "120x240 cm"}</span>
                          </div>

                          <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                            <span className="text-[10px] text-stone-400 font-medium block uppercase">Finish</span>
                            <span className="font-semibold text-stone-800 text-xs truncate block">{prod.finish || "Satin Matte"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Open Details Button */}
                      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                            Price per {unitLabel}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-lg font-bold font-serif text-stone-900">
                              ₹{Number(prod.price).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-stone-400">+ GST</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-900 group-hover:bg-stone-800 text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                        >
                          <span>View Product</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal with address selector and payment breakdown */}
      {checkoutPayload && (
        <CheckoutModal
          isOpen={!!checkoutPayload}
          onClose={() => setCheckoutPayload(null)}
          product={checkoutPayload.product}
          boxes={checkoutPayload.boxes}
          totalPieces={checkoutPayload.totalPieces}
          totalSqft={checkoutPayload.totalSqft}
          totalPrice={checkoutPayload.totalPrice}
        />
      )}

      {/* Split-Screen Phone OTP Login/Signup Modal */}
      <LoginSignupModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <Footer />
    </main>
  );
}
