package com.Examen.examen.repository;

import com.Examen.examen.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ✅ Método útil para buscar citas por rango de fechas (bonus)
    List<Appointment> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
}