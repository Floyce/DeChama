import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LearnPage from './pages/LearnPage'
import Dashboard from './pages/Dashboard'
import ContributionPage from './pages/ContributionPage'
import GovernancePage from './pages/GovernancePage'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="learn" element={<LearnPage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="contribution" element={<ContributionPage />} />
                    <Route path="governance" element={<GovernancePage />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
