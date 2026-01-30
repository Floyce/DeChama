import React, { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    Card,
    CardBody,
    SimpleGrid,
    Button,
    Badge,
    Flex,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    HStack,
    VStack,
    useToast
} from '@chakra-ui/react'
import { FaUsers, FaArrowLeft, FaFilter, FaSearch, FaLeaf, FaBuilding, FaHome, FaHandHoldingUsd, FaCheckCircle, FaClock, FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'

const BrowseChamasPage = () => {
    const navigate = useNavigate()
    const { setMyChamas, myChamas, isConnected, pendingChamas, setPendingChamas, formatCurrency } = useWallet()
    const { user } = useAuth()

    const toast = useToast()

    const [chamas, setChamas] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDiscover = async () => {
            try {
                const res = await fetch('/api/chamas/discover')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setChamas(data)
                }
            } catch (err) {
                console.error("Failed to fetch discovery", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDiscover()
    }, [])

    const handleJoin = async (chamaId: string, chamaName: string) => {
        if (!user) return

        try {
            const res = await fetch(`/api/chamas/${chamaId}/join-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            })
            const data = await res.json()

            if (data.success) {
                setPendingChamas(prev => [...prev, chamaName])
                toast({
                    title: 'Request Sent',
                    description: `Your request to join ${chamaName} has been sent for approval.`,
                    status: 'info',
                    duration: 4000,
                })
            } else {
                toast({ title: 'Request Failed', description: data.detail, status: 'error' })
            }
        } catch (err) {
            toast({ title: 'Network Error', status: 'error' })
        }
    }


    // Checking status
    const getStatus = (chamaName: string) => {
        if (myChamas.includes(chamaName)) return 'member'
        if (pendingChamas.includes(chamaName)) return 'pending'
        return 'none'
    }

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={4} onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
                <VStack spacing={4} align="start" mb={8}>
                    <Heading size="lg">Discover Communities</Heading>
                    <Text color="gray.500">Find the perfect Chama. Join forces, save together.</Text>
                </VStack>

                {/* Filters */}
                <Card mb={8} size="sm" variant="outline">
                    <CardBody>
                        <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                            <InputGroup maxW={{ md: '300px' }}>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaSearch} color="gray.300" />
                                </InputLeftElement>
                                <Input placeholder="Search by name..." />
                            </InputGroup>
                            <Select placeholder="Filter by Type" maxW={{ md: '200px' }}>
                                <option value="business">Business</option>
                                <option value="investment">Investment</option>
                                <option value="family">Family</option>
                            </Select>
                            <Select placeholder="Frequency" maxW={{ md: '200px' }}>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </Select>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Grid */}
                {isLoading ? (
                    <Text>Finding communities...</Text>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {chamas.map((chama, i) => {
                            const status = getStatus(chama.name)
                            const btcAmount = (chama.contribution_amount_sats / 100_000_000).toFixed(3)
                            return (
                                <Card key={i} _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
                                    <CardBody>
                                        <HStack justify="space-between" mb={4}>
                                            <Badge colorScheme="purple" fontSize="0.8em" px={2} py={1} rounded="md">{chama.type}</Badge>
                                            <Text fontSize="sm" color="gray.500">{chama.frequency}</Text>
                                        </HStack>

                                        <Heading size="md" mb={2}>{chama.name}</Heading>

                                        <VStack align="start" spacing={1} mb={6}>
                                            <HStack color="gray.600">
                                                <Icon as={FaUsers} />
                                                <Text>Group of {chama.expected_members}</Text>
                                            </HStack>
                                            <HStack color="gray.600">
                                                <Icon as={FaHandHoldingUsd} />
                                                <Text>
                                                    {formatCurrency(btcAmount).btc} / {chama.frequency}
                                                    <Text as="span" fontSize="xs" ml={2} color="gray.400">
                                                        (≈ {formatCurrency(btcAmount).local})
                                                    </Text>
                                                </Text>
                                            </HStack>

                                        </VStack>

                                        <Button
                                            w="full"
                                            size="lg"
                                            rounded="full"
                                            colorScheme={status === 'member' ? 'green' : (status === 'pending' ? 'yellow' : 'purple')}
                                            variant={status === 'member' ? 'outline' : 'solid'}
                                            onClick={() => status === 'none' && handleJoin(chama.id, chama.name)}
                                            isDisabled={status !== 'none'}
                                            leftIcon={status === 'member' ? <FaCheckCircle /> : (status === 'pending' ? <FaClock /> : <FaPlus />)}
                                            _hover={status === 'none' ? {
                                                transform: 'translateY(-2px)',
                                                shadow: 'md'
                                            } : {}}
                                            transition="all 0.2s"
                                        >
                                            {status === 'member' ? 'Joined' : (status === 'pending' ? 'Pending Approval' : 'Request to Join')}
                                        </Button>
                                    </CardBody>
                                </Card>
                            )
                        })}
                    </SimpleGrid>
                )}

            </Container>
        </Box>
    )
}

export default BrowseChamasPage
