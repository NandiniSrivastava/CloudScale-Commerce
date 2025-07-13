#!/bin/bash

yum update -y
yum install -y git curl wget htop

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Define project name
project_name="cloudscale-commerce"

# Create app directory
mkdir -p /opt/${project_name}
cd /opt/${project_name}

# Clone repo
git clone https://github.com/NandiniSrivastava/CloudScale-Commerce.git app
cd app

# Install dependencies
npm install

# Build (optional)
npm run build || echo "Build failed, fallback to dev"

# Create systemd service
sudo tee /etc/systemd/system/${project_name}.service > /dev/null <<EOF
[Unit]
Description=CloudScale Commerce Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/${project_name}/app
ExecStart=/usr/bin/npm run dev
Restart=always
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF

# Permissions
chown -R ec2-user:ec2-user /opt/${project_name}

# Enable and start
systemctl daemon-reload
systemctl enable ${project_name}
systemctl start ${project_name}

echo "CloudScale Commerce setup completed successfully!"
