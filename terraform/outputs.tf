# Outputs for CloudScale Commerce Infrastructure

output "load_balancer_dns" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_url" {
  description = "Full URL of the Application Load Balancer"
  value       = "http://${aws_lb.main.dns_name}"
}

output "load_balancer_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "auto_scaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.web.name
}

output "auto_scaling_group_arn" {
  description = "ARN of the Auto Scaling Group"
  value       = aws_autoscaling_group.web.arn
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "security_group_web_id" {
  description = "ID of the web security group"
  value       = aws_security_group.web.id
}

output "security_group_alb_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

# output "cloudwatch_dashboard_url" {
#   description = "URL to the CloudWatch dashboard"
#   value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.application_dashboard.dashboard_name}"
# }

# output "self_healing_sns_topic_arn" {
#   description = "ARN of the SNS topic for self-healing notifications"
#   value       = module.self_healing_infrastructure.sns_topic_arn
# }

# output "self_healing_dashboard_name" {
#   description = "Name of the self-healing CloudWatch dashboard"
#   value       = module.self_healing_infrastructure.dashboard_name
# }

output "availability_zones" {
  description = "Availability zones used for deployment"
  value       = data.aws_availability_zones.available.names
}

output "launch_template_id" {
  description = "ID of the launch template"
  value       = aws_launch_template.web.id
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.web.arn
}

output "cpu_high_alarm_arn" {
  description = "ARN of the CPU high alarm"
  value       = aws_cloudwatch_metric_alarm.cpu_high.arn
}

output "cpu_low_alarm_arn" {
  description = "ARN of the CPU low alarm"
  value       = aws_cloudwatch_metric_alarm.cpu_low.arn
}

output "scale_up_policy_arn" {
  description = "ARN of the scale up policy"
  value       = aws_autoscaling_policy.scale_up.arn
}

output "scale_down_policy_arn" {
  description = "ARN of the scale down policy"
  value       = aws_autoscaling_policy.scale_down.arn
}

# Regional information
output "region_info" {
  description = "Information about the AWS region and availability zones"
  value = {
    region              = var.aws_region
    availability_zones  = data.aws_availability_zones.available.names
    public_subnets     = {
      for i, subnet in aws_subnet.public : 
      data.aws_availability_zones.available.names[i] => subnet.id
    }
    private_subnets    = {
      for i, subnet in aws_subnet.private : 
      data.aws_availability_zones.available.names[i] => subnet.id
    }
  }
}