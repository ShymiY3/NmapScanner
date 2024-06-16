#!/bin/bash

# Determine the original user who invoked sudo
ORIGINAL_USER=${SUDO_USER:-$USER}

# Define the path to the virtual environment and project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"
VENV_PATH="$BACKEND_DIR/venv"
ENV_FILE="$BACKEND_DIR/.env"

# Check for root privileges
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Create the virtual environment
echo "Creating virtual environment..."
python3.12 -m venv $VENV_PATH
echo "Virtual environment created at $VENV_PATH"

# Activate the virtual environment and install dependencies
echo "Installing dependencies..."
source $VENV_PATH/bin/activate
$VENV_PATH/bin/pip install -r $BACKEND_DIR/requirements.txt
echo "Dependencies installed."

# Create the wrapper script
WRAPPER_PATH="$BACKEND_DIR/nmap_wrapper.sh"
echo "Setting up the wrapper script..."
cat <<EOF > $WRAPPER_PATH
#!/bin/bash
exec $VENV_PATH/bin/python $BACKEND_DIR/run_nmap.py "\$@"
EOF
chmod +x $WRAPPER_PATH
echo "Wrapper script created at $WRAPPER_PATH"

# Set ownership and permissions for the script
echo "Setting ownership and permissions for the wrapper script..."
chown root:root $WRAPPER_PATH
chmod 744 $WRAPPER_PATH

# Setup sudo permissions for the wrapper script
echo "Configuring sudo permissions for the wrapper script..."
echo "$ORIGINAL_USER ALL=(ALL) NOPASSWD: $WRAPPER_PATH" | EDITOR='tee -a' visudo

# Set ownership and permissions for the backend directory and virtual environment
echo "Setting ownership and permissions for the backend directory and virtual environment..."
chown -R $ORIGINAL_USER:$ORIGINAL_USER $BACKEND_DIR
chmod -R 744 $BACKEND_DIR
chmod -R 744 $VENV_PATH

# Set ownership and permissions for the frontend directory
echo "Setting ownership and permissions for the frontend directory..."
chown -R $ORIGINAL_USER:$ORIGINAL_USER $FRONTEND_DIR
chmod -R 744 $FRONTEND_DIR

# Create .env file and generate DJANGO_SECRET
echo "Creating .env file and generating DJANGO_SECRET..."
DJANGO_SECRET=$(openssl rand -base64 32)
cat <<EOF > $ENV_FILE
DJANGO_SECRET=$DJANGO_SECRET
EOF

# Set ownership and permissions for the .env file
echo "Setting ownership and permissions for the .env file..."
chown $ORIGINAL_USER:$ORIGINAL_USER $ENV_FILE
chmod 600 $ENV_FILE

# Migrate django models to db tables
echo "Migrate django models to db tables"
$VENV_PATH/bin/python $BACKEND_DIR/manage.py migrate

# Install serve package for the frontend
echo "Installing serve package for the frontend..."
npm install -g serve

# Build the frontend application
echo "Building frontend application..."
cd $FRONTEND_DIR
npm install
npm run build
echo "Frontend application built."

# Set ownership and permissions for the frontend build directory
FRONTEND_BUILD_DIR="$FRONTEND_DIR/build"
echo "Setting ownership and permissions for the frontend build directory..."
chown -R $ORIGINAL_USER:$ORIGINAL_USER $FRONTEND_BUILD_DIR
chmod -R 744 $FRONTEND_BUILD_DIR

echo "Setup complete! Your environment is ready to use."