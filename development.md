# DB-GPT Development Setup Guide

## Prerequisites
- Python 3.11 or higher
- uv package manager

## Initial Setup

1. Install uv package manager:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create and activate virtual environment:
```bash
uv venv
source .venv/bin/activate
```

3. Create .env file with required environment variables:
```bash
# OpenAI Configuration
OPENAI_API_KEY="your-api-key"
OPENAI_API_BASE="https://api.openai.com/v1"

# Model Configuration
LLM_MODEL_NAME="gpt-4"
LLM_MODEL_PROVIDER="proxy/openai"

# Embedding Configuration
EMBEDDING_MODEL_NAME="text-embedding-3-small"
EMBEDDING_MODEL_PROVIDER="proxy/openai"
EMBEDDING_MODEL_API_URL="https://api.openai.com/v1/embeddings"

# Language Configuration
DBGPT_LANG="en"
```

4. Source the environment variables:
```bash
source .env
```

## Installation

Install dependencies using uv sync (this only needs to be done once):
```bash
uv sync --all-packages \
--extra "base" \
--extra "proxy_openai" \
--extra "rag" \
--extra "storage_chromadb" \
--extra "dbgpts"
```

## Running the Application

After installation, you can start the webserver in two ways:

1. Using the installed dbgpt command (Recommended):
```bash
dbgpt start webserver --config configs/dbgpt-proxy-openai.toml
```

2. Or using Python directly:
```bash
python -m dbgpt_app.dbgpt_server --config configs/dbgpt-proxy-openai.toml
```

Note: Do not use `uv run` to start the server as it may try to reinstall dependencies unnecessarily.

## Optional: Running Web Frontend Separately

If you want to run the web frontend separately:

1. Navigate to web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
echo "API_BASE_URL=http://localhost:5670" > .env
```

4. Start development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Understanding the Commands

- `uv sync`: Installs all required Python packages and dependencies. This is a one-time setup step.
- `dbgpt start webserver`: Runs the DB-GPT application using the installed packages. This is what you use to start the server.

## Configuration

The main configuration file is located at `configs/dbgpt-proxy-openai.toml`. You can modify this file to change various settings like:
- Server host and port
- Database configuration
- Model settings
- API endpoints

## Troubleshooting

1. If you get environment variable errors:
   - Make sure you've created the .env file
   - Verify that you've sourced the .env file
   - Check that your API keys are correctly set

2. If you get dependency errors:
   - Make sure you've run `uv sync` with all required extras
   - Try deactivating and reactivating the virtual environment

3. If the server won't start:
   - Check the logs for specific error messages
   - Verify your configuration file settings
   - Ensure all required environment variables are set 