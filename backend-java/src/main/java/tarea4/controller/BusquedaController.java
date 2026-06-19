package tarea4.controller;

import tarea4.dto.ActividadBusquedaDTO;
import tarea4.service.ActividadService;
import java.util.Collections;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/actividades")
public class BusquedaController {

    private final ActividadService actividadService;

    public BusquedaController(ActividadService actividadService) {
        this.actividadService = actividadService;
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ActividadBusquedaDTO>> buscar(@RequestParam("q") String q) {
        if (q == null || q.trim().length() < 3) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(actividadService.buscar(q.trim()));
    }
}
