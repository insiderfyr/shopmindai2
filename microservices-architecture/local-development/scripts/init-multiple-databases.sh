#!/bin/bash

# 🗄️ PostgreSQL Multiple Databases Initialization Script
# Creates separate databases pentru different services

set -e
set -u

function create_user_and_database() {
    local database=$1
    local user=$2
    local password=$3
    
    echo "  Creating user '$user' and database '$database'"
    
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE USER $user WITH PASSWORD '$password';
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $user;
        
        -- Connect to the new database and create extensions
        \c $database;
        
        -- UUID extension pentru primary keys
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Full text search
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
        
        -- JSON operations
        CREATE EXTENSION IF NOT EXISTS "btree_gin";
        
        -- Time series data (pentru analytics)
        CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;
        
        -- Vector similarity (pentru semantic search)
        CREATE EXTENSION IF NOT EXISTS "vector";
        
        -- Grant permissions
        GRANT ALL ON SCHEMA public TO $user;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO $user;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO $user;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO $user;
EOSQL
}

function create_analytics_tables() {
    echo "  Creating analytics and monitoring tables"
    
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "librechat" <<-EOSQL
        -- User analytics table
        CREATE TABLE IF NOT EXISTS user_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            event_type VARCHAR(100) NOT NULL,
            event_data JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Convert to TimescaleDB hypertable pentru time-series data
        SELECT create_hypertable('user_analytics', 'created_at', if_not_exists => TRUE);
        
        -- Conversation analytics
        CREATE TABLE IF NOT EXISTS conversation_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            conversation_id UUID NOT NULL,
            user_id UUID NOT NULL,
            model_used VARCHAR(100),
            tokens_used INTEGER,
            cost_usd DECIMAL(10,6),
            response_time_ms INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        SELECT create_hypertable('conversation_analytics', 'created_at', if_not_exists => TRUE);
        
        -- AI model performance metrics
        CREATE TABLE IF NOT EXISTS model_metrics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            model_name VARCHAR(100) NOT NULL,
            provider VARCHAR(50) NOT NULL,
            request_count INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0,
            average_latency_ms FLOAT,
            success_rate FLOAT,
            cost_per_token DECIMAL(10,8),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        SELECT create_hypertable('model_metrics', 'created_at', if_not_exists => TRUE);
        
        -- Vector embeddings pentru semantic search
        CREATE TABLE IF NOT EXISTS message_embeddings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            message_id UUID NOT NULL,
            conversation_id UUID NOT NULL,
            user_id UUID NOT NULL,
            content TEXT NOT NULL,
            embedding vector(1536), -- OpenAI embedding dimension
            model_used VARCHAR(100) DEFAULT 'text-embedding-ada-002',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Index pentru vector similarity search
        CREATE INDEX IF NOT EXISTS message_embeddings_vector_idx 
        ON message_embeddings USING ivfflat (embedding vector_cosine_ops);
        
        -- Indexes pentru performance
        CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id_time 
        ON user_analytics (user_id, created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_conversation_analytics_user_time 
        ON conversation_analytics (user_id, created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_model_metrics_model_time 
        ON model_metrics (model_name, created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_message_embeddings_conversation 
        ON message_embeddings (conversation_id, created_at DESC);
        
        -- Grant permissions
        GRANT ALL ON ALL TABLES IN SCHEMA public TO librechat;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO librechat;
EOSQL
}

function setup_keycloak_database() {
    echo "  Setting up Keycloak database optimizations"
    
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "keycloak" <<-EOSQL
        -- Optimize Keycloak pentru development
        ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
        ALTER SYSTEM SET max_connections = 200;
        ALTER SYSTEM SET shared_buffers = '128MB';
        ALTER SYSTEM SET effective_cache_size = '512MB';
        ALTER SYSTEM SET maintenance_work_mem = '64MB';
        ALTER SYSTEM SET checkpoint_completion_target = 0.9;
        ALTER SYSTEM SET wal_buffers = '16MB';
        ALTER SYSTEM SET default_statistics_target = 100;
        
        -- Grant permissions
        GRANT ALL ON SCHEMA public TO keycloak;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO keycloak;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO keycloak;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    
    # Create main LibreChat database
    create_user_and_database "librechat" "librechat" "librechat123"
    
    # Create Keycloak database
    create_user_and_database "keycloak" "keycloak" "keycloak123"
    
    # Create EventStore database
    create_user_and_database "eventstore" "eventstore" "eventstore123"
    
    # Setup analytics tables
    create_analytics_tables
    
    # Optimize Keycloak database
    setup_keycloak_database
    
    echo "Multiple databases created successfully!"
else
    echo "POSTGRES_MULTIPLE_DATABASES not set, skipping additional database creation"
fi

# Performance optimizations pentru development
echo "Applying PostgreSQL optimizations pentru laptop development..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Development optimizations (trade durability for speed)
    ALTER SYSTEM SET fsync = off;
    ALTER SYSTEM SET synchronous_commit = off;
    ALTER SYSTEM SET full_page_writes = off;
    ALTER SYSTEM SET checkpoint_segments = 32;
    ALTER SYSTEM SET checkpoint_completion_target = 0.9;
    ALTER SYSTEM SET wal_buffers = '16MB';
    
    -- Memory optimizations pentru laptop
    ALTER SYSTEM SET shared_buffers = '256MB';
    ALTER SYSTEM SET effective_cache_size = '1GB';
    ALTER SYSTEM SET work_mem = '8MB';
    ALTER SYSTEM SET maintenance_work_mem = '128MB';
    
    -- Connection optimizations
    ALTER SYSTEM SET max_connections = 100;
    ALTER SYSTEM SET max_prepared_transactions = 0;
    
    -- Logging pentru debugging
    ALTER SYSTEM SET log_statement = 'all';
    ALTER SYSTEM SET log_min_duration_statement = 1000;
    ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
    
    -- Reload configuration
    SELECT pg_reload_conf();
EOSQL

echo "🚀 PostgreSQL optimizations applied pentru laptop development!"