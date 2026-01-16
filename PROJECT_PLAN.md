# No-Code/Low-Code AI Workflow Builder

## Project Overview

A visual workflow builder application that enables users to create and interact with intelligent AI workflows through a drag-and-drop interface. Users can configure components that handle user input, extract knowledge from documents, interact with language models, and return answers through a chat interface.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + TypeScript |
| Drag & Drop | React Flow |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Vector Store | ChromaDB |
| Embeddings | OpenAI Embeddings / Gemini |
| LLM | OpenAI GPT / Gemini |
| Web Search | SerpAPI / Brave |
| Text Extraction | PyMuPDF |
| Containerization | Docker + Docker Compose |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React.js)                            │
├─────────────────┬─────────────────────────────┬─────────────────────────────┤
│ Component       │ Workspace Canvas            │ Configuration Panel         │
│ Library Panel   │ (React Flow)                │ (Dynamic Forms)             │
│                 │                             │                             │
│ • User Query    │ • Drag & Drop               │ • API Keys                  │
│ • KnowledgeBase │ • Connect Nodes             │ • Model Selection           │
│ • LLM Engine    │ • Zoom/Pan                  │ • Custom Prompts            │
│ • Output        │ • Visual Arrows             │ • File Uploads              │
└─────────────────┴─────────────────────────────┴─────────────────────────────┘
                                    │
                                    ▼ REST API
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Endpoints:                                                                  │
│ • POST /api/workflow/validate     - Validate workflow connections           │
│ • POST /api/workflow/execute      - Execute workflow with query             │
│ • POST /api/documents/upload      - Upload & process PDFs                   │
│ • POST /api/documents/embed       - Generate embeddings                     │
│ • GET  /api/documents/search      - Semantic search in vector DB            │
│ • POST /api/llm/generate          - Call LLM APIs                           │
│ • POST /api/search/web            - Web search via SerpAPI                  │
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

---

## Core Components

### 1. User Query Component
- Accepts user queries via a simple interface
- Serves as the entry point for the workflow
- Sends the query forward to the next connected component

### 2. KnowledgeBase Component
- Allows uploading and processing of documents (PDFs)
- Extracts text from files using PyMuPDF
- Generates embeddings using OpenAI/Gemini Embeddings
- Stores embeddings in ChromaDB vector store
- Retrieves relevant context based on user query

### 3. LLM Engine Component
- Accepts query from User Query Component
- Optional context from KnowledgeBase Component
- Optional custom prompt configuration
- Sends request to LLM (OpenAI GPT / Gemini)
- Optionally uses SerpAPI for web search
- Outputs response to Output Component

### 4. Output Component
- Displays final response to user
- Functions as a chat interface
- Supports follow-up questions that re-run the workflow

---

## Workflow Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────┐    ┌────────┐│
│  │ User Query   │───▶│ KnowledgeBase   │───▶│ LLM Engine │───▶│ Output ││
│  │ Component    │    │ (Optional)      │    │            │    │        ││
│  └──────────────┘    └─────────────────┘    └────────────┘    └────────┘│
│                                                                          │
│  Entry Point         PDF Upload            OpenAI/Gemini    Chat Display│
│  User's Question     Text Extraction       Web Search       Final Answer│
│                      Embeddings/RAG        Custom Prompt                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Valid Workflow Examples

```
Example 1: Simple Q&A
User Query → LLM Engine → Output

Example 2: RAG (Retrieval Augmented Generation)
User Query → KnowledgeBase → LLM Engine → Output

Example 3: Direct Knowledge Retrieval
User Query → KnowledgeBase → Output
```

---

## Project Structure

```
workflow-builder/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/          # React Flow workspace
│   │   │   ├── Nodes/           # Custom node components
│   │   │   ├── Panels/          # Side panels (library, config)
│   │   │   ├── Chat/            # Chat interface
│   │   │   └── common/          # Shared components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # State management (Zustand)
│   │   ├── services/            # API calls
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utilities
│   ├── package.json
│   └── Dockerfile
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/          # API endpoints
│   │   │   └── deps.py          # Dependencies
│   │   ├── core/
│   │   │   ├── config.py        # Settings
│   │   │   └── security.py      # Auth (optional)
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   │   ├── document.py      # PDF processing
│   │   │   ├── embedding.py     # Vector operations
│   │   │   ├── llm.py           # LLM interactions
│   │   │   ├── search.py        # Web search
│   │   │   └── workflow.py      # Workflow execution
│   │   └── db/                  # Database setup
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── kubernetes/                  # K8s manifests (optional)
└── README.md
```

---

## Implementation Phases

### Phase 1: Project Setup & Foundation
- [ ] Initialize React app with Vite + TypeScript
- [ ] Initialize FastAPI project structure
- [ ] Set up PostgreSQL and ChromaDB connections
- [ ] Configure environment variables
- [ ] Set up Docker Compose for local development

### Phase 2: Backend Core Infrastructure
- [ ] Create database models (Document, Workflow, ChatMessage)
- [ ] Set up SQLAlchemy with PostgreSQL
- [ ] Configure ChromaDB client
- [ ] Create base API structure with FastAPI
- [ ] Implement health check endpoints

### Phase 3: Frontend Workflow Builder UI
- [ ] Set up React Flow canvas
- [ ] Create custom node components for all 4 types
- [ ] Implement component library panel (drag source)
- [ ] Implement configuration panel (dynamic forms)
- [ ] Add toolbar with Build/Chat buttons
- [ ] Implement state management with Zustand

### Phase 4: Document Processing & RAG Pipeline
- [ ] Implement PDF upload endpoint
- [ ] Text extraction with PyMuPDF
- [ ] Text chunking logic
- [ ] OpenAI/Gemini embedding integration
- [ ] ChromaDB storage and retrieval
- [ ] Semantic search endpoint

### Phase 5: LLM Integration & Web Search
- [ ] OpenAI GPT integration
- [ ] Gemini integration
- [ ] SerpAPI/Brave web search integration
- [ ] Prompt template system
- [ ] Response streaming (optional)

### Phase 6: Workflow Execution Engine
- [ ] Workflow validation logic
- [ ] Topological sorting for execution order
- [ ] Node execution dispatcher
- [ ] Data passing between nodes
- [ ] Error handling and recovery

### Phase 7: Chat Interface & Integration
- [ ] Chat modal component
- [ ] Message list with user/assistant styling
- [ ] Input area with send functionality
- [ ] Integration with workflow execution
- [ ] Loading states and error display

### Phase 8: Docker & Deployment
- [ ] Frontend Dockerfile
- [ ] Backend Dockerfile
- [ ] Docker Compose configuration
- [ ] Environment variable management
- [ ] Volume persistence for data

### Phase 9: Testing & Documentation
- [ ] API endpoint testing
- [ ] Frontend component testing
- [ ] Integration testing
- [ ] README with setup instructions
- [ ] Architecture documentation
- [ ] Video demo recording

---

## Database Models

### Document Model
```python
class Document(Base):
    id: UUID
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    status: str  # processing, ready, error
    chunk_count: int
    created_at: datetime
    updated_at: datetime
```

### Workflow Model (Optional)
```python
class Workflow(Base):
    id: UUID
    name: str
    description: str
    definition: JSON  # Stores React Flow nodes/edges
    is_valid: bool
    created_at: datetime
    updated_at: datetime
```

### ChatMessage Model (Optional)
```python
class ChatMessage(Base):
    id: UUID
    workflow_id: UUID
    role: str  # user, assistant
    content: str
    metadata: JSON  # execution details
    created_at: datetime
```

---

## API Endpoints

### Document Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload and process PDF |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/{id}` | Get document details |
| DELETE | `/api/documents/{id}` | Delete document |

### Workflow Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/validate` | Validate workflow structure |
| POST | `/api/workflows/execute` | Execute workflow with query |
| POST | `/api/workflows` | Save workflow (optional) |
| GET | `/api/workflows` | List workflows (optional) |
| GET | `/api/workflows/{id}` | Get workflow (optional) |

### LLM & Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/llm/generate` | Direct LLM call |
| POST | `/api/search/web` | Web search |
| POST | `/api/knowledge/search` | Semantic search in vector DB |

---

## Frontend Components

### Node Types
```typescript
const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llmEngine: LLMEngineNode,
  output: OutputNode,
};
```

### Node Data Structure
```typescript
interface BaseNodeData {
  label: string;
  type: 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';
}

interface UserQueryNodeData extends BaseNodeData {
  type: 'userQuery';
}

interface KnowledgeBaseNodeData extends BaseNodeData {
  type: 'knowledgeBase';
  config: {
    documents: string[];  // Document IDs
    embeddingModel: 'openai' | 'gemini';
    topK: number;
  };
}

interface LLMEngineNodeData extends BaseNodeData {
  type: 'llmEngine';
  config: {
    provider: 'openai' | 'gemini';
    model: string;
    systemPrompt: string;
    temperature: number;
    useWebSearch: boolean;
    webSearchProvider?: 'serpapi' | 'brave';
  };
}

interface OutputNodeData extends BaseNodeData {
  type: 'output';
}
```

### UI Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ Toolbar: [Build Stack] [Chat with Stack] [Save] [Load]          │
├──────────┬────────────────────────────────────────┬──────────────┤
│          │                                        │              │
│ LIBRARY  │         CANVAS                         │ CONFIG PANEL │
│          │         (React Flow)                   │              │
│ ┌──────┐ │                                        │ Selected:    │
│ │Query │ │    [User Query]                        │ LLM Engine   │
│ └──────┘ │         │                              │ ───────────  │
│ ┌──────┐ │         ▼                              │ Model: [▼]   │
│ │ KB   │ │    [Knowledge Base]                    │ Prompt: [__] │
│ └──────┘ │         │                              │ Web: [✓]     │
│ ┌──────┐ │         ▼                              │              │
│ │ LLM  │ │    [LLM Engine]                        │              │
│ └──────┘ │         │                              │              │
│ ┌──────┐ │         ▼                              │              │
│ │Output│ │    [Output]                            │              │
│ └──────┘ │                                        │              │
└──────────┴────────────────────────────────────────┴──────────────┘
```

---

## Workflow Validation Rules

1. **Must have exactly one User Query node** - Entry point required
2. **Must have exactly one Output node** - Exit point required
3. **Must have at least one LLM Engine OR KnowledgeBase** - Processing required
4. **All nodes must be connected** - No orphan nodes allowed
5. **Output node must have incoming connection** - Must receive data
6. **User Query must have outgoing connection** - Must send data
7. **No cycles allowed** - DAG structure required

---

## Workflow Execution Flow

```python
async def execute_workflow(workflow: Dict, user_query: str) -> str:
    """
    1. Validate workflow structure
    2. Build execution graph (topological sort)
    3. Execute nodes in dependency order
    4. Pass data between connected nodes
    5. Return final output from Output node
    """

    # Step 1: Validate
    validation = validate_workflow(workflow)
    if not validation.valid:
        raise WorkflowValidationError(validation.errors)

    # Step 2: Sort nodes
    sorted_nodes = topological_sort(workflow['nodes'], workflow['edges'])

    # Step 3-4: Execute
    context = {'user_query': user_query}
    for node in sorted_nodes:
        result = await execute_node(node, context)
        context.update(result)

    # Step 5: Return output
    return context.get('response', '')
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/workflow_db

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000

# OpenAI
OPENAI_API_KEY=sk-...

# Gemini
GOOGLE_API_KEY=...

# Web Search
SERPAPI_KEY=...
BRAVE_API_KEY=...

# App
SECRET_KEY=your-secret-key
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

---

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/workflow_db
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
    depends_on:
      - db
      - chromadb
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: workflow_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma

volumes:
  postgres_data:
  chroma_data:
```

---

## Deliverables Checklist

| Deliverable | Status | Description |
|-------------|--------|-------------|
| Source Code | [ ] | Full frontend + backend code |
| README | [ ] | Setup and run instructions |
| Architecture Diagram | [ ] | Visual system design |
| Video Demo | [ ] | Screen recording of app in action |
| Docker Setup | [ ] | Dockerfiles + docker-compose.yml |
| K8s Manifests | [ ] | Optional Kubernetes deployment |
| Monitoring | [ ] | Optional Prometheus + Grafana |

---

## Optional Features

- [ ] Workflow saving/loading from database
- [ ] Chat history persistence
- [ ] Execution logs with real-time updates
- [ ] User authentication
- [ ] Multiple workflow support
- [ ] Export/Import workflows as JSON
- [ ] Dark mode UI theme

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- OpenAI API Key

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd workflow-builder

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## References

- [React Flow Documentation](https://reactflow.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Figma Design](https://www.figma.com/design/xAXYhfJbQTqEfnpPiMfjqE/Turbo-Workflow-Builder?node-id=0-1&t=AQ84NVwRa5TTibIg-1)
