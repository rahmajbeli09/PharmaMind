import { Component, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTooltipModule, NgbModal, NgbModalModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Medicament } from '../../../models/medicament.model';

// Type definitions
type ModalRef = {
  componentInstance: { name: string };
  result: Promise<string>;
  close: (result?: any) => void;
};

type OffcanvasRef = {
  dismiss: () => void;
  close: (result?: any) => void;
};

interface PanierItem {
  medicamentId: number;
  medicamentName: string;
  quantite: number;
  prixUnitaire: number;
}
import { MedicamentService } from '../../../services/medicament.service';
import { TicketDeCaisse, TicketDeCaisseItem } from '../ticket-de-caisse.model';
import { AddMedicamentDialogComponent } from '../add-medicament-dialog/add-medicament-dialog.component';
import { ImportMedicamentsDialogComponent } from '../import-medicaments-dialog/import-medicaments-dialog.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-medicament-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    NgbTooltipModule,
    NgbModalModule
  ],
  templateUrl: './medicament-list.component.html',
  styleUrls: ['./medicament-list.component.scss'],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA] // Removed as it's not needed with proper component imports
})
export class MedicamentListComponent implements OnInit {
  // Component properties
  medicaments: Medicament[] = [];
  filteredMedicaments: Medicament[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  private searchDebounceTimer: any;
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  
  // Panier properties
  panier: PanierItem[] = [];
  showQuantiteInput: { [key: number]: boolean } = {};
  quantiteSelectionnee: { [key: number]: number } = {};
  showConfirmBtn = false;
  
  // Dialog states
  showAddDialog = false;
  showImportDialog = false;
  editMode = false;
  selectedMedicament: Medicament | null = null;
  medicamentToDelete: Medicament | null = null;
  
  // Table properties
  rows: Medicament[] = [];
  temp: Medicament[] = [];
  
  // ViewChild
  @ViewChild('panierTemplate') panierTemplate!: TemplateRef<any>;
  private modalRef?: ModalRef;
  private offcanvasRef: OffcanvasRef | null = null;
  
  // Inject services
  private modalService = inject(NgbModal);
  private offcanvasService = inject(NgbOffcanvas);
  private medicamentService = inject(MedicamentService);

  constructor() {}

  ngOnInit(): void {
    this.loadMedicaments();
    // Initialize first page of data
    this.page = 1;
  }

  // Load medicaments from service
  loadMedicaments(): void {
    this.loading = true;
    this.medicamentService.getAllMedicaments().subscribe({
      next: (data) => {
        this.medicaments = data;
        this.filteredMedicaments = [...this.medicaments];
        this.collectionSize = this.medicaments.length;
        this.updateTable();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des médicaments';
        this.loading = false;
        console.error('Error loading medicaments:', err);
      }
    });
  }

  // Search methods
  onSearchChange(): void {
    // Cancel previous search if any
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Start a new search timer
    this.searchDebounceTimer = setTimeout(() => {
      this.page = 1; // Reset to first page
      this.updateTable();
    }, 300); // 300ms delay before searching
  }

  onSearch(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.page = 1;
    this.updateTable();
  }

  updateTable(): void {
    // Apply filtering based on search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredMedicaments = this.medicaments.filter(med => 
        (med.name?.toLowerCase().includes(searchLower) ||
        (med.dosage && med.dosage.toLowerCase().includes(searchLower)) ||
        (med.forme && med.forme.toLowerCase().includes(searchLower)) ||
        (med as any).codeCIP?.toLowerCase().includes(searchLower) ||
        (med.dci && med.dci.toLowerCase().includes(searchLower)))
      );
    } else {
      this.filteredMedicaments = [...this.medicaments];
    }
    
    // Update pagination
    this.collectionSize = this.filteredMedicaments.length;
    this.rows = this.filteredMedicaments.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize
    );
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateTable();
  }

  // Panier methods
  openPanier(): void {
    this.offcanvasRef = this.offcanvasService.open(this.panierTemplate, { position: 'end', panelClass: 'panier-offcanvas' });
  }

  onClosePanier(): void {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
    }
  }

  validerPanier(): void {
    if (this.panier.length === 0) return;

    // Créer le ticket de caisse
    const ticket: TicketDeCaisse = {
      items: this.panier.map(item => ({
        medicamentId: item.medicamentId,
        medicamentName: item.medicamentName,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire
      } as TicketDeCaisseItem)),
      dateSortieTicket: new Date().toISOString(),
      montantTotal: this.getTotalPanier()
    };

    // Envoyer le ticket au serveur
    this.medicamentService.saveTicket(ticket).subscribe({
      next: () => {
        // Mettre à jour les stocks pour chaque médicament du panier
        this.panier.forEach(item => {
          const medicament = this.medicaments.find(m => m.id === item.medicamentId);
          if (medicament) {
            medicament.quantiteStock = (medicament.quantiteStock || 0) - item.quantite;
            this.medicamentService.updateMedicament(medicament).subscribe({
              next: () => {
                console.log(`Stock mis à jour pour ${medicament.name}`);
              },
              error: (error) => {
                console.error('Erreur lors de la mise à jour du stock:', error);
              }
            });
          }
        });

        // Générer et afficher le ticket
        this.genererTicketPDF(ticket);

        // Réinitialiser le panier
        this.panier = [];
        this.showConfirmBtn = false;

        // Fermer le panier
        if (this.offcanvasRef) {
          this.offcanvasRef.close();
        }

        // Afficher une notification de succès
        alert('Vente enregistrée avec succès !');
        // Générer et télécharger le ticket PDF
        this.genererTicketPDF(ticket);

        // Réinitialiser le panier
        this.panier = [];
        this.showConfirmBtn = false;

        // Fermer le panier
        if (this.offcanvasRef) {
          this.offcanvasRef.close();
        }

        // Afficher une notification de succès
        alert('Vente enregistrée avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la validation du panier:', error);
        alert('Une erreur est survenue lors de la validation du panier.');
      }
    });
  }

  genererTicketPDF(ticket: TicketDeCaisse): void {
    // Créer le contenu HTML du ticket
    let ticketContent = `
    <div style="max-width: 80mm; margin: 0 auto; padding: 10px; font-family: Arial, sans-serif; font-size: 12px;">
      <!-- En-tête avec logo -->
      <div style="text-align: center; margin-bottom: 10px;">
        <img src="assets/images/logo.png" alt="Logo" style="max-width: 120px; height: auto; margin-bottom: 10px;">
        <h2 style="margin: 5px 0; font-size: 16px;">PHARMA MIND</h2>
        <p style="margin: 0; font-size: 10px; color: #666;">Votre pharmacie de confiance</p>
        <p style="margin: 5px 0; font-size: 10px;">${new Date(ticket.dateSortieTicket).toLocaleString()}</p>
        <hr style="border-top: 1px dashed #ccc; margin: 10px 0;">
      </div>
      
      <!-- Détails des articles -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px dashed #ccc; padding: 3px 0;">Article</th>
            <th style="text-align: right; border-bottom: 1px dashed #ccc; padding: 3px 0; width: 40px;">Qté</th>
            <th style="text-align: right; border-bottom: 1px dashed #ccc; padding: 3px 0; width: 60px;">Prix U.</th>
            <th style="text-align: right; border-bottom: 1px dashed #ccc; padding: 3px 0; width: 60px;">Total</th>
          </tr>
        </thead>
        <tbody>`;

    ticket.items.forEach(item => {
      const prixUnitaire = item.prixUnitaire.toFixed(2);
      const total = (item.quantite * item.prixUnitaire).toFixed(2);
      ticketContent += `
          <tr>
            <td style="padding: 3px 0;">${item.medicamentName}</td>
            <td style="text-align: right; padding: 3px 0;">${item.quantite}</td>
            <td style="text-align: right; padding: 3px 0;">${prixUnitaire} €</td>
            <td style="text-align: right; padding: 3px 0;">${total} €</td>
          </tr>`;
    });

    ticketContent += `
          <tr>
            <td colspan="3" style="text-align: right; border-top: 1px dashed #ccc; padding-top: 8px;">
              <strong>TOTAL TTC :</strong>
            </td>
            <td style="text-align: right; border-top: 1px dashed #ccc; padding-top: 8px;">
              <strong>${ticket.montantTotal.toFixed(2)} €</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <hr style="border-top: 1px dashed #ccc; margin: 10px 0;">
      <p style="text-align: center; font-size: 10px; color: #666; margin: 10px 0 5px;">
        Merci pour votre achat !
      </p>
      <p style="text-align: center; font-size: 9px; color: #999; margin: 5px 0;">
        Rendez-vous sur www.pharmamind.com
      </p>
    </div>`;

    // Créer une nouvelle fenêtre avec le contenu du ticket
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de caisse - ${new Date(ticket.dateSortieTicket).toLocaleString()}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; margin-bottom: 20px; }
              th { text-align: left; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
            </style>
          </head>
          <body onload="window.print();">
            ${ticketContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  toggleQuantiteInput(medicament: Medicament | number): void {
    let medicamentId: number;
    
    if (typeof medicament === 'number') {
      medicamentId = medicament;
    } else {
      if (medicament.id === undefined) return;
      medicamentId = medicament.id;
    }
    
    this.showQuantiteInput[medicamentId] = !this.showQuantiteInput[medicamentId];
    if (this.showQuantiteInput[medicamentId]) {
      this.quantiteSelectionnee[medicamentId] = 1;
    }
  }

  ajouterAuPanier(medicament: Medicament): void {
    if (medicament.id === undefined) return;
    
    const quantite = this.quantiteSelectionnee[medicament.id] || 1;
    
    if (quantite > 0 && quantite <= (medicament.quantiteStock || 0)) {
      const existingItem = this.panier.find(item => item.medicamentId === medicament.id);
      
      if (existingItem) {
        existingItem.quantite += quantite;
      } else {
        this.panier.push({
          medicamentId: medicament.id,
          medicamentName: medicament.name,
          quantite: quantite,
          prixUnitaire: medicament.price || 0
        });
      }
      
      this.showQuantiteInput[medicament.id] = false;
      this.showConfirmBtn = this.panier.length > 0;
    }
  }

  augmenterQuantite(item: PanierItem): void {
    const medicament = this.medicaments.find(m => m.id === item.medicamentId);
    if (medicament && (medicament.quantiteStock || 0) > item.quantite) {
      item.quantite++;
    }
  }

  diminuerQuantite(item: PanierItem): void {
    if (item.quantite > 1) {
      item.quantite--;
    } else {
      this.supprimerDuPanier(item.medicamentId);
    }
  }

  supprimerDuPanier(medicamentId: number): void {
    const index = this.panier.findIndex(item => item.medicamentId === medicamentId);
    if (index !== -1) {
      this.panier.splice(index, 1);
      this.showConfirmBtn = this.panier.length > 0;
    }
  }

  getTotalPanier(): number {
    return this.panier.reduce((total, item) => total + (item.prixUnitaire * item.quantite), 0);
  }

  // Dialog methods
  openAddDialog(medicament?: Medicament) {
    const modalRef = this.modalService.open(AddMedicamentDialogComponent, { size: 'lg' });
    if (medicament) {
      modalRef.componentInstance.medicament = { ...medicament };
      modalRef.componentInstance.editMode = true;
    }
    
    modalRef.result.then(
      (result) => {
        if (result) {
          this.onMedicamentUpdated(result);
        }
      },
      () => {
        // Dismissed
      }
    );
  }

  onMedicamentUpdated(updatedMedicament: Medicament) {
    if (this.editMode) {
      const index = this.medicaments.findIndex(m => m.id === updatedMedicament.id);
      if (index > -1) {
        this.medicaments[index] = updatedMedicament;
      }
    } else {
      this.medicaments.unshift(updatedMedicament);
    }
    this.showAddDialog = false;
  }

  openImportDialog() {
    const modalRef = this.modalService.open(ImportMedicamentsDialogComponent, { size: 'lg' });
    
    modalRef.result.then(
      (result) => {
        if (result) {
          this.onImportComplete(result);
        }
      },
      () => {
        // Dismissed
      }
    );
  }

  onImportComplete(result: { success: number; failed: number }) {
    this.showImportDialog = false;
    if (result.success > 0) {
      this.loadMedicaments();
    }
  }

  confirmDelete(medicament: Medicament): void {
    this.medicamentToDelete = medicament;
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.name = medicament.name;
    
    modalRef.result.then(
      (result) => {
        if (result === 'confirm' && this.medicamentToDelete?.id) {
          this.deleteMedicament(this.medicamentToDelete.id);
        }
      },
      () => {
        // Dismissed
        this.medicamentToDelete = null;
      }
    );
  }
  
  private deleteMedicament(id: string | number): void {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    this.medicamentService.deleteMedicament(numericId).subscribe({
      next: () => {
        // Convert both IDs to strings for comparison to handle both string and number IDs
        const idStr = id.toString();
        this.medicaments = this.medicaments.filter(med => med.id?.toString() !== idStr);
        this.filteredMedicaments = this.filteredMedicaments.filter(med => med.id?.toString() !== idStr);
        this.collectionSize = this.medicaments.length;
        this.medicamentToDelete = null;
      },
      error: (error: any) => {
        console.error('Error deleting medicament:', error);
        this.error = 'Erreur lors de la suppression du médicament';
        this.loading = false;
      }
    });
  }

  

  // Medicament CRUD operations
  openEditDialog(medicament: Medicament) {
    this.openAddDialog(medicament);
  }

  onDeleteConfirmed() {
    if (!this.medicamentToDelete?.id) return;
    this.deleteMedicament(this.medicamentToDelete.id);
  }
}
