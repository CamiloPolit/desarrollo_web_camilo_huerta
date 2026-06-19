package tarea4.dto;

import java.util.List;

public class ActividadBusquedaDTO {

    private Integer id;
    private String titulo;
    private String descripcion;
    private String categoria;
    private String comuna;
    private String miembroNombre;
    private List<String> dias;
    private Double notaPromedio;
    private Long notaConteo;

    public ActividadBusquedaDTO(Integer id, String titulo, String descripcion, String categoria,
                                 String comuna, String miembroNombre, List<String> dias,
                                 Double notaPromedio, Long notaConteo) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.comuna = comuna;
        this.miembroNombre = miembroNombre;
        this.dias = dias;
        this.notaPromedio = notaPromedio;
        this.notaConteo = notaConteo;
    }

    public Integer getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public String getCategoria() { return categoria; }
    public String getComuna() { return comuna; }
    public String getMiembroNombre() { return miembroNombre; }
    public List<String> getDias() { return dias; }
    public Double getNotaPromedio() { return notaPromedio; }
    public Long getNotaConteo() { return notaConteo; }
}
