#!/bin/bash

# Define the path to the virtual environment and project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
VENV_PATH="$BACKEND_DIR/venv"


echo "Starting setup..."

# Check for root privileges
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Create admin user
$VENV_PATH/bin/python $BACKEND_DIR/manage.py createsuperuser