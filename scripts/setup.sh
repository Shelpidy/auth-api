#!/bin/bash

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "Docker does not seem to be running, start Docker and try again"
        exit 1
    fi
}

# Function to start containers and wait for database
start_containers() {
    local env=$1
    echo "Starting $env environment..."
    
    if [ "$env" = "test" ]; then
        export NODE_ENV=test
        docker-compose -f docker-compose-db.yml up -d postgres_test
        # Wait for test database to be ready
        until docker exec auth_test_db pg_isready; do
            echo "Waiting for test database..."
            sleep 2
        done
    else
        docker-compose -f docker-compose-db.yml up -d postgres
        # Wait for dev database to be ready
        until docker exec auth_db pg_isready; do
            echo "Waiting for database..."
            sleep 2
        done
    fi
}

# Function to run migrations and push changes
setup_environment() {
    local env=$1
    
    if [ "$env" = "test" ]; then
        echo "Setting up test environment..."
        npm run push:test
    else
        echo "Setting up development environment..."
        npm run push || {
        echo "Schema push failed, but continuing..."
        }
        echo "Seeding database..."
        npm run seed || {
        echo "Seeding failed (possibly due to existing data), continuing..."
        }
    fi
}



# Main script
case "$1" in
    "test")
        check_docker
        start_containers "test"
        setup_environment "test"
        echo "Test environment is ready!"
        ;;
    "dev")
        check_docker
        start_containers "dev"
        setup_environment "dev"
        echo "Development environment is ready!"
        ;;
    *)
        echo "Usage: $0 {test|dev}"
        exit 1
        ;;
esac