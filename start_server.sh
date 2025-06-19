#!/bin/bash

# Load environment variables
set -a
source .env
set +a

 source .venv/bin/activate
 
# Start the server
dbgpt start webserver --config configs/dbgpt-proxy-openai.toml 