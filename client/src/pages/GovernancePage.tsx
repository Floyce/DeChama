import React, { useState, useEffect } from 'react'
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
    useDisclosure,
    HStack
} from '@chakra-ui/react'
import { FaVoteYea, FaBullhorn, FaCheckCircle, FaTimesCircle, FaPlus, FaArrowLeft, FaUsers } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'

interface Proposal {
    id: string
    title: string
    type: string
    description: string
    votes_for: number
    votes_against: number
    status: 'active' | 'passed' | 'rejected' | 'executed'
    deadline: string
    myVote?: boolean
}

const GovernancePage = () => {
    const { isConnected, activeChama, currentUserRole } = useWallet()
    const { user } = useAuth()
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const [pendingMembers, setPendingMembers] = useState<any[]>([])
    const [isApproving, setIsApproving] = useState<string | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [totalMembers, setTotalMembers] = useState(10) // Should ideally come from chama details

    // Fetch Proposals & Pending members
    const fetchData = async () => {
        if (!activeChama) return
        setIsLoading(true)
        try {
            // Proposals
            const pRes = await fetch(`/api/chamas/${encodeURIComponent(activeChama)}/proposals`)
            const pData = await pRes.json()
            if (Array.isArray(pData)) setProposals(pData)

            // Pending Members (if admin)
            if (currentUserRole === 'admin') {
                const mRes = await fetch(`/api/chamas/${encodeURIComponent(activeChama)}/pending-members`)
                const mData = await mRes.json()
                if (Array.isArray(mData)) setPendingMembers(mData)
            }

            // Get Chama Details for total members count
            const cRes = await fetch(`/api/chamas/${encodeURIComponent(activeChama)}`)
            const cData = await cRes.json()
            if (cData.expected_members) setTotalMembers(cData.expected_members)

        } catch (err) {
            console.error("Failed to fetch governance data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [activeChama, currentUserRole])

    const handleApprove = async (userId: string) => {
        setIsApproving(userId)
        try {
            const res = await fetch(`/api/chamas/${encodeURIComponent(activeChama!)}/approve-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            })
            const data = await res.json()
            if (data.success) {
                toast({ title: 'Member Approved', status: 'success' })
                setPendingMembers(prev => prev.filter(u => u.id !== userId))
            }
        } catch (err) {
            toast({ title: 'Approval Failed', status: 'error' })
        } finally {
            setIsApproving(null)
        }
    }

    // Form State
    const [newTitle, setNewTitle] = useState('')
    const [newType, setNewType] = useState('loan_request')
    const [newDesc, setNewDesc] = useState('')
    const [newAmount, setNewAmount] = useState('')

    const handleCreateProposal = async () => {
        if (!newTitle || !newDesc || !user || !activeChama) {
            toast({ title: 'Missing information', status: 'warning' })
            return
        }

        try {
            const res = await fetch('/api/governance/proposals/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chama_id: activeChama,
                    creator_id: user.id,
                    type: newType,
                    title: newTitle,
                    description: newDesc,
                    payload: newType === 'loan_request' ? { amount: newAmount } : {}
                })
            })
            if (res.ok) {
                toast({ title: 'Proposal Created', status: 'success' })
                onClose()
                fetchData() // Refresh
                setNewTitle('')
                setNewDesc('')
                setNewAmount('')
            }
        } catch (err) {
            toast({ title: 'Failed to create proposal', status: 'error' })
        }
    }

    const handleVote = async (id: string, voteValue: boolean) => {
        if (!isConnected || !user) {
            toast({ title: 'Connect Wallet', status: 'warning' })
            return
        }

        try {
            const res = await fetch('/api/governance/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposal_id: id,
                    voter_id: user.id,
                    vote: voteValue
                })
            })
            const data = await res.json()
            if (data.success) {
                toast({ title: 'Vote Submitted', status: 'success' })
                fetchData() // Refresh to see updated counts and status
            } else {
                toast({ title: 'Voting failed', description: data.detail, status: 'error' })
            }
        } catch (err) {
            toast({ title: 'Network Error', status: 'error' })
        }
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

                {pendingMembers.length > 0 && (
                    <Box mb={10}>
                        <Heading size="md" mb={4} color="purple.600">Pending Membership Requests</Heading>
                        <VStack spacing={4} align="stretch">
                            {pendingMembers.map((u) => (
                                <Card key={u.id} variant="outline" borderColor="purple.200" bg="purple.50">
                                    <CardBody>
                                        <Flex justify="space-between" align="center">
                                            <HStack spacing={4}>
                                                <Icon as={FaUsers} color="purple.500" />
                                                <Box>
                                                    <Text fontWeight="bold">{u.display_name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{u.phoneNumber}</Text>
                                                </Box>
                                            </HStack>
                                            <VStack align="end" spacing={1}>
                                                <Button
                                                    colorScheme="purple"
                                                    size="sm"
                                                    onClick={() => handleApprove(u.id)}
                                                    isLoading={isApproving === u.id}
                                                >
                                                    Approve Entry
                                                </Button>
                                                <Text fontSize="10px" color="gray.500" fontWeight="bold">51% RULE APPLIES</Text>
                                            </VStack>

                                        </Flex>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    </Box>
                )}

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
                                        <Flex direction={{ base: 'column' }} gap={3} minW="200px">
                                            <VStack align="stretch" spacing={2}>
                                                <Button leftIcon={<FaCheckCircle />} colorScheme="green" variant="solid" onClick={() => handleVote(prop.id, 'YES')}>
                                                    Approve
                                                </Button>
                                                <Button leftIcon={<FaTimesCircle />} colorScheme="red" variant="outline" onClick={() => handleVote(prop.id, 'NO')}>
                                                    Reject
                                                </Button>
                                            </VStack>
                                            <Box p={2} bg="gray.50" rounded="md" border="1px solid" borderColor="gray.100">
                                                <Text fontSize="xs" fontWeight="bold" color="purple.600">
                                                    Rule: 51% Consensus
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {Math.ceil(prop.totalMembers * 0.51)} of {prop.totalMembers} votes needed to pass.
                                                </Text>
                                            </Box>
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
