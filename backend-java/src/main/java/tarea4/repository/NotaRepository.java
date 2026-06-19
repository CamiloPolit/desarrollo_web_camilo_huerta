package tarea4.repository;

import tarea4.entity.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotaRepository extends JpaRepository<Nota, Integer> {

    interface NotaStats {
        Double getPromedio();
        Long getConteo();
    }

    @Query("SELECT AVG(n.nota) AS promedio, COUNT(n) AS conteo " +
           "FROM Nota n WHERE n.actividad.id = :actividadId")
    NotaStats estadisticasPorActividad(@Param("actividadId") Integer actividadId);
}
