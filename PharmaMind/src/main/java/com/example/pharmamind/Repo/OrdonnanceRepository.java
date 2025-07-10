package com.example.pharmamind.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.pharmamind.Entites.Ordonnance;

public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {
}