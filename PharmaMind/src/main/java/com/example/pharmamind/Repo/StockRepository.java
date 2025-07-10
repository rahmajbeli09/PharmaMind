package com.example.pharmamind.Repo;
import com.example.pharmamind.Entites.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Long> {
}
