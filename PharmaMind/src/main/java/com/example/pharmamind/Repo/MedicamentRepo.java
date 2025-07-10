package com.example.pharmamind.Repo;


import com.example.pharmamind.Entites.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentRepo extends JpaRepository<Medicament, Long> {
}
