# Variables for CloudScale Commerce Infrastructure

variable "aws_region" {
  description = "AWS region for deployment (must support ap-south-1a and ap-south-1b)"
  type        = string
  default     = "ap-south-1"
  
  validation {
    condition     = can(regex("^ap-south-1$", var.aws_region))
    error_message = "AWS region must be ap-south-1 for this project."
  }
}

variable "project_name" {
  description = "Name of the project used for resource naming"
  type        = string
  default     = "cloudscale-commerce"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "instance_type" {
  description = "EC2 instance type for web servers"
  type        = string
  default     = "t3.micro"
}

variable "min_instances" {
  description = "Minimum number of instances in Auto Scaling Group"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances in Auto Scaling Group"
  type        = number
  default     = 3
}

variable "desired_instances" {
  description = "Desired number of instances in Auto Scaling Group"
  type        = number
  default     = 1
}

variable "application_repository" {
  description = "Git repository URL for the application code"
  type        = string
  default     = "https://github.com/NandiniSrivastava/CloudScale-Commerce.git"
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "cpu_scale_up_threshold" {
  description = "CPU utilization threshold for scaling up"
  type        = number
  default     = 70
}

variable "cpu_scale_down_threshold" {
  description = "CPU utilization threshold for scaling down"
  type        = number
  default     = 30
}

variable "health_check_grace_period" {
  description = "Health check grace period for Auto Scaling Group (seconds)"
  type        = number
  default     = 1200
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "CloudScale Commerce"
    Environment = "dev"
    ManagedBy   = "Terraform"
    Owner       = "DevOps Team"
  }
}

variable "notification_email" {
  description = "Email address for AWS notifications"
  type        = string
  default     = ""
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS (optional)"
  type        = string
  default     = ""
}
variable "port" {
  description = "Port number for Node.js app"
  type        = number
  default     = 5000
}
