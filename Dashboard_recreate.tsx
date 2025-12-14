import React from 'react'
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, Card, CardBody, Badge, VStack, Icon, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'
import { FaWallet, FaHandHoldingUsd, FaFileContract, FaHistory, FaPlus, FaVoteYea } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import { Link as RouterLink } from 'react-router-dom'

const Dashboard = () => {
    const { address } = useWallet()

    // Mock Data
    const metrics = [
        { label: 'Total Chama Pot', value: '1.45 BTC', help: '≈ $98,000' },
        { label: 'My Share', value: '0.145 BTC', help: '10% Ownership' },
    ]

    const activities = [
        { title: 'Contribution Received', date: '2 hrs ago', desc: 'Alice contributed 0.01 BTC via Lightning' },
        { title: 'Proposal Approved', date: '1 day ago', desc: 'Loan for Bob (0.1 BTC) approved by 6 members' },
        { title: 'New Member', date: '3 days ago', desc: 'Charlie joined the Chama' },
    ]

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={10}>
                    <Box>
                        <Heading size="lg" mb={2}>Welcome back, {address ? (address.slice(0, 5) + '...') : 'Guest'}</Heading>
                        <Text color="gray.500">Here is what is happening in your Chama.</Text>
                    </Box>
                    <Button leftIcon={<FaPlus />} colorScheme="purple" as={RouterLink} to="/contribution">Make Contribution</Button>
                </Flex>

                {/* Metrics */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
                    {metrics.map((m, i) => (
                        <Card key={i}>
                            <CardBody>
                                <Stat>
                                    <StatLabel color="gray.500">{m.label}</StatLabel>
                                    <StatNumber fontSize="2xl" color="primary.main">{m.value}</StatNumber>
                                    <StatHelpText>{m.help}</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    ))}
                    <Card bgGradient="linear(to-br, primary.main, primary.dark)" color="white">
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="bold">Next Payout</Text>
                                <Text fontSize="2xl" fontWeight="extrabold">12 Days</Text>
                                <Flex align="center" gap={2}>
                                    <Icon as={FaHandHoldingUsd} />
                                    <Text fontSize="xs">Beneficiary: You</Text>
                                </Flex>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <Flex justify="space-between" align="center" h="100%">
                                <Box>
                                    <Text color="gray.500" fontSize="sm">Active Proposals</Text>
                                    <Heading size="md">2 Pending</Heading>
                                </Box>
                                <Button size="sm" variant="outline" colorScheme="purple">Vote</Button>
                            </Flex>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
                    {/* Main Content */}
                    <GridItem>
                        <Card mb={8}>
                            <CardBody>
                                <Heading size="md" mb={6}>Payout Timeline</Heading>
                                {/* Visual Timeline Mock */}
                                <Flex justify="space-between" position="relative" mb={4}>
                                    {/* Line */}
                                    <Box position="absolute" top="50%" left="0" right="0" h="2px" bg="gray.200" zIndex={0} transform="translateY(-50%)" />

                                    {[1, 2, 3, 4, 5].map((step) => (
                                        <Box key={step} position="relative" zIndex={1} bg={step === 3 ? 'primary.main' : 'gray.100'} color={step === 3 ? 'white' : 'gray.500'} w={10} h={10} rounded="full" display="flex" alignItems="center" justifyContent="center" fontWeight="bold">
                                            {step}
                                        </Box>
                                    ))}
                                </Flex>
                                <Flex justify="space-between" fontSize="sm" color="gray.500">
                                    <Text>Jan</Text>
                                    <Text>Feb</Text>
                                    <Text fontWeight="bold" color="primary.main">Now</Text>
                                    <Text>Apr</Text>
                                    <Text>May</Text>
                                </Flex>
                            </CardBody>
                        </Card>

                        <Heading size="md" mb={4}>Recent Activity</Heading>
                        <VStack spacing={4} align="stretch">
                            {activities.map((act, i) => (
                                <Card key={i} variant="outline">
                                    <CardBody py={3}>
                                        <Flex justify="space-between">
                                            <Box>
                                                <Text fontWeight="bold">{act.title}</Text>
                                                <Text fontSize="sm" color="gray.500">{act.desc}</Text>
                                            </Box>
                                            <Text fontSize="xs" color="gray.400">{act.date}</Text>
                                        </Flex>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    </GridItem>

                    {/* Sidebar / Quick Actions */}
                    <GridItem>
                        <Heading size="md" mb={4}>Quick Actions</Heading>
                        <VStack spacing={4}>
                            <Button w="full" leftIcon={<FaPlus />} variant="solid" height="3.5rem" as={RouterLink} to="/contribution">Make Contribution</Button>
                            <Button w="full" leftIcon={<FaFileContract />} variant="outline" height="3.5rem">Create Proposal</Button>
                            <Button w="full" leftIcon={<FaUsers />} variant="ghost" height="3.5rem">View Members</Button>
                        </VStack>
                    </GridItem>
                </Grid>

            </Container>
        </Box>
    )
}

export default Dashboard
