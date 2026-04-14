import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Button,
    Text,
    Flex,
    Image,
    Input,
    FormControl,
    FormLabel,
    useToast,
    Divider
} from '@chakra-ui/react'
import { FaBolt, FaEthereum } from 'react-icons/fa'

interface WalletConnectModalProps {
    isOpen: boolean
    onClose: () => void
    onConnect: (type: string, address?: string) => void
}

const WalletConnectModal = ({ isOpen, onClose, onConnect }: WalletConnectModalProps) => {
    const [lnAddress, setLnAddress] = useState('')
    const toast = useToast()

    const handleConnectLnAddress = () => {
        if (!lnAddress.includes('@')) {
            toast({ title: "Invalid Lightning Address", status: "error" })
            return
        }
        onConnect('ln_address', lnAddress)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent>
                <ModalHeader>Connect Your Wallet</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.500">Lightning Address</FormLabel>
                            <Flex gap={2}>
                                <Input 
                                    placeholder="user@getalby.com" 
                                    value={lnAddress}
                                    onChange={(e) => setLnAddress(e.target.value)}
                                />
                                <Button colorScheme="purple" onClick={handleConnectLnAddress}>
                                    Set
                                </Button>
                            </Flex>
                        </FormControl>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default WalletConnectModal
