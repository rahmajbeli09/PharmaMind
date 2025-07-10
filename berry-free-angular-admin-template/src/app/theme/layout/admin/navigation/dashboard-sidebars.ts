import { NavigationItem } from './navigation';

type UserRole = 'ADMIN' | 'ADMINPH' | 'PHARMACIEN';

export const ADMIN_SIDEBAR: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    title: 'Tableau de bord Admin',
    type: 'group',
    icon: 'ti ti-layout-dashboard',
    children: [
      {
        id: 'demandes-inscription',
        title: '📄 Demandes d\'inscription',
        type: 'item',
        url: '/admin/demandes-inscription',
        icon: 'ti ti-file-text',
        role: 'ADMIN'
      },
      {
        id: 'utilisateurs',
        title: '🔐 Utilisateurs',
        type: 'item',
        url: '/admin/utilisateurs',
        icon: 'ti ti-users',
        role: 'ADMIN'
      },
      {
        id: 'reclamations',
        title: '📢 Réclamations',
        type: 'item',
        url: '/admin/reclamations',
        icon: 'ti ti-alert-circle',
        role: 'ADMIN'
      },
      {
        id: 'statistiques-admin',
        title: '📊 Statistiques',
        type: 'item',
        url: '/admin/statistiques',
        icon: 'ti ti-chart-bar',
        role: 'ADMIN'
      }
    ]
  }
];

export const RESPONSABLE_PH_SIDEBAR: NavigationItem[] = [
  {
    id: 'responsable-dashboard',
    title: 'Tableau de bord Responsable',
    type: 'group',
    icon: 'ti ti-layout-dashboard',
    children: [
      {
        id: 'gerer-pharmaciens',
        title: '👨‍🔬 Gérer les pharmaciens',
        type: 'item',
        url: '/responsable/pharmaciens',
        icon: 'ti ti-user-plus',
        role: 'ADMINPH'
      },
      {
        id: 'stock-alertes',
        title: '📦 Stock & alertes',
        type: 'item',
        url: '/responsable/stock',
        icon: 'ti ti-package',
        role: 'ADMINPH'
      },
      {
        id: 'ventes',
        title: '💊 Ventes',
        type: 'item',
        url: '/responsable/ventes',
        icon: 'ti ti-shopping-cart',
        role: 'ADMINPH'
      },
      {
        id: 'statistiques-responsable',
        title: '📊 Statistiques',
        type: 'item',
        url: '/responsable/statistiques',
        icon: 'ti ti-chart-bar',
        role: 'ADMINPH'
      }
    ]
  }
];

export const PHARMACIEN_SIDEBAR: NavigationItem[] = [
  {
    id: 'pharmacien-dashboard',
    title: 'Tableau de bord Pharmacien',
    type: 'group',
    icon: 'ti ti-layout-dashboard',
    children: [
      {
        id: 'stock',
        title: '📦 Stock',
        type: 'item',
        url: '/pharmacien/stock',
        icon: 'ti ti-package',
        role: 'PHARMACIEN'
      },
      {
        id: 'vente-medicaments',
        title: '📤 Vente de médicaments',
        type: 'item',
        url: '/pharmacien/ventes',
        icon: 'ti ti-cash',
        role: 'PHARMACIEN'
      }
    ]
  }
];

export function getSidebarByRole(role: UserRole): NavigationItem[] {
  switch (role) {
    case 'ADMIN':
      return ADMIN_SIDEBAR;
    case 'ADMINPH':
      return RESPONSABLE_PH_SIDEBAR;
    case 'PHARMACIEN':
      return PHARMACIEN_SIDEBAR;
    default:
      return [];
  }
}
