package com.example.pharmamind.Entites;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Pharmacie pharmacie;

    @ManyToOne
    private Medicament medicament;

    private int quantiteDisponible;
    private LocalDate dateDernierApprovisionnement;
}
