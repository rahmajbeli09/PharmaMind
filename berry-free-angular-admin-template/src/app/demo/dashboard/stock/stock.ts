import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketCaisseService } from 'src/app/services/ticket-caisse.service';
import { TicketDeCaisse } from 'src/app/models/ticket-caisse.model';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss']
})
export class Stock implements OnInit {
  dateSelectionnee: string;
  tickets: TicketDeCaisse[] = [];
  chargement = false;
  erreur: string | null = null;
  ticketSelectionne: TicketDeCaisse | null = null;

  constructor(private ticketService: TicketCaisseService) {
    // Initialiser avec la date d'hier par défaut
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    this.dateSelectionnee = hier.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.chargerTickets();
  }

  chargerTickets(): void {
    if (!this.dateSelectionnee) {
      this.erreur = 'Veuillez sélectionner une date';
      return;
    }

    this.chargement = true;
    this.erreur = null;
    this.ticketSelectionne = null;

    const date = new Date(this.dateSelectionnee);
    this.ticketService.getTicketsByDate(date).subscribe({
      next: (tickets) => {
        this.tickets = tickets || [];
        this.chargement = false;
      },
      error: (err) => {
        if (err.message === 'Aucun utilisateur connecté') {
          this.erreur = 'Vous devez être connecté pour accéder à cette fonctionnalité.';
        } else if (err.message === 'Aucune pharmacie associée à cet utilisateur') {
          this.erreur = 'Aucune pharmacie n\'est associée à votre compte.';
        } else {
          this.erreur = 'Erreur lors du chargement des tickets: ' + (err.message || 'Erreur inconnue');
        }
        this.chargement = false;
        console.error('Erreur détaillée:', err);
      }
    });
  }

  selectionnerTicket(ticket: TicketDeCaisse): void {
    console.log('Ticket sélectionné:', ticket);
    console.log('Médicaments du ticket:', ticket.medicamentsSelectionnes);
    this.ticketSelectionne = ticket;
  }

  // Méthode pour générer et télécharger un PDF du ticket
  genererPDF(ticket: TicketDeCaisse): void {
    if (!ticket) return;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Générer le contenu HTML pour le PDF
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket de caisse #${ticket.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .ticket-info { margin-bottom: 20px; }
          .ticket-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PHARMA MIND</h2>
          <p>123 Rue de la Pharmacie, 75000 Paris</p>
          <p>Tél: 01 23 45 67 89</p>
        </div>
        
        <div class="ticket-info">
          <h3>Ticket de caisse #${ticket.id}</h3>
          <p><strong>Date :</strong> ${new Date(ticket.dateSortieTicket).toLocaleDateString()}</p>
          <p><strong>Heure :</strong> ${new Date(ticket.dateSortieTicket).toLocaleTimeString()}</p>
          <p><strong>Pharmacien :</strong> ${ticket.pharmacien?.nom || 'Non spécifié'}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Médicament</th>
              <th>Dosage</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>`;

    // Ajouter les lignes des médicaments
    ticket.medicamentsSelectionnes.forEach(med => {
      content += `
            <tr>
              <td>${med.name || 'Non spécifié'}</td>
              <td>${med.dosage || 'N/A'}</td>
              <td>${med.price ? med.price.toFixed(2) : '0.00'} TND</td>
              <td>${med.price ? med.price.toFixed(2) : '0.00'} TND</td>
            </tr>`;
    });

    // Ajouter le total
    content += `
            <tr>
              <td colspan="3" class="total">Total TTC :</td>
              <td>${ticket.montantTotal ? ticket.montantTotal.toFixed(2) : '0.00'} TND</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Merci pour votre visite !</p>
          <p>Rendez-vous sur www.pharmamind.com</p>
        </div>
      </body>
      </html>`;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();

    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  // Méthode pour imprimer le ticket
  imprimerTicket(ticket: TicketDeCaisse): void {
    if (!ticket) return;
    
    // Générer le contenu HTML pour l'impression
    const printContent = this.genererContenuImpression(ticket);
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Démarrer l'impression
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Méthode utilitaire pour générer le contenu HTML pour l'impression
  private genererContenuImpression(ticket: TicketDeCaisse): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket de caisse #${ticket.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .ticket-info { margin-bottom: 20px; }
          .ticket-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { font-size: 12px; }
            .no-print { display: none; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PHARMA MIND</h2>
          <p>123 Rue de la Pharmacie, 75000 Paris</p>
          <p>Tél: 01 23 45 67 89</p>
        </div>
        
        <div class="ticket-info">
          <h3>Ticket de caisse #${ticket.id}</h3>
          <p><strong>Date :</strong> ${new Date(ticket.dateSortieTicket).toLocaleDateString()}</p>
          <p><strong>Heure :</strong> ${new Date(ticket.dateSortieTicket).toLocaleTimeString()}</p>
          <p><strong>Pharmacien :</strong> ${ticket.pharmacien?.nom || 'Non spécifié'}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Médicament</th>
              <th>Dosage</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${ticket.medicamentsSelectionnes.map(med => `
              <tr>
                <td>${med.name || 'Non spécifié'}</td>
                <td>${med.dosage || 'N/A'}</td>
                <td>${med.price ? med.price.toFixed(2) : '0.00'} TND</td>
                <td>${med.price ? med.price.toFixed(2) : '0.00'} TND</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" class="total">Total TTC :</td>
              <td>${ticket.montantTotal ? ticket.montantTotal.toFixed(2) : '0.00'} TND</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Merci pour votre visite !</p>
          <p>Rendez-vous sur www.pharmamind.com</p>
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimer ce ticket
          </button>
          <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Fermer
          </button>
        </div>
      </body>
      </html>`;
  }
}
