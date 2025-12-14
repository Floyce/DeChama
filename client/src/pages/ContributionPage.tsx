import React, { useState, useEffect } from 'react'
import { Box, Container, Heading, Text, Card, CardBody, SimpleGrid, Icon, VStack, Button, Input, InputGroup, InputRightAddon, Divider, useToast, Flex, Textarea, Code, HStack, IconButton } from '@chakra-ui/react'
import { FaBitcoin, FaMobileAlt, FaQrcode, FaCheckCircle, FaArrowLeft, FaCopy } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { QRCodeCanvas } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'

const ContributionPage = () => {
    const { isConnected } = useWallet()
    const navigate = useNavigate()
    const [amount, setAmount] = useState('')
    const [fiatAmount, setFiatAmount] = useState('0')
    const [message, setMessage] = useState('')
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
    const toast = useToast()

    // Mock Exchange Rate: 1 BTC = 9,500,000 KES (approx)
    const EXCHANGE_RATE = 9500000

    useEffect(() => {
        if (amount && !isNaN(parseFloat(amount))) {
            const val = parseFloat(amount) * EXCHANGE_RATE
            setFiatAmount(val.toLocaleString(undefined, { maximumFractionDigits: 0 }))
        } else {
            setFiatAmount('0')
        }
    }, [amount])

    const handleContribute = () => {
        if (!selectedMethod) {
            toast({ title: 'Select a payment method', status: 'error' })
            return
        }
        if (!amount) {
            toast({ title: 'Enter an amount', status: 'error' })
            return
        }

        // Mock successful contribution
        toast({
            title: 'Contribution Recorded',
            description: `Processing ${amount} BTC via ${selectedMethod}. Waiting for confirmation...`,
            status: 'info',
            duration: 5000,
            isClosable: true,
        })

        // redirect to dashboard after delay
        setTimeout(() => navigate('/dashboard'), 2000)
    }

    const copyInvoice = () => {
        navigator.clipboard.writeText('lnbc10n1p3j8y7spp...')
        toast({ title: 'Invoice Copied!', status: 'success', duration: 1500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PaymentMethod = ({ id, icon, title, desc }: any) => (
        <Card
            variant="outline"
            cursor="pointer"
            borderColor={selectedMethod === id ? 'purple.500' : 'gray.200'}
            bg={selectedMethod === id ? 'purple.50' : 'white'}
            onClick={() => setSelectedMethod(id)}
            _hover={{ borderColor: 'purple.400', transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
        >
            <CardBody>
                <Flex align="center" justify="space-between" mb={3}>
                    <Icon as={icon} w={8} h={8} color={selectedMethod === id ? 'purple.500' : 'gray.400'} />
                    {selectedMethod === id && <Icon as={FaCheckCircle} color="purple.500" />}
                </Flex>
                <Heading size="sm" mb={1} color="gray.700">{title}</Heading>
                <Text fontSize="xs" color="gray.500">{desc}</Text>
            </CardBody>
        </Card>
    )

    return (
        <Box py={10}>
            <Container maxW="container.md">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate(-1)}>
                    Back
                </Button>

                <VStack spacing={8} align="stretch">
                    <Box textAlign="center">
                        <Heading size="lg" mb={2} color="brand.800">Make a Contribution</Heading>
                        <Text color="gray.500">Secure your future. Verify on-chain.</Text>
                    </Box>

                    {/* Amount Input */}
                    <Card variant="outline" borderColor="gray.200" shadow="sm">
                        <CardBody>
                            <Text mb={2} fontWeight="bold" color="gray.600">Amount to Contribute</Text>
                            <InputGroup size="lg" mb={2}>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                                />
                                <InputRightAddon bg="gray.100" color="gray.600">BTC</InputRightAddon>
                            </InputGroup>
                            <Text fontSize="sm" color="gray.500" textAlign="right">
                                ≈ KES {fiatAmount}
                            </Text>

                            <Divider my={4} />

                            <Text mb={2} fontWeight="bold" color="gray.600">Message (Optional)</Text>
                            <Textarea
                                placeholder="E.g. Monthly contribution for June"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                borderColor="gray.300"
                                _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                            />
                        </CardBody>
                    </Card>

                    {/* Payment Methods */}
                    <Box>
                        <Text mb={4} fontWeight="bold" color="gray.600">Select Payment Method</Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <PaymentMethod id="lightning" icon={FaBitcoin} title="Lightning" desc="Instant & Low Fees" />
                            <PaymentMethod id="mpesa" icon={FaMobileAlt} title="M-Pesa" desc="Auto-convert to BTC" />
                            <PaymentMethod id="ussd" icon={FaMobileAlt} title="USSD" desc="*544# Offline" />
                        </SimpleGrid>
                    </Box>

                    {/* QR Code / Action Area */}
                    {selectedMethod === 'lightning' && (
                        <Card variant="outline" bg="white" borderColor="purple.500" shadow="md">
                            <CardBody>
                                <VStack spacing={4}>
                                    <Heading size="md" color="gray.700">Scan to Pay</Heading>
                                    <Text color="gray.500" fontSize="sm">Use a Lightning wallet like Phoenix or Blink</Text>

                                    <Box p={4} bg="white" border="1px solid" borderColor="gray.200" rounded="lg">
                                        <QRCodeCanvas value={`lightning:testinvoice?amount=${amount}`} size={200} />
                                    </Box>

                                    <Box w="full" bg="gray.50" p={3} rounded="md" border="1px dashed" borderColor="gray.300">
                                        <Flex justify="space-between" align="center">
                                            <Code flex="1" bg="transparent" fontSize="xs" mr={2} isTruncated>
                                                lnbc10n1p3j8y7spp...5d9...
                                            </Code>
                                            <IconButton
                                                aria-label="Copy invoice"
                                                icon={<FaCopy />}
                                                size="sm"
                                                onClick={copyInvoice}
                                            />
                                        </Flex>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    <Button size="lg" colorScheme="purple" onClick={handleContribute} isDisabled={!amount || !selectedMethod} shadow="lg">
                        Confirm Contribution
                    </Button>

                </VStack>
            </Container>
        </Box>
    )
}

export default ContributionPage
