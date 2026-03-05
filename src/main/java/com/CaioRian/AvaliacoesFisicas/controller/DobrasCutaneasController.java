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

import com.CaioRian.AvaliacoesFisicas.models.DobrasCutaneas;
import com.CaioRian.AvaliacoesFisicas.services.DobrasCutaneasService;

import jakarta.validation.Valid;
@CrossOrigin("*")
@RestController
@RequestMapping("/dobrasCutaneas")
@Validated
public class DobrasCutaneasController {
    
    @Autowired
    private DobrasCutaneasService dobrasCutaneasService;

    @GetMapping("/{id}")
    public ResponseEntity<DobrasCutaneas> findById(@PathVariable Long id){
        DobrasCutaneas dobrasCutaneas = this.dobrasCutaneasService.findById(id);

        return ResponseEntity.ok().body(dobrasCutaneas);
    }

    @GetMapping("aluno/{id_aluno}")
    public ResponseEntity<List<DobrasCutaneas>> findAllByAlunoId(@PathVariable UUID id_aluno){
        List<DobrasCutaneas> list = this.dobrasCutaneasService.findAllByAlunoId(id_aluno);

        return ResponseEntity.ok().body(list);
    }

    @GetMapping
    public ResponseEntity<List<DobrasCutaneas>> findAll(){
        List<DobrasCutaneas> list = this.dobrasCutaneasService.findAll();

        return ResponseEntity.ok().body(list);
    }

    @PostMapping("/aluno/{id_aluno}")
    public ResponseEntity<Void> create(@Valid @RequestBody DobrasCutaneas dobrasCutaneas, @PathVariable UUID id_aluno){
        this.dobrasCutaneasService.createDobras(dobrasCutaneas, id_aluno);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(dobrasCutaneas.getId()).toUri();
        
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}/aluno/{id_aluno}")
    public ResponseEntity<Void> update(@Valid @RequestBody DobrasCutaneas dobrasCutaneas, @PathVariable Long id, @PathVariable UUID id_aluno){
        dobrasCutaneas.setId(id);
        dobrasCutaneas = this.dobrasCutaneasService.updateDobras(dobrasCutaneas, id_aluno);
        return ResponseEntity.noContent().build(); 
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        this.dobrasCutaneasService.deletarDobras(id);
        return ResponseEntity.noContent().build();
    }
    
}
