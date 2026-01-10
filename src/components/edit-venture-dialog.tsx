"use client";

import { useState, useEffect } from "react";
import { Camera, Image as ImageIcon, Loader2, MessageCircle, Instagram, Facebook, Globe, Mail, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { compressImageToWebP } from "@/lib/image-utils";
import { useUpdateVenture } from "@/hooks/queries";
import type { Venture } from "@/services/ventures.service";
import { toast } from "sonner";

interface EditVentureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  venture: Venture;
}

export function EditVentureDialog({ isOpen, onClose, venture }: EditVentureDialogProps) {
  const updateVenture = useUpdateVenture();

  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    description: "",
    logoUrl: "",
    ownerImageUrl: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    website: "",
    email: "",
  });

  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [isCompressingOwner, setIsCompressingOwner] = useState(false);

  useEffect(() => {
    if (venture) {
      setFormData({
        name: venture.name || "",
        owner: venture.owner || "",
        description: venture.description || "",
        logoUrl: venture.logoUrl || "",
        ownerImageUrl: venture.ownerImageUrl || "",
        whatsapp: venture.whatsapp || "",
        instagram: venture.instagram || "",
        facebook: venture.facebook || "",
        website: venture.website || "",
        email: venture.email || "",
      });
    }
  }, [venture, isOpen]);

  const handleImgUpload = async (file: File, type: 'logo' | 'owner') => {
    try {
      if (type === 'logo') setIsCompressingLogo(true);
      else setIsCompressingOwner(true);

      const compressed = await compressImageToWebP(file);

      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'ownerImageUrl']: compressed
      }));
    } catch (error) {
      toast.error("Error al procesar la imagen");
    } finally {
      setIsCompressingLogo(false);
      setIsCompressingOwner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVenture.mutateAsync({ id: venture.id, data: formData });
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Emprendimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
          <div className="col-span-2 space-y-2">
            <Label>Nombre del Negocio</Label>
            <Input
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Dueño/a</Label>
            <Input
              value={formData.owner}
              onChange={e => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp (Internacional: 506...)</Label>
            <Input
              value={formData.whatsapp}
              onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="506..."
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Descripción Principal</Label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[80px]"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Logo del Negocio</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handleImgUpload(e.target.files[0], 'logo')}
                disabled={isCompressingLogo}
              />
              {formData.logoUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={formData.logoUrl} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: "" }))}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Foto del Dueño/a</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handleImgUpload(e.target.files[0], 'owner')}
                disabled={isCompressingOwner}
              />
              {formData.ownerImageUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={formData.ownerImageUrl} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, ownerImageUrl: "" }))}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 col-span-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</Label>
              <Input value={formData.instagram} onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</Label>
              <Input value={formData.facebook} onChange={e => setFormData(prev => ({ ...prev, facebook: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Sitio Web</Label>
              <Input value={formData.website} onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
              <Input value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
          </div>

          <div className="col-span-2 pt-4">
            <Button className="w-full h-12 text-lg" disabled={updateVenture.isPending}>
              {updateVenture.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
