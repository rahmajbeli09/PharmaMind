import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Confirmer la suppression</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>Êtes-vous sûr de vouloir supprimer <strong>{{ name }}</strong> ?</p>
      <p class="text-danger">Cette action est irréversible.</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.dismiss()">Annuler</button>
      <button type="button" class="btn btn-danger" (click)="activeModal.close('confirm')">Supprimer</button>
    </div>
  `
})
export class ConfirmDeleteModalComponent {
  @Input() name: string = '';

  constructor(public activeModal: NgbActiveModal) {}
}
