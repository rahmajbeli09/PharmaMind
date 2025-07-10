package com.example.pharmamind.Repo;


import com.example.pharmamind.Entites.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepo extends JpaRepository<Utilisateur, Long> {
    boolean existsByEmail(String email);
    Optional<Utilisateur> findByEmail(String email);
    List<Utilisateur> findByIsActiveFalse();
    List<Utilisateur> findByPharmacie_Id(Long pharmacieId);

}
