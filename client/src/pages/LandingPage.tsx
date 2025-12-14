import React from 'react'
import { Box, Container, Heading, Text, Button, SimpleGrid, Icon, VStack, Flex, useColorModeValue } from '@chakra-ui/react'
import { FaBitcoin, FaHandshake, FaLock, FaUsers } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom'

import { useWallet } from '../context/WalletContext'
import { useNavigate } from 'react-router-dom'

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
    const navigate = useNavigate()

    const [isRedirecting, setIsRedirecting] = React.useState(false)

    const handleGetStarted = async () => {
        if (!isConnected) {
            await connectWallet()
        }
        setIsRedirecting(true)
    }

    // Smart Redirect Logic
    React.useEffect(() => {
        if (isConnected && isRedirecting) {
            if (myChamas.length > 0) {
                setActiveChama(myChamas[0])
                navigate('/dashboard')
            } else {
                navigate('/hub')
            }
        }
    }, [isConnected, isRedirecting, myChamas, navigate, setActiveChama])


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
                                Chamas, Decentralized.
                            </Text>
                        </Heading>
                        <Text fontSize="xl" opacity={0.8} maxW="2xl" color="gray.300">
                            Transparent, community-owned savings circles powered by Bitcoin.
                            Replace opaque records with on-chain certainty and gold-standard security.
                        </Text>
                        <Flex gap={4} pt={4} direction={{ base: 'column', sm: 'row' }}>
                            <Button
                                onClick={handleGetStarted}
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

            {/* Features Section */}
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
