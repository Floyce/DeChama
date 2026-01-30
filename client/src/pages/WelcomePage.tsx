import React from 'react'
import { Box, Container, Heading, Text, Button, VStack, Icon, Card, CardBody } from '@chakra-ui/react'
import { FaUsers, FaPlus, FaPiggyBank } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const WelcomePage = () => {
    const navigate = useNavigate()

    return (
        <Box py={20} minH="calc(100vh - 80px)">
            <Container maxW="container.md">
                <VStack spacing={8}>
                    <Box textAlign="center">
                        <Heading size="2xl" mb={4}>Start Your Journey</Heading>
                        <Text fontSize="lg" color="gray.600">
                            Choose how you'd like to begin saving with Bitcoin
                        </Text>
                    </Box>

                    <VStack spacing={4} w="full">
                        <Card
                            w="full"
                            variant="outline"
                            borderColor="brand.200"
                            borderWidth="2px"
                            _hover={{ borderColor: 'brand.500', shadow: 'lg', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => navigate('/browse-chamas')}
                        >
                            <CardBody py={8}>
                                <VStack spacing={4}>
                                    <Icon as={FaUsers} w={12} h={12} color="brand.500" />
                                    <Heading size="md">Join Existing Chama</Heading>
                                    <Text textAlign="center" color="gray.600">
                                        Browse and request to join active savings circles
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card
                            w="full"
                            variant="outline"
                            borderColor="brand.200"
                            borderWidth="2px"
                            _hover={{ borderColor: 'brand.500', shadow: 'lg', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => navigate('/create-chama')}
                        >
                            <CardBody py={8}>
                                <VStack spacing={4}>
                                    <Icon as={FaPlus} w={12} h={12} color="brand.500" />
                                    <Heading size="md">Create New Chama</Heading>
                                    <Text textAlign="center" color="gray.600">
                                        Start your own savings circle and invite members
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card
                            w="full"
                            variant="outline"
                            borderColor="gray.200"
                            borderWidth="2px"
                            _hover={{ borderColor: 'brand.500', shadow: 'lg', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => navigate('/solo-savings')}
                        >
                            <CardBody py={8}>
                                <VStack spacing={4}>
                                    <Icon as={FaPiggyBank} w={12} h={12} color="gray.500" />
                                    <Heading size="md">Solo Savings</Heading>
                                    <Text textAlign="center" color="gray.600">
                                        Save individually with Bitcoin
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    </VStack>
                </VStack>
            </Container>
        </Box>
    )
}

export default WelcomePage
