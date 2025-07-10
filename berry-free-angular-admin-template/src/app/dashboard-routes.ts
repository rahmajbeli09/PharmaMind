import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard-admin',
    loadComponent: () => import('./demo/dashboard/admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  },
  {
    path: 'admin/demandes-inscription',
    loadComponent: () => import('./demo/admin/demandes-inscription/demandes-inscription.component').then(m => m.DemandesInscriptionComponent)
  },
  {
    path: 'admin/utilisateurs',
    loadComponent: () => import('./demo/admin/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
  },
  {
    path: 'admin/reclamations',
    loadComponent: () => import('./demo/admin/reclamations/reclamations.component').then(m => m.ReclamationsComponent)
  },
  {
    path: 'admin/statistiques',
    loadComponent: () => import('./demo/admin/statistiques/statistiques.component').then(m => m.StatistiquesComponent)
  }
];

export const RESPONSABLE_PHARMACIE_ROUTES: Routes = [
  {
    path: 'dashboard/responsable-pharmacie',
    loadComponent: () => import('./demo/dashboard/responsable-pharmacie/dashboard-responsable-pharmacie.component').then(m => m.DashboardResponsablePharmacieComponent)
  },
  {
    path: 'responsable/pharmaciens',
    loadComponent: () => import('./demo/responsable/pharmaciens/pharmaciens.component').then(m => m.PharmaciensComponent)
  },
  {
    path: 'responsable/stock',
    loadComponent: () => import('./demo/responsable/stock/stock/stock.component').then(m => m.StockComponent)
  },
  {
    path: 'responsable/ventes',
    loadComponent: () => import('./demo/responsable/ventes/ventes/ventes.component').then(m => m.VentesComponent)
  },
  {
    path: 'responsable/statistiques',
    loadComponent: () => import('./demo/responsable/statistiques/statistiques/statistiques.component').then(m => m.StatistiquesComponent)
  }
];

export const PHARMACIEN_ROUTES: Routes = [
  {
    path: 'dashboard/pharmacien',
    loadComponent: () => import('./demo/dashboard/pharmacien/dashboard-pharmacien.component').then(m => m.DashboardPharmacienComponent)
  },
  {
    path: 'pharmacien/stock',
    loadComponent: () => import('./demo/pharmacien/stock/stock/stock.component').then(m => m.StockComponent)
  },
  {
    path: 'pharmacien/vente',
    loadComponent: () => import('./demo/pharmacien/vente/vente/vente.component').then(m => m.VenteComponent)
  }
];

export const COMMON_ROUTES: Routes = [
  {
    path: 'profil',
    loadComponent: () => import('./demo/pages/profil/profil/profil.component').then(m => m.ProfilComponent)
  },
  {
    path: 'aide',
    loadComponent: () => import('./demo/pages/aide/aide/aide.component').then(m => m.AideComponent)
  }
];
