package com.Examen.examen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clienteNombre;
    private String clienteEmail;
    private String clienteTelefono;

    private LocalDateTime fechaHora;
    private int duracionMin;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    private LocalDateTime creadoEn;

    public enum Estado {
        RESERVADA, CANCELADA
    }

    @PrePersist
    public void prePersist() {
        if (this.creadoEn == null)  this.creadoEn  = LocalDateTime.now();
        if (this.estado   == null)  this.estado    = Estado.RESERVADA;
        if (this.duracionMin <= 0)  this.duracionMin = 30;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteEmail() { return clienteEmail; }
    public void setClienteEmail(String clienteEmail) { this.clienteEmail = clienteEmail; }

    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public int getDuracionMin() { return duracionMin; }
    public void setDuracionMin(int duracionMin) { this.duracionMin = duracionMin; }

    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}