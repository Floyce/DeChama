import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@chakra-ui/react'

interface WalletContextType {
    address: string | null
    isConnected: boolean
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null)
    const toast = useToast()

    useEffect(() => {
        // Check local storage on load
        const savedAddress = localStorage.getItem('impactchain_address')
        if (savedAddress) {
            setAddress(savedAddress)
        }
    }, [])

    const connectWallet = async () => {
        // Mock connection for MVP
        // In production, integrate with window.btc or Leather/Xverse
        try {
            // Simulating a delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            const mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
            setAddress(mockAddress)
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
        localStorage.removeItem('impactchain_address')
        toast({
            title: 'Wallet Disconnected',
            status: 'info',
            duration: 2000,
        })
    }

    return (
        <WalletContext.Provider value={{ address, isConnected: !!address, connectWallet, disconnectWallet }}>
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
