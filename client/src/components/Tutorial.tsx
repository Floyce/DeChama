import React, { useState } from 'react'
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Text, VStack, Box, Heading, Icon, Progress, HStack
} from '@chakra-ui/react'
import { FaRocket, FaFlagCheckered, FaChevronRight, FaChevronLeft } from 'react-icons/fa'

interface Step {
    title: string
    description: string
    icon: any
}

interface TutorialProps {
    isOpen: boolean
    onClose: () => void
    onComplete: () => void
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(0)

    const steps: Step[] = [
        {
            title: "Welcome to Impact Chain",
            description: "Your gateway to community-powered finance using Bitcoin. Let's show you around your new Hub.",
            icon: FaRocket
        },
        {
            title: "Launch a Chama",
            description: "Click 'Launch Chama' to start your own savings circle. You set the rules, goal, and rotation frequency.",
            icon: FaFlagCheckered
        },
        {
            title: "Join & Contribute",
            description: "Browse available Chamas and join ones that fit your goals. Contribute using Lightning for instant validation.",
            icon: FaCheckCircle
        },
        {
            title: "Fair Rotation",
            description: "The platform automatically calculates who receives next based on join date. First-in, first-out payout cycle.",
            icon: FaHistory
        },
        {
            title: "Internal Transfers",
            description: "Move funds from your Solo Savings to any Chama instantly with zero fees using our internal ledger.",
            icon: FaExchangeAlt
        }
    ]

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            onComplete()
            onClose()
        }
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1)
    }

    const currentStep = steps[step]

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay backdropFilter="blur(8px)" />
            <ModalContent rounded="2xl" p={8}>
                <ModalHeader textAlign="center" pb={0}>
                    <VStack spacing={4}>
                        <Box p={4} bg="purple.50" rounded="full">
                            <Icon as={currentStep.icon} w={10} h={10} color="purple.600" />
                        </Box>
                        <Heading size="lg">{currentStep.title}</Heading>
                    </VStack>
                </ModalHeader>
                <ModalBody py={6}>
                    <Text textAlign="center" color="gray.600" fontSize="lg">
                        {currentStep.description}
                    </Text>
                    <Progress mt={8} value={((step + 1) / steps.length) * 100} size="xs" colorScheme="purple" rounded="full" />
                    <Text textAlign="center" mt={2} fontSize="xs" color="gray.400">Step {step + 1} of {steps.length}</Text>
                </ModalBody>
                <ModalFooter justifyContent="space-between">
                    <Button variant="ghost" leftIcon={<FaChevronLeft />} onClick={handleBack} isDisabled={step === 0}>Back</Button>
                    <Button colorScheme="purple" rightIcon={step === steps.length - 1 ? <FaCheckCircle /> : <FaChevronRight />} onClick={handleNext}>
                        {step === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

// Re-using icons to avoid import errors
import { FaCheckCircle, FaHistory, FaExchangeAlt } from 'react-icons/fa'

export default Tutorial
