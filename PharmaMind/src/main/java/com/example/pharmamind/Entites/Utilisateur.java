package com.example.pharmamind.Entites;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Entity
@Data
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String email;
    private String motDePasse;
    private String adresse;
    private String ville;
    private double latitude;
    private double longitude;
    private boolean isActive = false;
    @Enumerated(EnumType.STRING)
    private Role role;
    @ManyToOne
    @JoinColumn(name = "pharmacie_id")
    @JsonBackReference
    private Pharmacie pharmacie;
    private String cin;
    private String dateNaissance;
    private Long telephone;


}
