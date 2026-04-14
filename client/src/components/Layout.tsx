import React from 'react'
import { Box, Flex, Heading, Button, Container, Text, Link, Menu, MenuButton, MenuList, MenuItem, Icon, Avatar, HStack, Divider, Select, useDisclosure } from '@chakra-ui/react'
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { FaChevronDown, FaWallet, FaUserCircle, FaInfoCircle } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import WalletConnectModal from './WalletConnectModal'

import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { isConnected, connectWallet, address, myChamas, disconnectWallet, currency, setCurrency, setDisplayName } = useWallet()
    const { user, isAuthenticated, logout } = useAuth()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const isActive = (path: string) => {
        return location.pathname === path ? 'purple.600' : 'gray.600'
    }

    const isActiveBg = (path: string) => {
        return location.pathname === path ? 'purple.50' : 'transparent'
    }

    return (
        <Box bg="white" px={4} boxShadow="sm" position="sticky" top={0} zIndex={10}>
            <Container maxW="container.xl">
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    <Heading size="md" color="purple.600" letterSpacing="tight" as={RouterLink} to="/">
                        Impact Chain
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
                            _hover={{ color: 'purple.600', bg: 'purple.50' }}
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
                            _hover={{ color: 'purple.600', bg: 'purple.50' }}
                        >
                            Learn
                        </Link>

                        {/* Authenticated User Actions */}
                        {isAuthenticated && (
                            <Menu>
                                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost" size="sm">
                                    Chama Hub
                                </MenuButton>
                                <MenuList>
                                    {myChamas.length > 0 ? (
                                        myChamas.map((chama, idx) => (
                                            <MenuItem key={idx} as={RouterLink} to={`/chama/${encodeURIComponent(chama)}`}>
                                                {chama}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem isDisabled>No Chamas joined</MenuItem>
                                    )}
                                    <Divider />
                                    <MenuItem as={RouterLink} to="/dashboard">View All (Dashboard)</MenuItem>
                                </MenuList>
                            </Menu>
                        )}

                        <Flex gap={2} align="center">
                            {/* Currency Selector */}
                            {isAuthenticated && (
                                <Select
                                    size="sm"
                                    w="80px"
                                    rounded="md"
                                    variant="outline"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    color="gray.600"
                                    borderColor="gray.200"
                                >
                                    <option value="kshs">🇰🇪 kshs</option>
                                    <option value="USD">🇺🇸 USD</option>
                                    <option value="UGX">🇺🇬 UGX</option>
                                    <option value="TZS">🇹🇿 TZS</option>
                                </Select>
                            )}

                            {/* Wallet Connection (Fix 2 Improved) */}
                            {isConnected ? (
                                <Menu>
                                    <MenuButton as={Button} size="sm" variant="outline" colorScheme="orange" leftIcon={<FaWallet />}>
                                        {address?.slice(0, 4)}...{address?.slice(-4)}
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem isDisabled fontSize="xs">Connected as: {address}</MenuItem>
                                        <Divider />
                                        <MenuItem onClick={onOpen}>Switch Wallet</MenuItem>
                                        <MenuItem color="red.500" onClick={disconnectWallet}>Disconnect</MenuItem>
                                    </MenuList>
                                </Menu>
                            ) : (
                                <Button size="sm" variant="ghost" colorScheme="orange" leftIcon={<FaWallet />} onClick={onOpen} title="Connect Wallet">
                                    Connect
                                </Button>
                            )}
                            
                            <WalletConnectModal isOpen={isOpen} onClose={onClose} onConnect={(type, addr) => {
                                if (type === 'ln_address' && addr) {
                                    setDisplayName(addr);
                                    connectWallet(addr);
                                }
                                onClose();
                            }} />

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
                                        <MenuItem onClick={() => { logout(); disconnectWallet(); navigate('/'); }}>Logout</MenuItem>
                                    </MenuList>
                                </Menu>
                            ) : (
                                <Button as={RouterLink} to="/auth" colorScheme="purple" size="sm">
                                    Get Started
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
                    © {new Date().getFullYear()} Impact Chain. Building the future of community finance.
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
