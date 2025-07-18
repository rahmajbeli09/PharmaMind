import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InscriptionAdminPharmacieService, PharmacienRequest } from 'src/app/services/inscription-admin-pharmacie.service';
import { TicketCaisseService } from 'src/app/services/ticket-caisse.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

interface NouveauPharmacien {
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  adresse: string;
  ville: string;
  dateNaissance: string;
  cin: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: 'app-dashboard-responsable-pharmacie',
  standalone: true,
  imports: [CommonModule, FormsModule, LeafletModule],
  templateUrl: './dashboard-responsable-pharmacie.component.html',
  styleUrls: [
    './dashboard-responsable-pharmacie.component.scss',
    './map-styles.scss'
  ]
})
export class DashboardResponsablePharmacieComponent implements OnInit {
  utilisateurs: any[] = [];
  loading = false;
  erreur: string | null = null;
  showLocationPrompt = false;
  showMap = false;
  pharmacie: any = null;
  
  // Référence à la carte
  private map: L.Map | null = null;
  marker: L.Marker | null = null;
  selectedLatitude: number = 0;
  selectedLongitude: number = 0;
  isSaving = false;
  
  // Configuration des couches et contrôles de la carte
  layers: L.Layer[] = [];
  layersControl = {
    baseLayers: {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    },
    overlays: {}
  };
  
  // Options de la carte
  mapOptions: L.MapOptions = {
    layers: [this.layersControl.baseLayers['OpenStreetMap']],
    zoom: 13,
    center: L.latLng(36.8065, 10.1815) // Centre sur Tunis par défaut
  };

  constructor(
    private inscriptionService: InscriptionAdminPharmacieService,
    private ticketCaisseService: TicketCaisseService,
    private router: Router
  ) { }

  afficherFormulaireAjout = false;
  envoiEnCours = false;
  nouveauPharmacien: NouveauPharmacien = {
    nom: '',
    email: '',
    telephone: '',
    motDePasse: this.genererMotDePasse(),
    adresse: '',
    ville: '',
    dateNaissance: '',
    cin: '',
    role: 'PHARMACIEN',
    isActive: true
  };
  today = new Date().toISOString().split('T')[0]; // Pour la validation de la date de naissance



  // Afficher le formulaire d'ajout
  ouvrirFormulaireAjout() {
    this.afficherFormulaireAjout = true;
  }

  // Générer un mot de passe aléatoire
  private genererMotDePasse(): string {
    const longueur = 12;
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let resultat = '';
    for (let i = 0; i < longueur; i++) {
      resultat += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultat;
  }

  // Fermer le formulaire d'ajout
  fermerFormulaireAjout() {
    this.afficherFormulaireAjout = false;
    this.nouveauPharmacien = {
      nom: '',
      email: '',
      telephone: '',
      motDePasse: this.genererMotDePasse(),
      adresse: '',
      ville: '',
      dateNaissance: '',
      cin: '',
      role: 'PHARMACIEN',
      isActive: true
    };
    this.erreur = null;
  }

  // Méthode pour ajouter un nouveau pharmacien
  ajouterPharmacien() {
    this.erreur = null;
    this.loading = true;

    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      this.erreur = 'Session expirée. Veuillez vous reconnecter.';
      this.loading = false;
      return;
    }

    try {
      // Décoder le token pour obtenir le pharmacieId
      const decodedToken = this.decodeJwt(token);
      const pharmacieId = decodedToken?.pharmacieId || decodedToken?.pharmacie_id;

      if (!pharmacieId) {
        this.erreur = 'Impossible de déterminer la pharmacie associée.';
        this.loading = false;
        return;
      }

      // Créer l'objet utilisateur pour le pharmacien
      const utilisateurData = {
        nom: this.nouveauPharmacien.nom,
        email: this.nouveauPharmacien.email,
        motDePasse: this.nouveauPharmacien.motDePasse,
        adresse: this.nouveauPharmacien.adresse,
        ville: this.nouveauPharmacien.ville,
        telephone: this.nouveauPharmacien.telephone,
        dateNaissance: this.nouveauPharmacien.dateNaissance,
        cin: this.nouveauPharmacien.cin,
        role: 'PHARMACIEN',
        isActive: true
      };

      // Appeler le service pour ajouter l'utilisateur à la pharmacie
      this.inscriptionService.addUtilisateurToPharmacie(utilisateurData, Number(pharmacieId)).subscribe({
        next: (response: any) => {
          console.log('Pharmacien ajouté avec succès :', response);
          
          // Récupérer l'ID de l'utilisateur créé depuis la réponse
          const userId = response.id; // Assurez-vous que la réponse contient l'ID de l'utilisateur
          
          if (!userId) {
            console.error('ID utilisateur non trouvé dans la réponse');
            this.erreur = 'Le compte a été créé mais n\'a pas pu être activé. Veuillez contacter l\'administrateur.';
            this.loading = false;
            return;
          }
          
          // Envoyer les identifiants par email
          this.inscriptionService.sendCredentials(
            this.nouveauPharmacien.email,
            this.nouveauPharmacien.motDePasse
          ).subscribe({
            next: () => {
              console.log('Email d\'identification envoyé avec succès');
              
              // Activer l'utilisateur après l'envoi réussi de l'email
              this.inscriptionService.activerUtilisateur(userId).subscribe({
                next: () => {
                  console.log('Utilisateur activé avec succès');
                  this.fermerFormulaireAjout();
                  this.chargerUtilisateurs();
                  this.loading = false;
                },
                error: (activationError) => {
                  console.error('Erreur lors de l\'activation du compte :', activationError);
                  // On continue quand même même si l'activation échoue
                  this.fermerFormulaireAjout();
                  this.chargerUtilisateurs();
                  this.loading = false;
                  alert('Le compte a été créé mais n\'a pas pu être activé. Veuillez contacter l\'administrateur.');
                }
              });
            },
            error: (emailError) => {
              console.error('Erreur lors de l\'envoi de l\'email d\'identification :', emailError);
              // On active quand même le compte même si l'email n'a pas pu être envoyé
              this.inscriptionService.activerUtilisateur(userId).subscribe({
                next: () => {
                  console.log('Utilisateur activé malgré l\'échec d\'envoi d\'email');
                  this.fermerFormulaireAjout();
                  this.chargerUtilisateurs();
                  this.loading = false;
                  alert('Le compte a été créé mais l\'email d\'identification n\'a pas pu être envoyé. Veuillez communiquer manuellement les identifiants à l\'utilisateur.');
                },
                error: (activationError) => {
                  console.error('Erreur lors de l\'activation du compte :', activationError);
                  this.fermerFormulaireAjout();
                  this.chargerUtilisateurs();
                  this.loading = false;
                  alert('Le compte a été créé mais n\'a pas pu être activé. Veuillez contacter l\'administrateur.');
                }
              });
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du pharmacien :', error);
          this.erreur = error.error?.message || 'Une erreur est survenue lors de l\'ajout du pharmacien.';
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors du décodage du token :', error);
      this.erreur = 'Erreur de traitement. Veuillez réessayer.';
      this.loading = false;
    }
  }

  // Fonction utilitaire pour décoder un JWT (sans dépendance externe)
  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) throw new Error('Invalid token format');
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Méthode pour charger les utilisateurs de la pharmacie
  // Supprimer un utilisateur
  supprimerUtilisateur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      this.loading = true;
      this.inscriptionService.deleteUtilisateur(id).subscribe({
        next: () => {
          console.log('Utilisateur supprimé avec succès');
          // Recharger la liste des utilisateurs
          this.chargerUtilisateurs();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur :', error);
          this.erreur = 'Une erreur est survenue lors de la suppression de l\'utilisateur.';
          this.loading = false;
        }
      });
    }
  }

  chargerUtilisateurs(): void {
    this.loading = true;
    this.erreur = null;
    
    // Vérifier si localStorage est disponible
    if (typeof localStorage === 'undefined') {
      this.erreur = 'localStorage n\'est pas disponible. Veuillez activer les cookies.';
      this.loading = false;
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Token brut du localStorage:', token);
    
    if (!token) {
      this.erreur = 'Session expirée. Veuillez vous reconnecter.';
      this.loading = false;
      this.router.navigate(['/guest/login']);
      return;
    }

    try {
      const decoded = this.decodeJwt(token);
      console.log('Token décodé:', decoded);
      
      const pharmacieId = decoded.pharmacieId || decoded.pharmacie_id;
      console.log('ID de la pharmacie extrait du token:', pharmacieId);
      
      if (!pharmacieId) {
        console.error('Aucun ID de pharmacie trouvé dans le token');
        this.erreur = 'Impossible de déterminer la pharmacie associée.';
        this.loading = false;
        return;
      }

      // Charger les utilisateurs de la pharmacie
      this.inscriptionService.getUtilisateursByPharmacie(pharmacieId).subscribe({
        next: (data) => {
          console.log('Réponse brute de l\'API:', data);
          console.log('Type de données reçues:', typeof data);
          
          if (Array.isArray(data)) {
            console.log(`Nombre d'utilisateurs reçus: ${data.length}`);
            console.log('Détails des utilisateurs:', JSON.stringify(data, null, 2));
            
            // Afficher les IDs de tous les utilisateurs reçus
            console.log('IDs des utilisateurs reçus:', data.map(u => ({
              id: u.id,
              type: typeof u.id,
              email: u.email,
              nom: u.nom
            })));
            
            // Filtrer pour exclure l'utilisateur connecté
            const utilisateurConnecteId = decoded.userId || decoded.sub;
            this.utilisateurs = data.filter(u => u.id !== utilisateurConnecteId);
            
            console.log(`Utilisateurs après filtrage: ${this.utilisateurs.length}`);
          } 
          // Si la réponse est un objet et non un tableau
          else if (data && typeof data === 'object') {
            console.log('Réponse reçue comme objet, conversion en tableau');
            const dataObj = data as any;
            
            // Vérifier si l'objet contient une propriété qui est un tableau
            const arrayKey = Object.keys(dataObj).find(key => Array.isArray(dataObj[key]));
            
            if (arrayKey) {
              const arrayData = dataObj[arrayKey];
              console.log(`Tableau trouvé dans la propriété '${arrayKey}' avec ${arrayData.length} éléments`);
              this.utilisateurs = arrayData;
            } else {
              console.warn('Aucun tableau trouvé dans la réponse, conversion en tableau');
              this.utilisateurs = [dataObj]; // Si un seul utilisateur est retourné comme objet
            }
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur API:', err);
          this.erreur = "Erreur lors du chargement des utilisateurs: " + 
            (err.error?.message || err.message || 'Erreur inconnue');
          this.loading = false;
        }
      });
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      this.erreur = "Erreur d'authentification. Veuillez vous reconnecter.";
      this.loading = false;
      localStorage.removeItem('token'); // Nettoyer le token invalide
      this.router.navigate(['/guest/login']);
    }
  }

  ngOnInit(): void {
    console.log('Initialisation du composant DashboardResponsablePharmacieComponent');
    this.chargerUtilisateurs();
    this.verifierLocalisationPharmacie();
  }

  verifierLocalisationPharmacie() {
    console.log('Vérification des coordonnées de la pharmacie...');
    const userId = this.ticketCaisseService.getCurrentUserId();
    console.log('ID utilisateur:', userId);
    
    if (userId) {
      this.inscriptionService.verifierCoordonneesNulles(userId).subscribe({
        next: (sontNulles) => {
          console.log('Les coordonnées sont nulles?', sontNulles);
          this.showLocationPrompt = sontNulles;
          
          if (sontNulles) {
            console.log('Affichage de la bannière de localisation manquante');
          } else {
            console.log('Les coordonnées GPS sont déjà définies');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification des coordonnées de la pharmacie', error);
          // En cas d'erreur, on n'affiche pas la bannière pour ne pas gêner l'utilisateur
          this.showLocationPrompt = false;
        }
      });
    } else {
      console.warn('Aucun ID utilisateur trouvé');
      this.showLocationPrompt = false;
    }
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    
    // Désactiver le zoom avec la molette de la souris
    this.map.scrollWheelZoom.disable();
    
    // Définir les chemins des icônes
    const iconRetina = 'assets/leaflet/images/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/images/marker-icon.png';
    const shadowUrl = 'assets/leaflet/images/marker-shadow.png';
    
    // Configurer l'icône par défaut
    const iconDefault = L.icon({
      iconRetinaUrl: iconRetina,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    // Définir l'icône par défaut pour tous les marqueurs
    (L.Marker.prototype as any).options.icon = iconDefault;
    
    // Ajouter un gestionnaire d'événements pour les clics sur la carte
    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
  }

  onMapClick(event: L.LeafletMouseEvent): void {
    if (!this.map) return;
    
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;
    this.selectedLatitude = lat;
    this.selectedLongitude = lng;
    
    if (!this.marker) {
      this.marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.icon({
          iconUrl: 'assets/leaflet/images/marker-icon.png',
          shadowUrl: 'assets/leaflet/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(this.map);
      
      this.marker.on('dragend', () => {
        if (this.marker) {
          const position = this.marker.getLatLng();
          this.selectedLatitude = position.lat;
          this.selectedLongitude = position.lng;
        }
      });
    } else {
      this.marker.setLatLng([lat, lng]);
    }
    
    this.map.setView([lat, lng], this.map.getZoom());
  }
  
  ajouterEmplacement() {
    console.log('Affichage de la carte pour la sélection de l\'emplacement');
    this.showMap = true;
    this.showLocationPrompt = false;
  }
  
  enregistrerLocalisation() {
    if (this.selectedLatitude === 0 && this.selectedLongitude === 0) {
      return;
    }

    this.isSaving = true;
    
    // Afficher toutes les clés du localStorage pour le débogage
    console.log('Clés du localStorage:', Object.keys(localStorage));
    
    // Essayer différentes clés de token possibles
    const token = localStorage.getItem('authToken') || 
                 localStorage.getItem('token') ||
                 localStorage.getItem('jwt');
    
    console.log('Token récupéré:', token);
    
    if (!token) {
      console.error('Aucun token d\'authentification trouvé dans le localStorage');
      console.log('Contenu complet du localStorage:', localStorage);
      this.isSaving = false;
      return;
    }

    // Décoder le token pour obtenir l'ID de la pharmacie
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const pharmacieId = tokenPayload.pharmacie_id;
      
      if (!pharmacieId) {
        console.error('Aucun ID de pharmacie trouvé dans le token');
        this.isSaving = false;
        return;
      }

      console.log('Mise à jour de la localisation pour la pharmacie ID:', pharmacieId);
      
      // Mettre à jour la localisation directement avec l'ID de la pharmacie
      this.inscriptionService.updateLocalisation(
        pharmacieId,
        this.selectedLatitude,
        this.selectedLongitude
      ).subscribe({
        next: (updatedPharmacie) => {
          console.log('Localisation mise à jour avec succès', updatedPharmacie);
          this.showMap = false;
          this.showLocationPrompt = false;
          // Recharger les données de la pharmacie si nécessaire
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la localisation', error);
        }
      }).add(() => {
        this.isSaving = false;
      });
      
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      this.isSaving = false;
    }
  }
}
