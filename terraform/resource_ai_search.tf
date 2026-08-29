resource "azurerm_search_service" "az_ai_search" {
    depends_on = [azurerm_resource_group.rg, random_id.suffix]
    name                = "${var.project_prefix}-search-${var.environment}-${random_id.suffix.hex}"
    resource_group_name = azurerm_resource_group.rg.name
    location            = var.location
    semantic_search_sku = "free"
    sku                 = "basic"
    authentication_failure_mode = "http401WithBearerChallenge"
    local_authentication_enabled = true
}
