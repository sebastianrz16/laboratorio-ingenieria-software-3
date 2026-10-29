package com.curso.tiendaapi.repositorio;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.curso.tiendaapi.modelo.Producto;
import jakarta.persistence.LockModeType;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Evita que dos compras lean a la vez la misma última unidad.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> buscarParaActualizar(@Param("id") Long id);
}
