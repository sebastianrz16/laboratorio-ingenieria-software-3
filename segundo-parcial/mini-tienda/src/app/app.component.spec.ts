import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { Producto } from './models/producto.interface';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { environment } from '../environments/environment';

const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Manzana',
    precio: 20.5,
    stock: 3,
    stockMinimo: 2,
    imagen: '/imagenes/manzana.svg',
  },
  {
    id: 2,
    nombre: 'Piña',
    precio: 15.36,
    stock: 5,
    stockMinimo: 2,
    imagen: '/imagenes/pina.svg',
  },
  {
    id: 3,
    nombre: 'Pera',
    precio: 5.45,
    stock: 2,
    stockMinimo: 2,
    imagen: '/imagenes/pera.svg',
  },
  {
    id: 4,
    nombre: 'Papaya',
    precio: 6.15,
    stock: 0,
    stockMinimo: 2,
    imagen: '/imagenes/papaya.svg',
  },
];

describe('Tienda conectada a la API', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let http: HttpTestingController;
  const url = environment.apiUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    fixture.destroy();
  });

  function cargar() {
    fixture.detectChanges();
    http.expectOne(url).flush(productos.map((p) => ({ ...p })));
    fixture.detectChanges();
  }

  it('consulta el servidor y mantiene un skeleton mientras espera', () => {
    fixture.detectChanges();
    expect(app.catalogo()).toEqual([]);
    expect(
      fixture.nativeElement.querySelectorAll('.skeleton-card').length,
    ).toBe(4);
    http.expectOne(url).flush(productos);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('app-producto-card').length,
    ).toBe(4);
    expect(app.productosStockBajo()).toBe(2);
  });

  it('incluye los agotados en el contador y avisa solo stock bajo en la pera', () => {
    cargar();
    const tarjetas = fixture.nativeElement.querySelectorAll('article');
    expect(tarjetas[2].textContent).toContain('¡Stock bajo!');
    expect(tarjetas[3].textContent).toContain('Agotado');
    expect(tarjetas[3].querySelector('button').disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain(
      'Productos con stock bajo: 2',
    );
  });

  it('repone mediante el endpoint nuevo y actualiza tarjeta y contador', () => {
    cargar();
    app.reponerStock({ id: 3, cantidad: 5 });
    const peticion = http.expectOne(`${url}/3/reponer/5`);
    expect(peticion.request.method).toBe('POST');
    expect(app.catalogo()[2].stock).toBe(2);
    peticion.flush({ ...productos[2], stock: 7 });
    fixture.detectChanges();
    expect(app.catalogo()[2].stock).toBe(7);
    expect(app.productosStockBajo()).toBe(1);
    expect(
      fixture.nativeElement.querySelectorAll('article')[2].textContent,
    ).not.toContain('¡Stock bajo!');
  });

  it('permite solicitar 30 para mostrar la validación del servidor', () => {
    cargar();
    app.reponerStock({ id: 2, cantidad: 30 });
    http
      .expectOne(`${url}/2/reponer/30`)
      .flush(
        { mensaje: 'La cantidad debe estar entre 1 y 20' },
        { status: 400, statusText: 'Bad Request' },
      );
    expect(app.mensaje()).toBe('La cantidad debe estar entre 1 y 20');
    expect(app.esError()).toBeTrue();
    expect(app.catalogo()[1].stock).toBe(5);
    expect(app.ocupados()).toEqual([]);
  });

  it('conserva el stock si el servidor rechaza superar 50', () => {
    cargar();
    app.reponerStock({ id: 2, cantidad: 20 });
    http
      .expectOne(`${url}/2/reponer/20`)
      .flush(
        { mensaje: 'El stock no puede superar las 50 unidades' },
        { status: 409, statusText: 'Conflict' },
      );
    expect(app.mensaje()).toBe('El stock no puede superar las 50 unidades');
    expect(app.catalogo()[1].stock).toBe(5);
  });

  it('solo descuenta stock y suma al carrito cuando la compra tiene éxito', () => {
    cargar();
    app.agregarAlCarrito(1);
    expect(app.carrito().length).toBe(0);
    http.expectOne(`${url}/1/comprar`).flush({ ...productos[0], stock: 2 });
    expect(app.catalogo()[0].stock).toBe(2);
    expect(app.productosStockBajo()).toBe(3);
    expect(app.totalCarrito()).toBe(20.5);
    app.agregarAlCarrito(1);
    http.expectOne(`${url}/1/comprar`).flush({ ...productos[0], stock: 1 });
    expect(app.cantidadCarrito()).toBe(2);
    expect(app.carrito().length).toBe(1);
    expect(app.totalCarrito()).toBe(41);
  });

  it('muestra el error de una compra desde una pestaña desactualizada', () => {
    cargar();
    app.agregarAlCarrito(1);
    http
      .expectOne(`${url}/1/comprar`)
      .flush(
        { mensaje: 'Lo sentimos, ya no hay stock' },
        { status: 409, statusText: 'Conflict' },
      );
    expect(app.mensaje()).toBe('Lo sentimos, ya no hay stock');
    expect(app.carrito()).toEqual([]);
  });

  it('evita dos peticiones simultáneas para el mismo producto', () => {
    cargar();
    app.reponerStock({ id: 3, cantidad: 5 });
    app.reponerStock({ id: 3, cantidad: 5 });
    expect(app.ocupados()).toEqual([3]);
    http.expectOne(`${url}/3/reponer/5`).flush({ ...productos[2], stock: 7 });
    expect(app.ocupados()).toEqual([]);
  });

  it('muestra el error de conexión y permite reintentar', () => {
    fixture.detectChanges();
    http.expectOne(url).error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(app.errorCarga()).toContain('backend');
    const boton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.error-panel button',
    );
    boton.click();
    http.expectOne(url).flush(productos);
    expect(app.errorCarga()).toBe('');
    expect(app.catalogo().length).toBe(4);
  });

  it('representa el estado vacío', () => {
    fixture.detectChanges();
    http.expectOne(url).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aún no hay productos');
    expect(app.productosStockBajo()).toBe(0);
  });

  it('mantiene el formulario si la creación falla y lo limpia al guardar', () => {
    cargar();
    const form: ProductoFormComponent = fixture.debugElement.query(
      By.directive(ProductoFormComponent),
    ).componentInstance;
    form.nombre.set('Mango');
    form.stockMinimo.set(-1);
    form.enviar();
    const invalido = http.expectOne(url);
    expect(invalido.request.body.stockMinimo).toBe(-1);
    invalido.flush(
      { mensaje: 'El stock mínimo no puede ser negativo' },
      { status: 400, statusText: 'Bad Request' },
    );
    expect(form.nombre()).toBe('Mango');
    expect(app.mensaje()).toBe('El stock mínimo no puede ser negativo');
    form.stockMinimo.set(2);
    form.enviar();
    http
      .expectOne(url)
      .flush({
        id: 5,
        nombre: 'Mango',
        precio: 0,
        stock: 0,
        stockMinimo: 2,
        imagen: '/imagenes/mango.svg',
      });
    expect(form.nombre()).toBe('');
    expect(form.stockMinimo()).toBe(2);
    expect(app.catalogo().length).toBe(5);
  });

  it('elimina tras confirmación y usa la respuesta del servidor', () => {
    cargar();
    spyOn(window, 'confirm').and.returnValue(true);
    app.eliminarProducto(3);
    expect(app.catalogo().length).toBe(4);
    const peticion = http.expectOne(`${url}/3`);
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush(null, { status: 204, statusText: 'No Content' });
    expect(app.catalogo().length).toBe(3);
  });

  it('no elimina si el usuario cancela', () => {
    cargar();
    spyOn(window, 'confirm').and.returnValue(false);
    app.eliminarProducto(3);
    http.expectNone(`${url}/3`);
    expect(app.catalogo().length).toBe(4);
  });

  it('un mensaje nuevo dispone de su propio tiempo de lectura', fakeAsync(() => {
    app.mostrarMensaje('Primero');
    tick(3000);
    app.mostrarMensaje('Segundo');
    tick(1100);
    expect(app.mensaje()).toBe('Segundo');
    tick(2900);
    expect(app.mensaje()).toBe('');
  }));
});
