#!/usr/bin/env bash
# Copy initial database to persistent disk if it doesn't exist
mkdir -p data
if [ ! -f "data/sih26103.db" ]; then
    if [ -f "sih26103.db" ]; then
        cp sih26103.db data/sih26103.db
        echo "Copied existing database to persistent volume."
    else
        echo "No initial database found. A fresh SQLite db will be created."
    fi
fi

# Run uvicorn
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
