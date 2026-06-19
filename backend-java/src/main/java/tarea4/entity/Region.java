package tarea4.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Entidad de solo lectura: Flask es el único backend que escribe esta tabla. */
@Entity
@Table(name = "region")
public class Region {

    @Id
    private Integer id;

    @Column(nullable = false, length = 200)
    private String nombre;

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
}
