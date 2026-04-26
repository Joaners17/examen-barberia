package com.Examen.examen.controller;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService service;

    // ✅ Inyección por constructor en vez de @Autowired en campo
    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    // ✅ Retorna ResponseEntity con código HTTP explícito
    @GetMapping
    public ResponseEntity<List<Appointment>> getCitas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    // ✅ Retorna 201 CREATED al crear una cita
    @PostMapping
    public ResponseEntity<?> crearCita(@RequestBody Appointment cita) {
        try {
            Appointment nueva = service.guardar(cita);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (IllegalArgumentException e) {
            // ✅ Retorna 400 con mensaje de error claro
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Retorna 204 NO CONTENT al eliminar correctamente
    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrarCita(@PathVariable Long id) {
        try {
            service.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            // ✅ Retorna 404 si la cita no existe
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}