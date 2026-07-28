# 🎓 BlockEdu — Blockchain-Based Student Record Management System

A **tamper-proof, decentralized** academic credential management platform secured by Ethereum blockchain technology.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- MetaMask (optional, for real blockchain)

---

### 1. Blockchain (Hardhat Local Network)

```bash
cd blockchain
# Start local blockchain node (keep this terminal open)
npx hardhat node

# In a new terminal — deploy the smart contract
npx hardhat run scripts/deploy.js --network localhost
# Copy the deployed contract address → paste into backend/.env as CONTRACT_ADDRESS
```

---

### 2. Backend (Express + MongoDB)

```bash
cd backend
# Edit .env with your MongoDB URI and the contract address from step 1
npm run dev    # runs on http://localhost:5000
```

---

### 3. Frontend (Next.js)

```bash
cd frontend
npm run dev    # runs on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@blockedu.com     | admin123   |
| Student  | aarav@student.com      | student123 |
| Verifier | hr@company.com         | verify123  |

### Sample Student IDs
| ID    | Name          | Status       |
|-------|---------------|--------------|
| S1001 | Aarav Sharma  | ✅ Verified  |
| S1002 | Priya Nair    | ✅ Verified  |
| S1003 | Rohan Gupta   | ❌ Tampered  |
| S1004 | Sneha Patel   | ✅ Verified  |
| S1005 | Kiran Mehta   | ✅ Verified  |

---

## 🏗️ Project Structure

```
project/
├── frontend/          # Next.js + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── verify/page.tsx       # Public verification portal
│       │   ├── admin/page.tsx        # Admin login
│       │   ├── admin/dashboard/      # Admin dashboard
│       │   ├── student/login/        # Student login
│       │   ├── student/dashboard/    # Student dashboard
│       │   └── verifier/page.tsx     # Verifier portal
│       └── components/
│           ├── QRModal.tsx           # QR code generator
│           ├── ExportPDF.tsx         # PDF certificate export
│           └── Toast.tsx             # Toast notifications
│
├── backend/           # Node.js + Express
│   ├── models/        # Mongoose models (User, Record, Log)
│   ├── routes/        # API routes (auth, records)
│   ├── middleware/    # JWT auth middleware
│   └── server.js      # Main server entry
│
└── blockchain/        # Hardhat + Solidity
    ├── contracts/
    │   └── StudentRecord.sol    # Smart contract
    └── scripts/
        └── deploy.js            # Deployment script
```

---

## 🔗 API Endpoints

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| POST   | `/api/auth/register`            | Register a new user                |
| POST   | `/api/auth/login`               | Login and get JWT token            |
| POST   | `/api/records/add`              | Add student record (Admin only)    |
| GET    | `/api/records`                  | List all records (Admin only)      |
| GET    | `/api/records/:studentId`       | Get a specific record              |
| GET    | `/api/records/verify/:studentId`| Verify record against blockchain   |
| GET    | `/api/records/logs/all`         | Get all activity logs (Admin)      |

---

## ⛓️ Smart Contract

**`StudentRecord.sol`** — Deployed on Hardhat local / Polygon testnet

```solidity
function addRecord(string memory studentId, string memory dataHash) public onlyOwner
function verifyRecord(string memory studentId) public view returns (string memory)
```

- Data is hashed using **SHA-256** before being stored on-chain
- Once added, records **cannot be modified** (immutable)
- Hash mismatch = **tamper detected**
