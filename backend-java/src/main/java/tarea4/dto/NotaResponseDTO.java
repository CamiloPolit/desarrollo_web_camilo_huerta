package tarea4.dto;

public class NotaResponseDTO {

    private Integer actividadId;
    private Double promedio;
    private Long conteo;

    public NotaResponseDTO(Integer actividadId, Double promedio, Long conteo) {
        this.actividadId = actividadId;
        this.promedio = promedio;
        this.conteo = conteo;
    }

    public Integer getActividadId() { return actividadId; }
    public Double getPromedio() { return promedio; }
    public Long getConteo() { return conteo; }
}
