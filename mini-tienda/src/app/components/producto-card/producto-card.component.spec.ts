import { TestBed } from '@angular/core/testing';
import { ProductoCardComponent } from './producto-card.component';

describe('Tarjeta de producto', () => {
  it('emite id y cantidad sin imponer límites locales que oculten errores de API', () => {
    const fixture = TestBed.createComponent(ProductoCardComponent);
    fixture.componentRef.setInput('producto', {
      id: 3,
      nombre: 'Pera',
      precio: 5.45,
      stock: 2,
      stockMinimo: 2,
      imagen: '/imagenes/pera.svg',
    });
    fixture.detectChanges();
    const eventos: unknown[] = [];
    fixture.componentInstance.reponer.subscribe((evento) =>
      eventos.push(evento),
    );
    fixture.componentInstance.cantidad.set(30);
    fixture.componentInstance.reponerProducto();
    expect(eventos).toEqual([{ id: 3, cantidad: 30 }]);
    fixture.destroy();
  });
});
