package com.Examen.examen.service;

import com.Examen.examen.model.Appointment;
import com.Examen.examen.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository repository;

    public List<Appointment> listarTodas() { return repository.findAll(); }
    public Appointment guardar(Appointment cita) { return repository.save(cita); }
    public void eliminar(Long id) { repository.deleteById(id); }
}