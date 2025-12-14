import React, { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast,
    Link
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'

const AuthPage = () => {
    const { login, signup, isAuthenticated } = useAuth()
    const { myChamas, activeChama, setActiveChama } = useWallet() // Use strictly for redirect checks after auth
    const navigate = useNavigate()
    const toast = useToast()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Cleanup States
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [referralCode, setReferralCode] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    // Smart Redirect Logic
    useEffect(() => {
        if (isAuthenticated) {
            // Check Wallet Context or just go to Hub?
            // "After login -> User's dashboard hub"
            // If they have chamas (from previous session mock), go to Dashboard?
            // User requested: "After login -> User's dashboard hub"
            // Assuming Hub is the 'HubPage'
            navigate('/hub')
        }
    }, [isAuthenticated, navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        await login(email, password)
        setIsLoading(false)
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (signupPassword !== confirmPassword) {
            toast({ title: "Passwords don't match", status: "error" })
            return
        }
        setIsLoading(true)
        await signup(signupEmail, signupPassword, displayName, referralCode)
        setIsLoading(false)
    }

    return (
        <Flex minH="80vh" align="center" justify="center" bg="gray.50">
            <Container maxW="container.sm">
                <Box
                    bg="white"
                    p={8}
                    rounded="xl"
                    shadow="xl"
                    border="1px solid"
                    borderColor="purple.100"
                >
                    <VStack spacing={6} mb={8} textAlign="center">
                        <Heading size="xl" color="brand.800">Welcome to ImpactChain</Heading>
                        <Text color="gray.500">The transparent, decentralized future of Chamas.</Text>
                    </VStack>

                    <Tabs isFitted variant="enclosed" colorScheme="purple">
                        <TabList mb="1em">
                            <Tab fontWeight="bold">LOGIN</Tab>
                            <Tab fontWeight="bold">SIGN UP</Tab>
                        </TabList>
                        <TabPanels>
                            {/* LOGIN PANEL */}
                            <TabPanel>
                                <form onSubmit={handleLogin}>
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Email</FormLabel>
                                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Password</FormLabel>
                                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                                        </FormControl>

                                        <Button type="submit" colorScheme="purple" w="full" size="lg" isLoading={isLoading}>
                                            Login
                                        </Button>

                                        <Link color="purple.500" fontSize="sm">Forgot Password?</Link>
                                    </VStack>
                                </form>
                            </TabPanel>

                            {/* SIGNUP PANEL */}
                            <TabPanel>
                                <form onSubmit={handleSignup}>
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Email</FormLabel>
                                            <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="Enter your email" />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Display Name</FormLabel>
                                            <Input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. John Doe" />
                                        </FormControl>
                                        <Flex gap={4} w="full">
                                            <FormControl isRequired>
                                                <FormLabel>Password</FormLabel>
                                                <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel>Confirm</FormLabel>
                                                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                            </FormControl>
                                        </Flex>
                                        <FormControl>
                                            <FormLabel>Referral Code (Optional)</FormLabel>
                                            <Input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="REF-XXXXXX" />
                                        </FormControl>

                                        <Button type="submit" colorScheme="purple" w="full" size="lg" isLoading={isLoading}>
                                            Create Account
                                        </Button>
                                    </VStack>
                                </form>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    <Text fontSize="sm" color="gray.400" mt={6} textAlign="center">
                        Wallet connection happens AFTER login to ensure security.
                    </Text>
                </Box>
            </Container>
        </Flex>
    )
}

export default AuthPage
