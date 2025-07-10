package com.example.pharmamind.Entites;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class InscriptionAdminPharmacieRequest {
    // Champs utilisateur
    private String nom;
    private String email;
    private String motDePasse;
    private String adresse;
    private String ville;
    private Role role;
    private String cin;
    private String dateNaissance;
    private Long telephone;

    // Champs pharmacie
    private String nomPharmacie;
    private String adressePharmacie;
    private String gouvernorat;
    private String codePostal;
    private String telephonePh;
    private double latitude;
    private double longitude;
    private String diplome;
    private String carte;
    private String autorisation;
}
