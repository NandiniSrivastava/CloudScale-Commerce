# CloudScale Commerce - Quick Deployment Guide

## 🚀 Fixed Terraform Configuration

I've resolved the duplicate module issue and properly configured the infrastructure to use:
- **yashodhan271's self-healing module** from Terraform Registry (version 1.0.0)
- **Your repository** (https://github.com/NandiniSrivastava/CloudScale-Commerce.git) for application code
- **Proper AWS infrastructure** for ap-south-1 region

## 📋 Step-by-Step Deployment

### 1. Prerequisites Setup (5 minutes)

```bash
# Install AWS CLI (Windows)
winget install Amazon.AWSCLI

# Install Terraform (Windows) 
winget install Hashicorp.Terraform

# Verify installations
aws --version
terraform --version
```

### 2. AWS Account Configuration (3 minutes)

```bash
# Configure AWS credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region: ap-south-1
# - Default output format: json

# Test connection
aws sts get-caller-identity
```

### 3. Project Setup (2 minutes)

```bash
# Clone your repository
git clone https://github.com/NandiniSrivastava/CloudScale-Commerce.git
cd CloudScale-Commerce

# Navigate to terraform directory
cd terraform

# Copy and edit configuration
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars  # Edit with your settings
```

### 4. Deploy Infrastructure (15 minutes)

#### Option A: Automated Deployment (Recommended)
```bash
# Run the deployment script
./deploy.sh
```

#### Option B: Manual Deployment
```bash
# Initialize and deploy
terraform init
terraform plan
terraform apply
```

## 🔧 Key Configuration Changes Made

### Fixed Terraform Issues:
1. **Removed duplicate module calls** - Now uses single self-healing module
2. **Fixed repository reference** - Points to yashodhan271's Terraform Registry module
3. **Updated user_data.sh** - Clones your repository automatically
4. **Added proper versioning** - Uses stable v1.0.0 of self-healing module

### Module Structure:
```hcl
# Uses Terraform Registry (stable)
module "self_healing_infrastructure" {
  source = "yashodhan271/aws-self-healing-infrastructure/aws"
  version = "1.0.0"
  
  region      = var.aws_region
  name_prefix = var.project_name
  # ... configuration
}
```

### Application Repository Integration:
- EC2 instances automatically clone your repository
- Installs dependencies with `npm install`
- Builds and runs your application
- Fallback to simple health endpoint if needed

## 📊 What Gets Deployed

### AWS Infrastructure:
- **VPC** with public/private subnets in ap-south-1a & ap-south-1b
- **Application Load Balancer** with health checks
- **Auto Scaling Group** (2-10 instances, t3.micro)
- **CloudWatch** monitoring and alarms
- **Self-healing capabilities** from yashodhan271 module

### Self-Healing Features:
- Automatic instance recovery
- Configuration drift detection
- Performance-based healing
- SNS notifications for events

### Scaling Triggers:
- **Scale Up**: CPU > 70% for 4 minutes
- **Scale Down**: CPU < 30% for 4 minutes

## 🎯 Expected Outputs

After deployment, you'll get:
```bash
load_balancer_url = "http://cloudscale-commerce-alb-123456789.ap-south-1.elb.amazonaws.com"
cloudwatch_dashboard_url = "https://ap-south-1.console.aws.amazon.com/cloudwatch/..."
auto_scaling_group_name = "cloudscale-commerce-asg"
```

## 🧪 Testing Auto-Scaling

### Generate Load:
```bash
# Install Apache Bench
# Windows: Download from Apache website
# Linux: sudo apt install apache2-utils

# Generate load to trigger scaling
ab -n 10000 -c 100 http://[your-load-balancer-url]/
```

### Monitor in AWS Console:
1. **EC2 → Auto Scaling Groups** - Watch instance count increase
2. **CloudWatch → Dashboards** - View real-time metrics
3. **CloudWatch → Alarms** - Check CPU threshold alarms

## 🗑️ Cleanup (When Done Testing)

```bash
# Destroy all infrastructure
./destroy.sh

# Or manually
terraform destroy
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Module not found"**
   - Solution: Run `terraform init` to download modules

2. **"AWS credentials not configured"**
   - Solution: Run `aws configure` with valid credentials

3. **"Region not supported"**
   - Solution: Verify ap-south-1 supports your instance type

4. **"Application not responding"**
   - Check target group health in EC2 console
   - View EC2 instance logs

### Cost Monitoring:
- **Expected cost**: $40-55/month beyond free tier
- **Free tier eligible**: t3.micro instances (750 hours/month)
- **Set up billing alerts** in AWS Console

## 📞 Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Review Terraform error messages
3. Verify AWS credentials and permissions
4. Ensure region supports required services

Your infrastructure is now ready to demonstrate enterprise-grade auto-scaling with self-healing capabilities!