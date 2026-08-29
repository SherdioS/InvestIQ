resource "azurerm_postgresql_flexible_server" "az_postgresql" {
    depends_on = [azurerm_resource_group.rg, random_id.suffix]
    name                              = "${var.project_prefix}-postgres-${var.environment}-${random_id.suffix.hex}"
    resource_group_name               = azurerm_resource_group.rg.name
    location                          = "eastus2"
    sku_name                          = "B_Standard_B1ms"
    storage_mb                        = 32768
    storage_tier                      = "P4"
    version                           = "18"
    public_network_access_enabled     = true
    zone = 1

    administrator_login               = var.postgres_admin_login
    administrator_password            = var.postgres_admin_password
}
