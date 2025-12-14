import React, { useEffect } from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Card,
    CardBody,
    Icon,
    Button,
    VStack,
    Flex,
    useColorModeValue
} from '@chakra-ui/react'
import { FaPlus, FaSearch, FaArrowRight } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'

const HubPage = () => {
    const { isConnected, displayName, address } = useWallet()
    const navigate = useNavigate()
    const cardBg = useColorModeValue('white', 'gray.800')

    // Protect Route
    useEffect(() => {
        if (!isConnected) {
            navigate('/auth')
        }
    }, [isConnected, navigate])

    if (!isConnected) return null

    return (
        <Box py={20} minH="calc(100vh - 80px)">
            <Container maxW="container.lg">
                <VStack spacing={8} mb={16} textAlign="center">
                    <Heading size="2xl">
                        Welcome, {displayName || (address ? `${address.slice(0, 5)}...${address.slice(-4)}` : 'User')}
                    </Heading>
                    <Text fontSize="xl" color="gray.500" maxW="2xl">
                        What would you like to do today?
                    </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    {/* Create Card */}
                    <Card
                        bg={cardBg}
                        borderColor="purple.200"
                        borderWidth="2px"
                        rounded="2xl"
                        shadow="xl"
                        cursor="pointer"
                        transition="all 0.3s"
                        _hover={{ transform: 'translateY(-8px)', shadow: '2xl', borderColor: 'purple.500' }}
                        onClick={() => navigate('/create-chama')}
                    >
                        <CardBody p={10} textAlign="center">
                            <Box
                                bg="purple.50"
                                color="purple.500"
                                w={20} h={20}
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={6}
                            >
                                <Icon as={FaPlus} w={8} h={8} />
                            </Box>
                            <Heading size="xl" mb={4}>Create New Chama</Heading>
                            <Text color="gray.500" fontSize="lg" mb={8}>
                                Launch a transparent savings circle. Set your own rules, invite friends, and save in Bitcoin.
                            </Text>
                            <Button size="lg" colorScheme="purple" rightIcon={<FaArrowRight />}>
                                Start a Chama
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Browse Card */}
                    <Card
                        bg={cardBg}
                        borderColor="gray.200"
                        borderWidth="2px"
                        rounded="2xl"
                        shadow="xl"
                        cursor="pointer"
                        transition="all 0.3s"
                        _hover={{ transform: 'translateY(-8px)', shadow: '2xl', borderColor: 'gray.400' }}
                        onClick={() => navigate('/browse-chamas')}
                    >
                        <CardBody p={10} textAlign="center">
                            <Box
                                bg="gray.100"
                                color="gray.500"
                                w={20} h={20}
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={6}
                            >
                                <Icon as={FaSearch} w={8} h={8} />
                            </Box>
                            <Heading size="xl" mb={4}>Browse Existing</Heading>
                            <Text color="gray.500" fontSize="lg" mb={8}>
                                Find active communities to join. Filter by contribution amount, frequency, and trust score.
                            </Text>
                            <Button size="lg" variant="outline" rightIcon={<FaArrowRight />}>
                                Find a Chama
                            </Button>
                        </CardBody>
                    </Card>
                </SimpleGrid>
            </Container>
        </Box>
    )
}

export default HubPage
