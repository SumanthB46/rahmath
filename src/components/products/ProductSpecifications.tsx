import React from "react";

interface ProductSpecificationsProps {
  sku: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  finish?: string;
  thickness?: string;
  color?: string;
  unit?: string;
}

export function ProductSpecifications({
  sku,
  brand = "Mubarak Tiles & Ceramics",
  material = "Glazed Vitrified Porcelain",
  dimensions = "120x240 cm",
  finish = "Satin Matte",
  thickness = "9.0 mm",
  color = "Natural",
  unit = "box",
}: ProductSpecificationsProps) {
  const specs = [
    { label: "SKU", value: sku },
    { label: "Brand", value: brand },
    { label: "Material", value: material },
    { label: "Dimensions", value: dimensions },
    { label: "Surface Finish", value: finish },
    { label: "Thickness", value: thickness },
    { label: "Color Tone", value: color },
    { label: "Packaging Unit", value: unit },
  ];

  return (
    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2.5 text-xs">
      <h5 className="font-bold text-[11px] uppercase tracking-wider text-stone-900 font-mono">
        Product Specifications
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[11.5px]">
        {specs.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-200/50">
            <span className="text-stone-400 font-medium">{item.label}</span>
            <span className="font-semibold text-stone-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSpecifications;
