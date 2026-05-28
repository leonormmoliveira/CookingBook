import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    isAuthenticated: () => boolean;
    Login: (userData: User) => void;
    logout: () => void;
    UpdateUser:(user: Partial<User>)=>void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const Login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = () => !!user;

    const UpdateUser = (updatedFields: Partial<User>) => { 
        setUser((prev) => { 
            if (!prev) return prev; 
            return { ...prev, ...updatedFields, }; 
        }); 
    };

    return (
        <AuthContext.Provider value={{ user, Login, logout, isAuthenticated, UpdateUser }}>
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