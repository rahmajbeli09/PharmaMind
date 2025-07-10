package com.example.pharmamind.Repo;


import com.example.pharmamind.Entites.Pharmacie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacieRepo extends JpaRepository<Pharmacie, Long> {
}