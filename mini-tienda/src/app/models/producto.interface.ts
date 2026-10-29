export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  stockMinimo: number;
}

export type NuevoProducto = Omit<Producto, 'id'>;
