# CloudScale Commerce - Complete Setup Guide

This guide provides step-by-step instructions to deploy your e-commerce application with AWS auto-scaling infrastructure using Terraform.

## Prerequisites

### 1. Install Required Software

#### Windows:
```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install tools
choco install awscli terraform git nodejs vscode -y
```

#### macOS:
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install awscli terraform git node vscode
```

#### Linux (Ubuntu/Debian):
```bash
# Update package list
sudo apt update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Install Git
sudo apt install git
```

### 2. AWS Account Setup

#### Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add a payment method (required for resource creation)

#### Step 2: Create IAM User for Terraform
1. Login to AWS Console
2. Navigate to **IAM** → **Users** → **Create user**
3. User name: `terraform-user`
4. Select **Attach policies directly**
5. Add these policies:
   - `PowerUserAccess` (recommended for full infrastructure management)
   - OR specific policies if you prefer least privilege:
     - `AmazonEC2FullAccess`
     - `AmazonVPCFullAccess`
     - `ElasticLoadBalancingFullAccess`
     - `CloudWatchFullAccess`
     - `AutoScalingFullAccess`
     - `IAMReadOnlyAccess`
     - `AmazonSNSFullAccess`

6. Click **Create user**
7. Go to the user → **Security credentials** tab
8. Click **Create access key**
9. Choose **Command Line Interface (CLI)**
10. Download or copy the **Access Key ID** and **Secret Access Key**

#### Step 3: Configure AWS CLI
```bash
# Configure AWS credentials
aws configure

# Enter the following when prompted:
# AWS Access Key ID: [Your Access Key ID]
# AWS Secret Access Key: [Your Secret Access Key]
# Default region name: ap-south-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

## Project Setup

### 1. Clone and Setup Project
```bash
# Clone the project (replace with your actual repository)
git clone <your-repository-url>
cd cloudscale-commerce

# Install Node.js dependencies
npm install

# Test the application locally
npm run dev
```

### 2. Prepare Terraform Configuration
```bash
# Navigate to terraform directory
cd terraform

# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit the variables file with your preferences
nano terraform.tfvars  # or use your preferred editor
```

#### Update terraform.tfvars:
```hcl
# AWS Configuration
aws_region = "ap-south-1"

# Project Configuration
project_name = "your-project-name"
environment  = "dev"

# Instance Configuration (start small for testing)
instance_type     = "t3.micro"
min_instances     = 2
max_instances     = 5
desired_instances = 2

# Notification email for alerts
notification_email = "your-email@example.com"

# Tags
common_tags = {
  Project     = "CloudScale Commerce"
  Environment = "dev"
  Owner       = "Your Name"
}
```

## Deployment Steps

### 1. Initialize Terraform
```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan the deployment
terraform plan
```

### 2. Deploy Infrastructure
```bash
# Apply the Terraform configuration
terraform apply

# Type 'yes' when prompted to confirm
```

**Expected Deployment Time:** 10-15 minutes

### 3. Verify Deployment
```bash
# Get the load balancer URL
terraform output load_balancer_url

# Test the application
curl $(terraform output -raw load_balancer_url)
```

## AWS Console Navigation Guide

### 1. Monitor Auto Scaling Groups
1. **AWS Console** → **EC2** → **Auto Scaling Groups**
2. Click on your ASG (e.g., `cloudscale-commerce-asg`)
3. View:
   - **Activity History** for scaling events
   - **Instance Management** for current instances
   - **Monitoring** for metrics

### 2. View Load Balancer Status
1. **AWS Console** → **EC2** → **Load Balancers**
2. Click on your ALB (e.g., `cloudscale-commerce-alb`)
3. Check:
   - **Target Groups** tab for healthy instances
   - **Monitoring** for traffic metrics
   - **Listeners** for routing rules

### 3. CloudWatch Monitoring
1. **AWS Console** → **CloudWatch** → **Dashboards**
2. Open the application dashboard
3. View real-time metrics:
   - EC2 CPU utilization
   - Load balancer response times
   - Auto scaling events

### 4. Self-Healing Monitoring
1. **CloudWatch** → **Dashboards** → Self-Healing Dashboard
2. Monitor:
   - Lambda function invocations
   - Healing events triggered
   - Error rates

### 5. SNS Notifications
1. **AWS Console** → **SNS** → **Topics**
2. Find the healing notifications topic
3. **Create subscription** → **Email** → Enter your email
4. Confirm subscription from your email

## Testing Auto-Scaling

### 1. Generate Load to Trigger Scaling
```bash
# Install stress testing tool
sudo yum install stress -y  # On EC2 instances

# OR use Apache Bench from your local machine
# Install: brew install httpd (macOS) or apt install apache2-utils (Linux)

# Generate load to trigger CPU alarm
ab -n 10000 -c 100 http://[your-load-balancer-url]/

# Monitor scaling in AWS Console
```

### 2. Monitor Scaling Events
1. **EC2** → **Auto Scaling Groups** → **Activity History**
2. **CloudWatch** → **Alarms** - Check CPU alarms
3. **CloudWatch** → **Metrics** - View scaling metrics

### 3. Test Self-Healing
```bash
# SSH into an instance (you'll need to add SSH key to launch template)
# Stop the application service to test healing
sudo systemctl stop cloudscale-commerce

# Watch the self-healing system detect and fix the issue
# Check CloudWatch logs for healing events
```

## File Structure Explanation

```
cloudscale-commerce/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # Main infrastructure configuration
│   ├── variables.tf       # Input variables
│   ├── outputs.tf         # Output values
│   ├── user_data.sh       # EC2 initialization script
│   ├── terraform.tfvars   # Your configuration values
│   └── versions.tf        # Provider versions
├── package.json           # Node.js dependencies
└── setup-guide.md         # This file
```

## Important Commands Reference

### Terraform Commands
```bash
# Initialize project
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure (when done testing)
terraform destroy

# Show current state
terraform show

# Get output values
terraform output

# Format code
terraform fmt

# Validate configuration
terraform validate
```

### AWS CLI Commands
```bash
# Check your identity
aws sts get-caller-identity

# List EC2 instances
aws ec2 describe-instances --region ap-south-1

# Check Auto Scaling Groups
aws autoscaling describe-auto-scaling-groups --region ap-south-1

# View CloudWatch alarms
aws cloudwatch describe-alarms --region ap-south-1

# List load balancers
aws elbv2 describe-load-balancers --region ap-south-1
```

## Troubleshooting

### Common Issues

#### 1. Terraform Permission Errors
```bash
# Error: User is not authorized to perform action
# Solution: Check IAM policies for your user
aws iam list-attached-user-policies --user-name terraform-user
```

#### 2. Region Not Supported
```bash
# Error: availability zone not supported
# Solution: Verify ap-south-1 region supports your instance type
aws ec2 describe-availability-zones --region ap-south-1
```

#### 3. Application Not Responding
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn [YOUR_TARGET_GROUP_ARN]

# Check instance logs
aws logs describe-log-groups --region ap-south-1
```

#### 4. Auto Scaling Not Working
```bash
# Check scaling policies
aws autoscaling describe-policies --region ap-south-1

# Check CloudWatch alarms
aws cloudwatch describe-alarms --alarm-names "cloudscale-commerce-cpu-high"
```

### Getting Help
- **AWS Documentation**: https://docs.aws.amazon.com/
- **Terraform Documentation**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **Self-Healing Module**: https://github.com/yashodhan271/terraform-aws-self-healing-infrastructure

## Cost Optimization

### Free Tier Resources
- **EC2**: 750 hours of t3.micro instances
- **ALB**: 750 hours
- **CloudWatch**: 10 metrics, 10 alarms

### Estimated Monthly Costs (Beyond Free Tier)
- **t3.micro instances (2)**: ~$15-20
- **Application Load Balancer**: ~$15-20
- **Data Transfer**: ~$5-10
- **CloudWatch**: ~$5
- **Total**: ~$40-55/month

### Cost Reduction Tips
1. Use **Spot Instances** for non-production
2. Set up **Budget Alerts** in AWS Console
3. **Stop instances** when not needed (development)
4. Use **Reserved Instances** for production

## Next Steps

1. **Monitor the system** for 24-48 hours to see auto-scaling in action
2. **Customize thresholds** based on your application's behavior
3. **Add SSL certificate** for HTTPS
4. **Set up CI/CD pipeline** for automated deployments
5. **Add database layer** (RDS with self-healing)
6. **Implement logging and alerting** improvements

## Security Best Practices

1. **Enable MFA** on your AWS account
2. **Use IAM roles** instead of access keys for EC2 instances
3. **Enable CloudTrail** for audit logging
4. **Regular security patches** via automated updates
5. **Network segmentation** with proper security groups

## Production Checklist

Before going to production:
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Security groups reviewed
- [ ] Instance types optimized
- [ ] Cost monitoring enabled
- [ ] Disaster recovery plan
- [ ] Documentation updated