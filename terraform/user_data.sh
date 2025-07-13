#!/bin/bash
#
# Bootstraps the CloudScale Commerce app on Amazon Linux 2

# Update OS packages
yum update -y

# Install utilities
yum install -y git curl wget htop

# Install Node.js 16 (compatible glibc)
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# Define project name
project_name="cloudscale-commerce"

# Create application directory
mkdir -p /opt/${project_name}
cd /opt/${project_name}

# Clone your repository
git clone https://github.com/NandiniSrivastava/CloudScale-Commerce.git app
cd app

# Install dependencies
npm install

# Build the app (optional, skip if not needed)
npm run build || echo "Build failed, fallback to dev"

# Create systemd service
cat > /etc/systemd/system/${project_name}.service <<EOF
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

# Fix permissions
chown -R ec2-user:ec2-user /opt/${project_name}

# Enable and start the service
systemctl daemon-reload
systemctl enable ${project_name}
systemctl start ${project_name}

echo "CloudScale Commerce setup completed successfully!"
