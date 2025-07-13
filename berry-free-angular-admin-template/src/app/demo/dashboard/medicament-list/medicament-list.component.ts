import { Component, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  constructor(private router: Router) {
    // Afficher l'ID utilisateur connecté
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Décoder le token JWT (si c'est un JWT)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('ID utilisateur connecté:', payload.userId || payload.sub || 'Non disponible');
        console.log('Détails complets du token:', payload);
      } catch (e) {
        console.log('ID utilisateur (depuis localStorage):', localStorage.getItem('userId') || 'Non disponible');
      }
    } else {
      console.log('Aucun utilisateur connecté ou token non trouvé');
    }
  }

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

    // Récupérer l'ID du pharmacien connecté depuis le token
    const token = localStorage.getItem('token');
    let pharmacienId: number | null = null;
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        pharmacienId = payload.id;
        console.log('ID du pharmacien connecté:', pharmacienId);
      } catch (e) {
        console.error('Erreur lors de la récupération de l\'ID du pharmacien:', e);
      }
    }

    if (!pharmacienId) {
      alert('Impossible d\'identifier le pharmacien connecté. Veuillez vous reconnecter.');
      return;
    }

    // Créer le ticket de caisse avec la structure attendue par le backend
    const ticket: TicketDeCaisse = {
      dateSortieTicket: new Date().toISOString(),
      montantTotal: this.getTotalPanier(),
      pharmacien: {
        id: pharmacienId
      },
      medicamentsSelectionnes: this.panier.map(item => {
        const medicament = this.medicaments.find(m => m.id === item.medicamentId);
        return {
          id: item.medicamentId,
          name: item.medicamentName,
          dci: medicament?.dci || '',
          dosage: medicament?.dosage || '',
          forme: medicament?.forme || '',
          presentation: medicament?.presentation || '',
          price: item.prixUnitaire,
          quantiteStock: (medicament?.quantiteStock || 0) - item.quantite,
          datePeremption: medicament?.datePeremption ? new Date(medicament.datePeremption).toISOString() : new Date().toISOString(),
          fournisseur: medicament?.fournisseur || '',
          categorie: medicament?.categorie || '',
          remboursement: medicament?.remboursement
        };
      })
    };
    
    console.log('Données du ticket envoyées au serveur:', JSON.stringify(ticket, null, 2));

    // Envoyer le ticket au serveur
    this.medicamentService.saveTicket(ticket).subscribe({
      next: (savedTicket) => {
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
        alert('Une erreur est survenue lors de la validation du panier. Le ticket va être généré localement.');
        // Générer le ticket même en cas d'erreur serveur
        this.genererTicketPDF(ticket);
      }
    });
  }

  async genererTicketPDF(ticket: TicketDeCaisse): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 297] // Format A4 en hauteur pour plus d'espace
    });

    // Ajout du logo
    try {
      const logo = await this.loadImage('assets/images/logo.png');
      doc.addImage(logo, 'PNG', 15, 10, 50, 20);
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error);
    }

    // En-tête du ticket
    doc.setFontSize(14);
    doc.text('PHARMA MIND', 40, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.text('123 Rue de la Pharmacie', 40, 45, { align: 'center' });
    doc.text('75000 Tunis, Tunisie', 40, 50, { align: 'center' });
    doc.text('Tél: 01 23 45 67 89', 40, 55, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(10, 60, 70, 60);

    // Détails de la vente
    doc.setFontSize(10);
    doc.text(`Ticket #${ticket.id || 'N/A'}`, 10, 70);
    doc.text(`Date: ${new Date(ticket.dateSortieTicket).toLocaleString()}`, 10, 75);
    doc.text(`Pharmacien : ${ticket.pharmacien?.nom || 'Non spécifié'}`, 10, 80);

    // Ligne de séparation
    doc.line(10, 85, 70, 85);

    // En-tête du tableau
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Article', 10, 95);
    doc.text('Qté', 45, 95);
    doc.text('P.U.', 60, 95, { align: 'right' });
    doc.text('Total', 80, 95, { align: 'right' });

    // Détails des articles
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    let y = 105;
    
    ticket.medicamentsSelectionnes.forEach((medicament) => {
      // Nom du médicament (avec retour à la ligne si trop long)
      const splitName = doc.splitTextToSize(medicament.name, 30);
      doc.text(splitName, 10, y);
      
      // Quantité (on utilise 1 comme quantité par défaut car elle n'est pas stockée dans le ticket)
      doc.text('1', 45, y + (splitName.length > 1 ? 10 : 0));
      
      // Prix unitaire
      doc.text(medicament.price.toFixed(2) + ' €', 60, y + (splitName.length > 1 ? 10 : 0), { align: 'right' });
      
      // Total ligne (prix unitaire * 1)
      doc.text(medicament.price.toFixed(2) + ' €', 80, y + (splitName.length > 1 ? 10 : 0), { align: 'right' });
      
      y += (splitName.length > 1 ? 15 : 10);
    });

    // Ligne de séparation
    doc.line(10, y, 70, y);
    y += 10;

    // Total
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 60, y, { align: 'right' });
    doc.text(ticket.montantTotal.toFixed(2) + ' €', 80, y, { align: 'right' });
    y += 10;

    // Remerciements
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('Merci pour votre achat !', 40, y + 10, { align: 'center' });
    doc.text('À bientôt dans votre pharmacie', 40, y + 15, { align: 'center' });

    // Pied de page
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('TVA non applicable, article 293B du CGI', 40, y + 30, { align: 'center' });
    doc.text('Service client: contact@pharmamind.fr', 40, y + 35, { align: 'center' });

    // Sauvegarder le PDF
    const date = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    doc.save(`ticket-${date}.pdf`);
  }

  // Méthode utilitaire pour charger une image
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (error) => {
        console.error('Erreur lors du chargement de l\'image:', error);
        reject(error);
      };
      img.src = src;
    });
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

  ajouterAuPanier(medicament: Medicament, quantite?: number): void {
    if (medicament.id === undefined) return;
    
    const qty = quantite || this.quantiteSelectionnee[medicament.id] || 1;
    
    if (quantite > 0 && quantite <= (medicament.quantiteStock || 0)) {
      const existingItem = this.panier.find(item => item.medicamentId === medicament.id);
      
      if (existingItem) {
        existingItem.quantite += qty;
      } else {
        this.panier.push({
          medicamentId: medicament.id,
          medicamentName: medicament.name,
          quantite: qty,
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
  openAddDialog() {
   
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
    this.openAddDialog();
  }

  onDeleteConfirmed() {
    if (!this.medicamentToDelete?.id) return;
    this.deleteMedicament(this.medicamentToDelete.id);
  }
}
