import { Component } from '@angular/core';

@Component({
  selector: 'app-stock',
  template: `
    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">stock</h4>
      </div>
      <div class="card-body">
        <p>Contenu de stock</p>
        <!-- Contenu à implémenter -->
      </div>
    </div>
  `
})
export class StockComponent {
  constructor() { }
}