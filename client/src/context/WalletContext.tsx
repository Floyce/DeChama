import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@chakra-ui/react'

interface WalletContextType {
    address: string | null
    displayName: string | null
    setDisplayName: (name: string) => void
    balance: string
    isConnected: boolean
    connectWallet: (addr: string) => Promise<void>
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
    preferredDisplay: 'sats' | 'kshs'
    setPreferredDisplay: (d: 'sats' | 'kshs') => void
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
    const [currency, setCurrency] = useState('kshs')
    const [preferredDisplay, setPreferredDisplayState] = useState<'sats' | 'kshs'>('kshs')
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
        'kshs': 12850000, // 1 sats = ... wait, we need to handle sats exchange logic or just keep the rate?
        'USD': 95000,    // 1 BTC = ~95k USD
        'UGX': 360000000,// 1 BTC = ~360M UGX
        'TZS': 250000000 // 1 BTC = ~250M TZS
    })

    const toast = useToast()

    // Fetch Rates Logic (Real-Time from Backend)
    useEffect(() => {
        // Initial load from preference
        let savedCurrency = localStorage.getItem('impactchain_currency')
        if (savedCurrency === 'KES') savedCurrency = 'kshs'
        if (savedCurrency) setCurrency(savedCurrency)

        const fetchRates = async () => {
            try {
                const res = await fetch('/api/rates/btc-kes')
                const data = await res.json()
                if (data.rate) {
                    setExchangeRates(prev => ({
                        ...prev,
                        'kshs': data.rate
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

        const safeCurrency = currency === 'kshs' ? 'KES' : currency
        let localFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: safeCurrency,
            maximumFractionDigits: 0
        }).format(localValue)
        
        if (currency === 'kshs') {
             localFormatted = localFormatted.replace(/KES|KSh/g, 'kshs')
        }

        return {
            btc: `${satsValue.toLocaleString()} sats`,
            sats: `${satsValue.toLocaleString()} sats`,
            local: localFormatted,
            full: `${satsValue.toLocaleString()} sats (≈ ${localFormatted})`
        }
    }

    const setPreferredDisplay = (d: 'sats' | 'kshs') => {
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
        const token = localStorage.getItem('impactchain_token')
        if (savedUser && token) {
            const user = JSON.parse(savedUser)
            try {
                const res = await fetch(`/api/chamas/hub?user_id=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.joined && data.pending) {
                    setMyChamas(data.joined.map((c: any) => c.name))
                    setPendingChamas(data.pending.map((c: any) => c.name))
                }
            } catch (err) {
                console.error("Failed to fetch chamas", err)
            }
        }
    }

    const fetchMembership = async (chamaId: string) => {
        const savedUser = localStorage.getItem('impactchain_user')
        const token = localStorage.getItem('impactchain_token')
        if (savedUser && token) {
            const user = JSON.parse(savedUser)
            try {
                const res = await fetch(`/api/chamas/${chamaId}/my-membership?user_id=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
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
        let savedDisplay = localStorage.getItem('impactchain_pref_display') as string
        if (savedDisplay === 'BTC') savedDisplay = 'sats'
        if (savedDisplay === 'KES') savedDisplay = 'kshs'
        if (savedDisplay) setPreferredDisplayState(savedDisplay as 'sats' | 'kshs')

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

    const connectWallet = async (addr: string) => {
        try {
            const savedUser = localStorage.getItem('impactchain_user')
            if (savedUser) {
                const user = JSON.parse(savedUser)
                const res = await fetch('/api/user/lightning-address', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        lightning_address: addr
                    })
                })
                if (!res.ok) throw new Error('Failed to save to database')
            }

            setAddress(addr)
            setBalance('1.45')

            localStorage.setItem('impactchain_address', addr)
            toast({
                title: 'Wallet Connected',
                description: `Linked ${addr}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            toast({ title: 'Connection Failed', description: String(error), status: 'error' })
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
