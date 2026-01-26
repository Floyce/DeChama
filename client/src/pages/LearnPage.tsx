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
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react'
import { FaQuestion, FaKey, FaBolt, FaUsers, FaArrowLeft, FaCheckCircle, FaBookOpen } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

interface Module {
    icon: any
    title: string
    desc: string
    content: string[]
}

const modules: Module[] = [
    {
        icon: FaQuestion,
        title: 'What is Bitcoin?',
        desc: 'Bitcoin is decentralized digital money that no one controls. It is secure, scarce, and open to everyone.',
        content: [
            'Bitcoin (BTC) was created in 2009 by Satoshi Nakamoto.',
            'It is the first decentralized cryptocurrency, meaning no government or bank controls it.',
            'There will only ever be 21 million Bitcoins, making it scarce like digital gold.',
            'Transactions are recorded on a public ledger called the Blockchain.'
        ]
    },
    {
        icon: FaKey,
        title: 'What is a Wallet?',
        desc: 'A wallet stores your private keys, which are like passwords that give you access to your Bitcoin.',
        content: [
            'A wallet does not store coins; it stores the keys to move them on the blockchain.',
            'Private Key: Your secret password. NEVER share this.',
            'Public Key: Your "account number" or address. You can share this to receive money.',
            'Self-Custody: "Not your keys, not your coins." Holding your own keys gives you true ownership.'
        ]
    },
    {
        icon: FaBolt,
        title: 'What is Lightning?',
        desc: 'The Lightning Network makes Bitcoin transactions fast and cheap, perfect for everyday payments.',
        content: [
            'The main Bitcoin network (Layer 1) can be slow and expensive for small coffee payments.',
            'Lightning (Layer 2) works on top of Bitcoin to enable instant, near-zero fee transactions.',
            'It is perfect for monthly Chama contributions and daily spending.',
            'Our platform uses Lightning to ensure you don\'t lose money to network fees.'
        ]
    },
    {
        icon: FaUsers,
        title: 'Why Bitcoin for Chamas?',
        desc: 'Bitcoin provides transparency and security, ensuring that group funds are safe and verifiable by all members.',
        content: [
            'Transparency: Every member can verify the group balance on the blockchain.',
            'Security: Multi-signature (MultiSig) wallets require multiple people to approve a withdrawal.',
            'No Middlemen: No bank freezing your account or charging hidden maintenance fees.',
            'Inflation Hedge: Saving in Bitcoin protects your group\'s purchasing power over long periods.'
        ]
    },
]

const LearnPage = () => {
    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedModule, setSelectedModule] = useState<Module | null>(null)

    const handleReadMore = (mod: Module) => {
        setSelectedModule(mod)
        onOpen()
    }

    return (
        <Box py={20}>
            <Container maxW="container.xl">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={8} onClick={() => navigate('/')}>
                    Back Home
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
                            _hover={{ shadow: 'xl' }}
                        >
                            <Flex mb={4} align="center">
                                <Box bg="purple.50" p={3} rounded="xl" color="purple.500" mr={4}>
                                    <Icon as={mod.icon} w={6} h={6} />
                                </Box>
                                <Heading size="md">{mod.title}</Heading>
                            </Flex>
                            <Text color="gray.600" mb={6}>
                                {mod.desc}
                            </Text>
                            <Button
                                variant="outline"
                                colorScheme="purple"
                                size="sm"
                                onClick={() => handleReadMore(mod)}
                                leftIcon={<FaBookOpen />}
                            >
                                Read More
                            </Button>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Content Modal */}
                <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
                    <ModalOverlay backdropFilter='blur(2px)' />
                    <ModalContent>
                        <ModalHeader>
                            <Flex align="center" gap={3}>
                                <Icon as={selectedModule?.icon} color="purple.500" />
                                <Text>{selectedModule?.title}</Text>
                            </Flex>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <VStack align="start" spacing={4}>
                                <Text fontWeight="bold" color="gray.700">
                                    {selectedModule?.desc}
                                </Text>
                                <List spacing={3}>
                                    {selectedModule?.content.map((point, i) => (
                                        <ListItem key={i} display="flex" alignItems="start">
                                            <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                                            {point}
                                        </ListItem>
                                    ))}
                                </List>
                            </VStack>
                        </ModalBody>
                        <ModalFooter bg="gray.50" roundedBottom="md">
                            <Button colorScheme="purple" mr={3} onClick={onClose}>
                                Got it
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

            </Container>
        </Box>
    )
}

export default LearnPage
