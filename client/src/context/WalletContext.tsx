import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@chakra-ui/react'

interface WalletContextType {
    address: string | null
    displayName: string | null
    setDisplayName: (name: string) => void
    balance: string
    isConnected: boolean
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    myChamas: string[]
    fetchMyChamas: () => Promise<void>
    setMyChamas: React.Dispatch<React.SetStateAction<string[]>>
    activeChama: string | null
    setActiveChama: (name: string | null) => void
    pendingChamas: string[]
    setPendingChamas: React.Dispatch<React.SetStateAction<string[]>>
    currency: string
    setCurrency: (c: string) => void
    formatCurrency: (btc: string) => { btc: string; local: string; full: string; sats: string }
    currentUserRole: string | null
    fetchMembership: (chamaId: string) => Promise<void>
    preferredDisplay: 'BTC' | 'KES'
    setPreferredDisplay: (d: 'BTC' | 'KES') => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null)
    const [displayName, setDisplayNameState] = useState<string | null>(null)
    const [balance, setBalance] = useState<string>('0.00')
    const [myChamas, setMyChamas] = useState<string[]>([])
    const [activeChama, setActiveChama] = useState<string | null>(null)
    const [pendingChamas, setPendingChamas] = useState<string[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

    // Currency State
    const [currency, setCurrency] = useState('KES')
    const [preferredDisplay, setPreferredDisplayState] = useState<'BTC' | 'KES'>('KES')
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
        'KES': 12850000, // 1 BTC = ~12.8M KES
        'USD': 95000,    // 1 BTC = ~95k USD
        'UGX': 360000000,// 1 BTC = ~360M UGX
        'TZS': 250000000 // 1 BTC = ~250M TZS
    })

    const toast = useToast()

    // Fetch Rates Logic (Real-Time from Backend)
    useEffect(() => {
        // Initial load from preference
        const savedCurrency = localStorage.getItem('impactchain_currency')
        if (savedCurrency) setCurrency(savedCurrency)

        const fetchRates = async () => {
            try {
                const res = await fetch('/api/rates/btc-kes')
                const data = await res.json()
                if (data.rate) {
                    setExchangeRates(prev => ({
                        ...prev,
                        'KES': data.rate
                    }))
                }
            } catch (err) {
                console.error("Failed to fetch rates", err)
            }
        }

        fetchRates() // Initial fetch
        const interval = setInterval(fetchRates, 300000) // Every 5 minutes
        return () => clearInterval(interval)
    }, [])

    const formatCurrency = (btcString: string) => {
        const amount = parseFloat(btcString.replace(/[^0-9.]/g, '')) || 0
        const rate = exchangeRates[currency] || 0
        const localValue = amount * rate
        const satsValue = Math.round(amount * 100000000)

        const localFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(localValue)

        return {
            btc: `${amount.toFixed(4)} BTC`,
            sats: `${satsValue.toLocaleString()} sats`,
            local: localFormatted,
            full: `${amount.toFixed(4)} BTC (≈ ${localFormatted})`
        }
    }

    const setPreferredDisplay = (d: 'BTC' | 'KES') => {
        setPreferredDisplayState(d)
        localStorage.setItem('impactchain_pref_display', d)
    }

    // Save currency preference
    const handleSetCurrency = (c: string) => {
        setCurrency(c)
        localStorage.setItem('impactchain_currency', c)
    }

    // Fetch Chamas API
    const fetchMyChamas = async () => {
        const savedUser = localStorage.getItem('impactchain_user')
        if (savedUser) {
            const user = JSON.parse(savedUser)
            try {
                const res = await fetch('/api/user/chamas', {
                    headers: { 'user-id': user.id }
                })
                const data = await res.json()
                if (Array.isArray(data)) {
                    // Extract names or ids. For now our app uses strings for names heavily.
                    const names = data.map((c: any) => c.name)
                    setMyChamas(names)
                }
            } catch (err) {
                console.error("Failed to fetch chamas", err)
            }
        }
    }

    const fetchMembership = async (chamaId: string) => {
        const savedUser = localStorage.getItem('impactchain_user')
        if (savedUser) {
            const user = JSON.parse(savedUser)
            try {
                const res = await fetch(`/api/chamas/${chamaId}/my-membership?user_id=${user.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setCurrentUserRole(data.role)
                } else {
                    setCurrentUserRole(null)
                }
            } catch (err) {
                console.error("Failed to fetch membership", err)
                setCurrentUserRole(null)
            }
        }
    }


    useEffect(() => {
        // Check local storage on load
        const savedAddress = localStorage.getItem('impactchain_address')
        const savedName = localStorage.getItem('impactchain_name')

        if (savedAddress) {
            setAddress(savedAddress)
            setBalance('1.45')
        }
        if (savedName) {
            setDisplayNameState(savedName)
        }
        const savedDisplay = localStorage.getItem('impactchain_pref_display') as 'BTC' | 'KES'
        if (savedDisplay) setPreferredDisplayState(savedDisplay)

        // Fetch real chamas
        fetchMyChamas()

        // Poll every 30s
        const interval = setInterval(fetchMyChamas, 30000)
        return () => clearInterval(interval)

    }, [])

    const setDisplayName = (name: string) => {
        setDisplayNameState(name)
        localStorage.setItem('impactchain_name', name)
    }

    const connectWallet = async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 800))
            const mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
            setAddress(mockAddress)
            setBalance('1.45')

            // We don't wipe myChamas here anymore, we let the API handle the truth based on user login
            // setMyChamas([]) 
            // setActiveChama(null) 

            localStorage.setItem('impactchain_address', mockAddress)
            toast({
                title: 'Wallet Connected',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            toast({ title: 'Connection Failed', status: 'error' })
        }
    }

    const disconnectWallet = () => {
        setAddress(null)
        setDisplayNameState(null)
        setBalance('0.00')
        // setMyChamas([]) // Keep them if logged in via AuthContext? 
        // Logic split: Wallet is for signing, Auth is for data access. 
        // We can keep data visible even if wallet disconnected? 
        // User requested separation.

        localStorage.removeItem('impactchain_address')
        localStorage.removeItem('impactchain_name')
        toast({ title: 'Wallet Disconnected', status: 'info' })
    }

    return (
        <WalletContext.Provider value={{
            address,
            displayName,
            setDisplayName,
            balance,
            isConnected: !!address,
            connectWallet,
            disconnectWallet,
            myChamas,
            fetchMyChamas,
            setMyChamas,
            activeChama,
            setActiveChama,
            pendingChamas,
            setPendingChamas,
            currency,
            setCurrency: handleSetCurrency,
            formatCurrency,
            currentUserRole,
            fetchMembership,
            preferredDisplay,
            setPreferredDisplay
        }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext)
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
