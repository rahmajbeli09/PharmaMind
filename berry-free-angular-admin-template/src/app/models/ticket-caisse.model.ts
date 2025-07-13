import { Medicament } from './medicament.model';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  motDePasse: string;
  adresse: string;
  ville: string;
  latitude: number;
  longitude: number;
  role: string;
  cin: string;
  dateNaissance: string;
  telephone: number;
  active: boolean;
}

export interface TicketDeCaisse {
  id: number;
  dateSortieTicket: string;
  pharmacien: Utilisateur;
  montantTotal: number;
  medicamentsSelectionnes: Medicament[];
}
