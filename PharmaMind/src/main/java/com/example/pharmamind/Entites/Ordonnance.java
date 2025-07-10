package com.example.pharmamind.Entites;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
public class Ordonnance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateAjout;

    @ManyToOne
    private Utilisateur utilisateur;

    private String imageUrl;

    @OneToMany(mappedBy = "ordonnance", cascade = CascadeType.ALL)
    private List<MedicamentPrescrit> medicamentsPrescrits;
}