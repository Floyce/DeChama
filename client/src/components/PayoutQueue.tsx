import React from 'react'
import { Box, VStack, HStack, Text, Icon, Badge } from '@chakra-ui/react'
import { FaCheckCircle, FaCircle, FaBullseye } from 'react-icons/fa'

interface PayoutQueueMember {
    name: string
    date: string
    status: 'completed' | 'current' | 'upcoming'
    isCurrentUser?: boolean
}

interface PayoutQueueProps {
    members: PayoutQueueMember[]
}

const PayoutQueue: React.FC<PayoutQueueProps> = ({ members }) => {
    return (
        <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="gray.200">
            <Text fontSize="md" fontWeight="bold" mb={4} color="gray.700">
                PAYOUT QUEUE
            </Text>
            <VStack align="stretch" spacing={3}>
                {members.map((member, index) => (
                    <HStack
                        key={index}
                        p={3}
                        bg={member.status === 'current' ? 'orange.50' : 'gray.50'}
                        rounded="md"
                        border="2px solid"
                        borderColor={member.status === 'current' ? 'brand.500' : 'transparent'}
                        position="relative"
                    >
                        <Icon
                            as={
                                member.status === 'completed'
                                    ? FaCheckCircle
                                    : member.status === 'current'
                                        ? FaBullseye
                                        : FaCircle
                            }
                            color={
                                member.status === 'completed'
                                    ? 'green.500'
                                    : member.status === 'current'
                                        ? 'brand.500'
                                        : 'gray.300'
                            }
                            w={5}
                            h={5}
                        />
                        <Box flex={1}>
                            <HStack justify="space-between">
                                <Text
                                    fontWeight={member.status === 'current' ? 'bold' : 'medium'}
                                    color={member.status === 'current' ? 'brand.600' : 'gray.700'}
                                >
                                    {member.name} {member.isCurrentUser && '(YOU)'}
                                </Text>
                                {member.status === 'current' && (
                                    <Badge colorScheme="orange" fontSize="xs">
                                        Next
                                    </Badge>
                                )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                                {member.status === 'completed' ? 'Received' : ''} {member.date}
                            </Text>
                        </Box>
                        {member.status === 'current' && (
                            <Text fontSize="2xl" position="absolute" right={2}>
                                ←
                            </Text>
                        )}
                    </HStack>
                ))}
            </VStack>
        </Box>
    )
}

export default PayoutQueue
