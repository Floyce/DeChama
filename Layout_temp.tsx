import React from 'react'
import { Box, Flex, Heading, Button, Container, Text, Link } from '@chakra-ui/react'
import { Outlet, Link as RouterLink } from 'react-router-dom'

const Navbar = () => {
    return (
        <Box bg="white" px={4} boxShadow="sm" position="sticky" top={0} zIndex={10}>
            <Container maxW="container.xl">
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    <Heading size="md" color="primary.main" letterSpacing="tight">
                        ImpactChain
                    </Heading>

                    <Flex alignItems="center" gap={6}>
                        <Link as={RouterLink} to="/" fontWeight="medium" _hover={{ color: 'primary.main' }}>
                            Home
                        </Link>
                        <Link as={RouterLink} to="/learn" fontWeight="medium" _hover={{ color: 'primary.main' }}>
                            Learn
                        </Link>
                        <Button colorScheme="purple" size="sm">
                            Connect Wallet
                        </Button>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    )
}

const Footer = () => {
    return (
        <Box bg="gray.50" py={10} mt={10}>
            <Container maxW="container.xl">
                <Text textAlign="center" color="gray.500" fontSize="sm">
                    © {new Date().getFullYear()} ImpactChain. Native Bitcoin Chamas.
                </Text>
            </Container>
        </Box>
    )
}

const Layout = () => {
    return (
        <Flex direction="column" minH="100vh">
            <Navbar />
            <Box flex="1">
                <Outlet />
            </Box>
            <Footer />
        </Flex>
    )
}

export default Layout
