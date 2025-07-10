import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MedicamentService } from '../../../services/medicament.service';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-import-medicaments-dialog',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FileSizePipe],
  templateUrl: './import-medicaments-dialog.component.html',
  styleUrls: ['./import-medicaments-dialog.component.scss']
})
export class ImportMedicamentsDialogComponent implements AfterViewInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @Output() close = new EventEmitter<void>();
  @Output() importComplete = new EventEmitter<{success: number, failed: number}>();

  selectedFile: File | null = null;
  loading = false;
  importMessage = '';
  importResult: {success: number, failed: number} | null = null;

  constructor(private medicamentService: MedicamentService) {}

  ngAfterViewInit() {
    // Open the file picker automatically after the dialog appears
    setTimeout(() => {
      this.fileInput.nativeElement.click();
    }, 0);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.importMessage = '';
      this.importResult = null;
      // Auto-submit when file is selected
      this.onImport(event);
    }
  }

  triggerFileInput() {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  // Fonction d'importation de médicaments depuis un fichier CSV
  async onImport(event: Event) {
    event.preventDefault();
    if (!this.selectedFile) return;
    
    this.loading = true;
    this.importMessage = 'Traitement en cours...';
    this.importResult = null;

    try {
      const text = await this.selectedFile.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      
      if (lines.length < 2) {
        this.importMessage = 'Le fichier ne contient pas de données.';
        this.loading = false;
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      let success = 0, failed = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) { 
          failed++; 
          continue; 
        }
        
        const medicament: any = {};
        headers.forEach((h, idx) => medicament[h] = values[idx]);
        
        // Skip if required fields are missing
        if (!medicament.name || !medicament.dosage || !medicament.forme || !medicament.presentation) {
          failed++;
          continue;
        }
        
        // Convert numeric fields with proper error handling
        try {
          medicament.price = parseFloat(medicament.price) || 0;
          medicament.remboursement = parseFloat(medicament.remboursement) || 0;
          medicament.quantiteStock = parseInt(medicament.quantiteStock, 10) || 0;
          
          await this.medicamentService.importCsvLine(medicament).toPromise();
          success++;
        } catch (e) {
          console.error('Error importing line:', e);
          failed++;
        }
      }
      
      this.importResult = { success, failed };
      this.importMessage = `${success} médicament(s) importé(s) avec succès.`;
      this.importComplete.emit({ success, failed });
      
      // Close the dialog after a short delay
      setTimeout(() => {
        this.close.emit();
      }, 1500);
      
    } catch (err) {
      console.error('Import error:', err);
      this.importMessage = 'Une erreur est survenue lors de l\'importation du fichier.';
    } finally {
      this.loading = false;
    }
  }

  onClose() {
    this.close.emit();
  }
}
