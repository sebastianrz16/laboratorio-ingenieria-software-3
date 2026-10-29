package com.curso.tiendaapi.controlador;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.curso.tiendaapi.modelo.Producto;
import com.curso.tiendaapi.servicio.ProductoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService servicio;
    public ProductoController(ProductoService servicio) { this.servicio = servicio; }

    @GetMapping
    public List<Producto> listar() { return servicio.listar(); }

    @GetMapping("/{id}")
    public Producto buscar(@PathVariable Long id) { return servicio.buscarPorId(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Producto crear(@Valid @RequestBody Producto producto) { return servicio.crear(producto); }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        return servicio.actualizar(id, producto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { servicio.eliminar(id); }

    @PostMapping("/{id}/comprar")
    public Producto comprar(@PathVariable Long id) { return servicio.comprar(id); }

    @PostMapping("/{id}/reponer/{cantidad}")
    public Producto reponer(@PathVariable Long id, @PathVariable Integer cantidad) {
        return servicio.reponer(id, cantidad);
    }
}
