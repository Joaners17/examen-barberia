package com.Examen.examen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String clienteNombre;
    private String servicio;
    private LocalDateTime fechaHora;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getServicio() { return servicio; }
    public void setServicio(String servicio) { this.servicio = servicio; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}