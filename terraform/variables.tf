variable "project_prefix" {
    description = "Prefix for Azure resource names."
    type        = string
    default     = "investiq"
}

variable "environment" {
    description = "Deployment environment suffix for Azure resource names."
    type        = string
    default     = "dev"
}

variable "resource_group_name" {
    description = "Azure resource group to deploy resources into."
    type        = string
    default     = "InvestIQ-dev"
}

variable "location" {
    description = "Azure region for deployments."
    type        = string
    default     = "eastus"
}

variable "postgres_admin_login" {
    description = "Administrator login name for PostgreSQL flexible server."
    type        = string
    default     = "aaitech"
}

variable "postgres_admin_password" {
    description = "Administrator password for PostgreSQL flexible server."
    type        = string
    default     = "rag@12345"
    sensitive   = true
}
