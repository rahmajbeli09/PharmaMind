import { Component } from '@angular/core';
import { InscriptionAdminPharmacieService, InscriptionAdminPharmacieRequest } from 'src/app/services/inscription-admin-pharmacie.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register-pharmacien',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register-pharmacien.component.html',
  styleUrls: ['./register-pharmacien.component.scss']
})

export class RegisterPharmacienComponent {
  today = new Date().toISOString().split('T')[0]; // Pour la validation de la date de naissance
  constructor(private inscriptionService: InscriptionAdminPharmacieService) {}

  // Contrôle de saisie pour la partie 1
  nomTouched = false;
  emailTouched = false;
  motDePasseTouched = false;
  adresseTouched = false;
  villeTouched = false;
  dateNaissanceTouched = false;
  cinTouched = false;
  telephoneTouched = false;

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  isValidPassword(pw: string): boolean {
    return pw && pw.length >= 6;
  }
  isPart1Valid(): boolean {
    return !!this.nom && this.isValidEmail(this.email) && this.isValidPassword(this.motDePasse) && !!this.adresse && !!this.ville;
  }

  // Pour la vérification de l'email
  code1: string = '';
  code2: string = '';
  code3: string = '';
  code4: string = '';

  // Soumission du code de vérification
  verificationError: string = '';
  isSubmitting: boolean = false;

  submitVerificationCode() {
    this.verificationError = '';
    this.isSubmitting = true;
    const code = this.code1 + this.code2 + this.code3 + this.code4;
    this.inscriptionService.verifyCode(this.email, code).subscribe({
      next: (result) => {
        // Si le backend retourne explicitement "OK", "success" ou similaire, tu peux vérifier ici
        // On considère que toute réponse sans erreur = code valide
        this.finalizeInscription();
      },
      error: err => {
        this.isSubmitting = false;
        this.verificationError = 'Code de vérification invalide ou expiré.';
      }
    });
  }

  finalizeInscription() {
    const request = {
      nom: this.nom,
      email: this.email,
      motDePasse: this.motDePasse,
      adresse: this.adresse,
      ville: this.ville,
      dateNaissance: this.dateNaissance,
      cin: this.cin,
      telephone: this.telephone,
      nomPharmacie: this.nomPharmacie,
      adressePharmacie: this.adressePharmacie,
      gouvernorat: this.gouvernorat,
      codePostal: this.codePostal,
      latitude: this.latitude,
      longitude: this.longitude
    };

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (this.diplome) formData.append('diplome', this.diplome);
    if (this.carte) formData.append('carte', this.carte);
    if (this.autorisation) formData.append('autorisation', this.autorisation);

    this.inscriptionService.inscrireAdminPharmacie(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Inscription enregistrée avec succès !');
        // Redirection ou reset du formulaire possible ici
      },
      error: err => {
        this.isSubmitting = false;
        alert('Erreur : ' + (err?.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  step: number = 1;

  goToStep(step: number) {
    if (step === 3) {
      this.isSubmitting = true;
      this.verificationError = '';
      this.inscriptionService.sendVerificationCode(this.email).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.step = step;
        },
        error: () => {
          this.isSubmitting = false;
          this.verificationError = "Erreur lors de l'envoi du code de vérification.";
        }
      });
    } else {
      this.step = step;
    }
  }

  getProgress(): string {
    switch (this.step) {
      case 1: return '33%';
      case 2: return '66%';
      case 3: return '100%';
      default: return '0%';
    }
  }

  nom: string = '';
  email: string = '';
  motDePasse: string = '';
  adresse: string = '';
  ville: string = '';
  dateNaissance: string = '';
  cin: string = '';
  telephone: string = '';
  role: string = '';
  nomPharmacie: string = '';
  adressePharmacie: string = '';
  gouvernorat: string = '';
  codePostal: string = '';
  latitude: number | null = null;
  longitude: number | null = null;
  diplome: File | null = null;
  carte: File | null = null;
  autorisation: File | null = null;

  currentFieldIndex: number = 0;
  fieldNames: string[] = [
    'nom', 'email', 'motDePasse', 'adresse', 'ville', 'role',
    'nomPharmacie', 'adressePharmacie', 'gouvernorat', 'codePostal', 'telephone',
    'latitude', 'longitude', 'diplome', 'carte', 'autorisation'
  ];

  nextField() {
    if (this.currentFieldIndex < this.fieldNames.length - 1) {
      this.currentFieldIndex++;
      setTimeout(() => {
        const nextInput = document.getElementById('field-' + this.fieldNames[this.currentFieldIndex]);
        if (nextInput) (nextInput as HTMLElement).focus();
      }, 0);
    }
  }

  onFileChange(event: any, type: string) {
    const file = event.target.files[0];
    if (type === 'diplome') this.diplome = file;
    if (type === 'carte') this.carte = file;
    if (type === 'autorisation') this.autorisation = file;
    this.nextField();
  }

  onSubmit() {
    // TODO: handle the form submission, including file upload
  }
}

