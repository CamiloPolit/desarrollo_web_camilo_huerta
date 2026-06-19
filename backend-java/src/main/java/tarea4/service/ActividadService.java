package tarea4.service;

import tarea4.dto.ActividadBusquedaDTO;
import tarea4.entity.Actividad;
import tarea4.entity.Horario;
import tarea4.repository.ActividadRepository;
import tarea4.repository.NotaRepository;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActividadService {

    private final ActividadRepository actividadRepository;
    private final NotaRepository notaRepository;

    public ActividadService(ActividadRepository actividadRepository, NotaRepository notaRepository) {
        this.actividadRepository = actividadRepository;
        this.notaRepository = notaRepository;
    }

    @Transactional(readOnly = true)
    public List<ActividadBusquedaDTO> buscar(String texto) {
        return actividadRepository.buscar(texto).stream()
            .map(this::aDTO)
            .toList();
    }

    private ActividadBusquedaDTO aDTO(Actividad a) {
        List<String> dias = new ArrayList<>(new LinkedHashSet<>(
            a.getHorarios().stream().map(Horario::getDia).toList()
        ));

        NotaRepository.NotaStats stats = notaRepository.estadisticasPorActividad(a.getId());
        Double promedio = (stats != null && stats.getPromedio() != null)
            ? Math.round(stats.getPromedio() * 100) / 100.0
            : null;
        Long conteo = (stats != null && stats.getConteo() != null) ? stats.getConteo() : 0L;

        return new ActividadBusquedaDTO(
            a.getId(),
            a.getTitulo(),
            a.getDescripcion(),
            a.getCategoria(),
            a.getMiembro().getComuna().getNombre(),
            a.getMiembro().getNombre(),
            dias,
            promedio,
            conteo
        );
    }
}
