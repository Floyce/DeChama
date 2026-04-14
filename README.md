# ⚡ Impact Chain: Decentralized Community Savings

Impact Chain is a state-of-the-art **Bitcoin-native ROSCA (Rotating Savings and Credit Association)** platform designed to empower communities through transparent, trustless, and automated financial governance. Built for the modern age, it replaces manual tracking and verbal trust with cryptographically secure smart-governance and Lightning Network payments.

---

## 💎 Core Features

### 🏢 Chama Hub & Governance
- **Discovery Engine**: Browse active Chamas or launch your own community circle in seconds.
- **51% Consensus Model**: Strict democratic governance. Membership, loans, and withdrawals require a majority vote to execute.
- **Strict Access Control**: Dashboards are locked behind a membership wall. Only approved members can view balance, rotation orders, or transaction history.

### ⚡ Lightning-Native Finance
- **Sats + KSH Display**: Dynamic currency bridging. View your savings in Bitcoin (Sats) and Kenyan Shillings (KSH) using real-time exchange rates.
- **Automated Payouts**: The system automatically triggers rotation payouts to your saved Lightning address the moment the pool target is reached.
- **Wallet of Satoshi Integration**: Seamlessly contribute via Lightning QR codes or deep-linking.

### 🛡️ Security & Transparency
- **Unique Login References**: Every session generates a persistent IC-XXXX-XXXX tracking number for auditability.
- **Proof-of-Payment**: Immutable digital receipts via Lightning payment hashes.
- **Rotation Order**: Transparent join-date-based rotation ensures everyone knows exactly when their "payday" is coming.

---

## 🚀 Tech Stack

- **Frontend**: React (TypeScript), Chakra UI (Glassmorphism design), Framer Motion.
- **Backend**: FastAPI (Python), SQLAlchemy (Async), Pydantic.
- **Database**: PostgreSQL with strict relational constraints and indexing.
- **Payments**: Lightning Network (LNbits / OpenNode compatible).
- **Automation**: Async polling and state-machine transitions for governance approval.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (3.9+)

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/impactchain
SECRET_KEY=your_super_secret_key
LNBITS_API_KEY=your_lnbits_key
LNBITS_URL=https://legend.lnbits.com
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run_server.py
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📦 Deployment

### Backend (Cloud Run)
1. Build the Docker image: `docker build -t gcr.io/impact-chain/backend .`
2. Push and deploy to Google Cloud Run with appropriate env variables.

### Frontend (Vercel)
1. Connect GitHub repository.
2. Set build command: `npm run build`.
3. Set output directory: `dist`.

---

## 📜 Database Migrations
To initialize the governance and request system:
1. Run the `add_requests_tables.sql` located in `backend/sql/`.
2. Ensure `chama_memberships` table has the `status` column for access control.

---

## 🤝 Contribution
Impact Chain is open-source. Join us in building the future of decentralized community finance!

**Developed by Antigravity AI for Floyce.**