package com.example.pharmamind.Repo;


import com.example.pharmamind.Entites.Pharmacie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacieRepo extends JpaRepository<Pharmacie, Long> {


}