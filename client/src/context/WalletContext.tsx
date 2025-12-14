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
    setMyChamas: React.Dispatch<React.SetStateAction<string[]>>
    activeChama: string | null
    setActiveChama: (name: string | null) => void
    pendingChamas: string[]
    setPendingChamas: React.Dispatch<React.SetStateAction<string[]>>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null)
    const [displayName, setDisplayNameState] = useState<string | null>(null)
    const [balance, setBalance] = useState<string>('0.00')
    const [myChamas, setMyChamas] = useState<string[]>([])
    const [activeChama, setActiveChama] = useState<string | null>(null)
    const [pendingChamas, setPendingChamas] = useState<string[]>([])

    const toast = useToast()

    useEffect(() => {
        // Check local storage on load
        const savedAddress = localStorage.getItem('impactchain_address')
        const savedName = localStorage.getItem('impactchain_name')

        if (savedAddress) {
            setAddress(savedAddress)
            // Mock fetching balance/chamas if logged in
            setBalance('1.45')
            setMyChamas(['Chama Alpha', 'Family Savings'])
            // For demo, let's assume no active chama on initial load unless explicitly saved
            // setActiveChama(localStorage.getItem('impactchain_active_chama'))
            // setPendingChamas(JSON.parse(localStorage.getItem('impactchain_pending_chamas') || '[]'))
        }
        if (savedName) {
            setDisplayNameState(savedName)
        }
    }, [])

    const setDisplayName = (name: string) => {
        setDisplayNameState(name)
        localStorage.setItem('impactchain_name', name)
    }

    const connectWallet = async () => {
        // Mock connection for MVP
        // In production, integrate with window.btc or Leather/Xverse
        try {
            // Simulating a delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            const mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
            setAddress(mockAddress)
            setBalance('1.45')
            setMyChamas([]) // Default to empty for new user flow
            setActiveChama(null) // No active chama on new connection
            setPendingChamas([]) // No pending chamas on new connection

            localStorage.setItem('impactchain_address', mockAddress)

            toast({
                title: 'Wallet Connected',
                description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            toast({
                title: 'Connection Failed',
                status: 'error',
                isClosable: true,
            })
        }
    }

    const disconnectWallet = () => {
        setAddress(null)
        setDisplayNameState(null)
        setBalance('0.00')
        setMyChamas([])

        localStorage.removeItem('impactchain_address')
        localStorage.removeItem('impactchain_name')

        toast({
            title: 'Wallet Disconnected',
            status: 'info',
            duration: 2000,
        })
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
            setMyChamas,
            activeChama,
            setActiveChama,
            pendingChamas,
            setPendingChamas
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
