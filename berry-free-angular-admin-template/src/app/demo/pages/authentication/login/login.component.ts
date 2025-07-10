// angular import
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InscriptionAdminPharmacieService } from 'src/app/services/inscription-admin-pharmacie.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  motDePasse: string = '';
  erreurConnexion: string = '';

constructor(private inscriptionService: InscriptionAdminPharmacieService, private router: Router) {}

login() {
  this.erreurConnexion = '';
  
  // Vérifier si localStorage est disponible
  if (typeof localStorage === 'undefined') {
    console.error('localStorage n\'est pas disponible');
    this.erreurConnexion = 'Erreur de configuration du navigateur. Veuillez activer les cookies.';
    return;
  }

  this.inscriptionService.login(this.email, this.motDePasse).subscribe({
    next: (response) => {
      console.log('Réponse du serveur:', response);
      
      if (!response || !response.token) {
        console.error('Format de réponse inattendu:', response);
        this.erreurConnexion = 'Erreur lors de la connexion. Veuillez réessayer.';
        return;
      }
      
      try {
        // Stocker le token JWT et le rôle dans le localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.role || '');
        console.log('Token stocké avec succès');
        
        // Redirection basée sur le rôle
        const role = response.role || '';
        console.log('Rôle détecté:', role);
        
        if (role === 'ADMINPH') {
          this.router.navigate(['/dashboard/responsable-pharmacie']);
        } else if (role === 'PHARMACIEN') {
          this.router.navigate(['/dashboard/medicaments']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/dashboard-admin']);
        } else {
          console.warn('Rôle inconnu:', role);
          this.router.navigate(['/']); // Rediriger vers une page par défaut
        }
      } catch (e) {
        console.error('Erreur lors du stockage du token:', e);
        this.erreurConnexion = 'Erreur lors de la connexion. Veuillez réessayer.';
      }
    },
    error: (err) => {
      console.error('Erreur de connexion:', err);
      this.erreurConnexion = err.error?.message || 'Email ou mot de passe incorrect.';
    }
  });
}

}
