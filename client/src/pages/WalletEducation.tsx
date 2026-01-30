import React from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Card,
    CardBody,
    VStack,
    Button,
    Icon,
    Flex,
    Badge,
    Link,
    Divider,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react'
import { FaMobileAlt, FaBolt, FaCheckCircle, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const WalletEducation = () => {
    const navigate = useNavigate()

    const wallets = [
        {
            name: 'Muun Wallet',
            type: 'Best for Beginners',
            desc: 'Extreme simplicity. Single balance for Bitcoin and Lightning. Great for Kenya.',
            logo: 'FaBolt',
            url: 'https://muun.com/'
        },
        {
            name: 'Wallet of Satoshi',
            type: 'Easiest Lighting',
            desc: 'Zero-config Lightning wallet. Just install and start receiving payments immediately.',
            logo: 'FaCheckCircle',
            url: 'https://www.walletofsatoshi.com/'
        },
        {
            name: 'Phoenix',
            type: 'Best for Sovereignty',
            desc: 'A real Lightning node on your phone. Native, non-custodial, and very powerful.',
            logo: 'FaMobileAlt',
            url: 'https://phoenix.acinq.co/'
        }
    ]

    return (
        <Box py={10}>
            <Container maxW="container.lg">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate(-1)}>
                    Back
                </Button>

                <VStack spacing={4} align="start" mb={12}>
                    <Heading size="2xl">Get a Bitcoin Wallet</Heading>
                    <Text fontSize="xl" color="gray.600">
                        To participate in ImpactChain and save in hard money, you need a mobile Lightning wallet.
                    </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={16}>
                    {wallets.map((w, idx) => (
                        <Card key={idx} variant="outline" borderColor="purple.200" _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }} transition="all 0.2s">
                            <CardBody>
                                <VStack align="start" spacing={4}>
                                    <Badge colorScheme="purple">{w.type}</Badge>
                                    <Heading size="md">{w.name}</Heading>
                                    <Text color="gray.500" fontSize="sm">{w.desc}</Text>
                                    <Button
                                        as={Link}
                                        href={w.url}
                                        isExternal
                                        w="full"
                                        colorScheme="purple"
                                        variant="solid"
                                        rightIcon={<FaExternalLinkAlt />}
                                    >
                                        Download
                                    </Button>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                <Box bg="purple.50" p={8} rounded="xl">
                    <Heading size="lg" mb={6} color="purple.700">Simple Setup Guide</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                        <VStack align="start" spacing={6}>
                            <Box>
                                <Heading size="sm" mb={2}>1. Download & Install</Heading>
                                <Text color="gray.600">Choose one of the wallets above from the App Store or Play Store.</Text>
                            </Box>
                            <Box>
                                <Heading size="sm" mb={2}>2. Secure Your Words</Heading>
                                <Text color="gray.600">Your wallet will give you 12-24 "backup words". Write them down on paper. Never share them with anyone.</Text>
                            </Box>
                            <Box>
                                <Heading size="sm" mb={2}>3. Receive Bitcoin/Sats</Heading>
                                <Text color="gray.600">Tap "Receive" in your wallet to see your QR code. Use this to transfer funds from M-Pesa or other users.</Text>
                            </Box>
                        </VStack>

                        <VStack align="start" spacing={6}>
                            <Box>
                                <Heading size="sm" mb={2}>Why Bitcoin for Chamas?</Heading>
                                <List spacing={3} color="gray.600">
                                    <ListItem>
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        Impossible to inflate: Only 21 million will ever exist.
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        Global: Send money to anyone with an internet connection.
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        Unstoppable: No bank can block your group's funds.
                                    </ListItem>
                                </List>
                            </Box>
                        </VStack>
                    </SimpleGrid>
                </Box>
            </Container>
        </Box>
    )
}

export default WalletEducation
