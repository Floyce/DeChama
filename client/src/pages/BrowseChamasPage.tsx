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

const BrowseChamasPage = () => {
    const navigate = useNavigate()
    const { setMyChamas, myChamas, isConnected, pendingChamas, setPendingChamas } = useWallet()
    const toast = useToast()

    // Protect Route
    useEffect(() => {
        if (!isConnected) {
            navigate('/auth')
        }
    }, [isConnected, navigate])

    // Mock Public Chamas
    const [chamas] = useState([
        { name: 'Chama Alpha', members: 12, amount: '0.01 BTC', freq: 'Monthly', type: 'Investment' },
        { name: 'Business Builders', members: 5, amount: '0.05 BTC', freq: 'Weekly', type: 'Business' },
        { name: 'Family Fund', members: 8, amount: '0.005 BTC', freq: 'Monthly', type: 'Family' },
        { name: 'Tech Startups', members: 20, amount: '0.1 BTC', freq: 'Monthly', type: 'Investment' },
        { name: 'Local Savings', members: 15, amount: '0.002 BTC', freq: 'Bi-Weekly', type: 'Community' },
        { name: 'Holiday Pot', members: 6, amount: '0.02 BTC', freq: 'Monthly', type: 'Family' },
    ])

    const handleJoin = (chamaName: string) => {
        // Add to pending chamas list
        setPendingChamas(prev => [...prev, chamaName])

        toast({
            title: 'Request Sent',
            description: `Your request to join ${chamaName} has been sent to the members for approval.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
        })

        // Do NOT navigate. Stay on browse page.
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
                <VStack spacing={4} align="start" mb={8}>
                    <Heading size="lg">Browse Chamas</Heading>
                    <Text color="gray.500">Find a community that matches your goals.</Text>
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
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {chamas.map((chama, i) => {
                        const status = getStatus(chama.name)
                        return (
                            <Card key={i} _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
                                <CardBody>
                                    <HStack justify="space-between" mb={4}>
                                        <Badge colorScheme="purple" fontSize="0.8em" px={2} py={1} rounded="md">{chama.type}</Badge>
                                        <Text fontSize="sm" color="gray.500">{chama.freq}</Text>
                                    </HStack>

                                    <Heading size="md" mb={2}>{chama.name}</Heading>

                                    <VStack align="start" spacing={1} mb={6}>
                                        <HStack color="gray.600">
                                            <Icon as={FaUsers} />
                                            <Text>{chama.members} Members</Text>
                                        </HStack>
                                        <HStack color="gray.600">
                                            <Icon as={FaHandHoldingUsd} />
                                            <Text>{chama.amount} / period</Text>
                                        </HStack>
                                    </VStack>

                                    <Button
                                        w="full"
                                        colorScheme={status === 'member' ? 'green' : (status === 'pending' ? 'yellow' : 'purple')}
                                        variant={status === 'member' ? 'outline' : 'solid'}
                                        onClick={() => status === 'none' && handleJoin(chama.name)}
                                        isDisabled={status !== 'none'}
                                        leftIcon={status === 'member' ? <FaCheckCircle /> : (status === 'pending' ? <FaClock /> : <FaPlus />)}
                                    >
                                        {status === 'member' ? 'Joined' : (status === 'pending' ? 'Pending Approval' : 'Request to Join')}
                                    </Button>
                                </CardBody>
                            </Card>
                        )
                    })}
                </SimpleGrid>
            </Container>
        </Box>
    )
}

export default BrowseChamasPage
