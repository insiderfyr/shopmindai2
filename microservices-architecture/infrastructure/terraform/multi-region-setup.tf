# Multi-Region Active-Active Deployment for LibreChat
# Inspired by Netflix, Uber, and AWS best practices

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

# Variables
variable "regions" {
  description = "List of AWS regions for multi-region deployment"
  type        = list(string)
  default     = ["us-east-1", "eu-west-1", "ap-southeast-1"]
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "librechat"
}

# Data sources
data "aws_availability_zones" "available" {
  count = length(var.regions)
  
  provider = aws.region[count.index]
  state    = "available"
}

# Provider configurations for multi-region
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu-west-1"
  region = "eu-west-1"
}

provider "aws" {
  alias  = "ap-southeast-1"
  region = "ap-southeast-1"
}

# Global Resources

# Route 53 Hosted Zone
resource "aws_route53_zone" "librechat" {
  name = "librechat.ai"
  
  tags = {
    Name        = "librechat-zone"
    Environment = var.environment
    Project     = "librechat"
  }
}

# CloudFront Distribution for Global CDN
resource "aws_cloudfront_distribution" "librechat" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "LibreChat Global CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_All"

  # Multiple origins for multi-region active-active
  dynamic "origin" {
    for_each = var.regions
    content {
      domain_name = "api-${origin.value}.librechat.ai"
      origin_id   = "librechat-${origin.value}"
      
      custom_origin_config {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
      
      origin_shield {
        enabled              = true
        origin_shield_region = origin.value
      }
    }
  }

  # Intelligent routing based on latency
  ordered_cache_behavior {
    path_pattern           = "/api/v1/ai/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "librechat-us-east-1"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    # Cache AI responses for 1 hour
    default_ttl = 3600
    max_ttl     = 86400
    min_ttl     = 0

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "X-API-Key", "X-User-ID"]
      
      cookies {
        forward = "none"
      }
    }

    # Lambda@Edge for intelligent routing
    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = aws_lambda_function.intelligent_routing.qualified_arn
      include_body = true
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "librechat-us-east-1"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    default_ttl = 0
    max_ttl     = 31536000
    min_ttl     = 0

    forwarded_values {
      query_string = true
      headers      = ["*"]
      
      cookies {
        forward = "all"
      }
    }
  }

  # Geographic restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.librechat.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Web Application Firewall
  web_acl_id = aws_wafv2_web_acl.librechat.arn

  tags = {
    Name        = "librechat-cdn"
    Environment = var.environment
  }
}

# Lambda@Edge for Intelligent Routing
resource "aws_lambda_function" "intelligent_routing" {
  provider = aws.us-east-1 # Lambda@Edge must be in us-east-1
  
  filename         = "intelligent-routing.zip"
  function_name    = "librechat-intelligent-routing"
  role            = aws_iam_role.lambda_edge_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.intelligent_routing.output_base64sha256
  runtime         = "nodejs18.x"
  timeout         = 5
  publish         = true

  environment {
    variables = {
      REGIONS = jsonencode(var.regions)
    }
  }

  tags = {
    Name        = "librechat-intelligent-routing"
    Environment = var.environment
  }
}

# Regional Infrastructure
module "region_infrastructure" {
  source = "./modules/region"
  count  = length(var.regions)

  providers = {
    aws = aws.region[count.index]
  }

  region           = var.regions[count.index]
  environment      = var.environment
  cluster_name     = "${var.cluster_name}-${var.regions[count.index]}"
  availability_zones = data.aws_availability_zones.available[count.index].names

  # Global resources
  route53_zone_id = aws_route53_zone.librechat.zone_id
  
  # Cross-region dependencies
  peer_regions = [for i, region in var.regions : {
    region = region
    vpc_id = module.region_infrastructure[i].vpc_id
    cidr   = module.region_infrastructure[i].vpc_cidr
  } if i != count.index]
}

# Global Database - CockroachDB for multi-region ACID transactions
module "cockroachdb_cluster" {
  source = "./modules/cockroachdb"

  regions     = var.regions
  environment = var.environment
  
  cluster_config = {
    instance_type = "c5.2xlarge"
    storage_size  = "500"
    storage_type  = "gp3"
    replica_count = 3
  }

  depends_on = [module.region_infrastructure]
}

# Global Event Store - EventStore Cloud
resource "aws_route53_record" "eventstore_global" {
  zone_id = aws_route53_zone.librechat.zone_id
  name    = "eventstore"
  type    = "CNAME"
  ttl     = 300
  
  set_identifier = "global"
  
  geolocation_routing_policy {
    continent = "NA"
  }
  
  records = [module.region_infrastructure[0].eventstore_endpoint]
}

# Global Redis Cluster with Cross-Region Replication
resource "aws_elasticache_global_replication_group" "librechat" {
  global_replication_group_id_suffix = "librechat-global"
  description                        = "LibreChat Global Redis Cluster"

  primary_replication_group_id = module.region_infrastructure[0].redis_replication_group_id
  
  # Enable automatic failover
  automatic_failover_enabled = true
  
  # Global parameters
  parameter_group_name = "default.redis7.cluster.on"
  
  tags = {
    Name        = "librechat-global-redis"
    Environment = var.environment
  }
}

# WAF for Global Protection
resource "aws_wafv2_web_acl" "librechat" {
  provider = aws.us-east-1 # CloudFront requires WAF in us-east-1
  
  name  = "librechat-waf"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            search_string = "/api/"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "STARTS_WITH"
          }
        }
      }
    }

    action {
      block {}
    }

    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
    }
  }

  # Bot control rule
  rule {
    name     = "BotControlRule"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesBotControlRuleSet"
        vendor_name = "AWS"
      }
    }

    action {
      allow {}
    }

    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "BotControlRule"
    }
  }

  # Known bad inputs rule
  rule {
    name     = "KnownBadInputsRule"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    action {
      block {}
    }

    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRule"
    }
  }

  tags = {
    Name        = "librechat-waf"
    Environment = var.environment
  }
}

# SSL Certificate for Global Domain
resource "aws_acm_certificate" "librechat" {
  provider = aws.us-east-1 # CloudFront requires certificate in us-east-1
  
  domain_name               = "librechat.ai"
  subject_alternative_names = [
    "*.librechat.ai",
    "api.librechat.ai",
    "auth.librechat.ai",
    "ai.librechat.ai"
  ]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "librechat-ssl"
    Environment = var.environment
  }
}

# Certificate validation
resource "aws_acm_certificate_validation" "librechat" {
  provider = aws.us-east-1
  
  certificate_arn         = aws_acm_certificate.librechat.arn
  validation_record_fqdns = [for record in aws_route53_record.librechat_validation : record.fqdn]
}

resource "aws_route53_record" "librechat_validation" {
  for_each = {
    for dvo in aws_acm_certificate.librechat.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.librechat.zone_id
}

# Global Health Checks for Automatic Failover
resource "aws_route53_health_check" "region_health" {
  count = length(var.regions)

  fqdn                            = "api-${var.regions[count.index]}.librechat.ai"
  port                            = 443
  type                            = "HTTPS"
  resource_path                   = "/health"
  failure_threshold               = 3
  request_interval                = 30
  cloudwatch_alarm_region         = var.regions[count.index]
  cloudwatch_alarm_name           = "librechat-${var.regions[count.index]}-health"
  insufficient_data_health_status = "Failure"

  tags = {
    Name        = "librechat-health-${var.regions[count.index]}"
    Environment = var.environment
  }
}

# DNS Records with Health Check Routing
resource "aws_route53_record" "api_regional" {
  count = length(var.regions)

  zone_id = aws_route53_zone.librechat.zone_id
  name    = "api"
  type    = "A"
  ttl     = 60

  set_identifier = var.regions[count.index]
  
  # Latency-based routing with health checks
  latency_routing_policy {
    region = var.regions[count.index]
  }
  
  health_check_id = aws_route53_health_check.region_health[count.index].id
  
  records = [module.region_infrastructure[count.index].load_balancer_ip]
}

# Global Outputs
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.librechat.domain_name
}

output "global_database_endpoints" {
  description = "CockroachDB global cluster endpoints"
  value       = module.cockroachdb_cluster.endpoints
}

output "regional_clusters" {
  description = "EKS cluster details for each region"
  value = {
    for i, region in var.regions : region => {
      cluster_name     = module.region_infrastructure[i].cluster_name
      cluster_endpoint = module.region_infrastructure[i].cluster_endpoint
      vpc_id          = module.region_infrastructure[i].vpc_id
    }
  }
}

# Lambda@Edge Function for Intelligent Routing
data "archive_file" "intelligent_routing" {
  type        = "zip"
  output_path = "intelligent-routing.zip"
  
  source {
    content = <<EOF
'use strict';

const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });

exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    
    // Get user's geolocation
    const country = headers['cloudfront-viewer-country'] ? 
                   headers['cloudfront-viewer-country'][0].value : 'US';
    
    // Intelligent region selection based on:
    // 1. User location
    // 2. Current load
    // 3. Health status
    const optimalRegion = await selectOptimalRegion(country);
    
    // Update origin based on optimal region
    request.origin = {
        custom: {
            domainName: `api-${optimalRegion}.librechat.ai`,
            port: 443,
            protocol: 'https',
            path: '/api'
        }
    };
    
    // Add routing headers
    headers['x-routed-region'] = [{ key: 'X-Routed-Region', value: optimalRegion }];
    headers['x-request-id'] = [{ key: 'X-Request-ID', value: generateRequestId() }];
    
    return request;
};

async function selectOptimalRegion(country) {
    const regionMapping = {
        'US': 'us-east-1',
        'CA': 'us-east-1',
        'GB': 'eu-west-1',
        'DE': 'eu-west-1',
        'FR': 'eu-west-1',
        'JP': 'ap-southeast-1',
        'KR': 'ap-southeast-1',
        'SG': 'ap-southeast-1'
    };
    
    const primaryRegion = regionMapping[country] || 'us-east-1';
    
    // Check region health (simplified)
    try {
        const params = {
            MetricName: 'HealthyHostCount',
            Namespace: 'AWS/ApplicationELB',
            StartTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            EndTime: new Date(),
            Period: 300,
            Statistics: ['Average'],
            Dimensions: [
                {
                    Name: 'LoadBalancer',
                    Value: `librechat-${primaryRegion}`
                }
            ]
        };
        
        const data = await cloudwatch.getMetricStatistics(params).promise();
        
        if (data.Datapoints.length > 0 && data.Datapoints[0].Average > 0) {
            return primaryRegion;
        }
    } catch (error) {
        console.log('Health check failed, using fallback');
    }
    
    // Fallback to us-east-1
    return 'us-east-1';
}

function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
EOF
    filename = "index.js"
  }
}

# IAM Role for Lambda@Edge
resource "aws_iam_role" "lambda_edge_role" {
  provider = aws.us-east-1
  
  name = "librechat-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_edge_basic" {
  provider = aws.us-east-1
  
  role       = aws_iam_role.lambda_edge_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_edge_cloudwatch" {
  provider = aws.us-east-1
  
  name = "lambda-edge-cloudwatch"
  role = aws_iam_role.lambda_edge_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      }
    ]
  })
}

# Global Data Synchronization with DynamoDB Global Tables
resource "aws_dynamodb_table" "global_state" {
  for_each = toset(var.regions)
  
  provider = aws.region[index(var.regions, each.value)]
  
  name           = "librechat-global-state"
  billing_mode   = "PAY_PER_REQUEST"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  global_secondary_index {
    name     = "GSI1"
    hash_key = "GSI1PK"
    range_key = "GSI1SK"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name        = "librechat-global-state"
    Environment = var.environment
    Region      = each.value
  }
}

# Global Tables Configuration
resource "aws_dynamodb_global_table" "librechat_global" {
  depends_on = [aws_dynamodb_table.global_state]
  
  name = "librechat-global-state"

  dynamic "replica" {
    for_each = var.regions
    content {
      region_name = replica.value
    }
  }
}

# Monitoring and Alerting
resource "aws_cloudwatch_dashboard" "global" {
  dashboard_name = "LibreChat-Global-Dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            for region in var.regions : [
              "AWS/ApplicationELB",
              "RequestCount",
              "LoadBalancer",
              "librechat-${region}"
            ]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "Global Request Count by Region"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            for region in var.regions : [
              "AWS/ApplicationELB",
              "TargetResponseTime",
              "LoadBalancer",
              "librechat-${region}"
            ]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "Global Response Time by Region"
          period  = 300
        }
      }
    ]
  })
}

# Global SNS Topic for Alerts
resource "aws_sns_topic" "global_alerts" {
  name = "librechat-global-alerts"
  
  tags = {
    Name        = "librechat-global-alerts"
    Environment = var.environment
  }
}

# CloudWatch Alarms for Global Health
resource "aws_cloudwatch_metric_alarm" "global_error_rate" {
  alarm_name          = "librechat-global-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "This metric monitors global 4XX error rate"
  alarm_actions       = [aws_sns_topic.global_alerts.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.librechat.id
  }

  tags = {
    Name        = "librechat-global-error-rate"
    Environment = var.environment
  }
}