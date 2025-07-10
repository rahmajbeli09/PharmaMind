export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

// Fonction pour obtenir les éléments de navigation en fonction du rôle
export function getNavigationItems(role: string): NavigationItem[] {
  // Navigation de base commune à tous les rôles
  const commonItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      type: 'item',
      icon: 'ti ti-dashboard',
      url: '/dashboard',
      breadcrumbs: false
    }
  ];

  // Éléments spécifiques à l'admin
  const adminItems: NavigationItem[] = [
    {
      id: 'inscription-requests',
      title: ' Demandes d\'inscription',
      type: 'item',
      icon: 'ti ti-file-text',
      url: '/admin/inscription-requests',
      role: ['ADMIN']
    },
    {
      id: 'users',
      title: ' Utilisateurs',
      type: 'item',
      icon: 'ti ti-users',
      url: '/admin/users',
      role: ['ADMIN']
    },
    {
      id: 'reclamations',
      title: ' Réclamations',
      type: 'item',
      icon: 'ti ti-alert-circle',
      url: '/admin/reclamations',
      role: ['ADMIN']
    },
    {
      id: 'admin-stats',
      title: ' Statistiques',
      type: 'item',
      icon: 'ti ti-chart-bar',
      url: '/admin/statistiques',
      role: ['ADMIN']
    }
  ];

  // Éléments spécifiques à l'admin de pharmacie
  const adminPhItems: NavigationItem[] = [
    {
      id: 'gestion-pharmaciens',
      title: ' Gérer les pharmaciens',
      type: 'item',
      icon: 'ti ti-user-check',
      url: '/admin-ph/pharmaciens',
      role: ['ADMINPH']
    },
    {
      id: 'stock',
      title: ' Stock & alertes',
      type: 'item',
      icon: 'ti ti-package',
      url: '/admin-ph/stock',
      role: ['ADMINPH']
    },
    {
      id: 'ventes',
      title: ' Ventes',
      type: 'item',
      icon: 'ti ti-shopping-cart',
      url: '/admin-ph/ventes',
      role: ['ADMINPH']
    },
    {
      id: 'ph-stats',
      title: ' Statistiques',
      type: 'item',
      icon: 'ti ti-chart-bar',
      url: '/admin-ph/statistiques',
      role: ['ADMINPH']
    }
  ];

  // Éléments spécifiques au pharmacien
  const pharmacienItems: NavigationItem[] = [
    {
      id: 'pharmacien-stock',
      title: ' Stock',
      type: 'item',
      icon: 'ti ti-package',
      url: '/pharmacien/stock',
      role: ['PHARMACIEN']
    },
    {
      id: 'vente-medicaments',
      title: ' Vente de médicaments',
      type: 'item',
      icon: 'ti ti-cash',
      url: '/pharmacien/vente',
      role: ['PHARMACIEN']
    }
  ];

  // Filtrer les éléments en fonction du rôle
  const filteredItems = [
    ...commonItems,
    ...adminItems.filter(item => !item.role || item.role.includes(role)),
    ...adminPhItems.filter(item => !item.role || item.role.includes(role)),
    ...pharmacienItems.filter(item => !item.role || item.role.includes(role))
  ];

  return filteredItems;
}

// Cette ligne est conservée pour la compatibilité
export const NavigationItems: NavigationItem[] = [];
