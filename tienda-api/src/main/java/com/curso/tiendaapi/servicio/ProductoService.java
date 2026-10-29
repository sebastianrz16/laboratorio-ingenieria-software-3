package com.curso.tiendaapi.servicio;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.curso.tiendaapi.modelo.Producto;
import com.curso.tiendaapi.repositorio.ProductoRepository;

@Service
@Transactional
public class ProductoService {
    private final ProductoRepository repositorio;

    public ProductoService(ProductoRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional(readOnly = true)
    public List<Producto> listar() {
        return repositorio.findAll(Sort.by("id"));
    }

    @Transactional(readOnly = true)
    public Producto buscarPorId(Long id) {
        return repositorio.findById(id).orElseThrow(() -> noExiste(id));
    }

    private Producto buscarParaActualizar(Long id) {
        return repositorio.buscarParaActualizar(id).orElseThrow(() -> noExiste(id));
    }

    private ResponseStatusException noExiste(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                "No existe el producto con id " + id);
    }

    public Producto crear(Producto producto) {
        producto.setId(null);
        return repositorio.save(producto);
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto producto = buscarParaActualizar(id);
        producto.setNombre(datos.getNombre());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        producto.setImagen(datos.getImagen());
        producto.setStockMinimo(datos.getStockMinimo());
        return repositorio.save(producto);
    }

    public void eliminar(Long id) {
        repositorio.delete(buscarParaActualizar(id));
    }

    public Producto comprar(Long id) {
        Producto producto = buscarParaActualizar(id);
        if (producto.getStock() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lo sentimos, ya no hay stock");
        }
        producto.setStock(producto.getStock() - 1);
        return repositorio.save(producto);
    }

    public Producto reponer(Long id, Integer cantidad) {
        Producto producto = buscarParaActualizar(id);
        if (cantidad == null || cantidad < 1 || cantidad > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La cantidad debe estar entre 1 y 20");
        }
        if ((long) producto.getStock() + cantidad > 50) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El stock no puede superar las 50 unidades");
        }
        producto.setStock(producto.getStock() + cantidad);
        return repositorio.save(producto);
    }
}
