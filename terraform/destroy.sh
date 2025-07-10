#!/bin/bash

# CloudScale Commerce - Destroy Script
# This script safely destroys all AWS infrastructure

set -e

echo "🗑️  CloudScale Commerce - Infrastructure Destruction"
echo "=================================================="

# Warning message
show_warning() {
    echo "⚠️  WARNING: This will destroy ALL infrastructure!"
    echo ""
    echo "This includes:"
    echo "- EC2 instances"
    echo "- Load balancers"
    echo "- Auto Scaling Groups"
    echo "- VPC and networking"
    echo "- CloudWatch dashboards and alarms"
    echo "- All data and configurations"
    echo ""
    echo "This action is IRREVERSIBLE!"
    echo ""
}

# Confirm destruction
confirm_destruction() {
    read -p "Are you absolutely sure you want to destroy everything? (type 'destroy' to confirm): " confirmation
    
    if [ "$confirmation" != "destroy" ]; then
        echo "❌ Destruction cancelled. Infrastructure preserved."
        exit 0
    fi
    
    echo ""
    read -p "Last chance! Type 'YES' to proceed with destruction: " final_confirmation
    
    if [ "$final_confirmation" != "YES" ]; then
        echo "❌ Destruction cancelled. Infrastructure preserved."
        exit 0
    fi
}

# Show current infrastructure
show_current_state() {
    echo "📊 Current Infrastructure State:"
    echo "================================"
    
    if terraform show &> /dev/null; then
        echo "✅ Infrastructure exists"
        echo ""
        echo "🌐 Application URL:"
        terraform output load_balancer_url 2>/dev/null || echo "Not available"
        echo ""
        echo "🏗️ Resources to be destroyed:"
        terraform state list 2>/dev/null | wc -l | xargs echo "   Total resources:"
    else
        echo "ℹ️  No infrastructure found to destroy"
        exit 0
    fi
    echo ""
}

# Plan destruction
plan_destruction() {
    echo "📋 Creating destruction plan..."
    terraform plan -destroy -out=destroy.tfplan
    echo "✅ Destruction plan created!"
    echo ""
}

# Execute destruction
execute_destruction() {
    echo "🗑️  Destroying infrastructure..."
    echo "This may take 5-10 minutes..."
    
    start_time=$(date +%s)
    terraform apply destroy.tfplan
    end_time=$(date +%s)
    
    duration=$((end_time - start_time))
    echo "✅ Infrastructure destroyed successfully in ${duration} seconds!"
}

# Cleanup local files
cleanup_files() {
    echo "🧹 Cleaning up local files..."
    
    # Remove Terraform state backup files
    rm -f terraform.tfstate.backup
    rm -f tfplan destroy.tfplan
    
    # Remove .terraform directory if user confirms
    read -p "Remove .terraform directory? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .terraform
        echo "✅ .terraform directory removed"
    fi
    
    echo "✅ Cleanup completed!"
}

# Main execution
main() {
    show_warning
    show_current_state
    confirm_destruction
    plan_destruction
    execute_destruction
    cleanup_files
    
    echo ""
    echo "🎉 Infrastructure Destruction Complete!"
    echo "======================================"
    echo ""
    echo "✅ All AWS resources have been destroyed"
    echo "✅ No ongoing charges will be incurred"
    echo "ℹ️  You can redeploy anytime using ./deploy.sh"
    echo ""
}

# Error handling
trap 'echo "❌ Destruction failed! Check the errors above."; exit 1' ERR

# Run main function
main "$@"