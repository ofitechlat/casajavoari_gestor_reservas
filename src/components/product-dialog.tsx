"use client";

import { useState, useEffect } from "react";
import { Camera, Youtube, Loader2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { compressImageToWebP } from "@/lib/image-utils";
import { useCreateProduct, useUpdateProduct } from "@/hooks/queries";
import type { Product } from "@/services/ventures.service";
import { toast } from "sonner";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ventureId: string;
  product?: Product | null;
}

export function ProductDialog({ isOpen, onClose, ventureId, product }: ProductDialogProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(ventureId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "CRC",
    category: "",
    type: "product" as "product" | "service",
    size: "",
    dimensions: "",
    imageUrl: "",
    videoUrl: "",
  });

  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        currency: product.currency || "CRC",
        category: product.category || "",
        type: product.type || "product",
        size: product.size || "",
        dimensions: product.dimensions || "",
        imageUrl: product.imageUrl || "",
        videoUrl: product.videoUrl || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        currency: "CRC",
        category: "",
        type: "product",
        size: "",
        dimensions: "",
        imageUrl: "",
        videoUrl: "",
      });
    }
  }, [product, isOpen]);

  const handleImgUpload = async (file: File) => {
    try {
      setIsCompressing(true);
      const compressed = await compressImageToWebP(file);
      setFormData(prev => ({ ...prev, imageUrl: compressed }));
    } catch (error) {
      toast.error("Error al procesar la imagen");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : undefined,
      ventureId,
    };

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Item" : "Agregar Item al Catálogo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
          <div className="col-span-2 space-y-2">
            <Label>Nombre del Producto/Servicio</Label>
            <Input
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Descripción</Label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[80px]"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <select
              className="w-full h-10 border rounded-md px-3"
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="product">Producto Físico</option>
              <option value="service">Servicio</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Input
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Ropa, Comida, Yoga..."
            />
          </div>
          <div className="space-y-2">
            <Label>Precio</Label>
            <div className="flex gap-2">
              <select
                className="w-20 h-10 border rounded-md px-2"
                value={formData.currency}
                onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              >
                <option value="CRC">₡ (CRC)</option>
                <option value="USD">$ (USD)</option>
              </select>
              <Input
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Talla / Tamaño / Dimensiones</Label>
            <Input
              value={formData.size}
              onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
              placeholder="M, L, o 20x30cm..."
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Camera className="w-4 h-4" /> Foto (WebP)</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && handleImgUpload(e.target.files[0])}
                  disabled={isCompressing}
                />
                {formData.imageUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {isCompressing && <p className="text-xs text-muted-foreground animate-pulse">Comprimiendo...</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500" /> YouTube Link</Label>
              <Input
                value={formData.videoUrl}
                onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="col-span-2 pt-4">
            <Button className="w-full h-12 text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (product ? "Guardar Cambios" : "Guardar Item")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
