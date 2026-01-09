"use client";

import { useState, useEffect } from "react";
import {
    Plus, Store, User, Camera, Instagram, Facebook, Globe, Mail,
    MessageCircle, Trash2, Loader2, Image as ImageIcon, Youtube,
    Tag, Ruler, Box, DollarSign, Wallet, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { compressImageToWebP } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    description?: string;
    price?: number;
    currency: string;
    category?: string;
    type: string;
    size?: string;
    dimensions?: string;
    imageUrl?: string;
    videoUrl?: string;
}

interface Venture {
    id: string;
    name: string;
    owner?: string;
    description?: string;
    logoUrl?: string;
    ownerImageUrl?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
    email?: string;
    products?: Product[];
}

export default function VenturesPage() {
    const [ventures, setVentures] = useState<Venture[]>([]);
    const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVentureDialogOpen, setIsVentureDialogOpen] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

    // Venture Form State
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

    // Product Form State
    const [pName, setPName] = useState("");
    const [pDesc, setPDesc] = useState("");
    const [pPrice, setPPrice] = useState("");
    const [pCurrency, setPCurrency] = useState("CRC");
    const [pCat, setPCat] = useState("");
    const [pType, setPType] = useState("product");
    const [pSize, setPSize] = useState("");
    const [pDim, setPDim] = useState("");
    const [pImg, setPImg] = useState("");
    const [pVideo, setPVideo] = useState("");

    useEffect(() => {
        fetchVentures();
    }, []);

    const fetchVentures = async () => {
        try {
            const res = await fetch('/api/ventures');
            const data = await res.json();
            if (Array.isArray(data)) {
                setVentures(data);
            } else {
                console.error("API response is not an array:", data);
                setVentures([]);
            }
        } catch (error) {
            console.error(error);
            setVentures([]);
        } finally {
            setIsLoading(false);
        }
    };

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
        setIsSaving(true);
        try {
            const res = await fetch('/api/ventures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: vName, owner: vOwner, description: vDesc,
                    logoUrl: vLogo, ownerImageUrl: vOwnerImg, whatsapp: vWhatsapp,
                    instagram: vInsta, facebook: vFb, website: vWeb, email: vEmail
                })
            });
            if (res.ok) {
                setIsVentureDialogOpen(false);
                fetchVentures();
                // Reset fields...
            }
        } catch (error) {
            alert("Error al guardar emprendimiento");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVenture) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: pName, description: pDesc, price: pPrice,
                    currency: pCurrency, category: pCat, type: pType,
                    size: pSize, dimensions: pDim, imageUrl: pImg,
                    videoUrl: pVideo, ventureId: selectedVenture.id
                })
            });
            if (res.ok) {
                setIsProductDialogOpen(false);
                fetchVentures();
                // Refresh detail if open
                const updated = await res.json();
                setSelectedVenture(prev => prev ? { ...prev, products: [...(prev.products || []), updated] } : null);
            }
        } catch (error) {
            alert("Error al guardar producto");
        } finally {
            setIsSaving(false);
        }
    };

    if (selectedVenture) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => setSelectedVenture(null)} className="gap-2 -ml-2">
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
                            <h1 className="text-4xl font-bold">{selectedVenture.name}</h1>
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
                    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-full gap-2"><Plus className="w-4 h-4" /> Nuevo Item</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Agregar al Catálogo</DialogTitle></DialogHeader>
                            <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4 pt-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Nombre del Producto/Servicio</Label>
                                    <Input value={pName} onChange={e => setPName(e.target.value)} required />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Descripción</Label>
                                    <textarea className="w-full p-2 border rounded-md min-h-[80px]" value={pDesc} onChange={e => setPDesc(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <select className="w-full h-10 border rounded-md px-3" value={pType} onChange={e => setPType(e.target.value)}>
                                        <option value="product">Producto Físico</option>
                                        <option value="service">Servicio</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Input value={pCat} onChange={e => setPCat(e.target.value)} placeholder="Ropa, Comida, Yoga..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio</Label>
                                    <div className="flex gap-2">
                                        <select className="w-20 h-10 border rounded-md px-2" value={pCurrency} onChange={e => setPCurrency(e.target.value)}>
                                            <option value="CRC">₡ (CRC)</option>
                                            <option value="USD">$ (USD)</option>
                                        </select>
                                        <Input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Talla / Tamaño</Label>
                                    <Input value={pSize} onChange={e => setPSize(e.target.value)} placeholder="M, L, Grande..." />
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Camera className="w-4 h-4" /> Foto (WebP)</Label>
                                        <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImgUpload(e.target.files[0], setPImg)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500" /> YouTube Link</Label>
                                        <Input value={pVideo} onChange={e => setPVideo(e.target.value)} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="col-span-2 pt-4">
                                    <Button className="w-full h-12 text-lg" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Item"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedVenture.products?.map(p => (
                        <Card key={p.id} className="overflow-hidden border-none shadow-md rounded-3xl group">
                            <div className="aspect-square relative bg-accent overflow-hidden">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>
                                )}
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
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Emprendimientos</h1>
                    <p className="text-muted-foreground">Ecosistema de negocios y servicios de nuestra comunidad.</p>
                </div>

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
                                <Input value={vOwner} onChange={e => setVOwner(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp</Label>
                                <Input value={vWhatsapp} onChange={e => setVWhatsapp(e.target.value)} placeholder="+506..." />
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
                                <Button className="w-full h-12 text-lg" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Perfil de Negocio"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ventures.map(v => (
                        <Card key={v.id}
                            className="p-6 border-none shadow-md hover:shadow-xl transition-all cursor-pointer rounded-3xl group relative overflow-hidden h-[240px]"
                            onClick={() => setSelectedVenture(v)}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                                <Store className="w-32 h-32" />
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
