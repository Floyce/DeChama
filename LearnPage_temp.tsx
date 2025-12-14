import React from 'react'
import { Box, Container, Heading, SimpleGrid, Text, Button, Icon, VStack } from '@chakra-ui/react'
import { FaQuestion, FaKey, FaBolt, FaUsers } from 'react-icons/fa'

const modules = [
    {
        icon: FaQuestion,
        title: 'What is Bitcoin?',
        desc: 'Bitcoin is decentralized digital money that no one controls. It is secure, scarce, and open to everyone.',
    },
    {
        icon: FaKey,
        title: 'What is a Wallet?',
        desc: 'A wallet stores your private keys, which are like passwords that give you access to your Bitcoin.',
    },
    {
        icon: FaBolt,
        title: 'What is Lightning?',
        desc: 'The Lightning Network makes Bitcoin transactions fast and cheap, perfect for everyday payments.',
    },
    {
        icon: FaUsers,
        title: 'Why Bitcoin for Chamas?',
        desc: 'Bitcoin provides transparency and security, ensuring that group funds are safe and verifiable by all members.',
    },
]

const LearnPage = () => {
    return (
        <Box py={20}>
            <Container maxW="container.xl">
                <VStack spacing={8} mb={16} textAlign="center">
                    <Heading size="2xl" color="brand.800">
                        Start Your Bitcoin Journey
                    </Heading>
                    <Text fontSize="xl" color="gray.600" maxW="2xl">
                        Learn the basics of Bitcoin and why it is the perfect foundation for trustless savings circles.
                    </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    {modules.map((mod, index) => (
                        <Box
                            key={index}
                            bg="white"
                            p={8}
                            rounded="2xl"
                            shadow="md"
                            borderWidth="1px"
                            borderColor="gray.100"
                            _hover={{ shadow: 'xl' }}
                        >
                            <Flex mb={4} align="center">
                                <Box bg="primary.50" p={3} rounded="xl" color="primary.main" mr={4}>
                                    <Icon as={mod.icon} w={6} h={6} />
                                </Box>
                                <Heading size="md">{mod.title}</Heading>
                            </Flex>
                            <Text color="gray.600" mb={6}>
                                {mod.desc}
                            </Text>
                            <Button variant="outline" colorScheme="purple" size="sm">
                                Read More
                            </Button>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    )
}
// Helper for Flex
import { Flex } from '@chakra-ui/react'

export default LearnPage
