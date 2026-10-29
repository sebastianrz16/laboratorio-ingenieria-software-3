import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NuevoProducto, Producto } from './models/producto.interface';
import { ProductoCardComponent } from './components/producto-card/producto-card.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { ProductoApi } from './servicios/producto-api';

@Component({
  selector: 'app-root',
  imports: [DecimalPipe, ProductoCardComponent, ProductoFormComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly api = inject(ProductoApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formulario = viewChild(ProductoFormComponent);
  private temporizador?: ReturnType<typeof setTimeout>;

  catalogo = signal<Producto[]>([]);
  carrito = signal<{ producto: Producto; cantidad: number }[]>([]);
  cargando = signal(true);
  errorCarga = signal('');
  guardando = signal(false);
  ocupados = signal<number[]>([]);
  mensaje = signal('');
  esError = signal(false);
  productosStockBajo = computed(
    () => this.catalogo().filter((p) => p.stock <= p.stockMinimo).length,
  );
  totalCarrito = computed(() =>
    this.carrito().reduce(
      (suma, item) => suma + item.producto.precio * item.cantidad,
      0,
    ),
  );
  cantidadCarrito = computed(() =>
    this.carrito().reduce((suma, item) => suma + item.cantidad, 0),
  );

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.temporizador));
  }
  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.api
      .listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (productos) => this.catalogo.set(productos),
        error: (err: HttpErrorResponse) =>
          this.errorCarga.set(
            this.textoError(
              err,
              'No se pudo cargar el catálogo. Revisa que el backend esté encendido.',
            ),
          ),
      });
  }

  agregarAlCarrito(id: number) {
    if (!this.iniciarOperacion(id)) return;
    this.api
      .comprar(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.terminarOperacion(id)),
      )
      .subscribe({
        next: (producto) => {
          this.reemplazarProducto(producto);
          this.carrito.update((items) =>
            items.some((item) => item.producto.id === id)
              ? items.map((item) =>
                  item.producto.id === id
                    ? { producto, cantidad: item.cantidad + 1 }
                    : item,
                )
              : [...items, { producto, cantidad: 1 }],
          );
          this.mostrarMensaje(`${producto.nombre} agregado al carrito`);
        },
        error: (err: HttpErrorResponse) =>
          this.mostrarMensaje(
            this.textoError(err, 'No se pudo completar la compra'),
            true,
          ),
      });
  }

  reponerStock(evento: { id: number; cantidad: number }) {
    if (!this.iniciarOperacion(evento.id)) return;
    this.api
      .reponer(evento.id, evento.cantidad)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.terminarOperacion(evento.id)),
      )
      .subscribe({
        next: (producto) => {
          this.reemplazarProducto(producto);
          this.mostrarMensaje(
            `Se repusieron ${evento.cantidad} unidades de ${producto.nombre}`,
          );
        },
        error: (err: HttpErrorResponse) =>
          this.mostrarMensaje(
            this.textoError(err, 'No se pudo reponer el producto'),
            true,
          ),
      });
  }

  eliminarProducto(id: number) {
    const producto = this.catalogo().find((p) => p.id === id);
    if (
      !producto ||
      !window.confirm(
        `¿Eliminar ${producto.nombre} del catálogo? Esta acción no se puede deshacer.`,
      )
    )
      return;
    if (!this.iniciarOperacion(id)) return;
    this.api
      .eliminar(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.terminarOperacion(id)),
      )
      .subscribe({
        next: () => {
          this.catalogo.update((lista) => lista.filter((p) => p.id !== id));
          this.mostrarMensaje(`${producto.nombre} eliminado del catálogo`);
        },
        error: (err: HttpErrorResponse) =>
          this.mostrarMensaje(
            this.textoError(err, 'No se pudo eliminar el producto'),
            true,
          ),
      });
  }

  crearProducto(datos: NuevoProducto) {
    if (this.guardando()) return;
    this.guardando.set(true);
    this.api
      .crear(datos)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (creado) => {
          this.catalogo.update((lista) => [...lista, creado]);
          this.formulario()?.limpiar();
          this.mostrarMensaje(`${creado.nombre} creado`);
        },
        error: (err: HttpErrorResponse) =>
          this.mostrarMensaje(
            this.textoError(err, 'No se pudo crear el producto'),
            true,
          ),
      });
  }

  mostrarMensaje(texto: string, error = false) {
    clearTimeout(this.temporizador);
    this.mensaje.set(texto);
    this.esError.set(error);
    this.temporizador = setTimeout(
      () => this.mensaje.set(''),
      error ? 7000 : 4000,
    );
  }

  private reemplazarProducto(producto: Producto) {
    this.catalogo.update((lista) =>
      lista.map((p) => (p.id === producto.id ? producto : p)),
    );
  }
  private iniciarOperacion(id: number): boolean {
    if (this.ocupados().includes(id)) return false;
    this.ocupados.update((ids) => [...ids, id]);
    return true;
  }
  private terminarOperacion(id: number) {
    this.ocupados.update((ids) => ids.filter((valor) => valor !== id));
  }
  private textoError(err: HttpErrorResponse, porDefecto: string): string {
    return typeof err.error?.mensaje === 'string'
      ? err.error.mensaje
      : porDefecto;
  }
}
