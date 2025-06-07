import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import axios from '~/lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    type: 'technician' | 'customer';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

interface AuthContextType extends AuthState {
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const checkAuthStatus = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/user')
            setUser(response.data.user);
            setIsAuthenticated(true);
            console.log(response);
        } catch (e: any) {
            console.log(e)
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                setIsAuthenticated,
                isLoading,
                error,
                checkAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
