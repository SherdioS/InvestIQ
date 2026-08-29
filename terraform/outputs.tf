
output "AZURE_SEARCH_ENDPOINT" {
    description = "Endpoint URL of the Azure Cognitive Search service."
    value       = azurerm_search_service.az_ai_search.endpoint
}

output "AZURE_SEARCH_API_KEY" {
    description = "Primary key for the Azure Cognitive Search service."
    value       = azurerm_search_service.az_ai_search.primary_key
    sensitive   = true
}

output "POSTGRES_HOST" {
    description = "Host URL of the Azure PostgreSQL flexible server."
    value       = azurerm_postgresql_flexible_server.az_postgresql.fqdn
}

output "AZURE_OPENAI_ENDPOINT" {
    description = "Endpoint URL of the Azure OpenAI service."
    value       = azurerm_cognitive_account.az_foundry.endpoint
}

output "AZURE_OPENAI_API_KEY" {
    description = "Primary key for the Azure OpenAI service."
    value       = azurerm_cognitive_account.az_foundry.primary_access_key
    sensitive   = true
}
