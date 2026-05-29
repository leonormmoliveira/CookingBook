import React, { useEffect, createContext, useContext, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebaseConfig.ts";
import api from "./services/api.js";

interface User {
    _id: string;
    authUid: string;
    username: string;
    name: string;
    email: string;
    status: string;
    emailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    loading?: boolean;
    isAuthenticated: () => boolean;
    Login: (userData: User) => void;
    Logout: () => void;
    UpdateUser:(user: Partial<User>)=>void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const Login = (userData: User) => setUser(userData);

    const Logout = async () => {
        await auth.signOut();
        setUser(null);
    };

    const isAuthenticated = () => !!user;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const token = await firebaseUser.getIdToken();
                // opcional: validar no backend e buscar perfil MySQL
                const { data } = await api.post("/auth/login", {
                    idToken: token
                });

                if (data.success) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const UpdateUser = (updatedFields: Partial<User>) => { 
        setUser((prev) => { 
            if (!prev) return prev; 
            return { ...prev, ...updatedFields, }; 
        }); 
    };

    return (
        <AuthContext.Provider value={{ user, loading, Login, Logout, isAuthenticated, UpdateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};