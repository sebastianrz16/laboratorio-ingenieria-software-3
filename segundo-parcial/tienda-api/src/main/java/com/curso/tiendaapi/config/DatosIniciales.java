package com.curso.tiendaapi.config;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.curso.tiendaapi.modelo.Producto;
import com.curso.tiendaapi.repositorio.ProductoRepository;

@Component
public class DatosIniciales implements CommandLineRunner {
    private final ProductoRepository repositorio;
    public DatosIniciales(ProductoRepository repositorio) { this.repositorio = repositorio; }

    @Override
    public void run(String... args) {
        if (repositorio.count() == 0) {
            repositorio.saveAll(List.of(
                    new Producto("Manzana", new BigDecimal("20.5"), 3, "/imagenes/manzana.svg"),
                    new Producto("Piña", new BigDecimal("15.36"), 5, "/imagenes/pina.svg"),
                    new Producto("Pera", new BigDecimal("5.45"), 2, "/imagenes/pera.svg"),
                    new Producto("Papaya", new BigDecimal("6.15"), 0, "/imagenes/papaya.svg")));
        }
    }
}
