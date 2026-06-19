package tarea4.controller;

import tarea4.dto.NotaRequestDTO;
import tarea4.dto.NotaResponseDTO;
import tarea4.entity.Actividad;
import tarea4.entity.Nota;
import tarea4.repository.ActividadRepository;
import tarea4.repository.NotaRepository;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/actividades")
public class NotaController {

    private final ActividadRepository actividadRepository;
    private final NotaRepository notaRepository;

    public NotaController(ActividadRepository actividadRepository, NotaRepository notaRepository) {
        this.actividadRepository = actividadRepository;
        this.notaRepository = notaRepository;
    }

    @PostMapping("/{id}/notas")
    public ResponseEntity<?> agregarNota(@PathVariable("id") Integer id,
                                          @Valid @RequestBody NotaRequestDTO body) {
        Actividad actividad = actividadRepository.findById(id).orElse(null);
        if (actividad == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Actividad no encontrada."));
        }

        notaRepository.save(new Nota(body.getNota(), actividad));

        NotaRepository.NotaStats stats = notaRepository.estadisticasPorActividad(id);
        Double promedio = (stats != null && stats.getPromedio() != null)
            ? Math.round(stats.getPromedio() * 100) / 100.0
            : null;
        Long conteo = (stats != null && stats.getConteo() != null) ? stats.getConteo() : 0L;

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new NotaResponseDTO(id, promedio, conteo));
    }
}
