import React from 'react'
import { Box, Container, Heading, Text, Button, SimpleGrid, Icon, VStack } from '@chakra-ui/react'
import { FaBitcoin, FaHandshake, FaLock, FaUsers } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom'

const Feature = ({ icon, title, text }: { icon: any; title: string; text: string }) => {
    return (
        <VStack
            bg="white"
            p={6}
            rounded="xl"
            shadow="md"
            spacing={4}
            align="start"
            _hover={{ transform: 'translateY(-4px)', shadow: 'lg', transition: 'all 0.2s' }}
        >
            <Icon as={icon} w={10} h={10} color="primary.main" />
            <Heading size="md" color="gray.800">
                {title}
            </Heading>
            <Text color="gray.500">{text}</Text>
        </VStack>
    )
}

const LandingPage = () => {
    return (
        <Box>
            {/* Hero Section */}
            <Box
                bgGradient="linear(to-br, primary.main, primary.light)"
                color="white"
                py={20}
                textAlign="center"
            >
                <Container maxW="container.lg">
                    <VStack spacing={6}>
                        <Heading size="3xl" fontWeight="extrabold" letterSpacing="tight">
                            Reinvent Trust. <br /> Chamas, Decentralized.
                        </Heading>
                        <Text fontSize="xl" opacity={0.9} maxW="2xl">
                            Transparent, community-owned savings circles powered by Bitcoin.
                            Replace opaque records with on-chain certainty.
                        </Text>
                        <Flex gap={4} pt={4}>
                            <Button
                                as={RouterLink}
                                to="/dashboard"
                                size="lg"
                                color="primary.main"
                                bg="white"
                                _hover={{ bg: 'gray.100' }}
                            >
                                Get Started
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/learn"
                                size="lg"
                                variant="outline"
                                color="white"
                                _hover={{ bg: 'whiteAlpha.200' }}
                            >
                                Learn Bitcoin
                            </Button>
                        </Flex>
                    </VStack>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxW="container.xl" py={20}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    <Feature
                        icon={FaBitcoin}
                        title="On-Chain Contributions"
                        text="Save via Lightning. Get immutable digital receipts."
                    />
                    <Feature
                        icon={FaHandshake}
                        title="Automated Payouts"
                        text="Smart contracts enforce the rotation. No manual tracking."
                    />
                    <Feature
                        icon={FaUsers}
                        title="Member Governance"
                        text="Vote on loans and members. 51% consensus rules."
                    />
                    <Feature
                        icon={FaLock}
                        title="Total Transparency"
                        text="View every transaction on the blockchain explorer."
                    />
                </SimpleGrid>
            </Container>
        </Box>
    )
}

export default LandingPage
