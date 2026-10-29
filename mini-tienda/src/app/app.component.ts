import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from './models/producto.interface';
import { ProductoCardComponent } from './components/producto-card/producto-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ProductoCardComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'mini-tienda';

  catalogo = signal<Producto[]>([
    { id: 1, nombre: 'Manzana', precio: 20.5, stock: 3, imagen: 'imagenes/manzana.svg' },
    { id: 2, nombre: 'Piña', precio: 15.36, stock: 5, imagen: 'imagenes/pina.svg' },
    { id: 3, nombre: 'Pera', precio: 5.45, stock: 2, imagen: 'imagenes/pera.svg' },
    { id: 4, nombre: 'Papaya', precio: 6.15, stock: 0, imagen: 'imagenes/papaya.svg' }
  ]);

  carrito = signal<{ producto: Producto, cantidad: number }[]>([]);

  mensaje = signal<{ texto: string, tipo: 'success' | 'error' } | null>(null);

  totalCarrito = computed(() => {
    return this.carrito().reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  });

  cantidadCarrito = computed(() => {
    return this.carrito().reduce((total, item) => total + item.cantidad, 0);
  });

  agregarAlCarrito(idProducto: number) {
    this.catalogo.update(productos => {
      const prodIndex = productos.findIndex(p => p.id === idProducto);
      if (prodIndex === -1) return productos;
      
      const producto = productos[prodIndex];
      
      if (producto.stock > 0) {
        // Reducir stock
        const nuevosProductos = [...productos];
        nuevosProductos[prodIndex] = { ...producto, stock: producto.stock - 1 };

        // Actualizar carrito
        this.carrito.update(items => {
          const itemIndex = items.findIndex(i => i.producto.id === idProducto);
          if (itemIndex > -1) {
            const nuevosItems = [...items];
            nuevosItems[itemIndex] = { ...nuevosItems[itemIndex], cantidad: nuevosItems[itemIndex].cantidad + 1 };
            return nuevosItems;
          } else {
            return [...items, { producto: nuevosProductos[prodIndex], cantidad: 1 }];
          }
        });

        this.mostrarMensaje(`¡${producto.nombre} agregado al carrito!`, 'success');
        return nuevosProductos;
      } else {
        this.mostrarMensaje(`Lo sentimos, ${producto.nombre} está agotado.`, 'error');
        return productos;
      }
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => {
      this.mensaje.set(null);
    }, 3000);
  }
}
