import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NuevoProducto, Producto } from '../models/producto.interface';

@Injectable({ providedIn: 'root' })
export class ProductoApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  listar() {
    return this.http.get<Producto[]>(this.url);
  }
  buscar(id: number) {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }
  crear(datos: NuevoProducto) {
    return this.http.post<Producto>(this.url, datos);
  }
  actualizar(id: number, datos: NuevoProducto) {
    return this.http.put<Producto>(`${this.url}/${id}`, datos);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  comprar(id: number) {
    return this.http.post<Producto>(`${this.url}/${id}/comprar`, {});
  }
  reponer(id: number, cantidad: number) {
    return this.http.post<Producto>(
      `${this.url}/${id}/reponer/${cantidad}`,
      {},
    );
  }
}
