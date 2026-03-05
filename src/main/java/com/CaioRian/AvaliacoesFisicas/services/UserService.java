package com.CaioRian.AvaliacoesFisicas.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CaioRian.AvaliacoesFisicas.exceptions.NotFoundException;
import com.CaioRian.AvaliacoesFisicas.models.User;
import com.CaioRian.AvaliacoesFisicas.repository.UserRepository;


@Service
public class UserService {
    
    @Autowired
    private UserRepository alunoRepository;

    public User findByNome(String nome){
        return alunoRepository.findByNome(nome).orElseThrow( () -> new NotFoundException("Aluno de nome " + nome + " não encontrado."));
    }

    public User findById(UUID id){
        Optional<User> aluno = this.alunoRepository.findById(id);
        return aluno.orElseThrow( () -> new NotFoundException("Aluno de id " + id + " não encontrado."));
    }

    public List<User> findAllAlunos(){
        List<User> list = this.alunoRepository.findAll();
        if (list.isEmpty()){
            throw new NotFoundException("Nenhum aluno encontrado.");
        }
        return list;
    }

    @Transactional
    public void createAluno(User aluno){
        this.alunoRepository.save(aluno);
    }

    @Transactional
    public User updateAluno(User aluno){
        User newAluno = findById(aluno.getId());

        newAluno.setNome(aluno.getNome());
        newAluno.setIdade(aluno.getIdade());
        newAluno.setSexo(aluno.getSexo());

        return this.alunoRepository.save(newAluno);
    }

    public void deleteAluno(UUID id){
        findById(id);
        try{
            this.alunoRepository.deleteById(id);
        }
        catch (DataIntegrityViolationException exception){
            throw new DataIntegrityViolationException("Não é possível excluir, pois o aluno possui vinculações");
        }
    }
    
}
