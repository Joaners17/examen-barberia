package com.Examen.examen.service;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public List<Appointment> listarTodas(String clienteEmail) {
        if (clienteEmail != null && !clienteEmail.isBlank()) {
            return repository.findByClienteEmail(clienteEmail);
        }
        return repository.findAll();
    }

    @Transactional
    public Appointment guardar(Appointment cita) {

        if (cita.getClienteNombre() == null || cita.getClienteNombre().isBlank())
            throw new IllegalArgumentException("El nombre del cliente es obligatorio.");

        if (cita.getClienteEmail() == null || cita.getClienteEmail().isBlank())
            throw new IllegalArgumentException("El email del cliente es obligatorio.");

        if (!cita.getClienteEmail().matches("^[\\w.+-]+@[\\w-]+\\.[\\w.]+$"))
            throw new IllegalArgumentException("El email no tiene un formato válido.");

        if (cita.getFechaHora() == null)
            throw new IllegalArgumentException("La fecha y hora son obligatorias.");

        if (cita.getFechaHora().isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("No se puede agendar una cita en el pasado.");

        if (cita.getDuracionMin() <= 0) {
            cita.setDuracionMin(30);
        }

        LocalDateTime nuevoInicio = cita.getFechaHora();
        LocalDateTime nuevoFin    = nuevoInicio.plusMinutes(cita.getDuracionMin());

        List<Appointment> candidatas = repository.findReservadasAntesDeNuevoFin(nuevoFin);

        boolean haySolapamiento = candidatas.stream().anyMatch(existente -> {
            LocalDateTime finExistente = existente.getFechaHora()
                    .plusMinutes(existente.getDuracionMin());
            return finExistente.isAfter(nuevoInicio);
        });

        if (haySolapamiento) {
            Appointment conflicto = candidatas.stream().filter(existente -> {
                LocalDateTime finExistente = existente.getFechaHora()
                        .plusMinutes(existente.getDuracionMin());
                return finExistente.isAfter(nuevoInicio);
            }).findFirst().get();

            throw new ConflictException(
                    "Conflicto de horario: ya existe una cita de "
                            + conflicto.getFechaHora()
                            + " a "
                            + conflicto.getFechaHora().plusMinutes(conflicto.getDuracionMin())
                            + ". Por favor elija otro horario."
            );
        }

        return repository.save(cita);
    }

    @Transactional
    public void cancelar(Long id) {
        Appointment cita = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una cita con ID: " + id));

        if (cita.getEstado() == Appointment.Estado.CANCELADA)
            throw new IllegalArgumentException("La cita ya está cancelada.");

        cita.setEstado(Appointment.Estado.CANCELADA);
        repository.save(cita);
    }

    public static class ConflictException extends RuntimeException {
        public ConflictException(String msg) { super(msg); }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String msg) { super(msg); }
    }
}