"use client";

import { useState } from "react";
import {
  Plus, Store, User, Camera, Instagram, Facebook, Globe, Mail,
  MessageCircle, Trash2, Loader2, Image as ImageIcon, Youtube,
  Tag, Ruler, Box, DollarSign, Wallet, ArrowLeft, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { compressImageToWebP } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { useVentures, useVenture, useCreateVenture, useDeleteVenture, useDeleteProduct } from "@/hooks/queries";
import { EditVentureDialog } from "@/components/edit-venture-dialog";
import { ProductDialog } from "@/components/dialog/product-dialog";
import type { Venture, Product } from "@/types";


/**
 * TODO: 1. Crear el formulario con z y react-hookform
 * TODO: 2. Crear componetizacion clara.
 * TODO: 3. Documentar y tipar los datos
 * TODO: 4. Responsabilizar cada componente segun su role
 * TODO: 5. Crear pagina separa para los productos de cada emprendimiento
 * TODO: 6. Crear pagina separa para las actividades de cada emprendimiento
 */

export default function VenturesPage() {
  // Data Loading
  const { data: ventures = [], isLoading: isVenturesLoading } = useVentures();

  // Selection State
  const [selectedVentureId, setSelectedVentureId] = useState<string | null>(null);
  const { data: selectedVenture, isLoading: isVentureLoading } = useVenture(selectedVentureId || "", true);

  // Mutations
  const createVentureMutation = useCreateVenture();
  const deleteVentureMutation = useDeleteVenture();
  const deleteProductMutation = useDeleteProduct(selectedVentureId || "");

  // Dialog States
  const [isVentureDialogOpen, setIsVentureDialogOpen] = useState(false);
  const [isEditVentureOpen, setIsEditVentureOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Create Venture Form State
  const [vName, setVName] = useState("");
  const [vOwner, setVOwner] = useState("");
  const [vDesc, setVDesc] = useState("");
  const [vLogo, setVLogo] = useState("");
  const [vOwnerImg, setVOwnerImg] = useState("");
  const [vWhatsapp, setVWhatsapp] = useState("");
  const [vInsta, setVInsta] = useState("");
  const [vFb, setVFb] = useState("");
  const [vWeb, setVWeb] = useState("");
  const [vEmail, setVEmail] = useState("");

  const handleImgUpload = async (file: File, setter: (val: string) => void) => {
    try {
      const compressed = await compressImageToWebP(file);
      setter(compressed);
    } catch (error) {
      alert("Error al procesar la imagen");
    }
  };

  const handleCreateVenture = async (e: React.FormEvent) => {
    e.preventDefault();
    createVentureMutation.mutate({
      name: vName, owner: vOwner, description: vDesc,
      logoUrl: vLogo, ownerImageUrl: vOwnerImg, whatsapp: vWhatsapp,
      instagram: vInsta, facebook: vFb, website: vWeb, email: vEmail
    }, {
      onSuccess: () => {
        setIsVentureDialogOpen(false);
        // Reset fields
        setVName(""); setVOwner(""); setVDesc(""); setVLogo("");
        setVOwnerImg(""); setVWhatsapp(""); setVInsta("");
        setVFb(""); setVWeb(""); setVEmail("");
      }
    });
  };

  const handleDeleteVenture = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de eliminar este emprendimiento y todos sus productos?")) {
      deleteVentureMutation.mutate(id);
    }
  };

  const handleDeleteProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsProductDialogOpen(true);
  };

  if (selectedVentureId && selectedVenture) {
    return (
      <div className="space-y-6 p-8">
        <Button variant="ghost" onClick={() => setSelectedVentureId(null)} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Volver a Emprendimientos
        </Button>

        <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-card to-accent/20 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Store className="w-40 h-40 capitalize" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white shadow-lg border-4 border-white shrink-0">
              <img src={selectedVenture.logoUrl || "/placeholder-shop.png"} alt={selectedVenture.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-bold">{selectedVenture.name}</h1>
                <Button variant="secondary" size="icon" className="rounded-full shadow-md" onClick={() => setIsEditVentureOpen(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-lg italic">{selectedVenture.description}</p>

              <div className="flex justify-center md:justify-start gap-4 pt-2">
                {selectedVenture.whatsapp && <Button variant="outline" size="icon" className="rounded-full hover:bg-green-50 hover:text-green-600 border-none shadow-sm"><MessageCircle className="w-5 h-5" /></Button>}
                {selectedVenture.instagram && <Button variant="outline" size="icon" className="rounded-full hover:bg-pink-50 hover:text-pink-600 border-none shadow-sm"><Instagram className="w-5 h-5" /></Button>}
                {selectedVenture.facebook && <Button variant="outline" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600 border-none shadow-sm"><Facebook className="w-5 h-5" /></Button>}
                {selectedVenture.website && <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary border-none shadow-sm"><Globe className="w-5 h-5" /></Button>}
              </div>
            </div>

            {selectedVenture.ownerImageUrl && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                  <img src={selectedVenture.ownerImageUrl} alt={selectedVenture.owner} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{selectedVenture.owner}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-between items-center pt-8">
          <h2 className="text-2xl font-bold">Catálogo de Productos y Servicios</h2>
          <Button className="rounded-full gap-2" onClick={handleNewProduct}><Plus className="w-4 h-4" /> Nuevo Item</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedVenture.products?.map(p => (
            <Card key={p.id} className="overflow-hidden border-none shadow-md rounded-3xl group relative">
              <div className="aspect-square relative bg-accent overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>
                )}

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="rounded-full w-8 h-8" onClick={(e) => handleEditProduct(p, e)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="rounded-full w-8 h-8" onClick={(e) => handleDeleteProduct(p.id, e)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg">
                    <p className="text-xs font-bold text-muted-foreground uppercase">{p.type === 'product' ? 'Producto' : 'Servicio'}</p>
                    <p className="text-xl font-black text-primary">
                      {p.currency === 'CRC' ? '₡' : '$'} {p.price?.toLocaleString()}
                    </p>
                  </div>
                  {p.videoUrl && (
                    <Button size="icon" variant="destructive" className="rounded-full shadow-lg h-10 w-10 hover:scale-110 transition-transform" onClick={() => window.open(p.videoUrl, '_blank')}>
                      <Youtube className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg">{p.name}</h3>
                {p.category && <span className="inline-block bg-accent px-2 py-1 rounded text-[10px] uppercase font-bold tracking-tighter">{p.category}</span>}
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                {p.size && <p className="text-xs font-medium bg-primary/5 p-2 rounded-lg flex items-center gap-2"><Ruler className="w-3 h-3" /> Talla: {p.size}</p>}
              </div>
            </Card>
          ))}
        </div>

        <EditVentureDialog
          isOpen={isEditVentureOpen}
          onClose={() => setIsEditVentureOpen(false)}
          venture={selectedVenture}
        />

        <ProductDialog
          isOpen={isProductDialogOpen}
          onClose={() => setIsProductDialogOpen(false)}
          ventureId={selectedVentureId}
          product={editingProduct}
        />
      </div>
    );
  }

  /* Pagina de los emprendimientos */
  return (
    <div className="space-y-8 mt-6 px-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emprendimientos</h1>
          <p className="text-muted-foreground">Ecosistema de negocios y servicios de nuestra comunidad.</p>
        </div>

        {/**
         * Crear componente aparte del dialog de este formulario y abrir el dialog con un boton
         */}
        <Dialog open={isVentureDialogOpen} onOpenChange={setIsVentureDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg gap-2"><Plus className="w-4 h-4" /> Registrar Negocio</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nuevo Emprendimiento</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateVenture} className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2 space-y-2">
                <Label>Nombre del Negocio</Label>
                <Input value={vName} onChange={e => setVName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Dueño/a</Label>
                <Input value={vOwner} onChange={e => setVOwner(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp (506...)</Label>
                <Input value={vWhatsapp} onChange={e => setVWhatsapp(e.target.value)} placeholder="506..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descripción Principal</Label>
                <textarea className="w-full p-2 border rounded-md min-h-[80px]" value={vDesc} onChange={e => setVDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Logo del Negocio</Label>
                <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImgUpload(e.target.files[0], setVLogo)} />
              </div>
              <div className="space-y-2">
                <Label>Foto del Dueño/a</Label>
                <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImgUpload(e.target.files[0], setVOwnerImg)} />
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2"><Label>Instagram</Label><Input value={vInsta} onChange={e => setVInsta(e.target.value)} /></div>
                <div className="space-y-2"><Label>Facebook</Label><Input value={vFb} onChange={e => setVFb(e.target.value)} /></div>
                <div className="space-y-2"><Label>Sitio Web</Label><Input value={vWeb} onChange={e => setVWeb(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={vEmail} onChange={e => setVEmail(e.target.value)} /></div>
              </div>
              <div className="col-span-2 pt-4">
                <Button className="w-full h-12 text-lg" disabled={createVentureMutation.isPending}>
                  {createVentureMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Perfil de Negocio"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {isVenturesLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" /></div>
      ) : ventures.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground italic">No hay emprendimientos registrados aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ventures.map(v => (
            <Card key={v.id}
              className="p-6 border-none shadow-md hover:shadow-xl transition-all cursor-pointer rounded-3xl group relative overflow-hidden h-[240px]"
              onClick={() => setSelectedVentureId(v.id)}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                <Store className="w-32 h-32" />
              </div>

              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Button size="icon" variant="destructive" className="rounded-full w-8 h-8" onClick={(e) => handleDeleteVenture(v.id, e)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-col h-full relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md border-4 border-white overflow-hidden mb-4 shrink-0">
                  <img src={v.logoUrl || "https://avatar.vercel.sh/shop"} alt={v.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-1 line-clamp-1">{v.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 italic mb-4">{v.description || "Comunidad Javorai"}</p>

                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20 bg-accent">
                      {v.ownerImageUrl ? <img src={v.ownerImageUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-1 opacity-50" />}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground/80">{v.owner || "Dueño/a"}</span>
                  </div>
                  <span className="text-primary font-bold text-sm tracking-widest uppercase group-hover:translate-x-1 transition-transform">Ver Catálogo</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
