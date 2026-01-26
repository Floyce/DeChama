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
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    useDisclosure
} from '@chakra-ui/react'
import { FaVoteYea, FaBullhorn, FaCheckCircle, FaTimesCircle, FaPlus, FaArrowLeft } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'

interface Proposal {
    id: number
    title: string
    type: string
    description: string
    amount?: string // For loans
    votesFor: number
    votesAgainst: number
    totalMembers: number
    status: 'Active' | 'Passed' | 'Rejected'
    deadline: string
    myVote?: 'YES' | 'NO'
}

const GovernancePage = () => {
    const { isConnected } = useWallet()
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()

    // Mock Proposals
    const [proposals, setProposals] = useState<Proposal[]>([
        { id: 1, title: 'Approve Loan for Bob', type: 'Loan', amount: '0.1 BTC', description: 'Business expansion loan.', votesFor: 6, votesAgainst: 1, totalMembers: 10, status: 'Active', deadline: '2 days' },
        { id: 2, title: 'Increase Payout Cycle', type: 'Rule Change', description: 'Change from 30 days to 45 days', votesFor: 2, votesAgainst: 4, totalMembers: 10, status: 'Active', deadline: '5 days' },
        { id: 3, title: 'Add New Member: Charlie', type: 'Membership', description: '0.01 BTC Collateral Paid', votesFor: 9, votesAgainst: 0, totalMembers: 10, status: 'Passed', deadline: 'Ended' },
    ])

    // Form State
    const [newTitle, setNewTitle] = useState('')
    const [newType, setNewType] = useState('Loan')
    const [newDesc, setNewDesc] = useState('')
    const [newAmount, setNewAmount] = useState('')

    const handleCreateProposal = () => {
        if (!newTitle || !newDesc) {
            toast({ title: 'Please fill in all fields', status: 'warning' })
            return
        }

        const newId = proposals.length + 1
        const newProposal: Proposal = {
            id: newId,
            title: newTitle,
            type: newType,
            description: newDesc,
            amount: newAmount,
            votesFor: 0,
            votesAgainst: 0,
            totalMembers: 10, // Mock
            status: 'Active',
            deadline: '7 days'
        }

        setProposals([newProposal, ...proposals])
        toast({ title: 'Proposal Created', status: 'success' })
        onClose()
        setNewTitle('')
        setNewDesc('')
        setNewAmount('')
    }

    const handleVote = (id: number, vote: 'YES' | 'NO') => {
        if (!isConnected) {
            toast({ title: 'Connect Wallet', description: 'You need to sign the vote transaction.', status: 'warning' })
            return
        }

        // Check if already voted (in a real app check backend)
        const proposal = proposals.find(p => p.id === id)
        if (proposal?.myVote) {
            toast({ title: 'Vote already cast', status: 'error' })
            return
        }

        // Optimistic update
        setProposals(prev => prev.map(p => {
            if (p.id === id) {
                const updatedFor = vote === 'YES' ? p.votesFor + 1 : p.votesFor
                const updatedAgainst = vote === 'NO' ? p.votesAgainst + 1 : p.votesAgainst

                // Check for auto-execution (51% threshold)
                // Threshold = > 50% of totalMembers
                const threshold = p.totalMembers / 2
                let newStatus = p.status

                if (updatedFor > threshold) {
                    newStatus = 'Passed'
                    toast({
                        title: 'Proposal Passed!',
                        description: 'Threshold reached. Smart contract will execute automatically.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true
                    })
                }

                return {
                    ...p,
                    votesFor: updatedFor,
                    votesAgainst: updatedAgainst,
                    myVote: vote,
                    status: newStatus
                }
            }
            return p
        }))

        toast({
            title: 'Vote Submitted',
            description: `You voted ${vote} on Proposal #${id}`,
            status: 'success',
            duration: 2000,
        })
    }

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => window.history.back()}>
                    Back to Chama
                </Button>
                <Flex justify="space-between" align="center" mb={10}>
                    <Box>
                        <Heading size="lg" mb={2}>Governance</Heading>
                        <Text color="gray.500">Vote on loans, rule changes, and custom community actions.</Text>
                    </Box>
                    <Button leftIcon={<FaPlus />} colorScheme="purple" onClick={onOpen}>Create Proposal</Button>
                </Flex>

                <VStack spacing={6} align="stretch">
                    {proposals.map((prop) => (
                        <Card key={prop.id} variant={prop.status === 'Active' ? 'elevated' : 'outline'} opacity={prop.status !== 'Active' ? 0.7 : 1} borderLeft={prop.status === 'Passed' ? '4px solid green' : undefined}>
                            <CardBody>
                                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={6}>
                                    <Box flex="1">
                                        <Flex align="center" gap={3} mb={2}>
                                            <Badge colorScheme={prop.type === 'Loan' ? 'blue' : prop.type === 'Membership' ? 'green' : prop.type === 'Custom' ? 'orange' : 'purple'}>{prop.type}</Badge>
                                            <Badge colorScheme={prop.status === 'Active' ? 'blue' : prop.status === 'Passed' ? 'green' : 'red'}>{prop.status}</Badge>
                                            <Text fontSize="xs" color="gray.500">Expires in {prop.deadline}</Text>
                                        </Flex>
                                        <Heading size="md" mb={2}>{prop.title}</Heading>
                                        <Text color="gray.600" mb={4}>
                                            {prop.amount && <Text as="span" fontWeight="bold" mr={2}>Requesting: {prop.amount}</Text>}
                                            {prop.description}
                                        </Text>

                                        {/* Progress Bar */}
                                        <Box mt={4}>
                                            <Flex justify="space-between" fontSize="xs" mb={1}>
                                                <Text color="green.600" fontWeight="bold">Yes: {prop.votesFor}</Text>
                                                <Text color="red.600" fontWeight="bold">No: {prop.votesAgainst}</Text>
                                            </Flex>
                                            <Progress value={(prop.votesFor / prop.totalMembers) * 100} colorScheme={prop.status === 'Passed' ? 'green' : 'purple'} size="sm" rounded="full" bg="gray.100" />
                                            <Text fontSize="xs" color="gray.400" mt={1}>{prop.votesFor + prop.votesAgainst} / {prop.totalMembers} voted (Threshold: 51%)</Text>
                                        </Box>
                                    </Box>

                                    {prop.status === 'Active' && !prop.myVote && (
                                        <Flex direction={{ base: 'row', md: 'column' }} gap={3} justify="center" minW="150px">
                                            <Button leftIcon={<FaCheckCircle />} colorScheme="green" variant="solid" onClick={() => handleVote(prop.id, 'YES')}>
                                                Approve
                                            </Button>
                                            <Button leftIcon={<FaTimesCircle />} colorScheme="red" variant="outline" onClick={() => handleVote(prop.id, 'NO')}>
                                                Reject
                                            </Button>
                                        </Flex>
                                    )}

                                    {prop.myVote && (
                                        <Flex direction="column" justify="center" align="center" minW="150px">
                                            <Text fontWeight="bold" color={prop.myVote === 'YES' ? 'green.500' : 'red.500'}>
                                                You Voted {prop.myVote}
                                            </Text>
                                        </Flex>
                                    )}
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>

                {/* Create Proposal Modal */}
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create New Proposal</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Proposal Type</FormLabel>
                                    <Select value={newType} onChange={(e) => setNewType(e.target.value)}>
                                        <option value="Loan">Loan Request</option>
                                        <option value="Membership">Membership Change</option>
                                        <option value="Rule Change">Rule Change</option>
                                        <option value="Custom">Custom / Other</option>
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Title</FormLabel>
                                    <Input placeholder="Proposal Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                                </FormControl>
                                {newType === 'Loan' && (
                                    <FormControl>
                                        <FormLabel>Amount (BTC)</FormLabel>
                                        <Input placeholder="0.00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                                    </FormControl>
                                )}
                                <FormControl isRequired>
                                    <FormLabel>{newType === 'Custom' ? 'Details / Question' : 'Description / Reason'}</FormLabel>
                                    <Textarea placeholder="Describe your proposal..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme="purple" mr={3} onClick={handleCreateProposal}>
                                Submit Proposal
                            </Button>
                            <Button onClick={onClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

            </Container>
        </Box>
    )
}

export default GovernancePage
