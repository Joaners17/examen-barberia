package com.Examen.examen.service;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    private static final Set<String> METODOS_PAGO = Set.of("Efectivo", "Tarjeta", "Sinpe Móvil");

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public List<Appointment> listarTodas() {
        return repository.findAll();
    }

    public Appointment guardar(Appointment cita) {
        if (cita.getClienteNombre() == null || cita.getClienteNombre().isBlank())
            throw new IllegalArgumentException("El nombre del cliente es obligatorio.");

        if (cita.getTelefono() == null || cita.getTelefono().isBlank())
            throw new IllegalArgumentException("El teléfono del cliente es obligatorio.");

        if (!cita.getTelefono().matches("\\d{8}"))
            throw new IllegalArgumentException("El teléfono debe tener 8 dígitos.");

        if (cita.getCedula() == null || cita.getCedula().isBlank())
            throw new IllegalArgumentException("La cédula es obligatoria.");

        if (!cita.getCedula().matches("\\d{9}"))
            throw new IllegalArgumentException("La cédula debe tener 9 dígitos.");

        if (cita.getServicio() == null || cita.getServicio().isBlank())
            throw new IllegalArgumentException("El servicio es obligatorio.");

        if (cita.getMetodoPago() == null || !METODOS_PAGO.contains(cita.getMetodoPago()))
            throw new IllegalArgumentException("Método de pago inválido. Use: Efectivo, Tarjeta o Sinpe Móvil.");

        if (cita.getFechaHora() == null)
            throw new IllegalArgumentException("La fecha y hora son obligatorias.");

        if (cita.getFechaHora().isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("No se puede agendar una cita en el pasado.");

        if (cita.getDuracionMin() <= 0)
            throw new IllegalArgumentException("La duración debe ser mayor a 0 minutos.");

        return repository.save(cita);
    }

    public void eliminar(Long id) {
        if (!repository.existsById(id))
            throw new IllegalArgumentException("No existe una cita con ID: " + id);
        repository.deleteById(id);
    }
}