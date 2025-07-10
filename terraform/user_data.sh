#!/bin/bash

# CloudScale Commerce - EC2 User Data Script
# This script sets up the e-commerce application on EC2 instances

# Update system
yum update -y

# Install required packages
yum install -y git curl wget docker htop

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Start and enable Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /opt/${project_name}
cd /opt/${project_name}

# Clone the CloudScale Commerce application repository
git clone https://github.com/NandiniSrivastava/CloudScale-Commerce.git app
cd app

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
  npm install
  
  # Build the application
  npm run build 2>/dev/null || echo "Build command not available, using development mode"
  
  # Start the application (try production first, fallback to development)
  if [ -f "dist/index.js" ]; then
    NODE_APP_COMMAND="node dist/index.js"
  else
    NODE_APP_COMMAND="npm run dev"
  fi
else
  # Fallback: Create a simple health check endpoint
  cat > server.js << 'EOF'
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    instance: process.env.HOSTNAME || 'unknown',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`CloudScale Commerce running on port ${port}`);
});
EOF
  NODE_APP_COMMAND="node server.js"
fi

# Create systemd service
cat > /etc/systemd/system/${project_name}.service << EOF
[Unit]
Description=CloudScale Commerce Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/${project_name}
ExecStart=/usr/bin/$NODE_APP_COMMAND
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/${project_name}

# Enable and start the service
systemctl daemon-reload
systemctl enable ${project_name}
systemctl start ${project_name}

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "metrics": {
    "namespace": "CloudScale/Commerce",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": [
          "tcp_established",
          "tcp_time_wait"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/messages",
            "log_group_name": "/aws/ec2/cloudscale-commerce",
            "log_stream_name": "{instance_id}-system"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s

# Create log rotation for application logs
cat > /etc/logrotate.d/${project_name} << EOF
/opt/${project_name}/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload ${project_name}
    endscript
}
EOF

# Create logs directory
mkdir -p /opt/${project_name}/logs
chown ec2-user:ec2-user /opt/${project_name}/logs

# Set up log monitoring
echo "*/5 * * * * ec2-user /bin/bash /opt/${project_name}/monitor.sh" >> /etc/crontab

# Create monitoring script
cat > /opt/${project_name}/monitor.sh << 'EOF'
#!/bin/bash

# Monitor application health and restart if needed
SERVICE_NAME="cloudscale-commerce"
LOG_FILE="/opt/cloudscale-commerce/logs/monitor.log"

# Check if service is running
if ! systemctl is-active --quiet $SERVICE_NAME; then
    echo "$(date): Service $SERVICE_NAME is not running. Attempting to restart..." >> $LOG_FILE
    systemctl start $SERVICE_NAME
    sleep 10
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo "$(date): Service $SERVICE_NAME restarted successfully" >> $LOG_FILE
    else
        echo "$(date): Failed to restart service $SERVICE_NAME" >> $LOG_FILE
    fi
fi

# Check application endpoint
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HTTP_STATUS" != "200" ]; then
    echo "$(date): Health check failed with status $HTTP_STATUS. Restarting service..." >> $LOG_FILE
    systemctl restart $SERVICE_NAME
fi
EOF

chmod +x /opt/${project_name}/monitor.sh
chown ec2-user:ec2-user /opt/${project_name}/monitor.sh

# Signal that the instance is ready
/opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource AutoScalingGroup --region ${AWS::Region} 2>/dev/null || true

echo "CloudScale Commerce setup completed successfully!"