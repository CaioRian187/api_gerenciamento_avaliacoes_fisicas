package com.CaioRian.AvaliacoesFisicas.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CaioRian.AvaliacoesFisicas.exceptions.NotFoundException;
import com.CaioRian.AvaliacoesFisicas.models.Circunferencias;
import com.CaioRian.AvaliacoesFisicas.models.DobrasCutaneas;
import com.CaioRian.AvaliacoesFisicas.repository.DobrasCutaneasRepository;

@Service
public class DobrasCutaneasService {
    
    @Autowired
    private DobrasCutaneasRepository dobrasCutaneasRepository;

    @Autowired
    private CircunferenciasService circunferenciasService;
    
    public DobrasCutaneas findById(Long id){
        Optional<DobrasCutaneas> dobrasCutaneas = this.dobrasCutaneasRepository.findById(id);

        return dobrasCutaneas.orElseThrow( () -> new NotFoundException("Dobras cutâneas não encontradas."));
    }

    public List<DobrasCutaneas> findAllByAlunoId(UUID id){
        List<DobrasCutaneas> list = this.dobrasCutaneasRepository.findByAluno_id(id);
        if (list.isEmpty()){
            throw new NotFoundException("Dobras Cutâneas não encontradas.");
        }
        return list;
    }

    public List<DobrasCutaneas> findAll(){
        List<DobrasCutaneas> list = this.dobrasCutaneasRepository.findAll();
        if (list.isEmpty()){
            throw new NotFoundException("Dobras Cutâneas não encontradas.");
        }
        return list;
    }

    @Transactional
    public void createDobras(DobrasCutaneas dobrasCutaneas, UUID alunoId) {
        List<Circunferencias> lista = this.circunferenciasService.findAllByAlunoId(alunoId);
        if (lista.isEmpty()) {
           throw new NotFoundException("O aluno precisa ter circunferências antes de cadastrar dobras.");
        }
        Circunferencias circ = lista.get(lista.size() - 1);
        dobrasCutaneas.setAluno(circ.getAluno());
        double rcqBruto = circ.getCintura() / circ.getQuadril();
        double rcqFormatado = Math.round(rcqBruto * 100.0) / 100.0;
        dobrasCutaneas.setRelacaoCinturaQuadril(rcqFormatado);


        double somatorioMasculino = dobrasCutaneas.getPeitoral() + dobrasCutaneas.getAbdominal() + dobrasCutaneas.getCoxa();
        double somatorioFeminino = dobrasCutaneas.getTriceps() + dobrasCutaneas.getSuprailiaca() + dobrasCutaneas.getCoxa();
        String sexo = dobrasCutaneas.getAluno().getSexo();
        int idade = dobrasCutaneas.getAluno().getIdade();

        double densidade = 0;
        if ("Masculino".equalsIgnoreCase(sexo)){
            densidade = 1.109380 - (0.0008267 * somatorioMasculino) + (0.0000016 * Math.pow(somatorioMasculino, 2)) - (0.0002574 * idade);
        }
        if ("Feminino".equalsIgnoreCase(sexo)){
            densidade = 1.099421 - (0.0009929 * somatorioFeminino) + (0.0000023 * Math.pow(somatorioFeminino, 2)) - (0.0001392 * idade);
        }

        if (densidade > 0){
        double percentual = ((4.95 / densidade) - 4.50) * 100;
        double percentualFormatado = Math.round(percentual * 100.0) / 100.0;
        dobrasCutaneas.setPercentualGordura(percentualFormatado);
        }else{
            dobrasCutaneas.setPercentualGordura(0.0);
        }
        this.dobrasCutaneasRepository.save(dobrasCutaneas);
    }

    @Transactional
    public DobrasCutaneas updateDobras(DobrasCutaneas dobrasCutaneas,UUID alunoId){
        DobrasCutaneas newDobrasCutaneas = this.findById(dobrasCutaneas.getId());

        newDobrasCutaneas.setData(dobrasCutaneas.getData());
        newDobrasCutaneas.setBiceps(dobrasCutaneas.getBiceps());
        newDobrasCutaneas.setTriceps(dobrasCutaneas.getTriceps());
        newDobrasCutaneas.setSubescapular(dobrasCutaneas.getSubescapular());
        newDobrasCutaneas.setPanturrilhaMedial(dobrasCutaneas.getPanturrilhaMedial());
        newDobrasCutaneas.setAbdominal(dobrasCutaneas.getAbdominal());
        newDobrasCutaneas.setSuprailiaca(dobrasCutaneas.getSuprailiaca());
        newDobrasCutaneas.setCoxa(dobrasCutaneas.getCoxa());
        newDobrasCutaneas.setPeitoral(dobrasCutaneas.getPeitoral());

        List<Circunferencias> lista = this.circunferenciasService.findAllByAlunoId(alunoId);
        Circunferencias circ = lista.get(lista.size() - 1);
        double rcqBruto = circ.getCintura() / circ.getQuadril();
        double rcqFormatado = Math.round(rcqBruto * 100.0) / 100.0;
        newDobrasCutaneas.setRelacaoCinturaQuadril(rcqFormatado);

        double somatorioMasculino = dobrasCutaneas.getPeitoral() + dobrasCutaneas.getAbdominal() + dobrasCutaneas.getCoxa();
        double somatorioFeminino = dobrasCutaneas.getTriceps() + dobrasCutaneas.getSuprailiaca() + dobrasCutaneas.getCoxa();
        String sexo = newDobrasCutaneas.getAluno().getSexo();
        int idade = newDobrasCutaneas.getAluno().getIdade();

        double densidade = 0;
        if ("Masculino".equalsIgnoreCase(sexo)){
            densidade = 1.109380 - (0.0008267 * somatorioMasculino) + (0.0000016 * Math.pow(somatorioMasculino, 2)) - (0.0002574 * idade);
        }
        if ("Feminino".equalsIgnoreCase(sexo)){
            densidade = 1.099421 - (0.0009929 * somatorioFeminino) + (0.0000023 * Math.pow(somatorioFeminino, 2)) - (0.0001392 * idade);
        }

        if (densidade > 0){
        double percentual = ((4.95 / densidade) - 4.50) * 100;
        double percentualFormatado = Math.round(percentual * 100.0) /100.0;
        newDobrasCutaneas.setPercentualGordura(percentualFormatado);
        }
        else{
            newDobrasCutaneas.setPercentualGordura(0.0);
        }
        return this.dobrasCutaneasRepository.save(newDobrasCutaneas);
    }

    public void deletarDobras(Long id){
        findById(id);

        try{
            this.dobrasCutaneasRepository.deleteById(id);
        }
        catch(DataIntegrityViolationException exception){
            throw new DataIntegrityViolationException("Não é possível excluir, pois há vinculações");
        }
    }
}
