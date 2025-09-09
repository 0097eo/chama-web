# ChamaSmart

A Next.js frontend application for a SACCO (Savings and Credit Cooperative) management system, consuming a Chama API with M-Pesa integration for seamless financial transactions.

## Features

- **Member Management**: Register, authenticate, and manage SACCO members
- **Financial Transactions**: Handle deposits, withdrawals, and loan applications
- **M-Pesa Integration**: Direct mobile money transactions
- **Real-time Updates**: Live balance and transaction updates
- **Secure Authentication**: JWT-based user authentication
- **Responsive Design**: Mobile-first approach for accessibility

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **State Management**: React Context API
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Integration**: M-Pesa API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios/Fetch API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- M-Pesa developer account
- Access to Chama API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/0097eo/chama-web
cd chama-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
AUTH_SECRET=your_jwt_secret
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Key Components

### Authentication Context
Manages user authentication state and JWT tokens:
```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

### Chama Context
Handles SACCO-specific operations:
```typescript
const { balance, transactions, members, makeDeposit } = useChama();
```

### M-Pesa Integration
Processes mobile money transactions:
```typescript
const { initiatePayment, checkStatus } = useMpesa();
```

## API Integration

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh

### Chama Endpoints
- `GET /chama/balance` - Get member balance
- `GET /chama/transactions` - Transaction history
- `POST /chama/deposit` - Make deposit
- `POST /chama/withdraw` - Request withdrawal
- `GET /chama/members` - Get all members

### M-Pesa Endpoints
- `POST /payments/initiate` - Start M-Pesa transaction
- `GET /payments/status/:id` - Check payment status
- `POST /payments/callback` - M-Pesa callback handler

## Environment Configuration

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.yoursacco.com
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Considerations

- JWT tokens stored in secure HTTP-only cookies
- API routes protected with middleware
- Input validation on all forms
- HTTPS enforced in production
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Issues: Create a GitHub issue

## Acknowledgments

- TanStack Query documentation
- WebSocket implementation patterns
- M-Pesa API documentation
- Next.js community
- React TypeScript patterns
- SACCO management best practices