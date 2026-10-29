import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NuevoProducto } from '../../models/producto.interface';

@Component({
  selector: 'app-producto-form',
  imports: [FormsModule],
  templateUrl: './producto-form.component.html',
})
export class ProductoFormComponent {
  guardando = input(false);
  guardar = output<NuevoProducto>();
  nombre = signal('');
  precio = signal<number | null>(0);
  stock = signal<number | null>(0);
  stockMinimo = signal<number | null>(2);
  imagen = signal('/imagenes/mango.svg');
  enviar() {
    if (this.guardando()) return;
    this.guardar.emit({
      nombre: this.nombre().trim(),
      precio: this.precio() as number,
      stock: this.stock() as number,
      stockMinimo: this.stockMinimo() as number,
      imagen: this.imagen().trim(),
    });
  }
  limpiar() {
    this.nombre.set('');
    this.precio.set(0);
    this.stock.set(0);
    this.stockMinimo.set(2);
    this.imagen.set('/imagenes/mango.svg');
  }
}
