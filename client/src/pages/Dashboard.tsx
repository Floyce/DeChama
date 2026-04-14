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
    Divider,
    ModalCloseButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Spinner,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td
} from '@chakra-ui/react'
import { FaPlus, FaSearch, FaArrowRight, FaWallet, FaUserFriends, FaPiggyBank, FaBookOpen, FaChartLine, FaBell, FaCrown } from 'react-icons/fa'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import Tutorial from '../components/Tutorial'

const Dashboard = () => {
    const { isConnected, displayName, myChamas, setActiveChama, balance, fetchMyChamas, address, formatCurrency, preferredDisplay, setPreferredDisplay } = useWallet()
    const { user, loginRef } = useAuth()
    const navigate = useNavigate()
    const cardBg = useColorModeValue('white', 'gray.800')

    const [stats, setStats] = useState({ total_savings_sats: 0, active_groups: 0, payouts_received_sats: 0 })
    const [chamaHub, setChamaHub] = useState({ joined: [], pending: [], available: [] })
    const [transactions, setTransactions] = useState([])
    const [isLoadingHub, setIsLoadingHub] = useState(true)
    const [showTutorial, setShowTutorial] = useState(false)
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 14, mins: 45, secs: 30 })

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, mins, secs } = prev
                if (secs > 0) secs--
                else {
                    secs = 59
                    if (mins > 0) mins--
                    else {
                        mins = 59
                        if (hours > 0) hours--
                        else {
                            hours = 23
                            if (days > 0) days--
                        }
                    }
                }
                return { days, hours, mins, secs }
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Fix 6: Fetch Real Stats
    const fetchStats = async () => {
        const token = localStorage.getItem('impactchain_token')
        if (user?.id && token) {
            try {
                const res = await fetch(`/api/user/stats?user_id=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (err) {
                console.error("Failed to fetch stats", err)
            }
        }
    }

    const fetchChamaHub = async () => {
        const token = localStorage.getItem('impactchain_token')
        if (user?.id && token) {
            setIsLoadingHub(true)
            try {
                const res = await fetch(`/api/chamas/hub?user_id=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setChamaHub(data)
                }
            } catch (err) {
                console.error("Failed to fetch hub", err)
            } finally {
                setIsLoadingHub(false)
            }
        }
    }

    const fetchTransactions = async () => {
        const token = localStorage.getItem('impactchain_token')
        if (user?.id && token) {
            try {
                const res = await fetch(`/api/transactions?user_id=${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setTransactions(data)
                }
            } catch (err) {
                console.error("Failed to fetch tx", err)
            }
        }
    }

    // Protect Route & Refresh Data
    useEffect(() => {
        if (!user && !isConnected) {
            navigate('/')
        } else {
            fetchChamaHub()
            fetchStats()
            fetchTransactions()

            // Fix 5: One-time tutorial logic
            const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user?.id}`)
            if (!hasSeenTutorial && user) {
                setShowTutorial(true)
            }
        }
    }, [user, isConnected])

    // Poll hub every 10s for real-time membership updates
    useEffect(() => {
        if (user && isConnected) {
            fetchChamaHub()
            const interval = setInterval(fetchChamaHub, 10000)
            return () => clearInterval(interval)
        }
    }, [user, isConnected])

    const closeTutorial = () => {
        setShowTutorial(false)
        if (user?.id) localStorage.setItem(`tutorial_seen_${user.id}`, 'true')
    }

    const handleEnterChama = (chamaName: string) => {
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
                        <Text fontSize="xs" fontFamily="mono" color="gray.400" mt={1}>
                            Login Ref: {loginRef || 'N/A'}
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
                        onClick={() => setPreferredDisplay(preferredDisplay === 'sats' ? 'kshs' : 'sats')}
                        _hover={{ bg: 'orange.100' }}
                    >
                        <Flex align="center" gap={4}>
                            <Icon as={FaWallet} color="brand.500" w={5} h={5} />
                            <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">TOTAL ASSETS (Fix 6)</Text>
                                <Heading size="md" color="brand.600">
                                    {preferredDisplay === 'sats' 
                                        ? `${stats.total_savings_sats.toLocaleString()} sats` 
                                        : formatCurrency((stats.total_savings_sats / 100000000).toString()).local}
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                    {stats.total_savings_sats.toLocaleString()} sats
                                </Text>
                            </Box>
                        </Flex>
                    </Card>
                </Flex>


                {/* Chama Hub Section */}
                <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md">Chama Hub</Heading>
                    <HStack>
                        <Button as={RouterLink} to="/create-chama" size="sm" colorScheme="purple" leftIcon={<FaPlus />}>
                            Launch Chama
                        </Button>
                    </HStack>
                </Flex>

                <Tabs variant="enclosed" colorScheme="purple" mb={12}>
                    <TabList>
                        <Tab fontWeight="bold">My Chamas ({chamaHub.joined.length})</Tab>
                        <Tab fontWeight="bold">Pending Requests ({chamaHub.pending.length})</Tab>
                        <Tab fontWeight="bold">Available Chamas ({chamaHub.available.length})</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel px={0} py={6}>
                            {isLoadingHub ? (
                                <Flex justify="center" py={10}><Spinner color="purple.500" /></Flex>
                            ) : chamaHub.joined.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {chamaHub.joined.map((chama: any) => (
                                        <Card
                                            key={chama.id}
                                            bg={cardBg}
                                            rounded="xl"
                                            shadow="md"
                                            border="1px solid"
                                            borderColor="green.100"
                                            _hover={{ shadow: 'xl', transform: 'translateY(-2px)', borderColor: 'green.400' }}
                                            transition="all 0.2s"
                                        >
                                            <CardBody>
                                                <Flex justify="space-between" align="start" mb={4}>
                                                    <Icon as={FaUserFriends} color="green.500" w={8} h={8} />
                                                    <Badge colorScheme="green" variant="solid" rounded="full" px={2}>JOINED</Badge>
                                                </Flex>
                                                <Heading size="md" mb={2}>{chama.name}</Heading>
                                                <Text color="gray.500" fontSize="sm" mb={6} noOfLines={2}>
                                                    {chama.description || "Active decentralized savings circle."}
                                                </Text>

                                                <HStack justify="space-between" fontSize="sm" mb={6} bg="gray.50" p={3} rounded="md">
                                                    <Text color="gray.500">Balance:</Text>
                                                    <Text fontWeight="bold">{formatCurrency((chama.current_balance_sats / 100_000_000).toString()).full}</Text>
                                                </HStack>

                                                <Button
                                                    w="full"
                                                    colorScheme="purple"
                                                    onClick={() => navigate(`/chama-dashboard/${chama.id}`)}
                                                    rightIcon={<FaArrowRight />}
                                                >
                                                    Open Dashboard
                                                </Button>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Card variant="outline" py={10} borderStyle="dashed">
                                    <VStack spacing={4}>
                                        <Icon as={FaUserFriends} w={10} h={10} color="gray.300" />
                                        <Text color="gray.500">You haven't joined any Chamas yet.</Text>
                                        <Button size="sm" variant="link" colorScheme="purple">Browse Chamas</Button>
                                    </VStack>
                                </Card>
                            )}
                        </TabPanel>
                        
                        {/* Pending Tab */}
                        <TabPanel px={0} py={6}>
                            {isLoadingHub ? (
                                <Flex justify="center" py={10}><Spinner color="purple.500" /></Flex>
                            ) : chamaHub.pending.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {chamaHub.pending.map((chama: any) => (
                                        <Card key={chama.id} bg="gray.50" opacity={0.8}>
                                            <CardBody>
                                                <Flex justify="space-between" align="start" mb={4}>
                                                    <Icon as={FaClock} color="yellow.500" w={8} h={8} />
                                                    <Badge colorScheme="yellow">PENDING APPROVAL</Badge>
                                                </Flex>
                                                <Heading size="md" mb={2}>{chama.name}</Heading>
                                                <Text fontSize="sm" color="gray.500" mb={4}>Your join request is waiting for member approval.</Text>
                                                <VStack align="stretch" spacing={2} mb={6}>
                                                    <Flex justify="space-between" fontSize="xs" color="gray.600">
                                                        <Text>Consensus Progress:</Text>
                                                        <Text fontWeight="bold">{chama.approvals} / {chama.target_votes} Approval</Text>
                                                    </Flex>
                                                    <Progress 
                                                        value={(chama.approvals / chama.target_votes) * 100} 
                                                        size="xs" 
                                                        colorScheme="yellow" 
                                                        rounded="full" 
                                                    />
                                                </VStack>
                                                <Button w="full" isDisabled variant="outline" borderColor="yellow.200">Pending Votes...</Button>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Text color="gray.500" textAlign="center">No pending requests.</Text>
                            )}
                        </TabPanel>
                        <TabPanel px={0} py={6}>
                            {isLoadingHub ? (
                                <Flex justify="center" py={10}><Spinner color="purple.500" /></Flex>
                            ) : chamaHub.available.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {chamaHub.available.map((chama: any) => (
                                        <Card
                                            key={chama.id}
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
                                                    <Icon as={FaPiggyBank} color="purple.500" w={8} h={8} />
                                                    <Badge colorScheme="purple" variant="outline" rounded="full" px={2}>AVAILABLE</Badge>
                                                </Flex>
                                                <Heading size="md" mb={2}>{chama.name}</Heading>
                                                <Text color="gray.500" fontSize="sm" mb={4} noOfLines={2}>
                                                    {chama.description || "Decentralized community savings."}
                                                </Text>
                                                
                                                <VStack align="stretch" spacing={2} mb={6} fontSize="xs" color="gray.600">
                                                    <Flex justify="space-between">
                                                        <Text>Target:</Text>
                                                        <Text fontWeight="bold">{formatCurrency((chama.target_goal_sats / 100_000_000).toString()).full}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between">
                                                        <Text>Contribution:</Text>
                                                        <Text fontWeight="bold">{formatCurrency((chama.contribution_amount_sats / 100_000_000).toString()).full}</Text>
                                                    </Flex>
                                                </VStack>

                                                 <Button
                                                    w="full"
                                                    variant="solid"
                                                    colorScheme="purple"
                                                    onClick={() => navigate(`/browse-chamas`)}
                                                >
                                                    Request to Join
                                                </Button>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Text color="gray.500" textAlign="center">No more Chamas available to join.</Text>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>

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
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.600">{timeLeft.days}</Text>
                                            <Text fontSize="xs" color="gray.500">days</Text>
                                        </VStack>
                                        <Text fontSize="xl" color="gray.400">:</Text>
                                        <VStack spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.600">{timeLeft.hours}</Text>
                                            <Text fontSize="xs" color="gray.500">hrs</Text>
                                        </VStack>
                                        <Text fontSize="xl" color="gray.400">:</Text>
                                        <VStack spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.600">{String(timeLeft.mins).padStart(2, '0')}</Text>
                                            <Text fontSize="xs" color="gray.500">mins</Text>
                                        </VStack>
                                        <Text fontSize="xl" color="gray.400">:</Text>
                                        <VStack spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="brand.600">{String(timeLeft.secs).padStart(2, '0')}</Text>
                                            <Text fontSize="xs" color="gray.500">secs</Text>
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

            {/* Transaction History Section */}
            <Heading size="md" mb={6} mt={10}>Global Transaction History</Heading>
            <Card variant="outline" rounded="xl" overflow="hidden">
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Type</Th>
                                <Th>Reason</Th>
                                <Th>Amount</Th>
                                <Th>Date</Th>
                                <Th>Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {transactions.length > 0 ? (
                                transactions.map((tx: any) => (
                                    <Tr key={tx.id}>
                                        <Td>
                                            <Badge colorScheme={tx.type === 'deposit' ? 'green' : 'purple'} variant="subtle">
                                                {tx.type.toUpperCase()}
                                            </Badge>
                                        </Td>
                                        <Td><Text fontSize="sm" fontWeight="medium">{tx.reason}</Text></Td>
                                        <Td fontWeight="bold">{tx.amount_sats.toLocaleString()} sats</Td>
                                        <Td fontSize="xs" color="gray.500">{new Date(tx.created_at).toLocaleDateString()}</Td>
                                        <Td>
                                            <Badge colorScheme={tx.status === 'COMPLETED' ? 'green' : 'orange'}>
                                                {tx.status}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr><Td colSpan={5} textAlign="center" py={10} color="gray.400">No transactions recorded yet.</Td></Tr>
                            )}
                        </Tbody>
                    </Table>
            </Card>

            {/* Fix 5: One-Time Tutorial component */}
            <Tutorial 
                isOpen={showTutorial} 
                onClose={() => setShowTutorial(false)} 
                onComplete={closeTutorial} 
            />
        </Container>
        </Box >
    )
}

export default Dashboard
