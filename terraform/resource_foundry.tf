resource "azurerm_cognitive_account" "az_foundry" {
    depends_on = [azurerm_resource_group.rg, random_id.suffix]
    name                = "${var.project_prefix}-foundry-${var.environment}-${random_id.suffix.hex}"
    location            = var.location
    resource_group_name = azurerm_resource_group.rg.name
    kind                = "AIServices"
    sku_name            = "S0"
}


resource "azurerm_cognitive_deployment" "text-embedding" {
    name                 = "text-embedding-deployment"
    cognitive_account_id = azurerm_cognitive_account.az_foundry.id

    model {
        format  = "OpenAI"
        name    = "text-embedding-ada-002"
        version = "2"
    }

    sku {
        name = "GlobalStandard"
        capacity = 150
    }
}

resource "azurerm_cognitive_deployment" "gpt-5" {
    name                 = "gpt-5-deployment"
    cognitive_account_id = azurerm_cognitive_account.az_foundry.id

    model {
        format  = "OpenAI"
        name    = "gpt-5"
        version = "2025-08-07"
    }

    sku {
        name = "GlobalStandard"
        capacity = 150
    }
}
