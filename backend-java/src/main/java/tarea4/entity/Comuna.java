package tarea4.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Entidad de solo lectura: Flask es el único backend que escribe esta tabla. */
@Entity
@Table(name = "comuna")
public class Comuna {

    @Id
    private Integer id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public Region getRegion() { return region; }
}
