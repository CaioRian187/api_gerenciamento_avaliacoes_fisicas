package com.CaioRian.AvaliacoesFisicas.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.CaioRian.AvaliacoesFisicas.models.DobrasCutaneas;

public interface DobrasCutaneasRepository extends JpaRepository<DobrasCutaneas, Long>{
    
    List<DobrasCutaneas> findByAluno_id(UUID id);
    
}
