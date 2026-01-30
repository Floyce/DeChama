import React, { useState } from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    Card,
    CardBody,
    VStack,
    Button,
    Flex,
    Icon,
    Spinner,
    useToast,
    Divider,
    Badge,
    Image,
    Alert,
    AlertIcon
} from '@chakra-ui/react'
import { QRCodeSVG } from 'qrcode.react'
import { FaBitcoin, FaBolt, FaCheckCircle, FaDownload, FaShareAlt, FaArrowLeft, FaHandHoldingUsd } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { FormControl, FormLabel, Input, AlertTitle, AlertDescription } from '@chakra-ui/react'

const ContributionPage = () => {
    const { isConnected, connectWallet, formatCurrency } = useWallet()
    const navigate = useNavigate()
    const toast = useToast()

    // States: 'idle' -> 'mpesa' | 'invoice' -> 'paid'
    const [step, setStep] = useState<'idle' | 'mpesa' | 'invoice' | 'paid'>('idle')
    const [loading, setLoading] = useState(false)
    const [invoice, setInvoice] = useState<string | null>(null)
    const [receiptData, setReceiptData] = useState<any>(null)

    // M-Pesa Specific
    const [mpesaPhone, setMpesaPhone] = useState('')
    const [isMpesaSent, setIsMpesaSent] = useState(false)


    const generateInvoice = async () => {
        setLoading(true)
        // Mock API call to LNBits / Lightning Provider
        setTimeout(() => {
            const mockInvoice = 'lnbc100n1p3...' + Math.random().toString(36).substring(7)
            setInvoice(mockInvoice)
            setLoading(false)
            setStep('invoice')

            // Simulate Payment Listener
            simulatePayment()
        }, 1500)
    }

    const simulatePayment = () => {
        // In a real app, this would be a websocket or polling
        setTimeout(() => {
            setStep('paid')
            setReceiptData({
                id: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                date: new Date().toLocaleString(),
                amount: '0.005 BTC',
                method: 'Lightning Network',
                status: 'Confirmed'
            })
            toast({
                title: 'Payment Received!',
                description: 'Your contribution has been recorded on-chain.',
                status: 'success',
                duration: 5000,
                isClosable: true
            })
        }, 5000) // 5 seconds to pay
    }

    if (!isConnected) {
        return (
            <Container maxW="container.md" py={20} textAlign="center">
                <Icon as={FaBitcoin} w={16} h={16} color="purple.500" mb={6} />
                <Heading mb={4}>Connect Wallet</Heading>
                <Text mb={6} color="gray.600">You must connect your Lightning wallet (Leather, Xverse) to make a secure contribution.</Text>
                <Button colorScheme="purple" size="lg" onClick={connectWallet}>Connect Wallet</Button>
            </Container>
        )
    }

    return (
        <Box py={10}>
            <Container maxW="container.md">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>

                {step === 'idle' && (
                    <Box textAlign="center">
                        <Heading mb={2}>Make Contribution</Heading>
                        <Text color="gray.500" mb={8}>
                            Monthly Cycle: January 2026
                        </Text>
                        <Card variant="outline" borderColor="purple.500" borderWidth={2} shadow="md">
                            <CardBody py={10}>
                                <VStack spacing={6}>
                                    <Icon as={FaHandHoldingUsd} color="green.500" w={12} h={12} />
                                    <Box>
                                        <Heading size="lg">{formatCurrency('0.005').local}</Heading>
                                        <Text color="gray.500">≈ {formatCurrency('0.005').sats}</Text>
                                    </Box>
                                    <Divider />

                                    <VStack w="full" spacing={4}>
                                        <Button
                                            w="full"
                                            size="lg"
                                            height="70px"
                                            colorScheme="green"
                                            onClick={() => setStep('mpesa')}
                                            leftIcon={<Image src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" h="30px" mr={2} />}
                                        >
                                            <VStack align="start" spacing={0}>
                                                <Text>Pay with M-Pesa</Text>
                                                <Text fontSize="xs" fontWeight="normal" opacity={0.8}>Aza Finance Secure Gateway</Text>
                                            </VStack>
                                        </Button>

                                        <Button
                                            w="full"
                                            variant="outline"
                                            size="md"
                                            colorScheme="purple"
                                            leftIcon={<FaBitcoin />}
                                            onClick={generateInvoice}
                                            isLoading={loading}
                                            loadingText="Generating Invoice..."
                                        >
                                            Pay with Bitcoin (Lightning)
                                        </Button>

                                        <Button
                                            variant="link"
                                            colorScheme="blue"
                                            fontSize="sm"
                                            as={RouterLink}
                                            to="/learn"
                                            leftIcon={<Icon as={FaBitcoin} />}
                                        >
                                            What's Bitcoin? Learn here
                                        </Button>
                                    </VStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    </Box>
                )}

                {step === 'mpesa' && (
                    <Box>
                        <Heading size="md" mb={6} textAlign="center">M-Pesa Payment</Heading>
                        <Card variant="outline" p={6}>
                            <VStack spacing={6}>
                                <FormControl id="phone">
                                    <FormLabel>Confirmed Safaricom Number</FormLabel>
                                    <Input
                                        type="tel"
                                        placeholder="0712 345 678"
                                        value={mpesaPhone}
                                        onChange={(e) => setMpesaPhone(e.target.value)}
                                        size="lg"
                                        rounded="md"
                                    />
                                </FormControl>

                                {!isMpesaSent ? (
                                    <Button
                                        w="full"
                                        colorScheme="green"
                                        size="lg"
                                        onClick={() => {
                                            setIsMpesaSent(true)
                                            // Simulate backend polling/confirmation
                                            setTimeout(() => {
                                                setReceiptData({
                                                    id: 'MP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                                                    date: new Date().toLocaleString(),
                                                    amount: formatCurrency('0.005').local,
                                                    method: 'M-Pesa / Aza Finance',
                                                    status: 'Confirmed'
                                                })
                                                setStep('paid')
                                            }, 8000)
                                        }}
                                        isDisabled={!mpesaPhone}
                                    >
                                        Initiate Payment
                                    </Button>

                                ) : (
                                    <VStack w="full" spacing={6} align="stretch">
                                        <Alert status="info" rounded="md">
                                            <AlertIcon />
                                            <Box>
                                                <AlertTitle>Manual Transfer Required</AlertTitle>
                                                <AlertDescription fontSize="sm">
                                                    Send <b>{formatCurrency('0.005').local}</b> to Safaricom Number:
                                                </AlertDescription>
                                            </Box>
                                        </Alert>

                                        <Flex bg="gray.100" p={4} rounded="lg" justify="space-between" align="center">
                                            <Text fontSize="xl" fontWeight="bold">0743 456 789</Text>
                                            <Button size="sm" colorScheme="purple" onClick={() => { navigator.clipboard.writeText('0743 456 789'); toast({ title: 'Number Copied', status: 'success' }) }}>
                                                Copy
                                            </Button>
                                        </Flex>

                                        <Flex align="center" gap={3} justify="center" py={4}>
                                            <Spinner color="green.500" />
                                            <Text fontWeight="bold">Waiting for M-Pesa confirmation...</Text>
                                        </Flex>

                                        <Button variant="ghost" size="sm" onClick={() => setIsMpesaSent(false)}>Back</Button>
                                    </VStack>
                                )}
                            </VStack>
                        </Card>
                    </Box>
                )}


                {step === 'invoice' && invoice && (
                    <Box textAlign="center">
                        <Heading size="md" mb={6}>Scan to Pay</Heading>
                        <Card variant="outline">
                            <CardBody>
                                <VStack spacing={6}>
                                    <Box p={4} bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                        <QRCodeSVG value={invoice} size={256} />
                                    </Box>
                                    <Box w="full">
                                        <Text fontSize="xs" fontWeight="bold" mb={1} textAlign="left">Invoice String</Text>
                                        <Flex bg="gray.50" p={2} rounded="md" justify="space-between" align="center">
                                            <Text fontSize="xs" color="gray.500" isTruncated maxW="300px" fontFamily="mono">
                                                {invoice}
                                            </Text>
                                            <Button size="xs" onClick={() => { navigator.clipboard.writeText(invoice); toast({ title: 'Copied', status: 'info' }) }}>
                                                Copy
                                            </Button>
                                        </Flex>
                                    </Box>
                                    <Flex align="center" gap={2} color="purple.600">
                                        <Spinner size="sm" />
                                        <Text fontWeight="bold" fontSize="sm">Waiting for payment confirmation...</Text>
                                    </Flex>
                                </VStack>
                            </CardBody>
                        </Card>
                    </Box>
                )}

                {step === 'paid' && receiptData && (
                    <Box>
                        <Alert status="success" mb={6} rounded="md">
                            <AlertIcon />
                            Payment Confirmed! Your balance has been updated.
                        </Alert>

                        <Card variant="outline" borderColor="green.400" borderWidth="1px" bg="white" position="relative" overflow="hidden">
                            {/* Decorative Watermark */}
                            <Icon as={FaCheckCircle} position="absolute" right="-20px" top="-20px" w="150px" h="150px" color="green.50" zIndex={0} />

                            <CardBody position="relative" zIndex={1} p={8}>
                                <VStack spacing={6}>
                                    <Badge colorScheme="green" fontSize="md" px={3} py={1} rounded="full">Verified Receipt</Badge>

                                    <VStack spacing={0}>
                                        <Text fontSize="sm" color="gray.500">Amount Paid</Text>
                                        <Heading size="xl" color="green.600">{formatCurrency('0.005').full}</Heading>
                                    </VStack>

                                    <Divider borderStyle="dashed" />

                                    <VStack w="full" spacing={3}>
                                        <Flex w="full" justify="space-between">
                                            <Text color="gray.500">Transaction ID</Text>
                                            <Text fontWeight="mono" fontSize="sm">{receiptData.id}</Text>
                                        </Flex>
                                        <Flex w="full" justify="space-between">
                                            <Text color="gray.500">Date</Text>
                                            <Text fontWeight="medium">{receiptData.date}</Text>
                                        </Flex>
                                        <Flex w="full" justify="space-between">
                                            <Text color="gray.500">Payment Method</Text>
                                            <Flex align="center" gap={1}>
                                                <Icon as={FaBolt} color="yellow.500" />
                                                <Text fontWeight="medium">{receiptData.method}</Text>
                                            </Flex>
                                        </Flex>
                                        <Flex w="full" justify="space-between">
                                            <Text color="gray.500">Status</Text>
                                            <Flex align="center" gap={1} color="green.500">
                                                <Icon as={FaCheckCircle} />
                                                <Text fontWeight="bold">{receiptData.status}</Text>
                                            </Flex>
                                        </Flex>
                                    </VStack>

                                    <Divider />

                                    <Flex w="full" gap={4}>
                                        <Button flex="1" leftIcon={<FaDownload />} variant="outline">
                                            Save Image
                                        </Button>
                                        <Button flex="1" leftIcon={<FaShareAlt />} colorScheme="purple">
                                            Share Receipt
                                        </Button>
                                    </Flex>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Button mt={6} w="full" variant="ghost" onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    )
}

export default ContributionPage
