package tarea4.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entidad de solo lectura: Flask es el único backend que escribe esta tabla.
 * `dia` se mapea como String (no enum Java) para evitar problemas con las
 * tildes de 'Miércoles' y 'Sábado' en identificadores de enum.
 */
@Entity
@Table(name = "horario")
public class Horario {

    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actividad_id", nullable = false)
    private Actividad actividad;

    @Column(nullable = false)
    private String dia;

    @Column(name = "hora_inicio", nullable = false, length = 5)
    private String horaInicio;

    @Column(name = "hora_fin", nullable = false, length = 5)
    private String horaFin;

    public Integer getId() { return id; }
    public Actividad getActividad() { return actividad; }
    public String getDia() { return dia; }
    public String getHoraInicio() { return horaInicio; }
    public String getHoraFin() { return horaFin; }
}
