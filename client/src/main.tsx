import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { WalletProvider } from './context/WalletContext'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <AuthProvider>
                <WalletProvider>
                    <App />
                </WalletProvider>
            </AuthProvider>
        </ChakraProvider>
    </React.StrictMode>,
)
