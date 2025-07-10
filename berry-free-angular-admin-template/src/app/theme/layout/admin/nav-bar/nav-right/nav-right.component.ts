// Angular import
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// third party import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  constructor(private http: HttpClient, private router: Router) {}

  logout() {
    this.http.post('http://localhost:8080/api/auth/logout', {}).subscribe({
      next: () => {
        // Supprimer le token ET le rôle lors de la déconnexion
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        this.router.navigate(['/guest/login']);
      },
      error: () => {
        // Même en cas d'erreur, on nettoie tout et on redirige
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        this.router.navigate(['/guest/login']);
      }
    });
  }
}

