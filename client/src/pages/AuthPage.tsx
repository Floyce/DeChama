import React, { useState, useEffect } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
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
    Link,
    Select
} from '@chakra-ui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'

const AuthPage = () => {
    const { login, signup, isAuthenticated } = useAuth()
    const { myChamas, activeChama, setActiveChama } = useWallet() // Use strictly for redirect checks after auth
    const navigate = useNavigate()
    const toast = useToast()

    const [phoneNumber, setPhoneNumber] = useState('')
    const [countryCode, setCountryCode] = useState('+254')
    const [password, setPassword] = useState('')

    // Cleanup States
    const [signupPhoneNumber, setSignupPhoneNumber] = useState('')
    const [signupCountryCode, setSignupCountryCode] = useState('+254')
    const [signupPassword, setSignupPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [referralCode, setReferralCode] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    // Smart Redirect Logic
    // Smart Redirect Logic
    useEffect(() => {
        if (isAuthenticated) {
            // "Smart Redirect" based on User Flow Architecture
            if (!myChamas || myChamas.length === 0) {
                // New User or No Groups -> Go to Welcome/Choice Page
                navigate('/welcome')
            } else if (myChamas.length === 1) {
                // ONE active Chama -> Go directly to that Chama's detail page
                const targetChama = myChamas[0]
                setActiveChama(targetChama)
                navigate(`/chama/${encodeURIComponent(targetChama)}`)
            } else {
                // MULTIPLE active Chamas -> Go to Dashboard
                navigate('/dashboard')
            }
        }
    }, [isAuthenticated, myChamas, navigate, setActiveChama])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const fullPhone = countryCode + phoneNumber.replace(/^0+/, '') // Remove leading zero if present
        await login(fullPhone, password)
        setIsLoading(false)
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (signupPassword !== confirmPassword) {
            toast({ title: "Passwords don't match", status: "error" })
            return
        }
        setIsLoading(true)
        const fullPhone = signupCountryCode + signupPhoneNumber.replace(/^0+/, '')
        await signup(fullPhone, signupPassword, displayName, referralCode)
        setIsLoading(false)
    }

    const [searchParams] = useSearchParams()
    const defaultTab = searchParams.get('tab') === 'signup' ? 1 : 0

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
                    <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={4} onClick={() => navigate('/')} alignSelf="flex-start">
                        Back to Home
                    </Button>

                    <VStack spacing={6} mb={8} textAlign="center">
                        <Heading size="xl" color="brand.800">Welcome to ImpactChain</Heading>
                        <Text color="gray.500">The transparent, decentralized future of Chamas.</Text>
                    </VStack>

                    <Tabs isFitted variant="enclosed" colorScheme="purple" defaultIndex={defaultTab}>
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
                                            <FormLabel>Phone Number</FormLabel>
                                            <Flex gap={2}>
                                                <Select w="110px" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                                                    <option value="+254">🇰🇪 +254</option>
                                                    <option value="+256">🇺🇬 +256</option>
                                                    <option value="+255">🇹🇿 +255</option>
                                                    <option value="+250">🇷🇼 +250</option>
                                                    <option value="+1">🇺🇸 +1</option>
                                                    <option value="+44">🇬🇧 +44</option>
                                                </Select>
                                                <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="700 000 000" flex="1" />
                                            </Flex>
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
                                            <FormLabel>Phone Number</FormLabel>
                                            <Flex gap={2}>
                                                <Select w="110px" value={signupCountryCode} onChange={(e) => setSignupCountryCode(e.target.value)}>
                                                    <option value="+254">🇰🇪 +254</option>
                                                    <option value="+256">🇺🇬 +256</option>
                                                    <option value="+255">🇹🇿 +255</option>
                                                    <option value="+250">🇷🇼 +250</option>
                                                    <option value="+1">🇺🇸 +1</option>
                                                    <option value="+44">🇬🇧 +44</option>
                                                </Select>
                                                <Input type="tel" value={signupPhoneNumber} onChange={(e) => setSignupPhoneNumber(e.target.value)} placeholder="700 000 000" flex="1" />
                                            </Flex>
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Pseudonym / Public Name</FormLabel>
                                            <Input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. CryptoSatoshi" />
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                This name will be visible to your Chama members. Your real phone number remains private.
                                            </Text>
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
