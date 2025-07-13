import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TicketDeCaisse } from '../models/ticket-caisse.model';

@Injectable({
  providedIn: 'root'
})
export class TicketCaisseService {
  private apiUrl = `${environment.apiUrl}/api`; // Assurez-vous que apiUrl est défini dans votre environment.ts

  constructor(private http: HttpClient) { }

  // Récupérer l'ID de la pharmacie par ID utilisateur
  getPharmacieIdByUserId(userId: number): Observable<number> {
    const url = `${this.apiUrl}/pharmacie-id-by-user/${userId}`;
    return this.http.get<number>(url);
  }

  // Méthode utilitaire pour obtenir l'ID de l'utilisateur connecté depuis le token JWT
  getCurrentUserId(): number | null {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('Aucun token trouvé dans le localStorage');
      return null;
    }
    
    try {
      // Décoder le token JWT (la partie payload est la deuxième partie)
      const payload = token.split('.')[1];
      if (!payload) {
        console.error('Format de token invalide');
        return null;
      }
      
      // Décoder le payload Base64
      const decodedPayload = JSON.parse(atob(payload));
      console.log('Payload du token décodé:', decodedPayload);
      
      // Essayer de récupérer l'ID utilisateur
      // D'après le payload, l'ID est directement dans la propriété 'id'
      const userId = decodedPayload.id;
      
      if (!userId) {
        console.error('Aucun ID utilisateur trouvé dans le token');
        return null;
      }
      
      // Convertir en nombre si nécessaire
      return typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  // Méthode pour afficher l'ID de la pharmacie dans la console
  logPharmacieId(): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      this.getPharmacieIdByUserId(userId).subscribe({
        next: (pharmacieId) => {
          console.log('ID de la pharmacie:', pharmacieId);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération de l\'ID de la pharmacie:', error);
        }
      });
    } else {
      console.warn('Aucun utilisateur connecté trouvé');
    }
  }

  // Récupérer les tickets de caisse par date
  getTicketsByDate(date: Date): Observable<TicketDeCaisse[]> {
    console.log('getTicketsByDate appelé avec la date:', date);
    const userId = this.getCurrentUserId();
    console.log('ID utilisateur récupéré:', userId);
    
    if (!userId) {
      console.error('Aucun ID utilisateur trouvé');
      return throwError(() => new Error('Aucun utilisateur connecté'));
    }

    return this.getPharmacieIdByUserId(userId).pipe(
      tap((pharmacieId: number) => console.log('ID de pharmacie récupéré:', pharmacieId)),
      switchMap((pharmacieId: number) => {
        if (!pharmacieId) {
          console.error('Aucun ID de pharmacie trouvé pour l\'utilisateur:', userId);
          return throwError(() => new Error('Aucune pharmacie associée à cet utilisateur'));
        }
        
        // Formater la date au format YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        const url = `${this.apiUrl}/tickets/${pharmacieId}/${dateStr}`;
        console.log('URL de l\'API appelée:', url);
        
        return this.http.get<TicketDeCaisse[]>(url).pipe(
          tap((response: any) => {
            console.log('Réponse brute de l\'API:', response);
            // Vérifier si la réponse est un tableau
            if (Array.isArray(response)) {
              console.log('Nombre de tickets reçus:', response.length);
              response.forEach((ticket, index) => {
                console.log(`Ticket ${index + 1}:`, ticket);
                console.log(`Médicaments du ticket ${index + 1}:`, ticket.medicamentsSelectionnes);
              });
            }
          }),
          catchError((error: any) => {
            console.error('Erreur lors de la récupération des tickets:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}
