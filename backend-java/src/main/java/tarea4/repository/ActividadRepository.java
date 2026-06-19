package tarea4.repository;

import tarea4.entity.Actividad;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActividadRepository extends JpaRepository<Actividad, Integer> {

    @Query("""
        SELECT DISTINCT a FROM Actividad a JOIN a.miembro m JOIN m.comuna c
        WHERE LOWER(a.titulo) LIKE LOWER(CONCAT('%', :texto, '%'))
           OR LOWER(a.descripcion) LIKE LOWER(CONCAT('%', :texto, '%'))
           OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
        ORDER BY a.titulo ASC
        """)
    List<Actividad> buscar(@Param("texto") String texto);
}
