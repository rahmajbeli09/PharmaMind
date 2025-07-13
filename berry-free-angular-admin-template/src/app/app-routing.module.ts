import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/default',
        pathMatch: 'full'
      },
      {
        path: 'accueil',
        loadComponent: () => import('./demo/pages/accueil/accueil.component').then((c) => c.AccueilComponent)
      },
     
      {
        path: 'dashboard-admin',
        loadComponent: () => import('./demo/dashboard/admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
      },
      {
        path: 'dashboard/responsable-pharmacie',
        loadComponent: () => import('./demo/dashboard/responsable-pharmacie/dashboard-responsable-pharmacie.component').then(m => m.DashboardResponsablePharmacieComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/elements/typography/typography.component')
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/other/sample-page/sample-page.component')
      },
      {
        path: 'dashboard/medicaments',
        loadChildren: () => import('./demo/dashboard/medicament/medicament.module').then(m => m.MedicamentModule)
      },
      {
        path: 'dashboard/stock',
        loadComponent: () => import('./demo/dashboard/stock/stock').then(m => m.Stock)
      },
      {
        path: 'dashboard/ventes',
        loadChildren: () => import('./demo/dashboard/ventes/ventes.module').then(m => m.VentesModule)
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'guest',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      },
      {
        path: 'authentication',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      },
      {
        path: 'home',
        loadComponent: () => import('./demo/pages/home/home.component').then((c) => c.HomeComponent),
        data: { animation: 'HomePage' }
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'register-pharmacien',
        loadComponent: () => import('./demo/pages/authentication/register-pharmacien/register-pharmacien.component').then(m => m.RegisterPharmacienComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
