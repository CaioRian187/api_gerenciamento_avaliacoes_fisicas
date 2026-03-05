package com.CaioRian.AvaliacoesFisicas.repository;

import com.CaioRian.AvaliacoesFisicas.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID>{
    
}
