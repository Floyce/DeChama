import React, { useEffect, useState } from 'react'
import { Box, Heading, Text, Button, HStack, Icon, keyframes } from '@chakra-ui/react'
import { FaGift } from 'react-icons/fa'

interface PaydayCelebrationProps {
    userName: string
    amount: string
    onClose: () => void
}

const confettiAnimation = keyframes`
    0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`

const PaydayCelebration: React.FC<PaydayCelebrationProps> = ({ userName, amount, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            {/* Confetti Effect */}
            {showConfetti && (
                <Box position="fixed" top={0} left={0} right={0} bottom={0} pointerEvents="none" zIndex={9998}>
                    {[...Array(30)].map((_, i) => (
                        <Box
                            key={i}
                            position="absolute"
                            left={`${Math.random() * 100}%`}
                            top="-10%"
                            width="10px"
                            height="10px"
                            bg={['brand.500', 'yellow.400', 'green.400', 'blue.400', 'pink.400'][i % 5]}
                            rounded="sm"
                            sx={{
                                animation: `${confettiAnimation} ${2 + Math.random() * 2}s linear infinite`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </Box>
            )}

            {/* Celebration Banner */}
            <Box
                bg="linear-gradient(135deg, #f7931a 0%, #ffbf1a 100%)"
                p={6}
                rounded="xl"
                shadow="2xl"
                border="3px solid"
                borderColor="yellow.400"
                position="relative"
                overflow="hidden"
                zIndex={9999}
            >
                <Box
                    position="absolute"
                    top="-50%"
                    right="-10%"
                    width="200px"
                    height="200px"
                    bg="whiteAlpha.200"
                    rounded="full"
                    filter="blur(40px)"
                />

                <HStack spacing={4} position="relative" zIndex={1}>
                    <Icon as={FaGift} w={12} h={12} color="white" />
                    <Box flex={1}>
                        <Heading size="lg" color="white" mb={2}>
                            🎉 Hey {userName}, today is Payday! 🎉
                        </Heading>
                        <Text fontSize="xl" color="white" fontWeight="bold">
                            You're receiving {amount} today!
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.900" mt={2}>
                            Your payout will be sent to your M-Pesa at 2:00 PM
                        </Text>
                    </Box>
                    <Button
                        colorScheme="whiteAlpha"
                        variant="solid"
                        onClick={onClose}
                        size="sm"
                    >
                        Got it!
                    </Button>
                </HStack>
            </Box>
        </>
    )
}

export default PaydayCelebration
