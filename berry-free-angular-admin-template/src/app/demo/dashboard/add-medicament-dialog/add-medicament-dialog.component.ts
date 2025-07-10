import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicamentService } from '../../../services/medicament.service';
import { Medicament } from '../../../models/medicament.model';

import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-add-medicament-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-medicament-dialog.component.html',
  styleUrls: ['./add-medicament-dialog.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('400ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AddMedicamentDialogComponent implements OnInit {
  @Input() medicament: Medicament | null = null;
  @Input() editMode: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() medicamentUpdated = new EventEmitter<Medicament>();

  localMedicament: Medicament = {
    name: '',
    dosage: '',
    forme: '',
    presentation: '',
    price: 0,
    remboursement: 0,
    dci: '',
    dciCode: '',
    datePeremption: new Date(),
    fournisseur: '',
    categorie: 'ANTIBIOTIQUE',
    quantiteStock: 0
  };
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  private medicamentService = inject(MedicamentService);
  
  constructor() {}

  ngOnInit() {
    if (this.editMode && this.medicament) {
      // Deep copy to avoid mutating parent
      this.localMedicament = { ...this.medicament };
    }
  }

  onSubmit(form: any) {
    if (form.invalid) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.editMode && this.localMedicament.id !== undefined) {
      // Edition
      this.medicamentService.updateMedicament(this.localMedicament).subscribe({
        next: (updated) => {
          this.successMessage = 'Médicament modifié avec succès !';
          this.medicamentUpdated.emit(updated);
          this.loading = false;
          this.close.emit();
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de la modification du médicament.";
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      // Ajout
      this.medicamentService.saveMedicament(this.localMedicament).subscribe({
        next: (created) => {
          this.successMessage = 'Médicament ajouté avec succès !';
          this.localMedicament = {
            name: '',
            dosage: '',
            forme: '',
            presentation: '',
            price: 0,
            remboursement: 0,
            dci: '',
            dciCode: '',
            datePeremption: new Date(),
            fournisseur: '',
            categorie: 'ANTIBIOTIQUE',
            quantiteStock: 0
          };
          form.resetForm();
          this.loading = false;
          this.medicamentUpdated.emit(created);
          this.close.emit();
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de l'ajout du médicament.";
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}
