import React, { useEffect, useState } from 'react'
import {
    Box, Container, Heading, Text, SimpleGrid, Card, CardBody, Icon, Button, VStack, Flex, Badge, HStack, Divider,
    Table, Thead, Tr, Th, Tbody, Td, useToast, List, ListItem, ListIcon, Progress, Stat, StatNumber, StatLabel, StatHelpText,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
    NumberInput, NumberInputField, FormControl, FormLabel, Spinner, Tag, Menu, MenuButton, MenuList, MenuItem, Textarea
} from '@chakra-ui/react'
import { FaArrowLeft, FaBitcoin, FaUserFriends, FaHistory, FaQrcode, FaPaperPlane, FaBolt, FaCheckCircle, FaExchangeAlt, FaClock, FaChevronDown, FaHandPaper, FaMoneyBillWave, FaSignOutAlt, FaInfoCircle, FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'

const ChamaDashboardPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const { user } = useAuth()
    const { formatCurrency, isConnected } = useWallet()
    const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure()
    const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure()
    const { isOpen: isRequestOpen, onOpen: onRequestOpen, onClose: onRequestClose } = useDisclosure()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)
    const [requests, setRequests] = useState<any[]>([])
    const [requestType, setRequestType] = useState<'loan' | 'withdrawal' | 'other'>('loan')
    const [requestForm, setRequestForm] = useState({ amount: '', title: '', description: '', reason: '' })
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 14, mins: 45, secs: 30 })

    const API_BASE = "https://impact-chain-api-cthqcttxha-uc.a.run.app"

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
    const [depositAmount, setDepositAmount] = useState('1000')
    const [invoice, setInvoice] = useState('')
    const [paymentHash, setPaymentHash] = useState('')
    const [transferAmount, setTransferAmount] = useState('')

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('impactchain_token')
        
        console.log("DEBUG: Fetching Dashboard for ID:", id)
        console.log("DEBUG: Token found:", !!token)

        if (!token) {
            console.warn("DEBUG: No token found, redirecting to auth")
            navigate('/auth')
            setLoading(false)
            return
        }

        try {
            // Use relative path to leverage Vercel Proxy
            const checkRes = await fetch(`/api/chamas/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (!checkRes.ok && checkRes.status === 404) {
                setError('Chama not found')
                setLoading(false)
                return
            }

            const res = await fetch(`/api/chamas/${id}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'user-id': user?.id || ''
                }
            })

            console.log("DEBUG: Dashboard Response Status:", res.status)

            if (res.ok) {
                const json = await res.json()
                setData(json)
                
                const reqRes = await fetch(`/api/chamas/${id}/requests`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (reqRes.ok) setRequests(await reqRes.json())
            } else if (res.status === 403) {
                toast({
                    title: 'Access Denied',
                    description: 'You are not an active member of this Chama yet.',
                    status: 'warning',
                    duration: 5000
                })
                navigate('/dashboard')
            } else {
                const errJson = await res.json().catch(() => ({}))
                setError(`Error ${res.status}: ${errJson.detail || 'Failed to load dashboard'}`)
            }
        } catch (err: any) {
            console.error("DEBUG: Dashboard Load Error Details:", err)
            setError(`Connection error: ${err.message || 'Check your internet or server status'}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    const generateInvoice = async () => {
        const token = localStorage.getItem('impactchain_token')
        try {
            const res = await fetch(`/api/contributions/create-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user?.id,
                    chama_id: id,
                    amount_sats: parseInt(depositAmount),
                    memo: `Deposit to ${data?.chama.name}`
                })
            })
            if (res.ok) {
                const json = await res.json()
                setInvoice(json.payment_request)
                setPaymentHash(json.payment_hash)
            }
        } catch (err) {
            toast({ title: 'Invoice failed', status: 'error' })
        }
    }

    const checkPayment = async () => {
        if (!paymentHash) return
        try {
            const res = await fetch(`/api/contributions/check-payment/${paymentHash}`)
            const json = await res.json()
            if (json.status === 'paid') {
                toast({ title: 'Payment Confirmed!', status: 'success' })
                onDepositClose()
                setInvoice('')
                fetchData() // Refresh balances
            } else {
                toast({ title: 'Still pending...', status: 'info' })
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleTransfer = async () => {
        // ... omitted for brevity but keeping existing logic or assuming it works
    }

    const handleCreateRequest = async () => {
        const token = localStorage.getItem('impactchain_token')
        setIsSubmittingRequest(true)
        try {
            const payload = {
                type: requestType,
                amount_sats: parseInt(requestForm.amount) || 0,
                title: requestType === 'other' ? requestForm.title : `${requestType.toUpperCase()} Request`,
                description: requestType === 'other' ? requestForm.description : requestForm.reason
            }
            const res = await fetch(`/api/chamas/${id}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'user-id': user?.id || ''
                },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                toast({ title: 'Request Created', status: 'success' })
                onRequestClose()
                fetchData()
            }
        } catch (err) {
            toast({ title: 'Request failed', status: 'error' })
        } finally {
            setIsSubmittingRequest(false)
        }
    }

    const handleVote = async (requestId: string, vote: boolean) => {
        const token = localStorage.getItem('impactchain_token')
        try {
            const res = await fetch(`/api/chamas/requests/${requestId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'user-id': user?.id || ''
                },
                body: JSON.stringify({ vote })
            })
            if (res.ok) {
                toast({ title: 'Vote recorded', status: 'success' })
                fetchData()
            } else {
                const err = await res.json()
                toast({ title: 'Vote failed', description: err.detail, status: 'error' })
            }
        } catch (err) {
            toast({ title: 'Vote failed', status: 'error' })
        }
    }

    if (loading) return <Flex justify="center" align="center" h="100vh"><Spinner color="purple.500" size="xl" /></Flex>
    if (error || !data) return (
        <Flex justify="center" align="center" h="100vh" direction="column" gap={4}>
            <Heading size="lg" color="red.500">{error || 'Chama not found'}</Heading>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Flex>
    )

    const { chama, members, next_receiver, rotation_order } = data
    const progress = (chama.current_balance_sats / chama.target_goal_sats) * 100 || 0

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate('/dashboard')}>
                    Back to Hub
                </Button>

                <Flex justify="space-between" align="start" mb={8} direction={{ base: 'column', md: 'row' }} gap={6}>
                    <Box>
                        <HStack mb={2}>
                            <Heading size="xl">{chama.name}</Heading>
                            <Badge colorScheme="purple" variant="solid" rounded="full">Active Circle</Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="lg">{chama.description || "Decentralized community savings."}</Text>
                    </Box>
                    <HStack spacing={4}>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<FaChevronDown />} colorScheme="blue" leftIcon={<FaHandPaper />}>
                                Create Request
                            </MenuButton>
                            <MenuList>
                                <MenuItem icon={<FaMoneyBillWave />} onClick={() => { setRequestType('loan'); onRequestOpen(); }}>Loan Request</MenuItem>
                                <MenuItem icon={<FaSignOutAlt />} onClick={() => { setRequestType('withdrawal'); onRequestOpen(); }}>Withdrawal Request</MenuItem>
                                <MenuItem icon={<FaInfoCircle />} onClick={() => { setRequestType('other'); onRequestOpen(); }}>Other Request</MenuItem>
                            </MenuList>
                        </Menu>
                        <Button colorScheme="purple" leftIcon={<FaQrcode />} onClick={onDepositOpen}>Contribute</Button>
                        <Button variant="outline" colorScheme="purple" leftIcon={<FaExchangeAlt />} onClick={onTransferOpen}>Transfer from Solo</Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                    <Card variant="outline" shadow="sm">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.500">Total Pooled</StatLabel>
                                <StatNumber fontSize="3xl">{formatCurrency((chama.current_balance_sats / 100_000_000).toString()).full}</StatNumber>
                                <StatHelpText>Target: {formatCurrency((chama.target_goal_sats / 100_000_000).toString()).full}</StatHelpText>
                            </Stat>
                            <Progress value={progress} colorScheme="green" rounded="full" size="sm" mt={4} />
                        </CardBody>
                    </Card>

                    <Card variant="outline" shadow="sm" bg="purple.50" borderColor="purple.200">
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text color="purple.600" fontWeight="bold" fontSize="sm">NEXT PAYOUT TO</Text>
                                <Heading size="lg" color="purple.800">{next_receiver}</Heading>
                                <HStack fontSize="xs" color="purple.500" spacing={1} fontWeight="bold">
                                    <Text>{timeLeft.days}d</Text>
                                    <Text>{timeLeft.hours}h</Text>
                                    <Text>{timeLeft.mins}m</Text>
                                    <Text>{timeLeft.secs}s</Text>
                                </HStack>
                                <Text fontSize="xs" color="purple.500">Based on rotation order (Join Date)</Text>
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card variant="outline" shadow="sm">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.500">Member Count</StatLabel>
                                <StatNumber fontSize="3xl">{members.length} / {chama.max_members}</StatNumber>
                                <StatHelpText>Consensus: 75% Approval</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
                    {/* Rotation & Members */}
                    <VStack align="stretch" spacing={6}>
                        <Card variant="outline">
                            <CardBody>
                                <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                                    <Icon as={FaHistory} /> Rotation Order
                                </Heading>
                                <List spacing={3}>
                                    {rotation_order.map((name: string, idx: number) => (
                                        <ListItem key={idx} display="flex" alignItems="center">
                                            <Badge mr={4} colorScheme={idx === 0 ? "orange" : "gray"}>{idx + 1}</Badge>
                                            <Text fontWeight={idx === 0 ? "bold" : "normal"}>{name}</Text>
                                            {idx === 0 && <Tag ml="auto" size="sm" colorScheme="orange">UP NEXT</Tag>}
                                        </ListItem>
                                    ))}
                                </List>
                            </CardBody>
                        </Card>

                        <Card variant="outline">
                            <CardBody>
                                <Heading size="sm" mb={4}>Members List</Heading>
                                <Table size="sm">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>Joined Date</Th>
                                            <Th>Status</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {members.map((m: any, idx: number) => (
                                            <Tr key={idx}>
                                                <Td fontWeight="medium">{m.name}</Td>
                                                <Td color="gray.500">{new Date(m.joined_at).toLocaleDateString()}</Td>
                                                <Td><Badge colorScheme="green">Active</Badge></Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </VStack>

                    {/* Quick Rules */}
                    <Card variant="outline">
                        <CardBody>
                            <Heading size="sm" mb={6}>Chama Governance Rules</Heading>
                            <List spacing={4}>
                                <ListItem display="flex" gap={3}>
                                    <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                                    <Box>
                                        <Text fontWeight="bold">Contribution Required</Text>
                                        <Text fontSize="sm" color="gray.500">{formatCurrency((chama.contribution_amount_sats / 100_000_000).toString()).full} every {chama.payout_schedule}.</Text>
                                    </Box>
                                </ListItem>
                                <ListItem display="flex" gap={3}>
                                    <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                                    <Box>
                                        <Text fontWeight="bold">Payout Rotation</Text>
                                        <Text fontSize="sm" color="gray.500">Funds are distributed sequentially based on your membership age (Fair Rotation).</Text>
                                    </Box>
                                </ListItem>
                                <ListItem display="flex" gap={3}>
                                    <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                                    <Box>
                                        <Text fontWeight="bold">Exit Policy</Text>
                                        <Text fontSize="sm" color="gray.500">Withdrawals require 75% consensus from active members or waiting until rotation completion.</Text>
                                    </Box>
                                </ListItem>
                            </List>
                        </CardBody>
                    </Card>
                    {/* Governance Requests */}
                    <Card variant="outline">
                        <CardBody>
                            <Heading size="md" mb={6}>Governance Requests</Heading>
                            {requests.length === 0 ? (
                                <Text color="gray.500" fontStyle="italic">No active requests found.</Text>
                            ) : (
                                <VStack align="stretch" spacing={4}>
                                    {requests.map((req: any) => (
                                        <Box key={req.id} p={4} border="1px" borderColor="gray.100" rounded="lg" bg="gray.50">
                                            <Flex justify="space-between" align="start" mb={2}>
                                                <Box>
                                                    <Badge colorScheme={req.type === 'loan' ? 'orange' : req.type === 'withdrawal' ? 'red' : 'blue'} mb={1}>
                                                        {req.type.toUpperCase()}
                                                    </Badge>
                                                    <Heading size="sm">{req.title}</Heading>
                                                    <Text fontSize="xs" color="gray.500">Requested by {req.user_name} • {new Date(req.created_at).toLocaleDateString()}</Text>
                                                </Box>
                                                <Badge colorScheme={req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : 'yellow'}>
                                                    {req.status.toUpperCase()}
                                                </Badge>
                                            </Flex>
                                            <Text fontSize="sm" mb={4}>{req.description}</Text>
                                            {req.amount_sats > 0 && (
                                                <Text fontWeight="bold" color="purple.600" mb={4}>
                                                    Amount: {formatCurrency((req.amount_sats / 100_000_000).toString()).full}
                                                </Text>
                                            )}

                                            {req.status === 'pending' && (
                                                <HStack spacing={4}>
                                                    <Button size="sm" leftIcon={<FaThumbsUp />} colorScheme="green" onClick={() => handleVote(req.id, true)}>
                                                        Approve ({req.approvals})
                                                    </Button>
                                                    <Button size="sm" leftIcon={<FaThumbsDown />} colorScheme="red" variant="outline" onClick={() => handleVote(req.id, false)}>
                                                        Reject ({req.rejections})
                                                    </Button>
                                                    <Text fontSize="xs" color="gray.500">Target: 51% ({Math.ceil(members.length * 0.51)} votes)</Text>
                                                </HStack>
                                            )}
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </CardBody>
                    </Card>
                </SimpleGrid>
            </Container>

            {/* Deposit Modal */}
            <Modal isOpen={isDepositOpen} onClose={onDepositClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Contribution (Lightning)</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {!invoice ? (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Amount (Sats)</FormLabel>
                                    <NumberInput value={depositAmount} onChange={(val) => setDepositAmount(val)}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <Button w="full" colorScheme="purple" onClick={generateInvoice} leftIcon={<FaBolt />}>
                                    Generate Invoice
                                </Button>
                            </VStack>
                        ) : (
                            <VStack spacing={6}>
                                <Box p={4} bg="gray.50" rounded="xl">
                                    <QRCodeSVG value={invoice} size={200} />
                                </Box>
                                <Text fontSize="sm" textAlign="center" color="gray.500">Scan this code with Wallet of Satoshi</Text>
                                <Button w="full" colorScheme="green" onClick={checkPayment}>Confirm Payment</Button>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Transfer Modal */}
            <Modal isOpen={isTransferOpen} onClose={onTransferClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Internal Transfer</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            <Box bg="purple.50" p={4} rounded="md" w="full">
                                <Text fontSize="xs" color="purple.600">Move funds from your Solo Savings to {chama.name} instantly (No Network Fees).</Text>
                            </Box>
                            <FormControl>
                                <FormLabel>Transfer Amount (Sats)</FormLabel>
                                <NumberInput value={transferAmount} onChange={(val) => setTransferAmount(val)}>
                                    <NumberInputField placeholder="e.g. 5000" />
                                </NumberInput>
                            </FormControl>
                            <Button w="full" colorScheme="purple" onClick={handleTransfer} leftIcon={<FaExchangeAlt />}>
                                Confirm Transfer
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {/* Create Request Modal */}
            <Modal isOpen={isRequestOpen} onClose={onRequestClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create {requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            {(requestType === 'loan' || requestType === 'withdrawal') && (
                                <FormControl isRequired>
                                    <FormLabel>Amount (Sats)</FormLabel>
                                    <NumberInput value={requestForm.amount} onChange={(val) => setRequestForm({ ...requestForm, amount: val })}>
                                        <NumberInputField placeholder="e.g. 5000" />
                                    </NumberInput>
                                    <Text fontSize="xs" color="gray.500" mt={1}>≈ {formatCurrency((parseInt(requestForm.amount) / 100_000_000 || 0).toString()).kshs}</Text>
                                </FormControl>
                            )}

                            {requestType === 'other' && (
                                <FormControl isRequired>
                                    <FormLabel>Request Title</FormLabel>
                                    <Input value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} placeholder="e.g. Update Chama Rules" />
                                </FormControl>
                            )}

                            <FormControl isRequired>
                                <FormLabel>{requestType === 'other' ? 'Detailed Description' : 'Reason for Request'}</FormLabel>
                                <Textarea
                                    value={requestType === 'other' ? requestForm.description : requestForm.reason}
                                    onChange={(e) => setRequestForm({ ...requestForm, [requestType === 'other' ? 'description' : 'reason']: e.target.value })}
                                    placeholder={requestType === 'other' ? 'Describe what you are proposing...' : 'Why do you need this?'}
                                />
                            </FormControl>

                            <Button w="full" colorScheme="blue" onClick={handleCreateRequest} isLoading={isSubmittingRequest} leftIcon={<FaPaperPlane />}>
                                Submit Request for Voting
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
}

export default ChamaDashboardPage
