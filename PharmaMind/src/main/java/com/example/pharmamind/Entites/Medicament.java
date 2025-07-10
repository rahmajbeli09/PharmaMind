package com.example.pharmamind.Entites;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;               // Nom commercial du médicament
    private String dosage;             // Dosage : ex "50 mg"
    private String forme;              // Forme : ex "Comprimés"
    private String presentation;       // Présentation : ex "B/90"
    private Double price;              // Prix en dinars
    private Double remboursement;      // Montant remboursé
    private String dci;                // Dénomination Commune Internationale
    @Enumerated(EnumType.STRING)
    private Categorie categorie;       // Tu peux toujours garder une catégorisation interne
    private int quantiteStock;         // Toujours utile pour ta gestion interne
}
