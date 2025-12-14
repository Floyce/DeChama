import React, { useState } from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    Card,
    CardBody,
    Badge,
    VStack,
    Button,
    Flex,
    Progress,
    Icon,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SimpleGrid,
    Divider,
    Alert,
    AlertIcon
} from '@chakra-ui/react'
import { FaBullhorn, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaEye, FaHistory, FaVoteYea } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { useNavigate } from 'react-router-dom'

const GovernancePage = () => {
    const { isConnected } = useWallet()
    const toast = useToast()
    const navigate = useNavigate()

    // Create Proposal Modal
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()

    // View/Vote Modal
    const { isOpen: isVoteOpen, onOpen: onVoteOpen, onClose: onVoteClose } = useDisclosure()
    const [selectedProposal, setSelectedProposal] = useState<any>(null)

    // Form State
    const [title, setTitle] = useState('')
    const [type, setType] = useState('Loan')
    const [desc, setDesc] = useState('')

    // Mock Proposals Initial State
    const [proposals, setProposals] = useState([
        { id: 1, title: 'Approve Loan for Bob', type: 'Loan Request', amount: '0.1 BTC', votesFor: 6, votesAgainst: 1, totalMembers: 10, status: 'Active', deadline: '2 days', creator: 'Bob' },
        { id: 2, title: 'Increase Payout Cycle', type: 'Timeline Change', desc: 'Change from 30 days to 45 days', votesFor: 2, votesAgainst: 4, totalMembers: 10, status: 'Active', deadline: '5 days', creator: 'Alice' },
        { id: 3, title: 'Add New Member: Charlie', type: 'Add New Member', desc: '0.01 BTC Collateral Paid', votesFor: 9, votesAgainst: 0, totalMembers: 10, status: 'Passed', deadline: 'Ended', creator: 'Admin' },
    ])

    // Mock user votes: proposalId -> vote
    const [myVotes, setMyVotes] = useState<Record<number, 'YES' | 'NO'>>({})

    const handleViewProposal = (prop: any) => {
        setSelectedProposal(prop)
        onVoteOpen()
    }

    const handleVote = (vote: 'YES' | 'NO') => {
        if (!isConnected) {
            toast({ title: 'Connect Wallet', status: 'warning' })
            return
        }
        if (!selectedProposal) return

        const previousVote = myVotes[selectedProposal.id]

        if (previousVote === vote) {
            toast({ title: `You already voted ${vote}`, status: 'info' })
            return
        }

        // Apply vote logic
        setProposals(prev => prev.map(p => {
            if (p.id === selectedProposal.id) {
                let newFor = p.votesFor
                let newAgainst = p.votesAgainst

                // Remove previous vote if any
                if (previousVote === 'YES') newFor--
                if (previousVote === 'NO') newAgainst--

                // Add new vote
                if (vote === 'YES') newFor++
                if (vote === 'NO') newAgainst++

                return { ...p, votesFor: newFor, votesAgainst: newAgainst }
            }
            return p
        }))

        setMyVotes(prev => ({ ...prev, [selectedProposal.id]: vote }))

        toast({
            title: previousVote ? 'Vote Changed' : 'Vote Submitted',
            description: `You voted ${vote} on Proposal #${selectedProposal.id}`,
            status: 'success',
            duration: 2000,
            isClosable: true,
        })

        onVoteClose()
    }

    const handleSubmitProposal = () => {
        if (!title || !desc) {
            toast({ title: 'Please fill all fields', status: 'error' })
            return
        }

        const newProposal = {
            id: proposals.length + 1,
            title,
            type,
            desc,
            votesFor: 0,
            votesAgainst: 0,
            totalMembers: 10,
            status: 'Active',
            deadline: '7 days',
            creator: 'You'
        }

        setProposals([newProposal, ...proposals])
        onCreateClose()
        setTitle('')
        setDesc('')
        toast({ title: 'Proposal Created', status: 'success' })
    }

    const activeProposals = proposals.filter(p => p.status === 'Active')
    const pastProposals = proposals.filter(p => p.status !== 'Active')

    const ProposalCard = ({ prop }: { prop: any }) => (
        <Card variant="outline" borderColor={prop.status === 'Active' ? 'purple.400' : 'gray.200'} _hover={{ shadow: 'md' }}>
            <CardBody>
                <Flex justify="space-between" align="start" mb={3}>
                    <Badge colorScheme={prop.type.includes('Loan') ? 'blue' : prop.type.includes('Member') ? 'green' : 'purple'}>
                        {prop.type}
                    </Badge>
                    <Badge variant={prop.status === 'Active' ? 'solid' : 'subtle'} colorScheme={prop.status === 'Active' ? 'green' : 'gray'}>
                        {prop.status}
                    </Badge>
                </Flex>

                <Heading size="md" mb={2} color="gray.700">{prop.title}</Heading>
                <Text fontSize="sm" color="gray.500" mb={4} noOfLines={2}>
                    {prop.amount ? `Amount: ${prop.amount}` : prop.desc}
                </Text>

                <Box mb={4}>
                    <Flex justify="space-between" fontSize="xs" mb={1}>
                        <Text color="green.500">Yes: {prop.votesFor}</Text>
                        <Text color="red.500">No: {prop.votesAgainst}</Text>
                    </Flex>
                    <Progress value={(prop.votesFor / prop.totalMembers) * 100} colorScheme="purple" size="xs" rounded="full" bg="gray.100" />
                </Box>

                <Button size="sm" w="full" variant="outline" rightIcon={<FaEye />} onClick={() => handleViewProposal(prop)}>
                    View Details {prop.status === 'Active' && '& Vote'}
                </Button>
            </CardBody>
        </Card>
    )

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate(-1)}>
                    Back
                </Button>

                <Flex justify="space-between" align="center" mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
                    <Box>
                        <Heading size="lg" mb={2} color="brand.800">Governance</Heading>
                        <Text color="gray.500">Vote on loans, rule changes, and new members.</Text>
                    </Box>
                    <Button leftIcon={<FaBullhorn />} colorScheme="purple" onClick={onCreateOpen}>Create Proposal</Button>
                </Flex>

                <Tabs variant="enclosed" colorScheme="purple">
                    <TabList mb={6}>
                        <Tab fontWeight="bold"><Icon as={FaVoteYea} mr={2} /> Active Proposals ({activeProposals.length})</Tab>
                        <Tab fontWeight="bold"><Icon as={FaHistory} mr={2} /> Past Proposals</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel p={0}>
                            {activeProposals.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {activeProposals.map(p => <ProposalCard key={p.id} prop={p} />)}
                                </SimpleGrid>
                            ) : (
                                <Alert status="info" rounded="md"><AlertIcon />No active proposals at the moment.</Alert>
                            )}
                        </TabPanel>
                        <TabPanel p={0}>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {pastProposals.map(p => <ProposalCard key={p.id} prop={p} />)}
                            </SimpleGrid>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {/* Create Proposal Modal */}
                <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
                    <ModalOverlay backdropFilter="blur(5px)" />
                    <ModalContent>
                        <ModalHeader>Create New Proposal</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Proposal Type</FormLabel>
                                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="Loan Request">Loan Request</option>
                                        <option value="Rule Change">Rule Change</option>
                                        <option value="Timeline Change">Timeline Change</option>
                                        <option value="Contribution Amount Change">Contribution Amount Change</option>
                                        <option value="Add New Member">Add New Member</option>
                                        <option value="Remove Member">Remove Member</option>
                                        <option value="Emergency Payout">Emergency Payout</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                </FormControl>

                                {type === 'Other' && (
                                    <FormControl isRequired>
                                        <FormLabel>Specify Proposal Type</FormLabel>
                                        <Input placeholder="e.g. Marketing Budget" onChange={(e) => setType(`Other: ${e.target.value}`)} />
                                    </FormControl>
                                )}

                                <FormControl>
                                    <FormLabel>Title</FormLabel>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Requesting 0.5 BTC Loan" />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Description / Amount</FormLabel>
                                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Explain why or state amount..." />
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onCreateClose}>Cancel</Button>
                            <Button colorScheme="purple" onClick={handleSubmitProposal}>Submit Proposal</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* View/Vote Modal */}
                <Modal isOpen={isVoteOpen} onClose={onVoteClose} size="lg">
                    <ModalOverlay backdropFilter="blur(5px)" />
                    <ModalContent>
                        <ModalHeader>
                            {selectedProposal?.title}
                            <Badge ml={3} colorScheme={selectedProposal?.status === 'Active' ? 'green' : 'gray'}>{selectedProposal?.status}</Badge>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500">PROPOSAL TYPE</Text>
                                    <Text>{selectedProposal?.type}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500">DESCRIPTION</Text>
                                    <Text>{selectedProposal?.desc || `Amount: ${selectedProposal?.amount}`}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500">CREATOR</Text>
                                    <Text>{selectedProposal?.creator}</Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Flex justify="space-between" mb={2}>
                                        <Text fontWeight="bold">Current Votes</Text>
                                        <Text fontSize="sm" color="gray.500">{selectedProposal?.votesFor + selectedProposal?.votesAgainst} / {selectedProposal?.totalMembers} Votes</Text>
                                    </Flex>
                                    <Progress value={(selectedProposal?.votesFor / selectedProposal?.totalMembers) * 100} colorScheme="purple" size="md" rounded="full" />
                                    <Flex justify="space-between" mt={1}>
                                        <Text fontSize="sm" color="green.600">{selectedProposal?.votesFor} Yes</Text>
                                        <Text fontSize="sm" color="red.600">{selectedProposal?.votesAgainst} No</Text>
                                    </Flex>
                                </Box>

                                {myVotes[selectedProposal?.id] && (
                                    <Alert status="info" size="sm" variant="left-accent">
                                        <AlertIcon />
                                        You have voted: <b>{myVotes[selectedProposal?.id]}</b>
                                    </Alert>
                                )}
                            </VStack>
                        </ModalBody>

                        <ModalFooter justifyContent="space-between">
                            {selectedProposal?.status === 'Active' ? (
                                <>
                                    <Button flex="1" mr={2} leftIcon={<FaCheckCircle />} colorScheme="green" variant="solid" onClick={() => handleVote('YES')}>
                                        Vote Accept
                                    </Button>
                                    <Button flex="1" ml={2} leftIcon={<FaTimesCircle />} colorScheme="red" variant="outline" onClick={() => handleVote('NO')}>
                                        Vote Reject
                                    </Button>
                                </>
                            ) : (
                                <Text color="gray.500" fontSize="sm" w="full" textAlign="center">Voting has ended.</Text>
                            )}
                        </ModalFooter>
                    </ModalContent>
                </Modal>

            </Container>
        </Box>
    )
}

export default GovernancePage
