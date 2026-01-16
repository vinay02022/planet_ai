# AI Workflow Builder

A No-Code/Low-Code web application that enables users to visually create and interact with intelligent AI workflows through a drag-and-drop interface.

![Workflow Builder](https://img.shields.io/badge/React-18.3-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## Features

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **Four Core Components**:
  - User Query: Entry point for user questions
  - Knowledge Base: Upload PDFs, create embeddings, semantic search
  - LLM Engine: Connect to OpenAI GPT or Google Gemini
  - Output: Display AI-generated responses
- **RAG Support**: Retrieval Augmented Generation with ChromaDB
- **Web Search**: Optional web search via SerpAPI or Brave
- **Chat Interface**: Interactive chat with your workflow
- **Workflow Persistence**: Save and load workflows

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React.js)                            │
├─────────────────┬─────────────────────────────────┬─────────────────────────┤
│ Component       │ Workspace Canvas                │ Configuration Panel     │
│ Library Panel   │ (React Flow)                    │ (Dynamic Forms)         │
└─────────────────┴─────────────────────────────────┴─────────────────────────┘
                                    │
                                    ▼ REST API
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI)                              │
│ • Workflow Validation & Execution                                           │
│ • Document Processing (PyMuPDF)                                             │
│ • LLM Integration (OpenAI/Gemini)                                           │
│ • Vector Search (ChromaDB)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────────┐
        │   PostgreSQL      │       │   ChromaDB            │
        │   • Documents     │       │   • Embeddings        │
        │   • Workflows     │       │   • Vector Search     │
        │   • Chat History  │       │                       │
        └───────────────────┘       └───────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI Components | React Flow, Tailwind CSS, Lucide Icons |
| State Management | Zustand |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 15 |
| Vector Store | ChromaDB |
| Embeddings | OpenAI / Gemini |
| LLM | OpenAI GPT / Google Gemini |
| Web Search | SerpAPI / Brave Search |
| Containerization | Docker + Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- OpenAI API Key (or Google API Key for Gemini)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd workflow-builder

# Copy environment file and add your API keys
cp .env.example .env
```

### 2. Configure API Keys

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-your-openai-api-key
GOOGLE_API_KEY=your-google-api-key  # Optional
SERPAPI_KEY=your-serpapi-key        # Optional, for web search
```

### 3. Start with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Development Setup (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Required Services

Make sure PostgreSQL and ChromaDB are running:

```bash
# Start only the database services
docker-compose up -d db chromadb
```

## Usage Guide

### Building a Workflow

1. **Drag components** from the left panel onto the canvas
2. **Connect components** by dragging from output handles (right) to input handles (left)
3. **Configure components** by clicking on them and using the right panel

### Example Workflow: RAG Q&A

```
[User Query] → [Knowledge Base] → [LLM Engine] → [Output]
```

1. Add **User Query** component (entry point)
2. Add **Knowledge Base** component
   - Upload PDF documents
   - Configure embedding model
3. Add **LLM Engine** component
   - Select provider (OpenAI/Gemini)
   - Choose model
   - Set custom prompt (optional)
4. Add **Output** component
5. Connect all components in order
6. Click **"Build Stack"** to validate
7. Click **"Chat with Stack"** to interact

### Validation Rules

- Must have exactly one User Query (entry point)
- Must have exactly one Output (exit point)
- Must have at least one LLM Engine or Knowledge Base
- All components must be connected
- No cycles allowed

## API Endpoints

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workflows/validate` | Validate workflow structure |
| POST | `/api/v1/workflows/execute` | Execute workflow with query |
| POST | `/api/v1/workflows` | Save workflow |
| GET | `/api/v1/workflows` | List saved workflows |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/upload` | Upload and process PDF |
| GET | `/api/v1/documents` | List all documents |
| DELETE | `/api/v1/documents/{id}` | Delete document |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/search/knowledge` | Semantic search in documents |
| POST | `/api/v1/search/web` | Web search via SerpAPI/Brave |

## Project Structure

```
workflow-builder/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Canvas/       # React Flow canvas
│   │   │   ├── Nodes/        # Custom node components
│   │   │   ├── Panels/       # Side panels
│   │   │   └── Chat/         # Chat interface
│   │   ├── store/            # Zustand store
│   │   ├── services/         # API services
│   │   └── types/            # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── core/             # Configuration
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── db/               # Database setup
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT and embeddings | Yes* |
| `GOOGLE_API_KEY` | Google API key for Gemini | Yes* |
| `SERPAPI_KEY` | SerpAPI key for web search | No |
| `BRAVE_API_KEY` | Brave Search API key | No |
| `DATABASE_URL` | PostgreSQL connection string | Auto |
| `CHROMA_HOST` | ChromaDB host | Auto |
| `CHROMA_PORT` | ChromaDB port | Auto |

*At least one of OpenAI or Google API key is required

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check logs
docker-compose logs backend

# Verify database is ready
docker-compose exec db psql -U workflow_user -d workflow_db -c "SELECT 1"
```

**ChromaDB connection error**
```bash
# Restart ChromaDB
docker-compose restart chromadb
```

**API key errors**
- Verify `.env` file exists and contains valid API keys
- Restart backend after changing environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [React Flow](https://reactflow.dev/) - Visual workflow library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [ChromaDB](https://www.trychroma.com/) - AI-native vector database
- [OpenAI](https://openai.com/) - GPT models and embeddings
- [Google AI](https://ai.google.dev/) - Gemini models
