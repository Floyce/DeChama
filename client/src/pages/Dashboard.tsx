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
    const { isConnected, displayName, myChamas, setActiveChama, balance, fetchMyChamas, address, formatCurrency, preferredDisplay, setPreferredDisplay } = useWallet()
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
                                <Badge colorScheme="green" variant="subtle">
                                    Identity Verified
                                </Badge>
                                <Badge colorScheme="yellow" variant="solid" display="flex" alignItems="center" gap={1}>
                                    <Icon as={FaCrown} size="xs" /> Rep: 98/100
                                </Badge>
                            </HStack>
                        )}
                    </Box>
                    <Card
                        variant="outline"
                        borderColor="brand.200"
                        px={6}
                        py={3}
                        bg="orange.50"
                        cursor="pointer"
                        onClick={() => setPreferredDisplay(preferredDisplay === 'BTC' ? 'KES' : 'BTC')}
                        _hover={{ bg: 'orange.100' }}
                    >
                        <Flex align="center" gap={4}>
                            <Icon as={FaWallet} color="brand.500" w={5} h={5} />
                            <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">TOTAL ASSETS (Tap to toggle)</Text>
                                <Heading size="md" color="brand.600">
                                    {preferredDisplay === 'BTC' ? formatCurrency(balance).btc : formatCurrency(balance).local}
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                    {preferredDisplay === 'BTC' ? `≈ ${formatCurrency(balance).local}` : `≈ ${formatCurrency(balance).sats}`}
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
                                        <Icon as={FaUserFriends} color="brand.500" w={8} h={8} />
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
                                        colorScheme="orange"
                                        onClick={() => handleEnterChama(chamaName)}
                                        rightIcon={<FaArrowRight />}
                                    >
                                        Enter Chama
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}

                {/* Quick Actions - Context-Aware */}
                <Heading size="md" mb={6}>Quick Actions</Heading>

                {myChamas.length === 0 ? (
                    // Enhanced action cards for users with NO Chamas
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                        <Card
                            as={RouterLink}
                            to="/browse-chamas"
                            variant="outline"
                            borderWidth="2px"
                            borderColor="brand.200"
                            _hover={{ borderColor: 'brand.500', shadow: 'lg', transform: 'translateY(-4px)', textDecoration: 'none' }}
                            transition="all 0.2s"
                            rounded="xl"
                        >
                            <CardBody py={8}>
                                <VStack spacing={4}>
                                    <Box bg="blue.50" p={4} rounded="full">
                                        <Icon as={FaSearch} w={8} h={8} color="blue.600" />
                                    </Box>
                                    <Heading size="md">Join Existing Chama</Heading>
                                    <Text textAlign="center" color="gray.600" fontSize="sm">
                                        Browse and request to join active savings circles
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card
                            as={RouterLink}
                            to="/create-chama"
                            variant="outline"
                            borderWidth="2px"
                            borderColor="brand.200"
                            _hover={{ borderColor: 'brand.500', shadow: 'lg', transform: 'translateY(-4px)', textDecoration: 'none' }}
                            transition="all 0.2s"
                            rounded="xl"
                        >
                            <CardBody py={8}>
                                <VStack spacing={4}>
                                    <Box bg="orange.50" p={4} rounded="full">
                                        <Icon as={FaPlus} w={8} h={8} color="brand.600" />
                                    </Box>
                                    <Heading size="md">Create New Chama</Heading>
                                    <Text textAlign="center" color="gray.600" fontSize="sm">
                                        Start your own savings circle and invite members
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card
                            as={RouterLink}
                            to="/solo-savings"
                            variant="outline"
                            borderWidth="2px"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'brand.500', shadow: 'lg', transform: 'translateY(-4px)', textDecoration: 'none' }}
                            transition="all 0.2s"
                            rounded="xl"
                        >
                            <CardBody py={8}>
                                <VStack spacing={4}>
                                    <Box bg="gray.50" p={4} rounded="full">
                                        <Icon as={FaPiggyBank} w={8} h={8} color="gray.600" />
                                    </Box>
                                    <Heading size="md">Start Solo Savings</Heading>
                                    <Text textAlign="center" color="gray.600" fontSize="sm">
                                        Save individually with Bitcoin
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    </SimpleGrid>
                ) : (
                    // Countdown timer and quick actions for users WITH Chamas
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                        {/* Next Payout Countdown */}
                        <Card
                            variant="outline"
                            borderWidth="2px"
                            borderColor="brand.500"
                            bg="orange.50"
                            rounded="xl"
                        >
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                                        Next Payout
                                    </Text>
                                    <HStack spacing={3} justify="center">
                                        <VStack spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.600">12</Text>
                                            <Text fontSize="xs" color="gray.500">days</Text>
                                        </VStack>
                                        <Text fontSize="xl" color="gray.400">:</Text>
                                        <VStack spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.600">14</Text>
                                            <Text fontSize="xs" color="gray.500">hrs</Text>
                                        </VStack>
                                    </HStack>
                                    <Box bg="white" p={2} rounded="md" textAlign="center">
                                        <Text fontSize="xs" color="gray.500">Recipient</Text>
                                        <Text fontSize="sm" fontWeight="bold" color="gray.800">You</Text>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card
                            as={RouterLink}
                            to="/create-chama"
                            variant="outline"
                            _hover={{ borderColor: 'brand.400', shadow: 'md', transform: 'translateY(-4px)', textDecoration: 'none' }}
                            transition="all 0.2s"
                            rounded="xl"
                        >
                            <CardBody display="flex" alignItems="center" gap={4}>
                                <Box bg="orange.50" p={3} rounded="lg" color="brand.600">
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
                                    <Text fontSize="xs" color="gray.500">Browse Chamas</Text>
                                </Box>
                            </CardBody>
                        </Card>
                    </SimpleGrid>
                )}

                {/* Learn Section */}
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
        </Box >
    )
}

export default Dashboard
