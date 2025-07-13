import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  role: string;
  // Ajoute d'autres champs si nécessaire
}

export interface PharmacienRequest {
  nom: string;
  email: string;
  motDePasse: string;
  adresse: string;
  ville: string;
  telephone: string;
  role: string;
  isActive: boolean;
  pharmacieId: number | string;
}

export interface Pharmacie {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  gouvernorat: string;
  codePostal: string;
  telephone: string;
  latitude: number | null;
  longitude: number | null;
  // Ajoutez d'autres champs si nécessaire
}

export interface InscriptionAdminPharmacieRequest {
  nom: string;
  email: string;
  motDePasse: string;
  adresse: string;
  ville: string;
  nomPharmacie: string;
  adressePharmacie: string;
  gouvernorat: string;
  codePostal: string;
  telephone: string;
  latitude: number;
  longitude: number;
  // Ajoute ici les champs pour les fichiers si besoin (cartes, autorisation, diplome)
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionAdminPharmacieService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  inscrireAdminPharmacie(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription-admin-pharmacie`, formData, { responseType: 'text' });
  }

  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-code`, { email, code: code.toString() }, { responseType: 'text' });
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-code`, { email }, { responseType: 'text' });
  }

  login(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, motDePasse });
  }

  getUtilisateursInactifs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateurs/inactifs`);
  }

  activerUtilisateur(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/utilisateurs/activer`, { userId }, { responseType: 'text' });
  }

  verifierCoordonneesNulles(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:8080/api/pharmacie-coordonnees-nulles/${userId}`).pipe(
      tap(estNul => console.log('Coordonnées nulles?', estNul))
    );
  }

  getPharmacieByUserId(userId: number): Observable<Pharmacie> {
    // Utiliser l'URL de base sans /auth pour cet endpoint
    return this.http.get<Pharmacie>(`http://localhost:8080/api/pharmacie-by-user/${userId}`).pipe(
      tap(pharmacie => console.log('Détails de la pharmacie reçus:', pharmacie))
    );
  }

  updateLocalisation(pharmacieId: number, latitude: number, longitude: number): Observable<Pharmacie> {
    return this.http.put<Pharmacie>(
      `http://localhost:8080/api/${pharmacieId}/localisation`,
      null,
      {
        params: {
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }
      }
    ).pipe(
      tap(pharmacie => console.log('Localisation mise à jour:', pharmacie))
    );
  }

  addUtilisateurToPharmacie(utilisateur: any, pharmacieId: number): Observable<any> {
    // Use the correct base URL without /auth for this endpoint
    const url = `http://localhost:8080/api/utilisateurs/add-to-pharmacie/${pharmacieId}`;
    console.log('Appel API vers:', url, 'avec les données:', utilisateur);
    
    return this.http.post(url, utilisateur).pipe(
      tap({
        next: (data) => console.log('Réponse de l\'ajout du pharmacien:', data),
        error: (err) => console.error('Erreur lors de l\'ajout du pharmacien:', err)
      })
    );
  }

  sendAcceptationEmail(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-acceptation-email`, { userId }, { responseType: 'text' });
  }

  getUtilisateursByPharmacie(pharmacieId: number): Observable<any[]> {
    // Attention : /api dans l'URL car ce endpoint n'est pas sous /api/auth
    const url = `http://localhost:8080/api/utilisateurs/by-pharmacie/${pharmacieId}`;
    console.log('Appel API vers:', url);
    
    return this.http.get<any[]>(url).pipe(
      tap({
        next: (data) => console.log('Réponse API - Nombre d\'utilisateurs:', data?.length, 'Détails:', data),
        error: (err) => console.error('Erreur API:', err)
      })
    );
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): Observable<any> {
    const url = `http://localhost:8080/api/utilisateurs/${id}`;
    console.log('Suppression de l\'utilisateur avec l\'ID:', id);
    
    return this.http.delete(url, { responseType: 'text' }).pipe(
      tap({
        next: () => console.log('Utilisateur supprimé avec succès'),
        error: (err) => console.error('Erreur lors de la suppression de l\'utilisateur:', err)
      })
    );
  }

  // Envoyer les identifiants par email
  sendCredentials(email: string, password: string): Observable<any> {
    const url = `http://localhost:8080/api/send-credentials?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    console.log('Envoi des identifiants à:', email);
    
    return this.http.post(url, {}, { responseType: 'text' }).pipe(
      tap({
        next: () => console.log('Email d\'identification envoyé avec succès à', email),
        error: (err) => console.error('Erreur lors de l\'envoi de l\'email d\'identification:', err)
      })
    );
  }

  // Créer un nouveau compte pharmacien
  creerComptePharmacien(pharmacien: PharmacienRequest): Observable<any> {
    const url = `${this.apiUrl}/utilisateurs/creer-pharmacien`;
    console.log('Création d\'un nouveau pharmacien:', pharmacien);
    
    return this.http.post(url, pharmacien).pipe(
      tap({
        next: (data) => console.log('Pharmacien créé avec succès:', data),
        error: (err) => console.error('Erreur lors de la création du pharmacien:', err)
      })
    );
  }

}
