import React from 'react'
import { Box, Container, Heading, Text, SimpleGrid, Card, CardBody, Icon, VStack, Button, Flex } from '@chakra-ui/react'
import { FaPlus, FaSearch, FaArrowRight, FaUserPlus } from 'react-icons/fa'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const WelcomePage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    return (
        <Box py={20} minH="80vh">
            <Container maxW="container.lg">
                <VStack spacing={6} mb={16} textAlign="center">
                    <Heading size="2xl" color="brand.800">
                        Welcome, {user?.displayName || 'Friend'}!
                    </Heading>
                    <Text fontSize="xl" color="gray.600" maxW="2xl">
                        You're all set. Now, how would you like to start your savings journey?
                    </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="4xl" mx="auto">
                    {/* Join Existing */}
                    <Card
                        as={RouterLink}
                        to="/browse-chamas"
                        variant="outline"
                        h="320px"
                        p={8}
                        borderColor="gray.200"
                        bg="white"
                        transition="all 0.3s"
                        _hover={{
                            borderColor: 'blue.400',
                            shadow: 'xl',
                            transform: 'translateY(-8px)',
                            bg: 'blue.50',
                            textDecoration: 'none'
                        }}
                        rounded="2xl"
                        position="relative"
                        overflow="hidden"
                        role="group"
                    >
                        <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="full">
                            <Box
                                bg="blue.100"
                                p={5}
                                rounded="full"
                                color="blue.500"
                                mb={6}
                                transition="all 0.3s"
                                _groupHover={{ bg: 'blue.500', color: 'white', transform: 'scale(1.1)' }}
                            >
                                <Icon as={FaSearch} w={8} h={8} />
                            </Box>
                            <Heading size="lg" mb={3} color="gray.700" _groupHover={{ color: 'blue.600' }}>
                                Find a Community
                            </Heading>
                            <Text color="gray.500" fontSize="md" maxW="xs" textAlign="center">
                                Browse established Chamas. Request access and join trusted circles.
                            </Text>

                            {/* Hover Arrow */}
                            <Icon
                                as={FaArrowRight}
                                position="absolute"
                                bottom={8}
                                right={8}
                                w={6} h={6}
                                color="blue.400"
                                opacity={0}
                                transform="translateX(-10px)"
                                _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
                                transition="all 0.3s"
                            />
                        </CardBody>
                    </Card>

                    {/* Create New */}
                    <Card
                        as={RouterLink}
                        to="/create-chama"
                        variant="outline"
                        h="320px"
                        p={8}
                        borderColor="gray.200"
                        bg="white"
                        transition="all 0.3s"
                        _hover={{
                            borderColor: 'purple.400',
                            shadow: 'xl',
                            transform: 'translateY(-8px)',
                            bg: 'purple.50',
                            textDecoration: 'none'
                        }}
                        rounded="2xl"
                        position="relative"
                        overflow="hidden"
                        role="group"
                    >
                        <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="full">
                            <Box
                                bg="purple.100"
                                p={5}
                                rounded="full"
                                color="purple.500"
                                mb={6}
                                transition="all 0.3s"
                                _groupHover={{ bg: 'purple.500', color: 'white', transform: 'scale(1.1)' }}
                            >
                                <Icon as={FaPlus} w={8} h={8} />
                            </Box>
                            <Heading size="lg" mb={3} color="gray.700" _groupHover={{ color: 'purple.600' }}>
                                Start a New Chama
                            </Heading>
                            <Text color="gray.500" fontSize="md" maxW="xs" textAlign="center">
                                Create your own circle. Set the rules, invite friends, and lead.
                            </Text>

                            {/* Hover Arrow */}
                            <Icon
                                as={FaArrowRight}
                                position="absolute"
                                bottom={8}
                                right={8}
                                w={6} h={6}
                                color="purple.400"
                                opacity={0}
                                transform="translateX(-10px)"
                                _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
                                transition="all 0.3s"
                            />
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <Box mt={16} textAlign="center">
                    <Text color="gray.400" fontSize="sm">
                        Not ready? <span style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/dashboard')}>Go to Dashboard</span> to explore later.
                    </Text>
                </Box>
            </Container>
        </Box>
    )
}

export default WelcomePage
