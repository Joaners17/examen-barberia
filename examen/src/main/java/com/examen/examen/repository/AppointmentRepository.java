package com.Examen.examen.repository;

import com.Examen.examen.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClienteEmail(String clienteEmail);

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.estado = com.Examen.examen.model.Appointment$Estado.RESERVADA
          AND a.fechaHora < :nuevoFin
    """)
    List<Appointment> findReservadasAntesDeNuevoFin(
            @Param("nuevoFin") LocalDateTime nuevoFin
    );
}