import { Component, input, output } from '@angular/core';
import { Producto } from '../../models/producto.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-card.component.html'
})
export class ProductoCardComponent {
  producto = input.required<Producto>();
  comprar = output<number>();

  onComprar() {
    this.comprar.emit(this.producto().id);
  }
}
