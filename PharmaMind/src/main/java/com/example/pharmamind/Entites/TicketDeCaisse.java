package com.example.pharmamind.Entites;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class TicketDeCaisse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateSortieTicket;

    @ManyToOne
    @JoinColumn(name = "id_pharmacien")
    private Utilisateur pharmacien;

    private Double montantTotal;

    @ManyToMany
    @JoinTable(
            name = "ticket_medicaments",
            joinColumns = @JoinColumn(name = "ticket_id"),
            inverseJoinColumns = @JoinColumn(name = "medicament_id")
    )
    private List<Medicament> medicamentsSelectionnes;
}

