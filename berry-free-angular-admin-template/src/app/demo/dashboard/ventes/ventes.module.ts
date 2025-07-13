import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { VentesComponent } from './ventes.component';

const routes: Routes = [
  {
    path: '',
    component: VentesComponent
  }
];

@NgModule({
  declarations: [VentesComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgbPaginationModule
  ]
})
export class VentesModule { }
