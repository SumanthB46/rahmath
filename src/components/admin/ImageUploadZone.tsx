import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { toast } from "sonner";

interface ImageUploadZoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export function ImageUploadZone({
  value,
  onChange,
  label = "Product Main Image",
  helperText = "Drag & drop an image here, or browse from your computer (PNG, JPG, WEBP)",
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format", { description: "Please upload an image file (PNG, JPG, WEBP, AVIF)" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large", { description: "Maximum image size is 10MB" });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImage(file);
      if (res?.url) {
        onChange(res.url);
        toast.success("Image uploaded successfully");
      }
    } catch (err: any) {
      toast.error("Image upload failed", { description: err.message || "Could not upload image" });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value to allow selecting same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-medium text-stone-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-amber-700 hover:text-amber-800 underline transition-colors"
        >
          {showUrlInput ? "Hide Direct URL" : "Paste Image URL"}
        </button>
      </div>

      {showUrlInput && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /assets/..."
          className="w-full rounded-xl border border-stone-300 bg-white py-1.5 px-3 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-none mb-2"
        />
      )}

      {value ? (
        <div className="relative rounded-2xl border border-stone-300 bg-stone-50 p-3 flex items-center gap-4 group">
          <div className="h-20 w-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 relative">
            <img
              src={value}
              alt="Uploaded visual preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="truncate">Image Attached</span>
            </div>
            <p className="text-[10px] font-mono text-stone-500 truncate mt-0.5">{value}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 shadow-xs transition-colors"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3 text-amber-600" />}
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-amber-600 bg-amber-500/10 scale-[1.01]"
              : "border-stone-300 bg-stone-50 hover:bg-stone-100/80 hover:border-amber-500"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2 gap-2 text-stone-600">
              <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
              <span className="text-xs font-semibold">Uploading image to studio storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-11 w-11 rounded-2xl bg-amber-100/70 border border-amber-200/80 flex items-center justify-center text-amber-700">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-800">
                  Drop image here or click to browse
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
