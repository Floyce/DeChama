import React, { useState, useEffect } from 'react'
import { Box, Text, VStack, HStack, Badge, Button, Flex } from '@chakra-ui/react'

interface PayoutCountdownProps {
    nextPayoutDate: Date
    nextRecipient: string
    payoutAmount: string
    isCurrentUser?: boolean
}

const PayoutCountdown: React.FC<PayoutCountdownProps> = ({
    nextPayoutDate,
    nextRecipient,
    payoutAmount,
    isCurrentUser = false
}) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const target = nextPayoutDate.getTime()
            const difference = target - now

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
                })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0 })
            }
        }

        calculateTimeLeft()
        const interval = setInterval(calculateTimeLeft, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [nextPayoutDate])

    const isToday = timeLeft.days === 0 && timeLeft.hours < 24

    return (
        <Box
            bg={isToday ? 'orange.50' : 'gray.50'}
            p={4}
            rounded="lg"
            border="2px solid"
            borderColor={isToday ? 'brand.500' : 'gray.200'}
        >
            <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        Next Payout
                    </Text>
                    {isToday && (
                        <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>
                            🎉 TODAY!
                        </Badge>
                    )}
                </Flex>

                <HStack spacing={4} justify="center">
                    <VStack spacing={0}>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                            {timeLeft.days}
                        </Text>
                        <Text fontSize="xs" color="gray.500">days</Text>
                    </VStack>
                    <Text fontSize="2xl" color="gray.400">:</Text>
                    <VStack spacing={0}>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                            {timeLeft.hours}
                        </Text>
                        <Text fontSize="xs" color="gray.500">hours</Text>
                    </VStack>
                    <Text fontSize="2xl" color="gray.400">:</Text>
                    <VStack spacing={0}>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                            {timeLeft.minutes}
                        </Text>
                        <Text fontSize="xs" color="gray.500">min</Text>
                    </VStack>
                </HStack>

                <Box bg="white" p={3} rounded="md" border="1px solid" borderColor="gray.200">
                    <Text fontSize="xs" color="gray.500" mb={1}>Next Recipient</Text>
                    <Text fontSize="md" fontWeight="bold" color="gray.800">
                        {nextRecipient} {isCurrentUser && '(You!)'}
                    </Text>
                    <Text fontSize="sm" color="brand.600" fontWeight="medium" mt={1}>
                        {payoutAmount}
                    </Text>
                </Box>

                <HStack spacing={2}>
                    <Button size="sm" variant="outline" colorScheme="orange" flex={1}>
                        View Schedule
                    </Button>
                    <Button size="sm" variant="ghost" colorScheme="orange" flex={1}>
                        Notify Group
                    </Button>
                </HStack>
            </VStack>
        </Box>
    )
}

export default PayoutCountdown
