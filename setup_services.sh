#!/bin/bash

# Determine the original user who invoked sudo
ORIGINAL_USER=${SUDO_USER:-$USER}

# Define the path to the virtual environment and necesary directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_PATH="$BACKEND_DIR/venv" 

# Check for root privileges
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Create a service for serving the frontend
FRONTEND_SERVICE="/etc/systemd/system/nmapscanner_frontend.service"
echo "Creating a systemd service for the frontend..."
cat <<EOF > $FRONTEND_SERVICE
[Unit]
Description=Serve Frontend
After=network.target
PartOf=nmapscanner.target

[Service]
User=$ORIGINAL_USER
WorkingDirectory=$FRONTEND_DIR
ExecStart=/usr/bin/serve -s build -l 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create a service for the Django server
DJANGO_SERVICE="/etc/systemd/system/nmapscanner_django.service"
echo "Creating a systemd service for the Django server..."
cat <<EOF > $DJANGO_SERVICE
[Unit]
Description=Django Development Server
After=network.target
PartOf=nmapscanner.target

[Service]
User=$ORIGINAL_USER
WorkingDirectory=$BACKEND_DIR
ExecStart=$VENV_PATH/bin/python $BACKEND_DIR/manage.py runserver 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF


# Create a service for the Celery worker
CELERY_SERVICE="/etc/systemd/system/nmapscanner_celery.service"
echo "Creating a systemd service for the Celery worker..."
cat <<EOF > $CELERY_SERVICE
[Unit]
Description=Celery Service
After=network.target
PartOf=nmapscanner.target

[Service]
User=$ORIGINAL_USER
WorkingDirectory=$BACKEND_DIR
ExecStart=$VENV_PATH/bin/celery -A NmapScanner worker --loglevel=info
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create a target to manage all services
ALL_SERVICES_TARGET="/etc/systemd/system/nmapscanner.target"
echo "Creating a systemd target to manage all services..."
cat <<EOF > $ALL_SERVICES_TARGET
[Unit]
Description=NmapScanner Services
Requires=nmapscanner_frontend.service nmapscanner_django.service nmapscanner_celery.service
After=nmapscanner_frontend.service nmapscanner_django.service nmapscanner_celery.service

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to recognize new target
echo "Reloading systemd daemon..."
systemctl daemon-reload

echo "Setup complete! Your environment is ready to use."

echo "To start, stop or enable all services, use the following commands:"
echo "sudo systemctl start nmapscanner.target"
echo "sudo systemctl stop nmapscanner.target"
echo "sudo systemctl enable nmapscanner.target"