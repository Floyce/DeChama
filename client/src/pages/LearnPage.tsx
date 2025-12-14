import React, { useState } from 'react'
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    Button,
    Icon,
    VStack,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    useDisclosure
} from '@chakra-ui/react'
import { FaQuestion, FaKey, FaBolt, FaUsers, FaArrowLeft, FaBookOpen } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const modules = [
    {
        icon: FaQuestion,
        title: 'What is Bitcoin?',
        desc: 'Bitcoin is decentralized digital money that no one controls. It is secure, scarce, and open to everyone.',
        content: `
            Bitcoin is the first decentralized digital currency. It works without a central bank or single administrator. 
            
            Key Concepts:
            • Decentralization: No one owns or controls Bitcoin.
            • Scarcity: There will only ever be 21 million Bitcoins.
            • Security: It uses cryptography to secure transactions.
            
            Why it matters for Chamas:
            It allows your group to hold money that cannot be devalued by inflation or seized by bad actors.
        `
    },
    {
        icon: FaKey,
        title: 'What is a Wallet?',
        desc: 'A wallet stores your private keys, which are like passwords that give you access to your Bitcoin.',
        content: `
            A Bitcoin wallet doesn't store money like a physical wallet. Instead, it stores the "Keys" (Secret Codes) that allow you to move your money on the blockchain.
            
            Types of Wallets:
            • Hot Wallets (Mobile/Desktop): Convenient for daily spending (like M-Pesa).
            • Cold Wallets (Hardware): Best for long-term savings (like a Vault).
            
            Important: If you lose your keys, you lose your Bitcoin. Always backup your seed phrase!
        `
    },
    {
        icon: FaBolt,
        title: 'What is Lightning?',
        desc: 'The Lightning Network makes Bitcoin transactions fast and cheap, perfect for everyday payments.',
        content: `
            The Bitcoin main chain is like a bank settlement layer - very secure but sometimes slow/expensive.
            
            The Lightning Network is a layer on top of Bitcoin that allows for instant, near-zero fee transactions. 
            
            • Perfect for Chama contributions.
            • Works instantly across borders.
            • Settles finally on the main Bitcoin blockchain.
        `
    },
    {
        icon: FaUsers,
        title: 'Why Bitcoin for Chamas?',
        desc: 'Bitcoin provides transparency and security, ensuring that group funds are safe and verifiable by all members.',
        content: `
            Traditional Chamas face risks:
            • Theft by treasurers.
            • Bank fees and delays.
            • Lack of transparency.
            
            DeChama solves this:
            • Multi-sig wallets mean no single person can steal funds.
            • The ledger is public - everyone can audit the pot in real-time.
            • Money grows in value over long term (historically) vs fiat currency devaluation.
        `
    },
]

const LearnPage = () => {
    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedModule, setSelectedModule] = useState<any>(null)

    const handleOpen = (mod: any) => {
        setSelectedModule(mod)
        onOpen()
    }

    return (
        <Box py={10}>
            <Container maxW="container.xl">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate(-1)}>
                    Back
                </Button>

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
                            _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => handleOpen(mod)}
                        >
                            <Flex mb={4} align="center">
                                <Box bg="purple.50" p={3} rounded="xl" color="purple.500" mr={4}>
                                    <Icon as={mod.icon} w={6} h={6} />
                                </Box>
                                <Heading size="md" color="gray.700">{mod.title}</Heading>
                            </Flex>
                            <Text color="gray.600" mb={6}>
                                {mod.desc}
                            </Text>
                            <Button variant="outline" colorScheme="purple" size="sm" rightIcon={<FaBookOpen />}>
                                Read Guide
                            </Button>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Content Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay backdropFilter="blur(5px)" />
                    <ModalContent>
                        <ModalHeader display="flex" alignItems="center" gap={3}>
                            {selectedModule && <Icon as={selectedModule.icon} color="purple.500" />}
                            {selectedModule?.title}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <Text whiteSpace="pre-line" lineHeight="tall" color="gray.600">
                                {selectedModule?.content}
                            </Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="purple" onClick={onClose}>Close</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

            </Container>
        </Box>
    )
}

export default LearnPage
