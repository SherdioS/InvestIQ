resource "azurerm_resource_group" "rg" {
    name     = var.resource_group_name
    location = var.location
}

resource "random_id" "suffix" {
    byte_length = 4
}
