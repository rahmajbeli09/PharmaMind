import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicament } from '../models/medicament.model';
import { TicketDeCaisse } from '../demo/dashboard/ticket-de-caisse.model';

@Injectable({
  providedIn: 'root'
})
export class MedicamentService {
  // Add this method to import a medicament from a CSV line
  // Nouvelle méthode : envoie un objet medicament au backend pour import CSV
  
  private apiUrl = 'http://localhost:8080/api/medicaments';

  constructor(private http: HttpClient) {}

  getAllMedicaments(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(this.apiUrl);
  }

  saveMedicament(medicament: Medicament): Observable<Medicament> {
    return this.http.post<Medicament>(`${this.apiUrl}/medicaments`, medicament);
  }

  deleteMedicament(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  importCsvLine(medicament: Medicament) {
    return this.http.post<Medicament>(this.apiUrl + '/import-csv-line', medicament);
  }

  updateMedicament(medicament: Medicament) {
    if (!medicament.id) throw new Error('ID manquant pour la mise à jour');
    return this.http.put<Medicament>(`${this.apiUrl}/${medicament.id}`, medicament);
  }

  saveTicket(ticket: TicketDeCaisse): Observable<TicketDeCaisse> {
    return this.http.post<TicketDeCaisse>('http://localhost:8080/api/tickets', ticket);
  }

  getNomPharmacien(id: number): Observable<{nom: string}> {
    return this.http.get<{nom: string}>(`http://localhost:8080/api/utilisateurs/${id}/nom`);
  }
}
