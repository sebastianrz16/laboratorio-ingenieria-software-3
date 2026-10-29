import { Component, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto.interface';

@Component({
  selector: 'app-producto-card',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './producto-card.component.html',
})
export class ProductoCardComponent {
  producto = input.required<Producto>();
  ocupado = input(false);
  cantidad = signal<number | null>(5);
  imagenFallida = signal(false);
  comprar = output<number>();
  reponer = output<{ id: number; cantidad: number }>();
  eliminar = output<number>();
  reponerProducto() {
    const cantidad = this.cantidad();
    if (cantidad !== null && Number.isFinite(cantidad))
      this.reponer.emit({ id: this.producto().id, cantidad });
  }
}
