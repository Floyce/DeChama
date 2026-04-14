import React, { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Grid,
    GridItem,
    Heading,
    Text,
    Flex,
    Button,
    Card,
    CardBody,
    Badge,
    VStack,
    Icon,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Select,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Avatar,
    HStack,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    Input,
    Textarea,
    Divider
} from '@chakra-ui/react'
import { FaWallet, FaHandHoldingUsd, FaFileContract, FaPlus, FaUsers, FaCrown, FaArrowRight, FaLock, FaUserPlus, FaRocket } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PayoutCountdown from '../components/PayoutCountdown'
import PayoutQueue from '../components/PayoutQueue'
import PaydayCelebration from '../components/PaydayCelebration'

const ChamaDetails = () => {
    const { chamaName } = useParams() // Get ID/Name from URL
    const { isConnected, myChamas, setActiveChama, activeChama, formatCurrency } = useWallet()
    const { user } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    // UI State
    const { isOpen: showTooltip, onClose: closeTooltip } = useDisclosure({ defaultIsOpen: true })
    const { isOpen: isMembersOpen, onOpen: onMembersOpen, onClose: onMembersClose } = useDisclosure()
    const { isOpen: isJoinOpen, onOpen: onJoinOpen, onClose: onJoinClose } = useDisclosure() // For Join Request Modal

    const [joinMessage, setJoinMessage] = useState('')
    const [isJoining, setIsJoining] = useState(false)
    const [payoutYear, setPayoutYear] = useState('2025')
    const [payoutMonth, setPayoutMonth] = useState('January')
    const [showPaydayCelebration, setShowPaydayCelebration] = useState(false)

    // Mock payout data - In production, fetch from API
    const nextPayoutDate = new Date(2026, 2, 15, 14, 0) // March 15, 2026 at 2 PM
    const isPayday = new Date().toDateString() === nextPayoutDate.toDateString()

    const payoutQueueMembers = [
        { name: 'James', date: 'Jan 15', status: 'completed' as const },
        { name: 'Mary', date: 'Feb 15', status: 'completed' as const },
        { name: user?.displayName || 'You', date: 'Mar 15', status: 'current' as const, isCurrentUser: true },
        { name: 'John', date: 'Apr 15', status: 'upcoming' as const },
        { name: 'Sarah', date: 'May 15', status: 'upcoming' as const },
    ]

    // Check if it's payday on mount
    useEffect(() => {
        if (isPayday) {
            setShowPaydayCelebration(true)
        }
    }, [isPayday])

    // Sync URL param with Context
    useEffect(() => {
        if (chamaName && chamaName !== activeChama) {
            setActiveChama(chamaName)
        }
    }, [chamaName, activeChama, setActiveChama])

    // Current Name (fallback to param)
    const currentName = activeChama || chamaName || 'Unknown Chama'

    // --- ACCESS CONTROL CHECK ---
    const isMember = myChamas.includes(currentName)

    const handleJoinRequest = () => {
        setIsJoining(true)
        setTimeout(() => {
            setIsJoining(false)
            onJoinClose()
            toast({
                title: 'Request Sent',
                description: `Your request to join ${currentName} has been sent to the members for voting.`,
                status: 'success',
                duration: 5000,
                isClosable: true
            })
        }, 1500)
    }

    // --- NON-MEMBER VIEW ---
    if (!isMember) {
        return (
            <Box py={20}>
                <Container maxW="container.md" textAlign="center">
                    <VStack spacing={8}>
                        <Icon as={FaLock} w={16} h={16} color="gray.300" />
                        <Heading size="2xl" color="gray.700">{currentName}</Heading>
                        <Text fontSize="xl" color="gray.500">
                            This is a private savings circle. You are not a member.
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                            <Card variant="outline" borderColor="purple.200" borderTopWidth="4px" borderTopColor="purple.500">
                                <CardBody textAlign="center" py={8}>
                                    <Icon as={FaUserPlus} w={8} h={8} color="purple.500" mb={4} />
                                    <Heading size="md" mb={2}>Request to Join</Heading>
                                    <Text fontSize="sm" color="gray.500" mb={6}>
                                        Submit a profile to the existing members. Acceptance requires 51% approval.
                                    </Text>
                                    <Button colorScheme="purple" w="full" onClick={onJoinOpen}>Request Access</Button>
                                </CardBody>
                            </Card>

                            <Card variant="outline" borderColor="gray.200">
                                <CardBody textAlign="center" py={8}>
                                    <Icon as={FaRocket} w={8} h={8} color="gray.500" mb={4} />
                                    <Heading size="md" mb={2}>Start Your Own</Heading>
                                    <Text fontSize="sm" color="gray.500" mb={6}>
                                        Don't wait. Create a new Chama and set your own rules.
                                    </Text>
                                    <Button variant="outline" w="full" onClick={() => navigate('/create-chama')}>Create Chama</Button>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <Button variant="ghost" mt={4} onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                    </VStack>

                    {/* Join Request Modal */}
                    <Modal isOpen={isJoinOpen} onClose={onJoinClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Join {currentName}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <VStack spacing={4}>
                                    <Alert status="info" fontSize="sm" rounded="md">
                                        <AlertIcon />
                                        Existing members will review your profile and vote.
                                    </Alert>
                                    <Box w="full">
                                        <Text mb={2} fontWeight="bold" fontSize="sm">Message to Members (Optional)</Text>
                                        <Textarea
                                            placeholder="Hello, I'm Alice's friend..."
                                            value={joinMessage}
                                            onChange={(e) => setJoinMessage(e.target.value)}
                                        />
                                    </Box>
                                </VStack>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme="purple" mr={3} onClick={handleJoinRequest} isLoading={isJoining}>
                                    Submit Request
                                </Button>
                                <Button variant="ghost" onClick={onJoinClose}>Cancel</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Container>
            </Box>
        )
    }

    // --- MEMBER VIEW ---
    const metrics = [
        { label: 'Total Chama Pot', value: formatCurrency('1.45').btc, help: `≈ ${formatCurrency('1.45').local} public funds`, icon: FaUsers },
        { label: 'My Share', value: formatCurrency('0.145').btc, help: '10% Ownership', icon: FaWallet },
    ]

    const activities = [
        { title: 'Contribution Received', date: '2 hrs ago', desc: 'Alice contributed 1,000,000 sats via Lightning' },
        { title: 'Proposal Approved', date: '1 day ago', desc: 'Loan for Bob (10,000,000 sats) approved by 6 members' },
        { title: 'New Member', date: '3 days ago', desc: 'Charlie joined the Chama' },
    ]

    const members = [
        { name: 'Alice (You)', status: 'Paid', amount: formatCurrency('0.01').btc },
        { name: 'Bob', status: 'Paid', amount: formatCurrency('0.01').btc },
        { name: 'Charlie', status: 'Defaulted', amount: '-' },
        { name: 'Dave', status: 'Paid', amount: formatCurrency('0.01').btc },
        { name: 'Eve', status: 'Pending', amount: '-' },
    ]

    return (
        <Box py={10}>
            <Container maxW="container.xl">

                {/* Onboarding Tooltip */}
                {showTooltip && isConnected && (
                    <Alert status="info" mb={6} rounded="md" variant="subtle">
                        <AlertIcon />
                        <Box flex="1">
                            <AlertTitle mr={2}>Welcome to your Dashboard!</AlertTitle>
                            <AlertDescription display="block">
                                This is where you track your Chama's transparent on-chain funds.
                            </AlertDescription>
                        </Box>
                        <CloseButton position="absolute" right="8px" top="8px" onClick={closeTooltip} />
                    </Alert>
                )}

                {/* Header */}
                <Flex justify="space-between" align="center" mb={6} direction={{ base: 'column', sm: 'row' }} gap={4}>
                    <Box>
                        <Heading size="lg" mb={2}>
                            {currentName}
                        </Heading>
                        <Text color="gray.500">
                            Viewing as Authenticated Member
                        </Text>
                    </Box>
                    <Flex gap={3}>
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                        <Button leftIcon={<FaPlus />} variant="solid" colorScheme="orange" bg="brand.500" _hover={{ bg: 'brand.400' }} as={RouterLink} to="/contribution">Make Contribution</Button>
                    </Flex>
                </Flex>

                {/* Payday Celebration Banner */}
                {showPaydayCelebration && (
                    <Box mb={6}>
                        <PaydayCelebration
                            userName={user?.displayName || 'Friend'}
                            amount="45,000 kshs (150,000 sats)"
                            onClose={() => setShowPaydayCelebration(false)}
                        />
                    </Box>
                )}

                {/* Payout Countdown & Queue */}
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={10}>
                    <PayoutCountdown
                        nextPayoutDate={nextPayoutDate}
                        nextRecipient={user?.displayName || 'You'}
                        payoutAmount="45,000 kshs (150,000 sats)"
                        isCurrentUser={true}
                    />
                    <PayoutQueue members={payoutQueueMembers} />
                </Grid>

                {/* Active Dashboard */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
                    {metrics.map((m, i) => (
                        <Card key={i}>
                            <CardBody>
                                <Stat>
                                    <Flex align="center" mb={2} color="gray.500">
                                        <Icon as={m.icon} mr={2} />
                                        <StatLabel>{m.label}</StatLabel>
                                    </Flex>
                                    <StatNumber fontSize="2xl" color="brand.500">{m.value}</StatNumber>
                                    <StatHelpText color="green.500" fontWeight="medium">{m.help}</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    ))}
                    <Card bgGradient="linear(to-br, purple.600, purple.800)" color="white" border="none">
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="bold" opacity={0.8}>Next Payout</Text>
                                <Text fontSize="2xl" fontWeight="extrabold">12 Days</Text>
                                <Flex align="center" gap={2}>
                                    <Icon as={FaHandHoldingUsd} />
                                    <Text fontSize="xs">Beneficiary: You</Text>
                                </Flex>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card as={RouterLink} to="/governance" _hover={{ borderColor: 'purple.400', shadow: 'md' }} transition="all 0.2s">
                        <CardBody>
                            <Flex justify="space-between" align="center" h="100%">
                                <Box>
                                    <Text color="gray.500" fontSize="sm">Active Proposals</Text>
                                    <Heading size="md">2 Pending</Heading>
                                </Box>
                                <Button size="sm" variant="outline" rightIcon={<FaArrowRight />}>Vote</Button>
                            </Flex>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
                    {/* Main Content */}
                    <GridItem>
                        <Card mb={8}>
                            <CardBody>
                                <Flex justify="space-between" align="center" mb={6}>
                                    <Heading size="md">Payout Timeline</Heading>
                                    <HStack>
                                        <Select size="sm" w="100px" value={payoutYear} onChange={(e) => setPayoutYear(e.target.value)}>
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                        </Select>
                                        <Select size="sm" w="120px" value={payoutMonth} onChange={(e) => setPayoutMonth(e.target.value)}>
                                            <option value="January">January</option>
                                            <option value="February">February</option>
                                            <option value="March">March</option>
                                        </Select>
                                        <Button size="sm" variant="ghost">Filter</Button>
                                    </HStack>
                                </Flex>

                                {/* Visual Timeline Mock */}
                                <Flex justify="space-between" position="relative" mb={8} px={4}>
                                    <Box position="absolute" top="50%" left="0" right="0" h="2px" bg="gray.100" zIndex={0} transform="translateY(-50%)" />
                                    {[1, 2, 3, 4, 5].map((step) => (
                                        <Box key={step} position="relative" zIndex={1} textAlign="center">
                                            <Box
                                                bg={step === 3 ? 'purple.500' : 'white'}
                                                color={step === 3 ? 'white' : 'gray.400'}
                                                borderWidth={step === 3 ? '0' : '2px'}
                                                borderColor={step === 3 ? 'purple.500' : 'gray.200'}
                                                w={10} h={10} rounded="full"
                                                display="flex" alignItems="center" justifyContent="center"
                                                fontWeight="bold" mb={2} mx="auto"
                                            >
                                                {step}
                                            </Box>
                                            <Text fontSize="xs" color={step === 3 ? 'purple.600' : 'gray.400'} fontWeight="bold">
                                                {step === 3 ? 'Current' : 'Week ' + step}
                                            </Text>
                                        </Box>
                                    ))}
                                </Flex>

                                <Divider mb={6} />

                                <Heading size="sm" mb={4}>Contribution Status (January)</Heading>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Member</Th>
                                            <Th>Status</Th>
                                            <Th isNumeric>Amount</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {members.map((member, i) => (
                                            <Tr key={i}>
                                                <Td>
                                                    <HStack>
                                                        <Avatar size="xs" name={member.name} />
                                                        <Text fontWeight={member.name.includes('(You)') ? 'bold' : 'normal'}>{member.name}</Text>
                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <Badge colorScheme={member.status === 'Paid' ? 'green' : member.status === 'Defaulted' ? 'red' : 'orange'}>{member.status}</Badge>
                                                </Td>
                                                <Td isNumeric>{member.amount}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Sidebar */}
                    <GridItem>
                        <Heading size="md" mb={4}>Quick Actions</Heading>
                        <VStack spacing={4} mb={8}>
                            <Button w="full" leftIcon={<FaPlus />} colorScheme="purple" height="3.5rem" as={RouterLink} to="/contribution">Make Contribution</Button>
                            <Button w="full" leftIcon={<FaFileContract />} variant="outline" height="3.5rem" as={RouterLink} to="/governance">Create Proposal</Button>
                            <Button w="full" leftIcon={<FaUsers />} variant="ghost" height="3.5rem" onClick={onMembersOpen}>View Members</Button>
                        </VStack>

                        <Card>
                            <CardBody>
                                <Heading size="sm" mb={4}>Recent Activity</Heading>
                                <VStack spacing={4} align="stretch">
                                    {activities.map((act, i) => (
                                        <Box key={i} pb={3} borderBottomWidth={i !== activities.length - 1 ? '1px' : '0'}>
                                            <Text fontWeight="bold" fontSize="sm">{act.title}</Text>
                                            <Text fontSize="xs" color="gray.500" mb={1}>{act.desc}</Text>
                                            <Text fontSize="xs" color="gray.400">{act.date}</Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>

                {/* Members Modal */}
                <Modal isOpen={isMembersOpen} onClose={onMembersClose} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Chama Members</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <VStack spacing={4} align="stretch">
                                {members.map((member, i) => (
                                    <Flex key={i} justify="space-between" align="center" p={2} bg="gray.50" rounded="md">
                                        <HStack>
                                            <Avatar size="sm" name={member.name} />
                                            <Box>
                                                <Text fontWeight="bold" fontSize="sm">{member.name}</Text>
                                                <Badge colorScheme={member.status === 'Paid' ? 'green' : member.status === 'Defaulted' ? 'red' : 'orange'} fontSize="xs">{member.status}</Badge>
                                            </Box>
                                        </HStack>
                                        <Text fontSize="sm" fontWeight="mono">{member.amount}</Text>
                                    </Flex>
                                ))}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="purple" mr={3} onClick={onMembersClose}>
                                Close
                            </Button>
                            <Button variant="ghost">Invite New</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

            </Container>
        </Box>
    )
}

export default ChamaDetails
