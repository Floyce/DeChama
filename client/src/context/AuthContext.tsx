import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

interface User {
    phoneNumber: string
    displayName: string
    referralCode: string
    referredBy?: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (phoneNumber: string, password: string) => Promise<boolean>
    signup: (phoneNumber: string, password: string, displayName: string, referralCode?: string) => Promise<boolean>
    logout: () => void
    logs: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [logs, setLogs] = useState<string[]>([])
    const toast = useToast()

    // Load user from local storage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('impactchain_user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const logAction = (action: string) => {
        const timestamp = new Date().toISOString()
        const ip = '192.168.1.1' // Mock IP
        const logEntry = `[${timestamp}] [IP: ${ip}] ${action}`
        setLogs(prev => [...prev, logEntry])
        console.log("Security Log:", logEntry)
    }

    const login = async (phoneNumber: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: phoneNumber, password })
            })
            const data = await res.json()

            if (data.success) {
                setUser(data.user)
                // Also save chamas if returned
                if (data.user.chamas) {
                    // We might need to handle this in WalletContext or pass it via URL/localstorage intermediate
                    // Ideally, Auth and Wallet contexts should sync. For now, we save user object which contains it.
                }
                localStorage.setItem('impactchain_user', JSON.stringify(data.user))
                logAction(`User logged in: ${phoneNumber}`)
                toast({ title: 'Welcome back!', status: 'success' })
                return true
            } else {
                toast({ title: data.error || 'Login failed', status: 'error' })
                logAction(`Failed login attempt: ${phoneNumber}`)
                return false
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error' })
            return false
        }
    }

    const signup = async (phoneNumber: string, password: string, displayName: string, referralCode?: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber, password, displayName, email: phoneNumber + "@placeholder.com" }) // API expects email, using phone as placeholder for now or update schema
            })
            const data = await res.json()

            if (data.success) {
                setUser(data.user)
                localStorage.setItem('impactchain_user', JSON.stringify(data.user))
                logAction(`New user registered: ${phoneNumber}`)
                toast({ title: 'Account Created', status: 'success' })
                return true
            } else {
                toast({ title: data.error || 'Signup failed', status: 'error' })
                return false
            }
        } catch (error) {
            toast({ title: 'Network Error', status: 'error' })
            return false
        }
    }

    const logout = () => {
        logAction(`User logged out: ${user?.phoneNumber}`)
        setUser(null)
        localStorage.removeItem('impactchain_user')
        toast({ title: 'Logged out', status: 'info' })
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, logs }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
