package com.CaioRian.AvaliacoesFisicas.models.dto;

import com.CaioRian.AvaliacoesFisicas.models.enums.UserRole;

public record CadastroDto(String nome,
                          Integer idade,
                          String sexo,
                          String login,
                          String password,
                          UserRole role
    ) {
}
