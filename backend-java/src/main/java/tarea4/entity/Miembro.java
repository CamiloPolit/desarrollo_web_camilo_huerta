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
 * Solo se mapean las columnas que necesita el buscador de actividades.
 */
@Entity
@Table(name = "miembro")
public class Miembro {

    @Id
    private Integer id;

    @Column(nullable = false, length = 255)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comuna_id", nullable = false)
    private Comuna comuna;

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public Comuna getComuna() { return comuna; }
}
