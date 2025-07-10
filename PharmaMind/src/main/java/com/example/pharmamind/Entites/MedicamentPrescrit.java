package com.example.pharmamind.Entites;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class MedicamentPrescrit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomReconnu;
    private String posologie;

    @ManyToOne
    private Ordonnance ordonnance;
}

