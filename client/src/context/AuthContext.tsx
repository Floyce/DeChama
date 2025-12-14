import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

interface User {
    email: string
    displayName: string
    referralCode: string
    referredBy?: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<boolean>
    signup: (email: string, password: string, displayName: string, referralCode?: string) => Promise<boolean>
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

    const login = async (email: string, password: string) => {
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                if (email && password) {
                    // Mock Login Success
                    // In real app: Validate hash, check DB
                    const mockUser: User = {
                        email,
                        displayName: email.split('@')[0], // Default name if not found
                        referralCode: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    }

                    setUser(mockUser)
                    localStorage.setItem('impactchain_user', JSON.stringify(mockUser))
                    logAction(`User logged in: ${email}`)

                    toast({ title: 'Welcome back!', status: 'success' })
                    resolve(true)
                } else {
                    toast({ title: 'Invalid credentials', status: 'error' })
                    logAction(`Failed login attempt: ${email}`)
                    resolve(false)
                }
            }, 1000)
        })
    }

    const signup = async (email: string, password: string, displayName: string, referralCode?: string) => {
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                const uniqueCode = 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase()
                const newUser: User = {
                    email,
                    displayName,
                    referralCode: uniqueCode,
                    referredBy: referralCode
                }

                setUser(newUser)
                localStorage.setItem('impactchain_user', JSON.stringify(newUser))
                logAction(`New user registered: ${email} (Ref: ${referralCode || 'None'})`)

                toast({
                    title: 'Account Created',
                    description: `Your referral code is ${uniqueCode}`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true
                })
                resolve(true)
            }, 1000)
        })
    }

    const logout = () => {
        logAction(`User logged out: ${user?.email}`)
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
