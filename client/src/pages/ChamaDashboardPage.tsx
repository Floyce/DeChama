import React, { useEffect, useState } from 'react'
import {
    Box, Container, Heading, Text, SimpleGrid, Card, CardBody, Icon, Button, VStack, Flex, Badge, HStack, Divider,
    Table, Thead, Tr, Th, Tbody, Td, useToast, List, ListItem, ListIcon, Progress, Stat, StatNumber, StatLabel, StatHelpText,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
    NumberInput, NumberInputField, FormControl, FormLabel, Spinner
} from '@chakra-ui/react'
import { FaArrowLeft, FaBitcoin, FaUserFriends, FaHistory, FaQrcode, FaPaperPlane, FaBolt, FaCheckCircle, FaExchangeAlt, FaClock } from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import QRCode from 'react-qr-code'

const ChamaDashboardPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const { user } = useAuth()
    const { formatCurrency, isConnected } = useWallet()
    const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure()
    const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [depositAmount, setDepositAmount] = useState('1000')
    const [invoice, setInvoice] = useState('')
    const [paymentHash, setPaymentHash] = useState('')
    const [transferAmount, setTransferAmount] = useState('')

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/chamas/${id}/dashboard`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (err) {
            toast({ title: 'Error loading dashboard', status: 'error' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    const generateInvoice = async () => {
        try {
            const res = await fetch('/api/contributions/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        try {
            const res = await fetch('/api/savings/transfer-to-chama', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id,
                    chama_id: id,
                    amount_sats: parseInt(transferAmount),
                    reason: `Internal transfer to ${data?.chama.name}`
                })
            })
            if (res.ok) {
                toast({ title: 'Transfer Successful', status: 'success' })
                onTransferClose()
                fetchData()
            }
        } catch (err) {
            toast({ title: 'Transfer failed', status: 'error' })
        }
    }

    if (loading) return <Flex justify="center" align="center" h="100vh"><Spinner color="purple.500" size="xl" /></Flex>
    if (!data) return <Box p={10} textAlign="center"><Text>Chama not found.</Text></Box>

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
                                    <QRCode value={invoice} size={200} />
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
        </Box>
    )
}

export default ChamaDashboardPage
