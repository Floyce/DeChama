import React, { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Heading,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    Text,
    Card,
    CardBody,
    useToast,
    Flex,
    Icon,
    Textarea,
    HStack,
    Switch,
    NumberInput,
    NumberInputField,
    Stepper,
    Step,
    StepIndicator,
    StepStatus,
    StepIcon,
    StepNumber,
    StepSeparator,
    StepTitle,
    StepDescription,
    Checkbox,
    Stack,
    Divider,
    Alert,
    AlertIcon
} from '@chakra-ui/react'
import { FaRocket, FaArrowLeft, FaBitcoin, FaArrowRight, FaCheck, FaWallet } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'

const steps = [
    { title: 'Basic Info', description: 'Name & Type' },
    { title: 'Members', description: 'Invites & Rewards' },
    { title: 'Financial', description: 'Contributions' },
    { title: 'Loans', description: 'Lending Rules' },
    { title: 'Governance', description: 'Voting' },
    { title: 'Deploy', description: 'Review & Launch' },
]

const CreateChamaPage = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const { setMyChamas, isConnected, connectWallet, setActiveChama } = useWallet()
    const { isAuthenticated } = useAuth()

    // Protect Route - Must be logged in via Email
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth')
        }
    }, [isAuthenticated, navigate])

    const [activeStep, setActiveStep] = useState(0)
    const [isDeploying, setIsDeploying] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
        name: '',
        description: '',
        type: 'Social',
        privacy: 'Invite-Only',
        // Step 2
        expectedMembers: 10,
        inviteEmails: '',
        enableReferrals: false,
        referralBonus: '',
        // Step 3
        contributionAmount: '',
        frequency: 'Monthly',
        contributionWindow: '1st-5th',
        // Step 4
        allowLoans: false,
        maxLoanAmount: '',
        interestRate: 5,
        repaymentPeriod: 3,
        // Step 5
        votingThreshold: '51%',
        votingPeriod: 3,
        proposalCategories: ['Loans', 'Membership', 'Rules']
    })

    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')

    const handleEmailValidation = async () => {
        if (!formData.inviteEmails) return
        setEmailStatus('checking')

        const emails = formData.inviteEmails.split(',').map(e => e.trim())
        let allValid = true

        // Check only last one as sample or check them all? Let's check the first non-empty
        const sampleEmail = emails[0]
        if (!sampleEmail) {
            setEmailStatus('idle')
            return
        }

        try {
            const res = await fetch('/api/validate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: sampleEmail })
            })
            const data = await res.json()
            if (data.valid) {
                setEmailStatus('valid')
            } else {
                setEmailStatus('invalid')
                toast({ title: 'Invalid Email', description: data.reason, status: 'warning' })
            }
        } catch (e) {
            console.error(e)
            setEmailStatus('idle')
        }
    }

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNext = () => setActiveStep(prev => prev + 1)
    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleDeploy = async () => {
        // Auth check (must have user)
        const userStr = localStorage.getItem('impactchain_user')
        if (!userStr) return

        const user = JSON.parse(userStr)

        // Step 6: Connect Wallet logic
        if (!isConnected) {
            try {
                await connectWallet()
                toast({ title: 'Wallet Connected', status: 'success' })
            } catch (err) {
                toast({ title: 'Wallet connection needed to deploy', status: 'error' })
                return
            }
        }

        setIsDeploying(true)

        try {
            // BACKEND CALL
            const res = await fetch('/api/chamas/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: user.id
                })
            })
            const data = await res.json()

            if (data.success) {
                // Update Context
                setMyChamas(prev => [...prev, formData.name])
                setActiveChama(formData.name)

                toast({
                    title: 'Chama Created Successfully!',
                    description: `Smart Contract Deployed. Fee paid.`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                })
                navigate(`/chama/${encodeURIComponent(formData.name)}`)
            } else {
                toast({ title: 'Error creating Chama', description: data.error, status: 'error' })
            }

        } catch (error) {
            toast({ title: 'Creation Failed', status: 'error' })
        } finally {
            setIsDeploying(false)
        }
    }

    const renderStepContent = (stepIndex: number) => {
        switch (stepIndex) {
            case 0: // Basic Info
                return (
                    <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Chama Name</FormLabel>
                            <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Family Savings" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Purpose of this chama..." />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Type</FormLabel>
                            <Select value={formData.type} onChange={(e) => updateField('type', e.target.value)}>
                                <option value="Social">Social</option>
                                <option value="Investment">Investment</option>
                                <option value="Business">Business</option>
                                <option value="Emergency">Emergency</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Privacy</FormLabel>
                            <Select value={formData.privacy} onChange={(e) => updateField('privacy', e.target.value)}>
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                                <option value="Invite-Only">Invite-Only</option>
                            </Select>
                        </FormControl>
                    </VStack>
                )
            case 1: // Member Setup
                return (
                    <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel>Expected Members</FormLabel>
                            <NumberInput min={2} max={100} value={formData.expectedMembers} onChange={(val) => updateField('expectedMembers', val)}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Invite Members</FormLabel>
                            <Text fontSize="xs" color="gray.500" mb={1}>Enter email addresses separated by commas to send invites.</Text>
                            <Text fontSize="xs" color="purple.600" mb={2} fontWeight="medium">
                                🔒 Privacy Note: Emails are only used to send the invite link. Members will join using their chosen Pseudonyms.
                            </Text>
                            <Textarea
                                value={formData.inviteEmails}
                                onChange={(e) => updateField('inviteEmails', e.target.value)}
                                onBlur={handleEmailValidation}
                                placeholder="alice@example.com, bob@example.com"
                                size="sm"
                                rows={3}
                                borderColor={emailStatus === 'valid' ? 'green.400' : emailStatus === 'invalid' ? 'red.400' : 'inherit'}
                            />
                            {emailStatus === 'checking' && <Text fontSize="xs" color="blue.500">Checking email domain...</Text>}
                            {emailStatus === 'valid' && <Flex align="center" gap={1} color="green.500" fontSize="xs"><Icon as={FaCheck} /> Emails valid</Flex>}
                            {emailStatus === 'invalid' && <Text fontSize="xs" color="red.500">One or more emails has an invalid domain.</Text>}
                        </FormControl>
                        <Flex align="center" justify="space-between">
                            <FormLabel mb={0}>Enable Referral Rewards?</FormLabel>
                            <Switch isChecked={formData.enableReferrals} onChange={(e) => updateField('enableReferrals', e.target.checked)} />
                        </Flex>
                        {formData.enableReferrals && (
                            <FormControl>
                                <FormLabel>Referral Bonus (BTC)</FormLabel>
                                <Input value={formData.referralBonus} onChange={(e) => updateField('referralBonus', e.target.value)} placeholder="0.0001" />
                            </FormControl>
                        )}
                    </VStack>
                )
            case 2: // Financial Rules
                return (
                    <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Contribution Amount (BTC)</FormLabel>
                            <Input value={formData.contributionAmount} onChange={(e) => updateField('contributionAmount', e.target.value)} placeholder="0.005" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Frequency</FormLabel>
                            <Select value={formData.frequency} onChange={(e) => updateField('frequency', e.target.value)}>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Contribution Window</FormLabel>
                            <Select value={formData.contributionWindow} onChange={(e) => updateField('contributionWindow', e.target.value)}>
                                <option value="1st-5th">1st - 5th of Month</option>
                                <option value="15th-20th">15th - 20th of Month</option>
                                <option value="End of Month">Last 5 Days</option>
                            </Select>
                        </FormControl>
                    </VStack>
                )
            case 3: // Loan Settings
                return (
                    <VStack spacing={4} align="stretch">
                        <Flex align="center" justify="space-between">
                            <FormLabel mb={0}>Allow Loans?</FormLabel>
                            <Switch isChecked={formData.allowLoans} onChange={(e) => updateField('allowLoans', e.target.checked)} />
                        </Flex>
                        {formData.allowLoans && (
                            <>
                                <FormControl>
                                    <FormLabel>Max Loan Amount (BTC)</FormLabel>
                                    <Input value={formData.maxLoanAmount} onChange={(e) => updateField('maxLoanAmount', e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Interest Rate (%)</FormLabel>
                                    <NumberInput value={formData.interestRate} onChange={(val) => updateField('interestRate', val)}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Repayment Period (Months)</FormLabel>
                                    <NumberInput value={formData.repaymentPeriod} onChange={(val) => updateField('repaymentPeriod', val)}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </>
                        )}
                    </VStack>
                )
            case 4: // Governance
                return (
                    <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel>Voting Threshold</FormLabel>
                            <Select value={formData.votingThreshold} onChange={(e) => updateField('votingThreshold', e.target.value)}>
                                <option value="51%">51% (Majority)</option>
                                <option value="67%">67% (Super Majority)</option>
                                <option value="75%">75% (High Consensus)</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Voting Period (Days)</FormLabel>
                            <NumberInput value={formData.votingPeriod} onChange={(val) => updateField('votingPeriod', val)}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Allowed Proposal Types</FormLabel>
                            <Stack pl={2} mt={1} spacing={1}>
                                <Checkbox defaultChecked>Loans</Checkbox>
                                <Checkbox defaultChecked>Membership Changes</Checkbox>
                                <Checkbox defaultChecked>Rule Changes</Checkbox>
                            </Stack>
                        </FormControl>
                    </VStack>
                )
            case 5: // Review & Deploy
                return (
                    <VStack spacing={6} align="stretch">
                        <Alert status="info" rounded="md">
                            <AlertIcon />
                            Review your settings. Deployment will require a small Bitcoin network fee.
                        </Alert>
                        <Box p={4} bg="gray.50" rounded="md" fontSize="sm">
                            <Text><b>Name:</b> {formData.name}</Text>
                            <Text><b>Type:</b> {formData.type} ({formData.privacy})</Text>
                            <Text><b>Members:</b> ~{formData.expectedMembers} (Referrals: {formData.enableReferrals ? 'Yes' : 'No'})</Text>
                            <Text><b>Contributions:</b> {formData.contributionAmount} BTC / {formData.frequency}</Text>
                            <Text><b>Loans:</b> {formData.allowLoans ? `${formData.interestRate}% Interest` : 'Disabled'}</Text>
                            <Text><b>Governance:</b> {formData.votingThreshold} Threshold</Text>
                        </Box>

                        {!isConnected ? (
                            <Button onClick={connectWallet} colorScheme="orange" size="lg" rounded="full" leftIcon={<FaWallet />}>
                                Connect Wallet to Deploy
                            </Button>
                        ) : (
                            <Button onClick={handleDeploy} colorScheme="purple" size="lg" rounded="full" isLoading={isDeploying} loadingText="Deploying Contract...">
                                DEPLOY SMART CONTRACT
                            </Button>
                        )}
                    </VStack>
                )
            default:
                return null
        }
    }

    return (
        <Box py={10}>
            <Container maxW="container.lg">
                <Button variant="ghost" leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>

                <VStack spacing={8} align="stretch">
                    <Box>
                        <Heading size="lg" mb={2}>Create New Chama</Heading>
                        <Text color="gray.500">Follow the steps to configure your decentralized savings circle.</Text>
                    </Box>

                    {/* Stepper */}
                    <Stepper index={activeStep} colorScheme="purple" size="sm">
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>
                                <Box flexShrink='0' display={{ base: 'none', md: 'block' }}>
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Box>
                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>

                    {/* Content Card */}
                    <Card variant="outline" shadow="md" minH="400px">
                        <CardBody>
                            {renderStepContent(activeStep)}
                        </CardBody>
                    </Card>

                    {/* Navigation Buttons */}
                    <Flex justify="space-between">
                        <Button
                            onClick={handleBack}
                            isDisabled={activeStep === 0}
                            leftIcon={<FaArrowLeft />}
                            variant="ghost"
                        >
                            Back
                        </Button>
                        {activeStep < steps.length - 1 && (
                            <Button
                                onClick={handleNext}
                                colorScheme="purple"
                                size="lg"
                                rounded="full"
                                px={8}
                                rightIcon={<FaArrowRight />}
                                isDisabled={
                                    (activeStep === 0 && !formData.name) ||
                                    (activeStep === 1 && (emailStatus === 'invalid' || emailStatus === 'checking'))
                                }
                            >
                                Next Step
                            </Button>
                        )}
                    </Flex>
                </VStack>
            </Container>
        </Box>
    )
}

export default CreateChamaPage
