"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { MOCK_USERS } from "@/data/mock";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on mount (optional for persistence)
        const stored = localStorage.getItem("casa_user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                localStorage.setItem("casa_user", JSON.stringify(userData));
                router.push("/dashboard");
            } else {
                const error = await res.json();
                alert(error.error || "Error de autenticación");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    const logout = async () => {
        // Optional: Call /api/auth/logout if implemented
        setUser(null);
        localStorage.removeItem("casa_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
