package com.CaioRian.AvaliacoesFisicas.repository;

import com.CaioRian.AvaliacoesFisicas.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID>{
    UserDetails findByLogin(String login);
}
