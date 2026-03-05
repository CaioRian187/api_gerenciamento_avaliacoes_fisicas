package com.CaioRian.AvaliacoesFisicas.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.CaioRian.AvaliacoesFisicas.models.Circunferencias;
import com.CaioRian.AvaliacoesFisicas.services.UserService;
import com.CaioRian.AvaliacoesFisicas.services.CircunferenciasService;

import jakarta.validation.Valid;

@CrossOrigin("*")
@RestController
@RequestMapping("/circunferencias")
@Validated
public class CircunferenciasController {
    
    @Autowired
    private CircunferenciasService circunferenciasService;

    @Autowired
    private UserService alunoService;

    @GetMapping("/{id}")
    public ResponseEntity<Circunferencias> findById(@PathVariable Long id){
        Circunferencias circunferencias = this.circunferenciasService.findById(id);

        return ResponseEntity.ok().body(circunferencias);
    }

    @GetMapping("/aluno/{id_aluno}")
    public ResponseEntity<List<Circunferencias>> findAllByAlunoId(@PathVariable UUID id_aluno){
        this.alunoService.findById(id_aluno);
        List<Circunferencias> list = this.circunferenciasService.findAllByAlunoId(id_aluno);
        return ResponseEntity.ok().body(list);
    }

    @GetMapping
    public ResponseEntity<List<Circunferencias>> findAll(){
        List<Circunferencias> list = this.circunferenciasService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @PostMapping
    public ResponseEntity<Void> createCircunferencia(@Valid @RequestBody Circunferencias circunferencias){
        this.circunferenciasService.createCircunferencia(circunferencias);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(circunferencias.getId()).toUri();

        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCircunferencia(@Valid @RequestBody Circunferencias circunferencias, @PathVariable Long id){
        circunferencias.setId(id);
        circunferencias = this.circunferenciasService.updateCircunferencias(circunferencias);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCircunferencia(@PathVariable Long id){
        this.circunferenciasService.deletarCircunferencia(id);
        return ResponseEntity.noContent().build();
    }
}
