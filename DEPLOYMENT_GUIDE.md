# CloudScale Commerce - Complete Deployment Guide

## Overview
This guide explains how to deploy your CloudScale Commerce platform to AWS using GitHub and Terraform with auto-scaling infrastructure.

## Step 1: Push Project to GitHub

### Option A: Direct GitHub Upload (Recommended)
1. **Download Project from Replit**:
   - Go to Files panel in Replit
   - Click the three dots menu (⋯) 
   - Select "Download as zip"
   - Extract the zip file on your computer

2. **Create GitHub Repository**:
   - Go to GitHub.com and create a new repository
   - Name it `CloudScale-Commerce` 
   - Set it to Public (required for GitHub Actions)
   - Don't initialize with README (since you have files)

3. **Upload to GitHub**:
   - In your new repository, click "uploading an existing file"
   - Drag and drop all project files from the extracted folder
   - Commit with message: "Initial CloudScale Commerce deployment"

### Option B: Git Commands (Alternative)
```bash
# Clone your empty repository
git clone https://github.com/YOUR_USERNAME/CloudScale-Commerce.git
cd CloudScale-Commerce

# Copy all files from Replit project to this folder
# Then:
git add .
git commit -m "Initial CloudScale Commerce deployment"
git push origin main
```

## Step 2: AWS Prerequisites

### Required AWS Setup
1. **AWS Account**: Ensure you have an AWS account with billing enabled
2. **AWS CLI**: Install and configure with your credentials
3. **IAM Permissions**: Ensure your AWS user has permissions for:
   - EC2 (instances, load balancers, auto-scaling)
   - VPC (subnets, security groups)
   - CloudWatch (metrics, alarms)
   - SNS (notifications)

### Install Terraform
```bash
# Download Terraform from terraform.io
# Or use package manager:
brew install terraform  # macOS
choco install terraform # Windows
sudo apt install terraform # Ubuntu
```

## Step 3: Update Terraform Configuration

### Modify terraform/main.tf
Update the repository URL in your Terraform script:

```hcl
# In terraform/main.tf, find and update:
variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/YOUR_USERNAME/CloudScale-Commerce.git"
}

# Update region if needed (currently ap-south-1)
variable "aws_region" {
  description = "AWS region"
  type        = string  
  default     = "ap-south-1"  # Mumbai region
}
```

### Configure User Data Script
The EC2 instances will automatically:
1. Clone your GitHub repository
2. Install Node.js and dependencies
3. Start the application on port 80
4. Configure health checks

## Step 4: Deploy Infrastructure

### Initialize Terraform
```bash
cd terraform
terraform init
```

### Plan Deployment
```bash
terraform plan
# Review the planned resources (EC2, ALB, Auto Scaling, etc.)
```

### Deploy to AWS
```bash
terraform apply
# Type 'yes' when prompted
# Wait 5-10 minutes for complete deployment
```

## Step 5: Application Deployment Process

### Automatic Deployment Flow
1. **Auto Scaling Group** launches EC2 instances in ap-south-1a and ap-south-1b
2. **User Data Script** on each instance:
   ```bash
   #!/bin/bash
   yum update -y
   curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
   yum install -y nodejs git
   
   cd /home/ec2-user
   git clone https://github.com/YOUR_USERNAME/CloudScale-Commerce.git
   cd CloudScale-Commerce
   
   npm install
   npm run build
   
   # Start application
   nohup npm start > app.log 2>&1 &
   ```

3. **Application Load Balancer** distributes traffic across instances
4. **CloudWatch** monitors CPU and triggers auto-scaling
5. **Self-Healing Module** detects and fixes infrastructure issues

### Environment Variables
Set these in your EC2 instances or use AWS Systems Manager Parameter Store:
```bash
export DATABASE_URL="your-neon-database-url"
export SESSION_SECRET="your-session-secret"
export NODE_ENV="production"
export PORT="80"
```

## Step 6: Auto-Scaling Configuration

### Scaling Triggers
- **Scale UP**: When CPU > 70% for 2 consecutive periods (2 minutes)
- **Scale DOWN**: When CPU < 30% for 2 consecutive periods (2 minutes)
- **User-Based Scaling**: When 4+ active users detected
- **Instance Range**: 1-5 instances

### Health Checks
- **Application**: HTTP GET to `/api/health`
- **Load Balancer**: Port 80 health check
- **Auto Scaling**: EC2 instance health

## Step 7: Self-Healing Features

### Automatic Recovery
1. **Configuration Drift**: Monitors and reverts unauthorized changes
2. **Instance Recovery**: Replaces unhealthy instances
3. **Performance Issues**: CPU/memory threshold monitoring
4. **Notifications**: SNS alerts for all scaling/healing events

### Monitoring Dashboard
Access your real-time metrics at:
- **Application**: `http://your-load-balancer-dns`
- **AWS Console**: CloudWatch dashboards
- **Auto-scaling**: EC2 Auto Scaling Groups

## Step 8: Verify Deployment

### Test Your Application
1. **Get Load Balancer URL**:
   ```bash
   terraform output load_balancer_dns
   ```

2. **Test Endpoints**:
   ```bash
   curl http://your-alb-dns/api/health
   curl http://your-alb-dns/api/products
   ```

3. **Verify Auto-Scaling**:
   - Register 4+ users simultaneously
   - Watch CloudWatch metrics
   - Confirm new instances launch

### Monitor Logs
```bash
# SSH to EC2 instance
ssh -i your-key.pem ec2-user@instance-ip

# Check application logs
tail -f /home/ec2-user/CloudScale-Commerce/app.log

# Check system logs
sudo tail -f /var/log/cloud-init-output.log
```

## Step 9: Domain Configuration (Optional)

### Custom Domain Setup
1. **Route 53**: Create hosted zone for your domain
2. **Certificate Manager**: Request SSL certificate
3. **ALB**: Configure HTTPS listener with certificate
4. **DNS**: Point domain to load balancer

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify DATABASE_URL environment variable
3. **Port Conflicts**: Ensure application runs on port 80
4. **Security Groups**: Check inbound rules for ports 80/443

### Debug Commands
```bash
# Check running processes
ps aux | grep node

# Check port usage
netstat -tlnp | grep :80

# Check application status
curl localhost/api/health
```

## Cost Optimization

### Expected AWS Costs
- **t3.micro instances**: ~$8-15/month per instance
- **Application Load Balancer**: ~$20/month
- **Data Transfer**: Variable based on traffic
- **CloudWatch**: ~$1-3/month for metrics

### Cost Controls
- Set up billing alerts
- Use reserved instances for production
- Configure auto-scaling to minimize unused capacity

## Security Best Practices

### Production Security
1. **Environment Variables**: Use AWS Systems Manager Parameter Store
2. **Database**: Use RDS with encryption
3. **SSL/TLS**: Enable HTTPS with valid certificates
4. **Security Groups**: Restrict access to necessary ports
5. **IAM**: Use least-privilege access policies

Your CloudScale Commerce platform will automatically scale based on real user traffic, providing enterprise-grade auto-scaling and self-healing capabilities across multiple AWS availability zones!