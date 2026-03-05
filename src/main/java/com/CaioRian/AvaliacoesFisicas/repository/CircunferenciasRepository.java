package com.CaioRian.AvaliacoesFisicas.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.CaioRian.AvaliacoesFisicas.models.Circunferencias;

public interface CircunferenciasRepository extends JpaRepository<Circunferencias, Long>{

    List<Circunferencias> findByAluno_id(UUID id);
    
}
