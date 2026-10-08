import React, { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    gstAmount,
    totalAmount,
    totalCount,
    openCheckout,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeCart();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        if (window.__lenis) window.__lenis.start();
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
    }
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] text-stone-900 border-l border-stone-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-amber-900/10 flex items-center justify-center text-amber-900">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
                  Your Cart
                </h2>
                <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500">
                  {totalCount} {totalCount === 1 ? "Item" : "Items"} Selected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-medium text-stone-400 hover:text-rose-600 transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                className="h-8 w-8 rounded-full border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="h-8 w-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-stone-900">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                    Explore our curated collection of monolithic sinks, custom tile vanities, and architectural slabs.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full pt-2">
                  <Link
                    to="/sinks"
                    onClick={closeCart}
                    className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Explore Sinks &amp; Basins
                  </Link>
                  <Link
                    to="/products"
                    onClick={closeCart}
                    className="w-full py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Browse Tiles &amp; Slabs
                  </Link>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-3.5 flex gap-3.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900 truncate leading-snug">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {item.specs && (
                        <p className="text-[11px] text-stone-500 truncate mt-0.5 font-sans">
                          {item.specs}
                        </p>
                      )}
                      {item.dimensions && (
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          {item.dimensions}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 transition-colors text-xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-stone-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 transition-colors text-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-serif font-bold text-stone-950">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9.5px] text-stone-400 block">
                          ₹{item.price.toLocaleString("en-IN")} / {item.unit || "unit"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Checkout Section */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-stone-200 space-y-4">
              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST (18% Architectural Rate)</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    ₹{gstAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm sm:text-base font-serif font-bold text-stone-950">
                  <span>Estimated Total</span>
                  <span className="text-amber-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Delivery Advisory */}
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/80 flex items-start gap-2 text-[10.5px] text-stone-600">
                <Truck className="h-3.5 w-3.5 text-amber-800 shrink-0 mt-0.5" />
                <p>
                  <strong>Direct Dispatch:</strong> Freight coordination and scheduled truck delivery are confirmed with our logistics team upon order review.
                </p>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={openCheckout}
                className="w-full py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4 text-amber-300" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-stone-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Verified Studio Fulfillment · GST Invoice Provided</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
