package com.curso.tiendaapi;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import com.curso.tiendaapi.modelo.Producto;
import com.curso.tiendaapi.repositorio.ProductoRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:tienda-pruebas;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.h2.console.enabled=false"})
class ProductoApiTest {
    @LocalServerPort int puerto;
    @Autowired ProductoRepository repositorio;
    final HttpClient cliente = HttpClient.newHttpClient();
    final JsonMapper json = JsonMapper.builder().build();
    Long manzana;
    Long pina;
    Long pera;
    Long papaya;

    @BeforeEach
    void prepararDatos() {
        repositorio.deleteAllInBatch();
        List<Producto> productos = repositorio.saveAll(List.of(
                producto("Manzana", "20.5", 3), producto("Piña", "15.36", 5),
                producto("Pera", "5.45", 2), producto("Papaya", "6.15", 0)));
        manzana = productos.get(0).getId();
        pina = productos.get(1).getId();
        pera = productos.get(2).getId();
        papaya = productos.get(3).getId();
    }

    Producto producto(String nombre, String precio, int stock) {
        return new Producto(nombre, new BigDecimal(precio), stock, "/imagenes/mango.svg");
    }

    HttpResponse<String> pedir(String metodo, String ruta, String cuerpo) throws Exception {
        HttpRequest peticion = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + "/api/productos" + ruta))
                .header("Content-Type", "application/json")
                .method(metodo, cuerpo == null ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofString(cuerpo)).build();
        return cliente.send(peticion, HttpResponse.BodyHandlers.ofString());
    }

    JsonNode contenido(HttpResponse<String> respuesta) { return json.readTree(respuesta.body()); }

    int stock(Long id) throws Exception {
        return contenido(pedir("GET", "/" + id, null)).get("stock").asInt();
    }

    void error(HttpResponse<String> respuesta, int codigo, String mensaje) {
        assertEquals(codigo, respuesta.statusCode());
        assertEquals(mensaje, contenido(respuesta).get("mensaje").asText());
    }

    @Test
    void catalogoContieneCuatroProductosConStockMinimoPorDefecto() throws Exception {
        var respuesta = pedir("GET", "", null);
        assertEquals(200, respuesta.statusCode());
        assertEquals(4, contenido(respuesta).size());
        assertEquals(2, contenido(respuesta).get(0).get("stockMinimo").asInt());
    }

    @Test
    void cicloCrearActualizarConsultarYEliminar() throws Exception {
        var creado = pedir("POST", "", "{\"id\":12345,\"nombre\":\"Mango\",\"precio\":8.9,\"stock\":10}");
        assertEquals(201, creado.statusCode());
        long id = contenido(creado).get("id").asLong();
        assertNotEquals(12345, id);
        assertEquals(2, contenido(creado).get("stockMinimo").asInt());
        var actualizado = pedir("PUT", "/" + id,
                "{\"nombre\":\"Mango tommy\",\"precio\":9.5,\"stock\":12,\"stockMinimo\":4}");
        assertEquals(200, actualizado.statusCode());
        assertEquals("Mango tommy", contenido(actualizado).get("nombre").asText());
        assertEquals(4, contenido(pedir("GET", "/" + id, null)).get("stockMinimo").asInt());
        assertEquals(204, pedir("DELETE", "/" + id, null).statusCode());
        error(pedir("GET", "/" + id, null), 404, "No existe el producto con id " + id);
    }

    @Test
    void compraDescuentaUnaUnidadYAgotadoDevuelveConflicto() throws Exception {
        assertEquals(200, pedir("POST", "/" + pera + "/comprar", null).statusCode());
        assertEquals(1, stock(pera));
        error(pedir("POST", "/" + papaya + "/comprar", null), 409, "Lo sentimos, ya no hay stock");
        assertEquals(0, stock(papaya));
    }

    @Test
    void b1ReponerCincoALaPeraLaDejaEnSiete() throws Exception {
        var respuesta = pedir("POST", "/" + pera + "/reponer/5", null);
        assertEquals(200, respuesta.statusCode());
        assertEquals(7, contenido(respuesta).get("stock").asInt());
        assertEquals(7, stock(pera));
    }

    @Test
    void b2CantidadTreintaEsInvalidaYNoModificaStock() throws Exception {
        error(pedir("POST", "/" + pina + "/reponer/30", null), 400, "La cantidad debe estar entre 1 y 20");
        assertEquals(5, stock(pina));
    }

    @Test
    void b3DosReposicionesAceptadasYTerceraRechazadaSinModificar() throws Exception {
        assertEquals(200, pedir("POST", "/" + pina + "/reponer/20", null).statusCode());
        assertEquals(200, pedir("POST", "/" + pina + "/reponer/20", null).statusCode());
        error(pedir("POST", "/" + pina + "/reponer/20", null), 409,
                "El stock no puede superar las 50 unidades");
        assertEquals(45, stock(pina));
    }

    @Test
    void b4StockMinimoNegativoEsRechazado() throws Exception {
        var respuesta = pedir("POST", "", "{\"nombre\":\"Mango\",\"precio\":8.9,\"stock\":10,\"stockMinimo\":-1}");
        error(respuesta, 400, "El stock mínimo no puede ser negativo");
        assertEquals(4, repositorio.count());
    }

    @Test
    void limitesUnoVeinteYCincuentaSonAceptados() throws Exception {
        var producto = repositorio.findById(manzana).orElseThrow();
        producto.setStock(29);
        repositorio.save(producto);
        assertEquals(200, pedir("POST", "/" + manzana + "/reponer/1", null).statusCode());
        assertEquals(200, pedir("POST", "/" + manzana + "/reponer/20", null).statusCode());
        assertEquals(50, stock(manzana));
        error(pedir("POST", "/" + manzana + "/reponer/1", null), 409,
                "El stock no puede superar las 50 unidades");
        error(pedir("POST", "/" + pera + "/reponer/0", null), 400, "La cantidad debe estar entre 1 y 20");
        error(pedir("POST", "/" + pera + "/reponer/-1", null), 400, "La cantidad debe estar entre 1 y 20");
    }

    @Test
    void productoInexistenteDevuelve404EnTodasLasOperaciones() throws Exception {
        long inexistente = 999999;
        for (String ruta : List.of("/" + inexistente, "/" + inexistente + "/comprar",
                "/" + inexistente + "/reponer/5")) {
            String metodo = ruta.endsWith("999999") ? "GET" : "POST";
            error(pedir(metodo, ruta, null), 404, "No existe el producto con id " + inexistente);
        }
        error(pedir("DELETE", "/999999", null), 404, "No existe el producto con id 999999");
    }

    @Test
    void validacionesDeNombrePrecioStockYNullSeDevuelvenComoMensaje() throws Exception {
        var respuesta = pedir("POST", "", "{\"nombre\":\"\",\"precio\":-3,\"stock\":-1,\"stockMinimo\":null}");
        assertEquals(400, respuesta.statusCode());
        String mensaje = contenido(respuesta).get("mensaje").asText();
        assertTrue(mensaje.contains("El nombre es obligatorio"));
        assertTrue(mensaje.contains("El precio no puede ser negativo"));
        assertTrue(mensaje.contains("El stock no puede ser negativo"));
        assertTrue(mensaje.contains("El stock mínimo es obligatorio"));
        assertEquals(400, pedir("POST", "", "{\"nombre\":\"Mango\",\"precio\":null}").statusCode());
        assertEquals(4, repositorio.count());
    }

    @Test
    void jsonYParametrosMalFormadosDevuelven400ConMensaje() throws Exception {
        assertEquals(400, pedir("POST", "", "no-es-json").statusCode());
        var respuesta = pedir("POST", "/" + pina + "/reponer/no-es-numero", null);
        assertEquals(400, respuesta.statusCode());
        assertNotNull(contenido(respuesta).get("mensaje"));
    }

    @Test
    void crearYActualizarNoPuedenEvitarElLimiteDeBodega() throws Exception {
        String datos = "{\"nombre\":\"Mango\",\"precio\":8.9,\"stock\":51}";
        error(pedir("POST", "", datos), 400, "El stock no puede superar las 50 unidades");
        error(pedir("PUT", "/" + pera, datos), 400, "El stock no puede superar las 50 unidades");
        assertEquals(2, stock(pera));
        assertEquals(4, repositorio.count());
    }

    @Test
    void comprasConcurrentesNoVendenMasUnidadesQueLasDisponibles() {
        List<CompletableFuture<Integer>> compras = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            compras.add(CompletableFuture.supplyAsync(() -> {
                try { return pedir("POST", "/" + manzana + "/comprar", null).statusCode(); }
                catch (Exception error) { throw new RuntimeException(error); }
            }));
        }
        List<Integer> codigos = compras.stream().map(CompletableFuture::join).toList();
        assertEquals(3, codigos.stream().filter(c -> c == 200).count());
        assertEquals(5, codigos.stream().filter(c -> c == 409).count());
        assertEquals(0, repositorio.findById(manzana).orElseThrow().getStock());
    }

    @Test
    void corsAutorizaElFrontendYRechazaOrigenDesconocido() throws Exception {
        URI uri = URI.create("http://localhost:" + puerto + "/api/productos");
        var permitido = cliente.send(HttpRequest.newBuilder(uri).header("Origin", "http://localhost:4200")
                .GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals("http://localhost:4200", permitido.headers().firstValue("access-control-allow-origin").orElse(""));
        var rechazado = cliente.send(HttpRequest.newBuilder(uri).header("Origin", "https://origen-ajeno.example")
                .GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(403, rechazado.statusCode());
        assertTrue(rechazado.headers().firstValue("access-control-allow-origin").isEmpty());
    }
}
