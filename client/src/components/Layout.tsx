import React from 'react'
import { Box, Flex, Heading, Button, Container, Text, Link, Menu, MenuButton, MenuList, MenuItem, Icon, Avatar, HStack } from '@chakra-ui/react'
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
import { FaChevronDown, FaWallet, FaUserCircle } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'

import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const location = useLocation()
    const { isConnected, connectWallet, address, myChamas, disconnectWallet } = useWallet()
    const { user, isAuthenticated, logout } = useAuth()

    const isActive = (path: string) => {
        return location.pathname === path ? 'primary.main' : 'gray.600'
    }

    const isActiveBg = (path: string) => {
        return location.pathname === path ? 'primary.50' : 'transparent'
    }

    return (
        <Box bg="white" px={4} boxShadow="sm" position="sticky" top={0} zIndex={10}>
            <Container maxW="container.xl">
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    <Heading size="md" color="primary.main" letterSpacing="tight" as={RouterLink} to="/">
                        ImpactChain
                    </Heading>

                    <Flex alignItems="center" gap={6}>
                        {/* Navigation */}
                        <Link
                            as={RouterLink}
                            to="/"
                            fontWeight="medium"
                            color={isActive('/')}
                            px={3} py={1} rounded="md"
                            bg={isActiveBg('/')}
                            _hover={{ color: 'primary.main', bg: 'primary.50' }}
                        >
                            Home
                        </Link>
                        <Link
                            as={RouterLink}
                            to="/learn"
                            fontWeight="medium"
                            color={isActive('/learn')}
                            px={3} py={1} rounded="md"
                            bg={isActiveBg('/learn')}
                            _hover={{ color: 'primary.main', bg: 'primary.50' }}
                        >
                            Learn
                        </Link>

                        {/* Authenticated User Actions */}
                        {isAuthenticated && (
                            <Menu>
                                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost" size="sm">
                                    My Chamas
                                </MenuButton>
                                <MenuList>
                                    {myChamas.length > 0 ? (
                                        myChamas.map((chama, idx) => (
                                            <MenuItem key={idx} as={RouterLink} to="/dashboard">{chama}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem isDisabled>No Chamas joined</MenuItem>
                                    )}
                                    <MenuItem as={RouterLink} to="/hub">Chama Hub</MenuItem>
                                </MenuList>
                            </Menu>
                        )}

                        <Flex gap={2} align="center">
                            {/* Wallet Connection */}
                            {isConnected ? (
                                <Button size="sm" variant="outline" colorScheme="orange" leftIcon={<FaWallet />} onClick={disconnectWallet}>
                                    {address?.slice(0, 4)}...{address?.slice(-4)}
                                </Button>
                            ) : (
                                <Button size="sm" colorScheme="orange" variant="ghost" onClick={connectWallet} title="Connect Wallet">
                                    <Icon as={FaWallet} />
                                </Button>
                            )}

                            {/* User Profile */}
                            {isAuthenticated ? (
                                <Menu>
                                    <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm" colorScheme="purple" rounded="full">
                                        <HStack>
                                            <Avatar size="xs" name={user?.displayName || 'User'} />
                                            <Text maxW="100px" isTruncated display={{ base: 'none', md: 'block' }}>
                                                {user?.displayName}
                                            </Text>
                                        </HStack>
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem>Ref: {user?.referralCode}</MenuItem>
                                        <MenuItem as={RouterLink} to="/dashboard">Dashboard</MenuItem>
                                        <MenuItem onClick={() => { logout(); disconnectWallet(); }}>Logout</MenuItem>
                                    </MenuList>
                                </Menu>
                            ) : (
                                <Button as={RouterLink} to="/auth" colorScheme="purple" size="sm">
                                    Login / Sign Up
                                </Button>
                            )}
                        </Flex>
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
