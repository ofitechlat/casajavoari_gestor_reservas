"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Music, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const { login } = useAuth();
    const [view, setView] = useState<'selection' | 'form'>('selection');
    const [role, setRole] = useState<'gestor' | 'admin' | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectRole = (selectedRole: 'gestor' | 'admin') => {
        setRole(selectedRole);
        setView('form');
        // Pre-fill email as a hint or just leave it for the user
        setEmail(selectedRole === 'gestor' ? 'mercedes' : 'admin');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            // Error managed in AuthContext via alert
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="w-full max-w-md z-10 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Casa Javorai</h1>
                    <p className="text-muted-foreground italic">Sistema de Gestión de Espacios</p>
                </div>

                {view === 'selection' ? (
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => handleSelectRole("gestor")}
                            className="group relative flex items-center gap-6 p-6 bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all rounded-2xl shadow-sm hover:shadow-xl cursor-pointer text-left overflow-hidden"
                        >
                            <div className="p-4 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                <Music className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">Gestora Cultural</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Solicitar espacios y agendar actividades.
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleSelectRole("admin")}
                            className="group relative flex items-center gap-6 p-6 bg-card border border-border hover:border-destructive/50 hover:bg-accent transition-all rounded-2xl shadow-sm hover:shadow-xl cursor-pointer text-left overflow-hidden"
                        >
                            <div className="p-4 bg-destructive/10 rounded-xl text-destructive group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">Administrador</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Aprobar solicitudes y gestionar el centro.
                                </p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="bg-card border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            {role === 'gestor' ? <Music className="w-32 h-32" /> : <ShieldCheck className="w-32 h-32" />}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-8 w-8"
                                onClick={() => setView('selection')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-xl font-bold">
                                {role === 'gestor' ? "Ingreso Gestora" : "Ingreso Administrador"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Usuario</Label>
                                <Input
                                    id="email"
                                    placeholder="Nombre de usuario"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="h-12 border-muted-foreground/20 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="h-12 border-muted-foreground/20 focus:border-primary"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar al Sistema"}
                            </Button>
                        </form>
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 pt-4">
                    <p className="text-xs text-muted-foreground opacity-50">
                        Casa Javorai &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
