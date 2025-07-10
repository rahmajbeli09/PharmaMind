import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InscriptionAdminPharmacieService } from 'src/app/services/inscription-admin-pharmacie.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {
  succes: string | null = null;
  showImagePreview: boolean = false;
  imagePreviewSrc: string | null = null;

  ouvrirImagePreview(src: string) {
    this.imagePreviewSrc = src;
    this.showImagePreview = true;
  }

  fermerImagePreview() {
    this.showImagePreview = false;
    this.imagePreviewSrc = null;
  }
  // ...
  getPharmacieImageUrl(id: number, type: 'diplome' | 'carte' | 'autorisation'): string {
    return `http://localhost:8080/api/pharmacies/${id}/${type}`;
  }
  utilisateursInactifs: any[] = [];
  loading: boolean = false;
  erreur: string = '';

  selectedUser: any = null;
  showDetail: boolean = false;

  constructor(private inscriptionService: InscriptionAdminPharmacieService) {}

  afficherDetail(user: any) {
    console.log('Utilisateur sélectionné pour détail:', user);
    this.selectedUser = user;
    this.showDetail = true;
  }

  fermerDetail() {
    this.showDetail = false;
    this.selectedUser = null;
  }

  ngOnInit() {
    this.loading = true;
    this.inscriptionService.getUtilisateursInactifs().subscribe({
      next: (data) => {
        console.log('Réponse utilisateurs inactifs:', data);
        // Force sous forme de tableau si jamais le backend renvoie un seul objet
        this.utilisateursInactifs = Array.isArray(data) ? data : (data ? [data] : []);
        this.loading = false;
      },
      error: (err) => {
        this.erreur = "Erreur lors du chargement des utilisateurs inactifs.";
        this.loading = false;
      }
    });
  }

  accepterUtilisateur(user: any) {
    this.inscriptionService.activerUtilisateur(user.id).subscribe({
      next: (res) => {
        // Après activation, envoyer l'email d'acceptation
        this.inscriptionService.sendAcceptationEmail(user.id).subscribe({
          next: () => {
            this.utilisateursInactifs = this.utilisateursInactifs.filter(u => u.id !== user.id);
            this.fermerDetail();
            this.succes = `L'utilisateur ${user.nom} a été accepté et informé par email.`;
            this.erreur = '';
          },
          error: (err) => {
            this.succes = null;
            this.erreur = `Utilisateur activé, mais échec de l'envoi de l'email : ${err?.error?.message || err.message || 'Erreur inconnue'}`;
          }
        });
      },
      error: (err) => {
        this.succes = null;
        this.erreur = `Erreur lors de l’activation : ${err?.error?.message || err.message || 'Erreur inconnue'}`;
      }
    });
  }
  
  refuserUtilisateur(user: any) {
    
  }
}
