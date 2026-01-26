import React, { useEffect, useState } from 'react'
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
    useColorModeValue,
    Tag,
    Badge,
    HStack,
    Divider
} from '@chakra-ui/react'
import { FaPlus, FaSearch, FaArrowRight, FaWallet, FaUserFriends, FaPiggyBank, FaBookOpen, FaChartLine, FaBell, FaCrown } from 'react-icons/fa'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
    const { isConnected, displayName, myChamas, setActiveChama, balance, fetchMyChamas, address, formatCurrency } = useWallet()
    const { user } = useAuth()
    const navigate = useNavigate()
    const cardBg = useColorModeValue('white', 'gray.800')

    // Protect Route & Refresh Data
    useEffect(() => {
        if (!user && !isConnected) {
            navigate('/auth')
        } else {
            fetchMyChamas() // Refresh on load
        }
    }, [user, isConnected, navigate, fetchMyChamas])

    const handleEnterChama = (chamaName: string) => {
        // Set the active Chama context so the detail page knows what to load
        setActiveChama(chamaName)
        navigate(`/chama/${encodeURIComponent(chamaName)}`)
    }

    return (
        <Box py={10} minH="calc(100vh - 80px)">
            <Container maxW="container.xl">
                {/* Header Section */}
                <Flex justify="space-between" align="center" mb={10} direction={{ base: 'column', md: 'row' }} gap={6}>
                    <Box>
                        <Heading size="lg" mb={2}>
                            Welcome, {displayName || (user?.displayName) || 'Member'}
                        </Heading>
                        <Text color="gray.500" fontSize="lg">
                            Manage your wealth and communities.
                        </Text>
                        {(user?.displayName || isConnected) && (
                            <HStack mt={2} spacing={2}>
                                <Badge colorScheme="purple" variant="subtle">
                                    Connected as: {user?.displayName || (isConnected ? `${address?.slice(0, 6)}...` : 'Guest')}
                                </Badge>
                                <Badge colorScheme="yellow" variant="solid" display="flex" alignItems="center" gap={1}>
                                    <Icon as={FaCrown} size="xs" /> Rep: 98/100
                                </Badge>
                            </HStack>
                        )}
                    </Box>
                    <Card variant="outline" borderColor="purple.200" px={6} py={3} bg="purple.50">
                        <Flex align="center" gap={4}>
                            <Icon as={FaWallet} color="purple.500" w={5} h={5} />
                            <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">TOTAL ASSETS</Text>
                                <Heading size="md" color="purple.700">{balance} BTC</Heading>
                                <Text fontSize="xs" color="gray.500">
                                    ≈ {formatCurrency(balance || '0').local}
                                </Text>
                            </Box>
                        </Flex>
                    </Card>
                </Flex>

                {/* My Chamas Section */}
                <Heading size="md" mb={6}>Your Active Chamas</Heading>

                {myChamas.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={12}>
                        {myChamas.map((chamaName, index) => (
                            <Card
                                key={index}
                                bg={cardBg}
                                rounded="xl"
                                shadow="md"
                                border="1px solid"
                                borderColor="gray.100"
                                _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                <CardBody>
                                    <Flex justify="space-between" align="start" mb={4}>
                                        <Icon as={FaUserFriends} color="purple.500" w={8} h={8} />
                                        <Badge colorScheme="green" variant="solid" rounded="full" px={2}>Active</Badge>
                                    </Flex>
                                    <Heading size="md" mb={2}>{chamaName}</Heading>
                                    <Text color="gray.500" fontSize="sm" mb={6}>
                                        Next payout in 12 days. You are in good standing.
                                    </Text>

                                    <HStack justify="space-between" fontSize="sm" mb={6} bg="gray.50" p={3} rounded="md">
                                        <Text color="gray.500">My Share:</Text>
                                        <Text fontWeight="bold">{formatCurrency("0.145").full}</Text>
                                    </HStack>

                                    <Button
                                        w="full"
                                        colorScheme="purple"
                                        onClick={() => handleEnterChama(chamaName)}
                                        rightIcon={<FaArrowRight />}
                                    >
                                        Enter Chama
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Box
                        textAlign="center"
                        py={12}
                        px={6}
                        bg="gray.50"
                        rounded="xl"
                        border="2px dashed"
                        borderColor="gray.200"
                        mb={12}
                    >
                        <Heading size="md" color="gray.500" mb={2}>You are not in any Chamas yet.</Heading>
                        <Text color="gray.400" mb={6}>Join an existing community or start your own.</Text>
                        <Button colorScheme="purple" onClick={() => navigate('/create-chama')}>Get Started</Button>
                    </Box>
                )}

                {/* Quick Actions / Discover */}
                <Heading size="md" mb={6}>Quick Actions</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                    <Card
                        as={RouterLink}
                        to="/create-chama"
                        variant="outline"
                        _hover={{ borderColor: 'purple.400', shadow: 'md', transform: 'translateY(-4px)', textDecoration: 'none' }}
                        transition="all 0.2s"
                        rounded="xl"
                    >
                        <CardBody display="flex" alignItems="center" gap={4}>
                            <Box bg="purple.50" p={3} rounded="lg" color="purple.600">
                                <Icon as={FaPlus} w={5} h={5} />
                            </Box>
                            <Box>
                                <Heading size="sm">Create New Chama</Heading>
                                <Text fontSize="xs" color="gray.500">Start a new circle</Text>
                            </Box>
                        </CardBody>
                    </Card>

                    <Card
                        as={RouterLink}
                        to="/browse-chamas"
                        variant="outline"
                        _hover={{ borderColor: 'blue.400', shadow: 'md', transform: 'translateY(-4px)', textDecoration: 'none' }}
                        transition="all 0.2s"
                        rounded="xl"
                    >
                        <CardBody display="flex" alignItems="center" gap={4}>
                            <Box bg="blue.50" p={3} rounded="lg" color="blue.600">
                                <Icon as={FaSearch} w={5} h={5} />
                            </Box>
                            <Box>
                                <Heading size="sm">Find a Community</Heading>
                                <Text fontSize="xs" color="gray.500">Marketplace & Discovery</Text>
                            </Box>
                        </CardBody>
                    </Card>

                    <Card
                        as={RouterLink}
                        to="/solo-savings"
                        variant="outline"
                        _hover={{ borderColor: 'orange.400', shadow: 'md', transform: 'translateY(-4px)', textDecoration: 'none' }}
                        transition="all 0.2s"
                        rounded="xl"
                    >
                        <CardBody display="flex" alignItems="center" gap={4}>
                            <Box bg="orange.50" p={3} rounded="lg" color="orange.600">
                                <Icon as={FaPiggyBank} w={5} h={5} />
                            </Box>
                            <Box>
                                <Heading size="sm">Solo Savings</Heading>
                                <Text fontSize="xs" color="gray.500">Personal wallet only</Text>
                            </Box>
                        </CardBody>
                    </Card>

                    <Card
                        as={RouterLink}
                        to="/learn"
                        variant="outline"
                        _hover={{ borderColor: 'green.400', shadow: 'md', transform: 'translateY(-4px)', textDecoration: 'none' }}
                        transition="all 0.2s"
                        rounded="xl"
                    >
                        <CardBody display="flex" alignItems="center" gap={4}>
                            <Box bg="green.50" p={3} rounded="lg" color="green.600">
                                <Icon as={FaBookOpen} w={5} h={5} />
                            </Box>
                            <Box>
                                <Heading size="sm">Academy</Heading>
                                <Text fontSize="xs" color="gray.500">Learn & Earn Badges</Text>
                            </Box>
                        </CardBody>
                    </Card>

                    <Card
                        variant="outline"
                        opacity={0.7}
                        cursor="default"
                        rounded="xl"
                    >
                        <CardBody display="flex" alignItems="center" gap={4}>
                            <Box bg="red.50" p={3} rounded="lg" color="red.600">
                                <Icon as={FaChartLine} w={5} h={5} />
                            </Box>
                            <Box>
                                <Heading size="sm" color="gray.600">Performance</Heading>
                                <Text fontSize="xs" color="gray.500">Analytics Pro (Coming Soon)</Text>
                            </Box>
                        </CardBody>
                    </Card>

                    <Card
                        variant="outline"
                        opacity={0.7}
                        cursor="default"
                        rounded="xl"
                    >
                        <CardBody display="flex" alignItems="center" gap={4}>
                            <Box bg="gray.100" p={3} rounded="lg" color="gray.600">
                                <Icon as={FaBell} w={5} h={5} />
                            </Box>
                            <Box>
                                <Heading size="sm" color="gray.600">Reminders</Heading>
                                <Text fontSize="xs" color="gray.500">SMS & Email Alerts</Text>
                            </Box>
                        </CardBody>
                    </Card>
                </SimpleGrid>

            </Container>
        </Box>
    )
}

export default Dashboard
