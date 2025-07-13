import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicamentService } from '../../../services/medicament.service';
import { Medicament } from '../../../models/medicament.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportMedicamentsDialogComponent } from '../import-medicaments-dialog/import-medicaments-dialog.component';

@Component({
  selector: 'app-ventes',
  templateUrl: 'ventes.component.html',
  styleUrls: ['ventes.component.scss'],
  standalone: false
})
export class VentesComponent implements OnInit {
  // Exposer Math pour l'utiliser dans le template
  Math = Math;
  
  pageTitle = 'Gestion des Ventes';
  medicaments: Medicament[] = [];
  loading = false;
  error: string | null = null;
  
  // Propriétés pour le formulaire de modification
  afficherFormulaireModification = false;
  medicamentEnCoursEdition: any = {};
  enregistrementEnCours = false;
  categories: string[] = [
    'ANALGESIQUE', 'ANTIBIOTIQUE', 'ANTIINFLAMMATOIRE', 'ANTIVIRAL',
    'ANTIFONGIQUE', 'VITAMINE', 'HORMONE', 'VACCIN', 'AUTRE'
  ];

  // Propriétés pour la pagination
  page = 1;
  pageSize = 10;
  collectionSize = 0;

  // Propriétés pour la recherche
  searchTerm = '';
  selectedCategory = '';
  private searchTimeout: any;

  // Créer un médicament vide avec des valeurs par défaut
  private creerMedicamentVide(): any {
    return {
      name: '',
      dci: '',
      dosage: '',
      forme: '',
      presentation: '',
      price: 0,
      remboursement: 0,
      categorie: 'AUTRE',
      quantiteStock: 0,
      datePeremption: new Date().toISOString().split('T')[0]
    };
  }
  
  constructor(
    private medicamentService: MedicamentService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.chargerMedicaments();
  }

  chargerMedicaments(): void {
    this.loading = true;
    this.medicamentService.getAllMedicaments().subscribe({
      next: (data) => {
        this.medicaments = data;
        this.collectionSize = data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des médicaments:', err);
        this.error = 'Impossible de charger les médicaments';
        this.loading = false;
      }
    });
  }

  supprimerMedicament(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      this.medicamentService.deleteMedicament(id).subscribe({
        next: () => {
          this.medicaments = this.medicaments.filter(m => m.id !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du médicament:', err);
          this.error = 'Erreur lors de la suppression du médicament';
        }
      });
    }
  }

  // Ouvrir le formulaire de modification d'un médicament
  ouvrirFormulaireModification(medicament: Medicament | null = null): void {
    this.medicamentEnCoursEdition = medicament ? { ...medicament } : this.creerMedicamentVide();
    this.afficherFormulaireModification = true;
  }

  // Fermer le formulaire de modification
  fermerFormulaireModification(): void {
    this.afficherFormulaireModification = false;
    this.medicamentEnCoursEdition = {};
    this.error = null;
  }

  // Mettre à jour un médicament
  mettreAJourMedicament(): void {
    if (!this.medicamentEnCoursEdition.id) return;
    
    this.enregistrementEnCours = true;
    this.error = null;
    
    this.medicamentService.updateMedicament(this.medicamentEnCoursEdition as Medicament).subscribe({
      next: (medicamentMisAJour) => {
        // Mettre à jour la liste des médicaments
        const index = this.medicaments.findIndex(m => m.id === medicamentMisAJour.id);
        if (index !== -1) {
          this.medicaments[index] = medicamentMisAJour;
        }
        this.fermerFormulaireModification();
        this.enregistrementEnCours = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du médicament:', err);
        this.error = 'Une erreur est survenue lors de la mise à jour du médicament.';
        this.enregistrementEnCours = false;
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    // Réinitialiser à la première page lors d'une nouvelle recherche
    this.page = 1;
  }

  // Changer le nombre d'éléments par page
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.page = 1; // Revenir à la première page lors du changement de taille
  }

  // Ouvrir le dialogue d'importation de médicaments
  ouvrirImportDialog(): void {
    const modalRef = this.modalService.open(ImportMedicamentsDialogComponent, { 
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        // Rafraîchir la liste après un import réussi
        if (result === 'import_success') {
          this.chargerMedicaments();
        }
      },
      (reason) => {
        // Gérer la fermeture du modal
      }
    );
  }

  get medicamentsFiltres(): Medicament[] {
    let result = this.medicaments;
    
    // Appliquer le filtre par catégorie si une catégorie est sélectionnée
    if (this.selectedCategory) {
      result = result.filter(med => med.categorie === this.selectedCategory);
    }
    
    // Appliquer le filtre de recherche si un terme est saisi
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(med => 
        med.name?.toLowerCase().includes(term) || 
        med.dci?.toLowerCase().includes(term) ||
        med.dciCode?.toLowerCase().includes(term) ||
        med.forme?.toLowerCase().includes(term) ||
        med.presentation?.toLowerCase().includes(term)
      );
    }
    
    // Mettre à jour la taille de la collection pour la pagination
    this.collectionSize = result.length;
    
    // Retourner les données paginées
    return result.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize
    );
  }
  
  // Réinitialiser les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.page = 1;
  }
}
