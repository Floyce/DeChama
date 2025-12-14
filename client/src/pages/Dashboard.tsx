import React, { useState } from 'react'
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
    Image,
    Stack,
    Divider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton
} from '@chakra-ui/react'
import { FaWallet, FaHandHoldingUsd, FaFileContract, FaPlus, FaUsers, FaCrown, FaArrowRight, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { Link as RouterLink } from 'react-router-dom'

const Dashboard = () => {
    const { address, displayName, isConnected, myChamas, activeChama } = useWallet()
    const { isOpen: showTooltip, onClose: closeTooltip } = useDisclosure({ defaultIsOpen: true })
    const { isOpen: isMembersOpen, onOpen: onMembersOpen, onClose: onMembersClose } = useDisclosure()

    // Use activeChama if set, otherwise first chama, otherwise fallback (for safety)
    const currentChamaName = activeChama || (myChamas.length > 0 ? myChamas[0] : 'Chama Alpha')

    // Mock Data State
    const [payoutYear, setPayoutYear] = useState('2025')
    const [payoutMonth, setPayoutMonth] = useState('January')

    const metrics = [
        { label: 'Total Chama Pot', value: '1.45 BTC', help: '≈ $98,000 public funds', icon: FaUsers },
        { label: 'My Share', value: '0.145 BTC', help: '10% Ownership', icon: FaWallet },
    ]

    const activities = [
        { title: 'Contribution Received', date: '2 hrs ago', desc: 'Alice contributed 0.01 BTC via Lightning' },
        { title: 'Proposal Approved', date: '1 day ago', desc: 'Loan for Bob (0.1 BTC) approved by 6 members' },
        { title: 'New Member', date: '3 days ago', desc: 'Charlie joined the Chama' },
    ]

    const members = [
        { name: 'Alice (You)', status: 'Paid', amount: '0.01 BTC' },
        { name: 'Bob', status: 'Paid', amount: '0.01 BTC' },
        { name: 'Charlie', status: 'Pending', amount: '-' },
        { name: 'Dave', status: 'Paid', amount: '0.01 BTC' },
        { name: 'Eve', status: 'Pending', amount: '-' },
    ]

    // Active Dashboard Component
    const ActiveDashboard = () => (
        <>
            {/* Metrics */}
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

                            {/* Visual Timeline Mock - Fixed for selected period */}
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
                                                <Badge colorScheme={member.status === 'Paid' ? 'green' : 'orange'}>{member.status}</Badge>
                                            </Td>
                                            <Td isNumeric>{member.amount}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </CardBody>
                    </Card>

                </GridItem>

                {/* Sidebar / Quick Actions */}
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

                    {/* Premium Features Placeholder */}
                    <Card mt={6} border="1px dashed" borderColor="purple.200" bg="purple.50">
                        <CardBody textAlign="center" py={6}>
                            <Icon as={FaCrown} w={6} h={6} color="purple.500" mb={2} />
                            <Heading size="xs" mb={1} color="purple.700">Premium Features</Heading>
                            <Text fontSize="xs" color="purple.600" mb={3}>
                                Advanced analytics & auto-compounding.
                            </Text>
                            <Badge colorScheme="purple">Coming Soon</Badge>
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
                                            <Badge colorScheme={member.status === 'Paid' ? 'green' : 'orange'} fontSize="xs">{member.status}</Badge>
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
        </>
    )

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
                <Flex justify="space-between" align="center" mb={10} direction={{ base: 'column', sm: 'row' }} gap={4}>
                    <Box>
                        <Heading size="lg" mb={2}>
                            Welcome back, {displayName || (address ? (address.slice(0, 5) + '...' + address.slice(-4)) : 'Guest')}
                        </Heading>
                        <Text color="gray.500">
                            Viewing: <b>{currentChamaName}</b>
                        </Text>
                    </Box>
                    <Flex gap={3}>
                        <Button variant="outline" onClick={() => window.history.back()}>Back to Hub</Button>
                        <Button leftIcon={<FaPlus />} variant="solid" colorScheme="purple" as={RouterLink} to="/contribution">Make Contribution</Button>
                    </Flex>
                </Flex>

                {/* Main Content Area */}
                <ActiveDashboard />

            </Container>
        </Box>
    )
}

export default Dashboard
