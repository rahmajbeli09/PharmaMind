package com.example.pharmamind.Repo;

import com.example.pharmamind.Entites.TicketDeCaisse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TicketDeCaisseRepo extends JpaRepository<TicketDeCaisse, Long> {
    List<TicketDeCaisse> findByDateSortieTicketAndPharmacien_Pharmacie_Id(LocalDateTime dateTime, Long pharmacieId);

    @Query("SELECT t FROM TicketDeCaisse t WHERE t.pharmacien.pharmacie.id = :pharmacieId AND FUNCTION('DATE', t.dateSortieTicket) = :date")
    List<TicketDeCaisse> findAllByPharmacieIdAndExactDate(@Param("pharmacieId") Long pharmacieId, @Param("date") LocalDate date);

    // A    dditional query methods can be defined here if needed
}
