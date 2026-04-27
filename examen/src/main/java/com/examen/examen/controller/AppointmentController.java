package com.Examen.examen.controller;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    // ✅ GET /api/appointments
    // ✅ GET /api/appointments?clienteEmail=xxx  (filtro opcional)
    @GetMapping
    public ResponseEntity<List<Appointment>> getCitas(
            @RequestParam(required = false) String clienteEmail) {
        return ResponseEntity.ok(service.listarTodas(clienteEmail));
    }

    // ✅ POST /api/appointments
    // Retorna 201 Created | 400 Bad Request | 409 Conflict
    @PostMapping
    public ResponseEntity<?> crearCita(@RequestBody Appointment cita) {
        try {
            Appointment nueva = service.guardar(cita);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);

        } catch (AppointmentService.ConflictException e) {
            // ✅ 409 Conflict con mensaje explicativo
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            // ✅ 400 Bad Request para validaciones
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ DELETE /api/appointments/{id}
    // Cancela la cita (estado = CANCELADA). Retorna 200 OK | 404 Not Found
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarCita(@PathVariable Long id) {
        try {
            service.cancelar(id);
            // ✅ 200 OK con mensaje (el enunciado pide 200, no 204)
            return ResponseEntity.ok(Map.of("mensaje", "Cita cancelada correctamente."));

        } catch (AppointmentService.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}