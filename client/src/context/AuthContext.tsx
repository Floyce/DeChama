import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

const API_BASE = '/api'

interface User {
    id: string
    phoneNumber: string
    displayName: string
    referralCode?: string
    referredBy?: string
    email?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (phoneNumber: string, password: string) => Promise<boolean>
    signup: (phoneNumber: string, password: string, displayName: string, referralCode?: string) => Promise<boolean>
    logout: () => void
    logs: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [logs, setLogs] = useState<string[]>([])
    const toast = useToast()

    useEffect(() => {
        const savedUser = localStorage.getItem('impactchain_user')
        const savedToken = localStorage.getItem('impactchain_token')
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser))
            setToken(savedToken)
        }
    }, [])

    const logAction = (action: string) => {
        const timestamp = new Date().toISOString()
        const logEntry = `[${timestamp}] ${action}`
        setLogs(prev => [...prev, logEntry])
        console.log('Security Log:', logEntry)
    }

    const login = async (phoneNumber: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: phoneNumber, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast({ title: data.detail || 'Invalid credentials', status: 'error', duration: 3000 })
                logAction(`Failed login: ${phoneNumber}`)
                return false
            }
            const userData: User = {
                id: data.user.id,
                phoneNumber: data.user.phoneNumber || phoneNumber,
                displayName: data.user.displayName || data.user.display_name || phoneNumber,
                referralCode: data.user.referralCode,
                referredBy: data.user.referredBy,
                email: data.user.email,
            }
            setUser(userData)
            setToken(data.access_token)
            localStorage.setItem('impactchain_user', JSON.stringify(userData))
            localStorage.setItem('impactchain_token', data.access_token)
            logAction(`User logged in: ${phoneNumber}`)
            toast({ title: 'Welcome back!', status: 'success', duration: 2000 })
            return true
        } catch (err) {
            toast({ title: 'Login failed — is the backend running?', status: 'error', duration: 4000 })
            return false
        }
    }

    const signup = async (
        phoneNumber: string,
        password: string,
        displayName: string,
        referralCode?: string
    ): Promise<boolean> => {
        try {
            // Generate a synthetic email from phone so backend email field is satisfied
            const syntheticEmail = `${phoneNumber.replace(/[^a-zA-Z0-9]/g, '')}@dechama.app`
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: syntheticEmail,
                    phoneNumber,
                    display_name: displayName,
                    password,
                    referralCode: referralCode || null,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast({ title: data.detail || 'Registration failed', status: 'error', duration: 3000 })
                return false
            }
            const userData: User = {
                id: data.user.id,
                phoneNumber: data.user.phoneNumber || phoneNumber,
                displayName: data.user.displayName || data.user.display_name || displayName,
                referralCode: data.user.referralCode,
                email: data.user.email,
            }
            setUser(userData)
            setToken(data.access_token)
            localStorage.setItem('impactchain_user', JSON.stringify(userData))
            localStorage.setItem('impactchain_token', data.access_token)
            logAction(`New user registered: ${phoneNumber}`)
            toast({ title: 'Account Created!', status: 'success', duration: 2000 })
            return true
        } catch (err) {
            toast({ title: 'Signup failed — is the backend running?', status: 'error', duration: 4000 })
            return false
        }
    }

    const logout = () => {
        logAction(`User logged out: ${user?.phoneNumber}`)
        setUser(null)
        setToken(null)
        localStorage.removeItem('impactchain_user')
        localStorage.removeItem('impactchain_token')
        toast({ title: 'Logged out', status: 'info' })
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, signup, logout, logs }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}
