import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2, Plus, Upload, Search, X, Check, ChevronDown, ChevronRight } from 'angular-feather/icons';

import { MedicamentListComponent } from '../medicament-list/medicament-list.component';
import { AddMedicamentDialogComponent } from '../add-medicament-dialog/add-medicament-dialog.component';
import { ImportMedicamentsDialogComponent } from '../import-medicaments-dialog/import-medicaments-dialog.component';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

const routes: Routes = [
  {
    path: '',
    component: MedicamentListComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddMedicamentDialogComponent,
    ImportMedicamentsDialogComponent,
    MedicamentListComponent,
    RouterModule.forChild(routes),
    NgbModule,
    NgxDatatableModule,
    FeatherModule.pick({
      Edit, 
      Trash2, 
      Plus, 
      Upload, 
      Search, 
      X, 
      Check, 
      ChevronDown, 
      ChevronRight
    }),
    FileSizePipe
  ],
  exports: [RouterModule]
})
export class MedicamentModule { }
