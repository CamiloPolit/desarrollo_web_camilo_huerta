package tarea4.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

/** Entidad de solo lectura: Flask es el único backend que escribe esta tabla. */
@Entity
@Table(name = "actividad")
public class Actividad {

    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "miembro_id", nullable = false)
    private Miembro miembro;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false)
    private String categoria;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @OneToMany(mappedBy = "actividad", fetch = FetchType.LAZY)
    private List<Horario> horarios = new ArrayList<>();

    public Integer getId() { return id; }
    public Miembro getMiembro() { return miembro; }
    public String getTitulo() { return titulo; }
    public String getCategoria() { return categoria; }
    public String getDescripcion() { return descripcion; }
    public List<Horario> getHorarios() { return horarios; }
}
