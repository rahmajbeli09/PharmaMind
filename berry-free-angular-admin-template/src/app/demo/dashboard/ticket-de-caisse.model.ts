export interface TicketDeCaisseItem {
  medicamentId: number;
  medicamentName: string;
  quantite: number;
  prixUnitaire: number;
}

export interface TicketDeCaisse {
  items: TicketDeCaisseItem[];
  dateSortieTicket: string;
  montantTotal: number;
}
