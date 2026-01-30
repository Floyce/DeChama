import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

interface User {
    id: string
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
            // Mock login - check localStorage for existing users
            const usersData = localStorage.getItem('impactchain_users')
            const users = usersData ? JSON.parse(usersData) : {}

            if (users[phoneNumber] && users[phoneNumber].password === password) {
                const userData = users[phoneNumber]
                setUser(userData)
                localStorage.setItem('impactchain_user', JSON.stringify(userData))
                logAction(`User logged in: ${phoneNumber}`)
                toast({ title: 'Welcome back!', status: 'success', duration: 2000 })
                return true
            } else {
                toast({ title: 'Invalid credentials', status: 'error', duration: 3000 })
                logAction(`Failed login attempt: ${phoneNumber}`)
                return false
            }
        } catch (error) {
            toast({ title: 'Login Error', status: 'error', duration: 3000 })
            return false
        }
    }

    const signup = async (phoneNumber: string, password: string, displayName: string, referralCode?: string) => {
        try {
            // Mock signup - save to localStorage
            const usersData = localStorage.getItem('impactchain_users')
            const users = usersData ? JSON.parse(usersData) : {}

            if (users[phoneNumber]) {
                toast({ title: 'Phone number already registered', status: 'error', duration: 3000 })
                return false
            }

            const newUser: User = {
                id: `user_${Date.now()}`,
                phoneNumber,
                displayName,
                referralCode: referralCode || `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                referredBy: referralCode
            }

            users[phoneNumber] = { ...newUser, password }
            localStorage.setItem('impactchain_users', JSON.stringify(users))

            setUser(newUser)
            localStorage.setItem('impactchain_user', JSON.stringify(newUser))
            logAction(`New user registered: ${phoneNumber}`)
            toast({ title: 'Account Created Successfully!', status: 'success', duration: 2000 })
            return true
        } catch (error) {
            toast({ title: 'Signup Error', status: 'error', duration: 3000 })
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
