#!/bin/bash

# CloudScale Commerce - Deployment Script
# This script deploys the complete infrastructure to AWS

set -e

echo "🚀 CloudScale Commerce - AWS Deployment Script"
echo "=============================================="

# Check if required tools are installed
check_requirements() {
    echo "✅ Checking requirements..."
    
    if ! command -v terraform &> /dev/null; then
        echo "❌ Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Initialize Terraform
init_terraform() {
    echo "🔧 Initializing Terraform..."
    terraform init
    echo "✅ Terraform initialized!"
}

# Validate configuration
validate_config() {
    echo "🔍 Validating Terraform configuration..."
    terraform validate
    if [ $? -eq 0 ]; then
        echo "✅ Configuration is valid!"
    else
        echo "❌ Configuration validation failed!"
        exit 1
    fi
}

# Plan deployment
plan_deployment() {
    echo "📋 Creating deployment plan..."
    terraform plan -out=tfplan
    echo "✅ Deployment plan created!"
    
    echo ""
    echo "📊 Deployment Summary:"
    echo "- Region: ap-south-1 (Mumbai)"
    echo "- Availability Zones: ap-south-1a, ap-south-1b"
    echo "- Auto Scaling: 2-10 instances"
    echo "- Instance Type: t3.micro (Free Tier eligible)"
    echo "- Self-Healing: Enabled"
    echo ""
    
    read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
}

# Deploy infrastructure
deploy_infrastructure() {
    echo "🚀 Deploying infrastructure..."
    echo "This may take 10-15 minutes..."
    
    start_time=$(date +%s)
    terraform apply tfplan
    end_time=$(date +%s)
    
    duration=$((end_time - start_time))
    echo "✅ Infrastructure deployed successfully in ${duration} seconds!"
}

# Display outputs
show_outputs() {
    echo ""
    echo "🎉 Deployment Complete!"
    echo "====================="
    echo ""
    echo "📊 Your CloudScale Commerce is now running:"
    echo ""
    echo "🌐 Application URL:"
    terraform output load_balancer_url
    echo ""
    echo "📈 CloudWatch Dashboard:"
    terraform output cloudwatch_dashboard_url
    echo ""
    echo "🔍 Auto Scaling Group:"
    echo "   Name: $(terraform output auto_scaling_group_name)"
    echo ""
    echo "🏗️ Infrastructure Details:"
    echo "   VPC ID: $(terraform output vpc_id)"
    echo "   Region: $(terraform output -json region_info | jq -r '.region')"
    echo ""
    echo "✉️ Email Notifications:"
    echo "   Check your email and confirm SNS subscription for alerts"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Visit the application URL to test the website"
    echo "   2. Check CloudWatch dashboard for real-time metrics"
    echo "   3. Generate load to test auto-scaling"
    echo "   4. Monitor self-healing capabilities"
    echo ""
}

# Main execution
main() {
    echo "Starting deployment process..."
    
    check_requirements
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        echo "⚠️  terraform.tfvars not found. Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        echo "📝 Please edit terraform.tfvars with your settings and run this script again."
        exit 1
    fi
    
    init_terraform
    validate_config
    plan_deployment
    deploy_infrastructure
    show_outputs
    
    echo "🎊 Deployment completed successfully!"
    echo "Your CloudScale Commerce platform is now live!"
}

# Error handling
trap 'echo "❌ Deployment failed! Check the errors above."; exit 1' ERR

# Run main function
main "$@"