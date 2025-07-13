export interface TicketDeCaisseItem {
  medicamentId: number;
  medicamentName: string;
  quantite: number;
  prixUnitaire: number;
}

export interface TicketDeCaisse {
  id?: number;
  dateSortieTicket: string;
  montantTotal: number;
  pharmacien: {
    id: number;
    nom?: string;
  };
  medicamentsSelectionnes: Array<{
    id: number;
    name: string;
    dci: string;
    dosage: string;
    forme: string;
    presentation: string;
    price: number;
    quantiteStock: number;
    datePeremption: string;
    fournisseur: string;
    categorie: string;
    remboursement?: number;
  }>;
}
