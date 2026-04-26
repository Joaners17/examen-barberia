package com.Examen.examen.controller;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentService service;

    @GetMapping
    public List<Appointment> getCitas() { return service.listarTodas(); }

    @PostMapping
    public Appointment crearCita(@RequestBody Appointment cita) { return service.guardar(cita); }

    @DeleteMapping("/{id}")
    public void borrarCita(@PathVariable Long id) { service.eliminar(id); }
}