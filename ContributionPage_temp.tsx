import React, { useState } from 'react'
import { Box, Container, Heading, Text, Card, CardBody, VStack, Button, Flex, Icon, Spinner, useToast } from '@chakra-ui/react'
import { QRCodeSVG } from 'qrcode.react'
import { FaBitcoin, FaBolt } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'

const ContributionPage = () => {
    const { isConnected, connectWallet } = useWallet()
    const [loading, setLoading] = useState(false)
    const [invoice, setInvoice] = useState<string | null>(null)
    const toast = useToast()

    const generateInvoice = async () => {
        setLoading(true)
        // Mock API call to LNBits
        setTimeout(() => {
            const mockInvoice = 'lnbc100n1p3...' // In real app, this would be a real bolt11
            setInvoice(mockInvoice)
            setLoading(false)
            toast({
                title: 'Invoice Generated',
                status: 'success',
                duration: 3000,
            })
        }, 1500)
    }

    if (!isConnected) {
        return (
            <Container maxW="container.md" py={20} textAlign="center">
                <Heading mb={4}>Connect Wallet</Heading>
                <Text mb={6}>You must connect your Lightning wallet to make a contribution.</Text>
                <Button colorScheme="purple" onClick={connectWallet}>Connect Wallet</Button>
            </Container>
        )
    }

    return (
        <Box py={10}>
            <Container maxW="container.md">
                <Heading mb={2}>Make Your Contribution</Heading>
                <Text color="gray.500" mb={8}>
                    Contributions are locked in the smart contract and earn you a digital receipt.
                </Text>

                <Card variant="outline" borderColor="primary.main" borderWidth={2}>
                    <CardBody>
                        <Flex align="center" gap={4} mb={6}>
                            <Icon as={FaBolt} color="yellow.400" w={8} h={8} />
                            <Box>
                                <Heading size="md">Bitcoin Lightning</Heading>
                                <Text fontSize="sm" color="gray.500">Fast, low-cost, instant settlement.</Text>
                            </Box>
                        </Flex>

                        {invoice ? (
                            <VStack spacing={6}>
                                <Box p={4} bg="white" rounded="xl" shadow="sm">
                                    <QRCodeSVG value={invoice} size={256} />
                                </Box>
                                <Text fontSize="xs" color="gray.400" maxW="full" isTruncated>
                                    {invoice}
                                </Text>
                                <Text color="green.500" fontWeight="bold">Waiting for payment...</Text>
                                <Button variant="ghost" size="sm" onClick={() => setInvoice(null)}>Cancel</Button>
                            </VStack>
                        ) : (
                            <Button
                                w="full"
                                size="lg"
                                colorScheme="purple"
                                isLoading={loading}
                                loadingText="Generating Invoice..."
                                onClick={generateInvoice}
                            >
                                Generate Invoice
                            </Button>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </Box>
    )
}

export default ContributionPage
