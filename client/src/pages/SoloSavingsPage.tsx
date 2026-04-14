import React, { useState } from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Button,
    Flex,
    Icon,
    Divider,
    Stat,
    StatNumber,
    StatLabel,
    StatHelpText,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Badge,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Textarea,
    FormControl,
    FormLabel,
    Input,
    SimpleGrid
} from '@chakra-ui/react'
import { FaBitcoin, FaArrowLeft, FaArrowDown, FaArrowUp, FaHistory, FaQrcode, FaPaperPlane, FaBolt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'

const SoloSavingsPage = () => {
    const navigate = useNavigate()
    const { balance, isConnected, formatCurrency } = useWallet()
    const { user } = useAuth()
    const toast = useToast()

    const [transactions] = useState([
        { id: 1, type: 'received', amount: '0.00005 BTC', date: 'Today, 10:30 AM', status: 'Confirmed' },
        { id: 2, type: 'sent', amount: '0.00002 BTC', date: 'Yesterday, 4:15 PM', status: 'Confirmed' },
        { id: 3, type: 'received', amount: '0.00010 BTC', date: 'Jan 24, 2026', status: 'Confirmed' },
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalAction, setModalAction] = useState<'Send' | 'Receive'>('Receive')
    const [btcAmount, setBtcAmount] = useState('')
    const [invoiceString, setInvoiceString] = useState('')
    const [generatedInvoice, setGeneratedInvoice] = useState('')
    const [processing, setProcessing] = useState(false)
    const [reason, setReason] = useState('') // Fix 9: Required reason

    const handleAction = (action: 'Send' | 'Receive') => {
        if (!user) {
            toast({ title: 'Please Log In', description: 'You need an account to use the wallet.', status: 'warning' })
            navigate('/auth')
            return
        }
        if (!isConnected) {
            toast({ title: 'Connect Wallet', status: 'warning' })
            return
        }
        setModalAction(action)
        setBtcAmount('')
        setInvoiceString('')
        setGeneratedInvoice('')
        setIsModalOpen(true)
    }

    const handleProcess = async () => {
        if (modalAction === 'Send' && (!invoiceString || !reason)) {
            toast({ title: 'Reason & Invoice required', status: 'error' })
            return
        }
        
        setProcessing(true)
        try {
            if (modalAction === 'Receive') {
                // Fix 8: Real Invoice Generation
                const res = await fetch('/api/contributions/create-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user?.id || 'guest',
                        chama_id: 'SOLO', // Handled as solo savings on backend
                        amount_sats: parseInt(btcAmount) || 1000,
                        memo: `Solo Savings`
                    })
                })
                
                if (res.ok) {
                    const data = await res.json()
                    setGeneratedInvoice(data.payment_request)
                    toast({ title: 'Invoice Generated', status: 'success' })
                } else {
                    const err = await res.json()
                    toast({ title: 'Backend Error', description: err.detail, status: 'error' })
                }
            } else {
                // Fix 10: Real Lightning Payment (Send)
                const res = await fetch('/api/payments/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        bolt11: invoiceString,
                        reason: reason 
                    })
                })
                if (res.ok) {
                    toast({ title: 'Payment Sent', description: 'Transaction confirmed via LNbits.', status: 'success' })
                    setIsModalOpen(false)
                } else {
                    const err = await res.json()
                    toast({ title: 'Payment Failed', description: err.detail, status: 'error' })
                }
            }
        } catch (err) {
            toast({ title: 'Error', status: 'error' })
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Box py={10}>
            <Container maxW="container.md">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>

                <VStack spacing={6} align="stretch">
                    <Heading size="lg">Solo Savings Wallet</Heading>
                    <Text color="gray.500">Your personal Bitcoin Lightning wallet. No group rules, just you.</Text>

                    {/* Balance Card - Coming Soon State */}
                    <Card bgGradient="linear(to-br, gray.400, gray.600)" color="white" opacity={0.8}>
                        <CardBody py={12} textAlign="center">
                            <VStack spacing={4}>
                                <Icon as={FaBolt} w={12} h={12} />
                                <Heading size="lg">Coming Soon!</Heading>
                                <Text opacity={0.9} maxW="400px">
                                    Solo Savings is currently undergoing maintenance to bring you a better experience. 
                                    Join an active Chama in the meantime!
                                </Text>
                                <Button 
                                    as={RouterLink} 
                                    to="/dashboard" 
                                    bg="white" 
                                    color="gray.700"
                                    size="md"
                                    rounded="full"
                                    mt={4}
                                >
                                    Back to Dashboard
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Quick Stats */}
                    <SimpleGrid columns={2} spacing={4}>
                        <Card variant="outline">
                            <CardBody>
                                <Stat>
                                    <StatLabel color="gray.500">Total Saved</StatLabel>
                                    <StatNumber color="green.500">0.12 BTC</StatNumber>
                                    <StatHelpText>All time</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card variant="outline">
                            <CardBody>
                                <Stat>
                                    <StatLabel color="gray.500">Total Spent</StatLabel>
                                    <StatNumber color="red.500">0.075 BTC</StatNumber>
                                    <StatHelpText>All time</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Transactions */}
                    <Card variant="outline">
                        <CardBody>
                            <Flex align="center" gap={2} mb={6}>
                                <Icon as={FaHistory} color="gray.400" />
                                <Heading size="md">Transaction History</Heading>
                            </Flex>

                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Type</Th>
                                        <Th>Date</Th>
                                        <Th isNumeric>Amount</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {transactions.map((tx) => (
                                        <Tr key={tx.id}>
                                            <Td>
                                                <Flex align="center" gap={2}>
                                                    <Icon
                                                        as={tx.type === 'received' ? FaArrowDown : FaArrowUp}
                                                        color={tx.type === 'received' ? 'green.500' : 'orange.500'}
                                                    />
                                                    <Text textTransform="capitalize" fontWeight="medium">{tx.type}</Text>
                                                </Flex>
                                            </Td>
                                            <Td color="gray.500">{tx.date}</Td>
                                            <Td isNumeric fontWeight="bold" color={tx.type === 'received' ? 'green.600' : 'gray.800'}>
                                                {formatCurrency(tx.amount).full}
                                            </Td>
                                            <Td>
                                                <Badge colorScheme="green" variant="subtle" rounded="full">{tx.status}</Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </CardBody>
                    </Card>

                </VStack>

                {/* Lightning Action Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{modalAction} Bitcoin (Lightning)</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {modalAction === 'Receive' ? (
                                <VStack spacing={4}>
                                    {!generatedInvoice ? (
                                        <>
                                            <FormControl>
                                                <FormLabel>Amount to Receive (Sats)</FormLabel>
                                                <Input placeholder="e.g. 10000" type="number" value={btcAmount} onChange={(e) => setBtcAmount(e.target.value)} />
                                            </FormControl>
                                            <Button w="full" colorScheme="orange" onClick={handleProcess} isLoading={processing}>
                                                Generate Invoice
                                            </Button>
                                        </>
                                    ) : (
                                        <VStack spacing={4} w="full" textAlign="center">
                                            <Box p={4} bg="white" border="1px" borderColor="gray.200" rounded="lg">
                                                <Icon as={FaQrcode} w={32} h={32} />
                                            </Box>
                                            <Text fontSize="xs" bg="gray.100" p={2} rounded="md" w="full" wordBreak="break-all" fontFamily="mono">
                                                {generatedInvoice}
                                            </Text>
                                            <Text fontSize="sm" color="green.500" fontWeight="bold">Check your wallet to pay this invoice.</Text>
                                        </VStack>
                                    )}
                                </VStack>
                            ) : (
                                <VStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Lightning Invoice</FormLabel>
                                        <Textarea placeholder="lnbc..." value={invoiceString} onChange={(e) => setInvoiceString(e.target.value)} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Reason for Sending (Fix 9)</FormLabel>
                                        <Input placeholder="Rent, Coffee, etc." value={reason} onChange={(e) => setReason(e.target.value)} />
                                    </FormControl>
                                    <Button w="full" colorScheme="orange" onClick={handleProcess} isLoading={processing} leftIcon={<FaBolt />}>
                                        Pay Invoice (Fix 10)
                                    </Button>
                                </VStack>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Container>
        </Box>
    )
}

export default SoloSavingsPage
