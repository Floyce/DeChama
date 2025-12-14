# DeChama: Decentralized Chama Management Platform

DeChama is a modern, decentralized application designed to revolutionize traditional Chamas (savings circles) by leveraging blockchain technology for transparency, security, and efficiency.

## 🚀 Vision
To empower communities to save, grow, and thrive together without the risks of fraud or mismanagement associated with traditional informal savings groups. DeChama provides a trustless environment where every transaction is verifiable on-chain.

## ✨ Key Features

### 🔐 Hybrid Authentication & Security
*   **Email & Password Login:** Familiar onboarding experience for non-crypto users.
*   **Wallet Integration:** Connect Bitcoin/Stacks wallets (Leather, Xverse) for fund management.
*   **Referral System:** Built-in referral codes and tracking to grow the community.
*   **Security:** Session tracking and secure authentication flow.

### 🧙‍♂️ Chama Creation Wizard
A guided 6-step process to launch your customized savings circle:
1.  **Basic Info:** Name, Type (Social, Investment, etc.), and Privacy settings.
2.  **Members:** Invite system and referral configuration.
3.  **Financial Rules:** Set contribution amounts, frequencies (Weekly/Monthly), and windows.
4.  **Loan Settings:** Configure interest rates, max loan amounts, and repayment periods.
5.  **Governance:** Define voting thresholds (51%, 67%, etc.) for decision making.
6.  **Deploy:** One-click smart contract deployment.

### 📊 Member Dashboard
*   **Real-time Overview:** View your Total Chama Pot and Personal Share in BTC/USD.
*   **Activity Feed:** Live updates on contributions, proposals, and new members.
*   **Members List:** View all members and their contribution status (Paid/Pending).
*   **Quick Actions:** Make contributions, request loans, or create governance proposals.

### 🗳️ Governance & Voting
*   **Proposal System:** Members can propose changes or loan requests.
*   **Voting:** Transparent on-chain voting based on the Chama's configured threshold.

## 🛠️ Technology Stack
*   **Frontend:** React (TypeScript), Vite
*   **UI Framework:** Chakra UI (Custom "Purple/Brand" Theme)
*   **State Management:** React Context API (AuthContext, WalletContext)
*   **Blockchain Integration:** Stacks.js (for Bitcoin L2 smart contracts)

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Floyce/DeChama.git
    cd DeChama
    ```

2.  Install dependencies:
    ```bash
    cd client
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📂 Project Structure

```
DeChama/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components (Navbar, Layout, etc.)
│   │   ├── context/        # Global State (Auth, Wallet)
│   │   ├── pages/          # Main Application Pages (Dashboard, Wizard, etc.)
│   │   └── theme.ts        # Chakra UI Custom Theme
│   └── vite.config.ts      # Vite Configuration
└── README.md               # Project Documentation
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.