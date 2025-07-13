# Region
aws_region = "ap-south-1"

# The name of your project (important: must match what user_data.sh expects)
project_name = "cloudscale-commerce"

# EC2 instance type
instance_type = "t3.micro"

# Auto Scaling configuration
min_instances = 1
max_instances = 3
desired_instances = 1

# Notification email (optional, for scaling alerts)
notification_email = "nans.srivastava16@gmail.com"

cpu_scale_up_threshold   = 50
cpu_scale_down_threshold = 20

health_check_grace_period = 1200

# Tags applied to resources
common_tags = {
  Project     = "CloudScale Commerce"
  Environment = "production"
  Owner       = "Your Name"
}
