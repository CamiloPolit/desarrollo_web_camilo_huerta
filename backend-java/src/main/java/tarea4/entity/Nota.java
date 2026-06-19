package tarea4.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Única entidad de escritura del backend Java: propiedad exclusiva de Tarea 4. */
@Entity
@Table(name = "nota")
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nota", nullable = false)
    private Integer nota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actividad_id", nullable = false)
    private Actividad actividad;

    protected Nota() {
    }

    public Nota(Integer nota, Actividad actividad) {
        this.nota = nota;
        this.actividad = actividad;
    }

    public Integer getId() { return id; }
    public Integer getNota() { return nota; }
    public Actividad getActividad() { return actividad; }
}
