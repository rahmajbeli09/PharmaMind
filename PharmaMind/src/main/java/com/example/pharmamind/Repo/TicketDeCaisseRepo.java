package com.example.pharmamind.Repo;

import com.example.pharmamind.Entites.TicketDeCaisse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketDeCaisseRepo extends JpaRepository<TicketDeCaisse, Long> {
    // Additional query methods can be defined here if needed
}
