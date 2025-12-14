import React, { useState } from 'react'
import { Box, Container, Heading, Text, Card, CardBody, Badge, VStack, Button, Flex, Progress, Icon, useToast } from '@chakra-ui/react'
import { FaVoteYea, FaBullhorn, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'

const GovernancePage = () => {
    const { isConnected, connectWallet } = useWallet()
    const toast = useToast()

    // Mock Proposals
    const [proposals, setProposals] = useState([
        { id: 1, title: 'Approve Loan for Bob', type: 'Loan', amount: '0.1 BTC', votesFor: 6, votesAgainst: 1, totalMembers: 10, status: 'Active', deadline: '2 days' },
        { id: 2, title: 'Increase Payout Cycle', type: 'Rule Change', desc: 'Change from 30 days to 45 days', votesFor: 2, votesAgainst: 4, totalMembers: 10, status: 'Active', deadline: '5 days' },
        { id: 3, title: 'Add New Member: Charlie', type: 'Membership', desc: '0.01 BTC Collateral Paid', votesFor: 9, votesAgainst: 0, totalMembers: 10, status: 'Passed', deadline: 'Ended' },
    ])

    const handleVote = (id: number, vote: 'YES' | 'NO') => {
        if (!isConnected) {
            toast({ title: 'Connect Wallet', status: 'warning' })
            return
        }

        toast({
            title: 'Vote Submitted',
            description: `You voted ${vote} on Proposal #${id}`,
            status: 'success',
            duration: 3000,
        })

        // Optimistic update
        setProposals(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    votesFor: vote === 'YES' ? p.votesFor + 1 : p.votesFor,
                    votesAgainst: vote === 'NO' ? p.votesAgainst + 1 : p.votesAgainst
                }
            }
            return p
        }))
    }

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                <Flex justify="space-between" align="center" mb={10}>
                    <Box>
                        <Heading size="lg" mb={2}>Governance</Heading>
                        <Text color="gray.500">Vote on loans, rule changes, and new members.</Text>
                    </Box>
                    <Button leftIcon={<FaBullhorn />} colorScheme="purple" variant="outline">Create Proposal</Button>
                </Flex>

                <VStack spacing={6} align="stretch">
                    {proposals.map((prop) => (
                        <Card key={prop.id} variant={prop.status === 'Active' ? 'elevated' : 'outline'} opacity={prop.status === 'Passed' ? 0.8 : 1}>
                            <CardBody>
                                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={6}>
                                    <Box flex="1">
                                        <Flex align="center" gap={3} mb={2}>
                                            <Badge colorScheme={prop.type === 'Loan' ? 'blue' : prop.type === 'Membership' ? 'green' : 'purple'}>{prop.type}</Badge>
                                            <Badge colorScheme={prop.status === 'Active' ? 'green' : 'gray'}>{prop.status}</Badge>
                                            <Text fontSize="xs" color="gray.500">Expires in {prop.deadline}</Text>
                                        </Flex>
                                        <Heading size="md" mb={2}>{prop.title}</Heading>
                                        <Text color="gray.600" mb={4}>
                                            {prop.amount ? `Amount: ${prop.amount}` : prop.desc}
                                        </Text>

                                        {/* Progress Bar */}
                                        <Box mt={4}>
                                            <Flex justify="space-between" fontSize="xs" mb={1}>
                                                <Text color="green.500">Yes: {prop.votesFor}</Text>
                                                <Text color="red.500">No: {prop.votesAgainst}</Text>
                                            </Flex>
                                            <Progress value={(prop.votesFor / prop.totalMembers) * 100} colorScheme="green" size="sm" rounded="full" bg="red.100" />
                                            <Text fontSize="xs" color="gray.400" mt={1}>{prop.votesFor + prop.votesAgainst} / {prop.totalMembers} voted</Text>
                                        </Box>
                                    </Box>

                                    {prop.status === 'Active' && (
                                        <Flex direction={{ base: 'row', md: 'column' }} gap={3} justify="center">
                                            <Button leftIcon={<FaCheckCircle />} colorScheme="green" variant="solid" onClick={() => handleVote(prop.id, 'YES')}>
                                                Approve
                                            </Button>
                                            <Button leftIcon={<FaTimesCircle />} colorScheme="red" variant="outline" onClick={() => handleVote(prop.id, 'NO')}>
                                                Reject
                                            </Button>
                                        </Flex>
                                    )}
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            </Container>
        </Box>
    )
}

export default GovernancePage
