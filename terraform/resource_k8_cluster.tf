resource "azurerm_kubernetes_cluster" "az_aks" {
    depends_on                          = [azurerm_resource_group.rg, random_id.suffix]
    name                                = "${var.project_prefix}-aks-${var.environment}-${random_id.suffix.hex}"
    location                            = var.location
    resource_group_name                 = azurerm_resource_group.rg.name
    dns_prefix                          = "${var.project_prefix}-aks-dns-${var.environment}-${random_id.suffix.hex}"
    kubernetes_version                  = "1.35.6"
    sku_tier                            = "Free"
    support_plan                        = "KubernetesOfficial"

    default_node_pool {
        name                          = "investiqnode"
        node_count                    = 1
        kubelet_disk_type             = "OS"
        max_pods                      = 110
        orchestrator_version          = "1.35.6"
        os_disk_size_gb               = 128
        os_disk_type                  = "Managed"
        os_sku                        = "Ubuntu"
        type                          = "VirtualMachineScaleSets"
        vm_size                       = "Standard_A2_v2"
    }

    node_provisioning_profile {
        default_node_pools = "None"
        mode               = "Manual"
    }

    identity {
        type = "SystemAssigned"
    }
}
