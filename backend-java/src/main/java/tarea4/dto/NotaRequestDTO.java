package tarea4.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class NotaRequestDTO {

    @NotNull(message = "El campo 'nota' es obligatorio.")
    @Min(value = 1, message = "La nota debe ser un entero entre 1 y 7.")
    @Max(value = 7, message = "La nota debe ser un entero entre 1 y 7.")
    private Integer nota;

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }
}
