# Personaliz Video Task - Full-Stack Application

A personalized video creation and WhatsApp delivery application built with Express.js, Next.js, and PostgreSQL.

## Features

- **Personalized Video Generation**: Uses SyncLabs API for voice cloning and lipsync
- **WhatsApp Integration**: Sends personalized videos directly to user's WhatsApp
- **Actor Selection**: Choose from different actors for video personalization
- **Real-time Status Tracking**: Monitor video generation and delivery status
- **Comprehensive Logging**: Track all requests, responses, and delivery statuses

## Tech Stack

### Backend
- Express.js with TypeScript
- Prisma ORM with PostgreSQL
- SyncLabs API integration
- WhatsApp Business API integration

### Frontend
- Next.js 14 with React
- TypeScript
- Tailwind CSS
- Axios for API calls

### Infrastructure
- Docker & Docker Compose
- PostgreSQL database
- Multi-container setup

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- SyncLabs API key
- WhatsApp Business API credentials

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd personaliz-video-app
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Fill in your API keys in `.env`:
   \`\`\`env
   SYNCLABS_API_KEY=your_synclabs_api_key_here
   WHATSAPP_API_KEY=your_whatsapp_api_key_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   \`\`\`

3. **Run the application**
   \`\`\`bash
   docker-compose up --build
   \`\`\`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Database Setup

The database will be automatically set up when the backend starts. If you need to run migrations manually:

\`\`\`bash
docker-compose exec backend npm run db:migrate
\`\`\`

## API Endpoints

### Video Generation
- `POST /api/video/generate` - Generate personalized video
- `GET /api/video/status/:id` - Check video generation status

### WhatsApp Integration
- `POST /api/whatsapp/send` - Send video via WhatsApp
- `POST /api/whatsapp/webhook` - Handle delivery status webhooks

### Actors
- `GET /api/actors` - Get available actors

## Usage Flow

1. **User Input**: Fill in name, city, and phone number
2. **Actor Selection**: Choose from available actors
3. **Video Generation**: Backend calls SyncLabs API to create personalized video
4. **WhatsApp Delivery**: Automatically sends video to user's WhatsApp
5. **Status Tracking**: Real-time updates on generation and delivery status

## Development

### Running in Development Mode

Backend:
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

Frontend:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Database Operations

\`\`\`bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes
npm run db:push
\`\`\`

## AI Assistant Usage

This project was developed with AI assistance (Claude/Cursor). Key areas where AI was utilized:

1. **Project Architecture**: Initial setup and structure planning
2. **API Integration**: SyncLabs and WhatsApp API implementation
3. **Database Schema**: Prisma schema design and relationships
4. **Frontend Components**: React components and form handling
5. **Docker Configuration**: Multi-container setup optimization
6. **Error Handling**: Comprehensive error handling and logging

## Deployment

The application is containerized and ready for deployment. Ensure all environment variables are properly configured in your production environment.

## License

This project is for assignment purposes.
