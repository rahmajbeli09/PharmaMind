export interface Medicament {
  id?: number;
  name: string;
  dci: string;
  dosage: string;
  forme: string;
  presentation: string;
  dciCode: string;
  price: number;
  quantiteStock: number;
  datePeremption: Date;
  fournisseur: string;
  categorie: string;
  remboursement?: number;
}
