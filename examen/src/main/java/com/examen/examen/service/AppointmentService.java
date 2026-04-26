package com.Examen.examen.service;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    // ✅ Inyección por constructor (mejor práctica que @Autowired en campo)
    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public List<Appointment> listarTodas() {
        return repository.findAll();
    }

    public Appointment guardar(Appointment cita) {
        // ✅ Validación: no permitir citas en el pasado
        if (cita.getFechaHora() == null) {
            throw new IllegalArgumentException("La fecha y hora son obligatorias.");
        }
        if (cita.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("No se puede agendar una cita en el pasado.");
        }
        if (cita.getClienteNombre() == null || cita.getClienteNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio.");
        }
        if (cita.getServicio() == null || cita.getServicio().isBlank()) {
            throw new IllegalArgumentException("El servicio es obligatorio.");
        }
        if (cita.getDuracionMin() <= 0) {
            throw new IllegalArgumentException("La duración debe ser mayor a 0 minutos.");
        }
        return repository.save(cita);
    }

    public void eliminar(Long id) {
        // ✅ Verificar que la cita exista antes de eliminar
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("No existe una cita con ID: " + id);
        }
        repository.deleteById(id);
    }
}