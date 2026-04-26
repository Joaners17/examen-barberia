package com.Examen.examen.service;

import com.Examen.examen.model.Servicio;
import com.Examen.examen.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class ServicioService {

    private final ServicioRepository repository;

    public ServicioService(ServicioRepository repository) {
        this.repository = repository;
    }

    // ✅ Carga los servicios por defecto al iniciar si no hay ninguno
    @PostConstruct
    public void cargarDatosIniciales() {
        if (repository.count() == 0) {
            repository.save(crearServicio("Corte Clásico", 7000, 30));
            repository.save(crearServicio("Degradado Pro", 9000, 45));
            repository.save(crearServicio("Barba King",    5000, 20));
            repository.save(crearServicio("Combo",         12000, 60));
        }
    }

    private Servicio crearServicio(String nombre, int precio, int duracion) {
        Servicio s = new Servicio();
        s.setNombre(nombre);
        s.setPrecio(precio);
        s.setDuracionMin(duracion);
        return s;
    }

    public List<Servicio> listarTodos() {
        return repository.findAll();
    }

    public Servicio guardar(Servicio s) {
        if (s.getNombre() == null || s.getNombre().isBlank())
            throw new IllegalArgumentException("El nombre del servicio es obligatorio.");
        if (s.getPrecio() <= 0)
            throw new IllegalArgumentException("El precio debe ser mayor a 0.");
        if (s.getDuracionMin() <= 0)
            throw new IllegalArgumentException("La duración debe ser mayor a 0.");
        return repository.save(s);
    }

    public void eliminar(Long id) {
        if (!repository.existsById(id))
            throw new IllegalArgumentException("No existe un servicio con ID: " + id);
        repository.deleteById(id);
    }
}