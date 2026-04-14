import { Box, Container, Heading, Text, Button, SimpleGrid, Icon, VStack, Flex, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Checkbox, Link as ChakraLink, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react'
import { FaBitcoin, FaHandshake, FaLock, FaUsers, FaPlus, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'

import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import React, { useState } from 'react'

const Feature = ({ icon, title, text }: { icon: any; title: string; text: string }) => {
    return (
        <VStack
            bg={useColorModeValue('white', 'dark.card')}
            p={6}
            rounded="xl"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'dark.border')}
            shadow="md"
            spacing={4}
            align="start"
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl', borderColor: 'brand.500', transition: 'all 0.2s' }}
        >
            <Icon as={icon} w={10} h={10} color="brand.500" />
            <Heading size="md" color={useColorModeValue('gray.800', 'white')}>
                {title}
            </Heading>
            <Text color={useColorModeValue('gray.500', 'gray.400')}>{text}</Text>
        </VStack>
    )
}

const LandingPage = () => {
    const { connectWallet, isConnected, myChamas, setActiveChama } = useWallet()
    const { login, signup, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const inviteChamaId = searchParams.get('chama')
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isRedirectOpen, onOpen: onRedirectOpen, onClose: onRedirectClose } = useDisclosure()

    // Form state
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [signupName, setSignupName] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showLoginPassword, setShowLoginPassword] = useState(false)
    const [showSignupPassword, setShowSignupPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const success = await login(loginEmail, loginPassword)
        setIsLoading(false)
        if (success) {
            onClose()
            if (inviteChamaId) {
                // Auto-join if invited
                const userStr = localStorage.getItem('impactchain_user')
                const token = localStorage.getItem('impactchain_token')
                if (userStr && token) {
                    const userObj = JSON.parse(userStr)
                    fetch(`/api/chamas/${inviteChamaId}/requests`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'user-id': userObj.id
                        },
                        body: JSON.stringify({ 
                            type: 'join',
                            title: `Invited Member Join`,
                            description: `Joining via invite link.`
                        })
                    })
                }
            }
            navigate('/dashboard')
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const success = await signup(signupEmail, signupPassword, signupName)
        setIsLoading(false)
        if (success) {
            onClose()
            if (inviteChamaId) {
                // Auto-join if invited (get user from localStorage since state might not be updated yet)
                const userStr = localStorage.getItem('impactchain_user')
                const token = localStorage.getItem('impactchain_token')
                if (userStr && token) {
                    const userObj = JSON.parse(userStr)
                    fetch(`/api/chamas/${inviteChamaId}/requests`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'user-id': userObj.id
                        },
                        body: JSON.stringify({ 
                            type: 'join',
                            title: `Invited Member Join`,
                            description: `Joining via invite link.`
                        })
                    })
                }
            }
            navigate('/dashboard')
        }
    }



    return (
        <Box>
            {/* Hero Section */}
            <Box
                bg="black"
                bgGradient="linear(to-b, black, gray.900)"
                color="white"
                py={24}
                textAlign="center"
                position="relative"
                overflow="hidden"
            >
                {/* Abstract Gold Glow */}
                <Box
                    position="absolute"
                    top="-50%"
                    left="50%"
                    transform="translateX(-50%)"
                    w="1000px"
                    h="1000px"
                    bg="brand.500"
                    filter="blur(150px)"
                    opacity={0.15}
                    zIndex={0}
                    rounded="full"
                />

                <Container maxW="container.lg" position="relative" zIndex={1}>
                    <VStack spacing={8}>
                        <Heading size="3xl" fontWeight="extrabold" letterSpacing="tight" lineHeight="1.2">
                            Reinvent Trust. <br />
                            <Text as="span" bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text">
                                Savings, Decentralized.
                            </Text>
                        </Heading>
                        <Text fontSize="xl" opacity={0.8} maxW="2xl" color="gray.300">
                            Transparent, community-owned savings circles powered by Bitcoin.
                        </Text>

                        <Flex gap={4} pt={4} direction={{ base: 'column', sm: 'row' }}>
                             {isAuthenticated ? (
                                <Button
                                    onClick={onRedirectOpen}
                                    size="lg"
                                    rounded="full"
                                    bgGradient="linear(to-r, brand.500, brand.600)"
                                    color="white"
                                    _hover={{ bgGradient: "linear(to-r, brand.400, brand.500)", transform: 'scale(1.05)' }}
                                    transition="all 0.2s"
                                    px={10}
                                >
                                    Get Started
                                </Button>
                            ) : (
                                <Button
                                    onClick={onOpen}
                                    size="lg"
                                    rounded="full"
                                    bgGradient="linear(to-r, brand.500, brand.600)"
                                    color="white"
                                    _hover={{ bgGradient: "linear(to-r, brand.400, brand.500)", transform: 'scale(1.05)' }}
                                    transition="all 0.2s"
                                    px={10}
                                >
                                    Get Started
                                </Button>
                            )}
                            <Button
                                as={RouterLink}
                                to="/learn"
                                size="lg"
                                rounded="full"
                                variant="outline"
                                borderColor="brand.500"
                                color="brand.400"
                                _hover={{ bg: 'whiteAlpha.100' }}
                                px={10}
                            >
                                Learn Bitcoin
                            </Button>
                        </Flex>
                    </VStack>
                </Container>
            </Box>

            {/* Get Started Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay backdropFilter='blur(4px)' />
                <ModalContent p={6} rounded="xl">
                    <ModalHeader textAlign="center">
                        <Heading size="lg" color="brand.600">Welcome to Impact Chain</Heading>
                        <Text fontSize="sm" color="gray.500" mt={2}>
                            Already have an account? Log in to access your Hub
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs isFitted variant="enclosed" colorScheme="orange">
                            <TabList mb={4}>
                                <Tab _selected={{ color: 'brand.600', borderColor: 'brand.500' }}>
                                    <Icon as={FaLock} mr={2} /> Log In
                                </Tab>
                                <Tab _selected={{ color: 'brand.600', borderColor: 'brand.500' }}>
                                    <Icon as={FaPlus} mr={2} /> Sign Up
                                </Tab>
                            </TabList>

                            <TabPanels>
                                {/* Login Form */}
                                <TabPanel px={0}>
                                    <form onSubmit={handleLogin}>
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel>Email or Phone</FormLabel>
                                                <Input
                                                    type="text"
                                                    placeholder="user@email.com or +254..."
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    focusBorderColor="brand.500"
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Password</FormLabel>
                                                <InputGroup>
                                                    <Input
                                                        type={showLoginPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={loginPassword}
                                                        onChange={(e) => setLoginPassword(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                    />
                                                    <InputRightElement>
                                                        <IconButton
                                                            aria-label="Toggle password"
                                                            icon={showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                        />
                                                    </InputRightElement>
                                                </InputGroup>
                                            </FormControl>

                                            <Flex w="full" justify="space-between" align="center">
                                                <Checkbox
                                                    colorScheme="orange"
                                                    isChecked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                >
                                                    Remember me
                                                </Checkbox>
                                                <ChakraLink color="brand.500" fontSize="sm" fontWeight="medium">
                                                    Forgot Password?
                                                </ChakraLink>
                                            </Flex>

                                            <Button
                                                type="submit"
                                                w="full"
                                                colorScheme="orange"
                                                bg="brand.500"
                                                _hover={{ bg: 'brand.400' }}
                                                isLoading={isLoading}
                                                size="lg"
                                            >
                                                Log In
                                            </Button>
                                        </VStack>
                                    </form>
                                </TabPanel>

                                {/* Signup Form */}
                                <TabPanel px={0}>
                                    <form onSubmit={handleSignup}>
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel>Full Name</FormLabel>
                                                <Input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={signupName}
                                                    onChange={(e) => setSignupName(e.target.value)}
                                                    focusBorderColor="brand.500"
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Email or Phone</FormLabel>
                                                <Input
                                                    type="text"
                                                    placeholder="user@email.com or +254..."
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    focusBorderColor="brand.500"
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Password</FormLabel>
                                                <InputGroup>
                                                    <Input
                                                        type={showSignupPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={signupPassword}
                                                        onChange={(e) => setSignupPassword(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                    />
                                                    <InputRightElement>
                                                        <IconButton
                                                            aria-label="Toggle password"
                                                            icon={showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                                                        />
                                                    </InputRightElement>
                                                </InputGroup>
                                            </FormControl>

                                            <Button
                                                type="submit"
                                                w="full"
                                                colorScheme="orange"
                                                bg="brand.500"
                                                _hover={{ bg: 'brand.400' }}
                                                isLoading={isLoading}
                                                size="lg"
                                            >
                                                Sign Up
                                            </Button>

                                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                                By signing up, you agree to our Terms of Service and Privacy Policy
                                            </Text>
                                        </VStack>
                                    </form>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Already Logged In Dialog */}
            <Modal isOpen={isRedirectOpen} onClose={onRedirectClose} isCentered size="sm">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent p={4}>
                    <ModalHeader textAlign="center">Notice</ModalHeader>
                    <ModalBody>
                        <Text textAlign="center">You are already logged in. Proceed to your Impact Chain dashboard?</Text>
                    </ModalBody>
                    <ModalFooter justifyContent="center" gap={4}>
                        <Button colorScheme="purple" onClick={() => navigate('/dashboard')}>Yes, Proceed</Button>
                        <Button variant="ghost" onClick={onRedirectClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Container maxW="container.xl" py={20}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    <Feature
                        icon={FaBitcoin}
                        title="On-Chain Contributions"
                        text="Save via Lightning. Get immutable digital receipts. Hard money for hard work."
                    />
                    <Feature
                        icon={FaHandshake}
                        title="Automated Payouts"
                        text="Smart contracts enforce the rotation. No manual tracking. Trust code, not people."
                    />
                    <Feature
                        icon={FaUsers}
                        title="Member Governance"
                        text="Vote on loans and members. 51% consensus rules. True democracy."
                    />
                    <Feature
                        icon={FaLock}
                        title="Total Transparency"
                        text="View every transaction on the blockchain explorer. Verify, don't trust."
                    />
                </SimpleGrid>
            </Container>
        </Box>
    )
}

export default LandingPage
