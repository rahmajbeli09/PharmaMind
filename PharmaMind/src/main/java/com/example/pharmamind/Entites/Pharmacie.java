package com.example.pharmamind.Entites;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Pharmacie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private String gouvernorat;
    private String codePostal;
    private String telephone;
    private double latitude;
    private double longitude;

    // Stockage des images en base de données
    @Lob
    private byte[] diplome;

    @Lob
    private byte[] autorisation;

    @Lob
    private byte[] carte;

    @OneToMany(mappedBy = "pharmacie")
    private List<Stock> stocks;
    @OneToMany(mappedBy = "pharmacie")
    @JsonManagedReference
    private List<Utilisateur> utilisateurs;
}
