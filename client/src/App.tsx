import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LearnPage from './pages/LearnPage'
import Dashboard from './pages/Dashboard'
import ContributionPage from './pages/ContributionPage'
import GovernancePage from './pages/GovernancePage'
import AuthPage from './pages/AuthPage'
import CreateChamaPage from './pages/CreateChamaPage'
import BrowseChamasPage from './pages/BrowseChamasPage'
import HubPage from './pages/HubPage'

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />

                <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="learn" element={<LearnPage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="hub" element={<HubPage />} />
                    <Route path="contribution" element={<ContributionPage />} />
                    <Route path="governance" element={<GovernancePage />} />
                    <Route path="create-chama" element={<CreateChamaPage />} />
                    <Route path="browse-chamas" element={<BrowseChamasPage />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
