import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editinventario',
  templateUrl: './editinventario.page.html',
  styleUrls: ['./editinventario.page.scss'],
})
export class EditinventarioPage implements OnInit {
  productId: number;
  initialQuantity: number;
  nombre: string;
  selledQuantity: number;
  giftProducts: number;
  wasteProducts: number;
  selectedPvp: number;
  date: string;
  productos: any[] = []; // Arreglo de productos
  selectedProduct: any; // Producto seleccionado

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const riCodigo = params['ri_codigo'];
      const rfCodigo = params['rf_codigo'] || null;
      this.loadProductData(riCodigo, rfCodigo);
    });
  }

  onProductChange(event: any) {
    const selectedProductId = event.detail.value;
    this.selectedProduct = this.productos.find(
      (product) => product.id === selectedProductId
    );
    if (this.selectedProduct) {
      this.nombre = this.selectedProduct.nombre;
      this.initialQuantity = this.selectedProduct.RI_CANTIDAD_INICIAL;
      this.selectedPvp = this.selectedProduct.pvp;
      this.selledQuantity = this.selectedProduct.RF_CANTIDAD_VENDIDA || 0;
      this.giftProducts = this.selectedProduct.RF_PRODUCTOS_MUESTRA || 0;
      this.wasteProducts = this.selectedProduct.RF_PRODUCTOS_DESECHADOS || 0;
      this.date = this.selectedProduct.RI_FECHA;
    }
  }

  loadProductData(riCodigo: number, rfCodigo: number | null) {
    this.http
      .post<any>('https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_gad.php', {
        accion: 'cargar_productos3',
        ri_codigo: riCodigo,
        rf_codigo: rfCodigo,
      })
      .subscribe(
        (response) => {
          if (response.estado) {
            this.productos = response.datos;
            console.log('Datos del producto cargados:', this.productos);
            if (this.productos.length > 0) {
              this.selectedProduct = this.productos[0];
              this.nombre = this.selectedProduct.nombre;
              this.initialQuantity = this.selectedProduct.RI_CANTIDAD_INICIAL;

              this.selectedPvp = this.selectedProduct.costo;
              this.selledQuantity =
                this.selectedProduct.RF_CANTIDAD_VENDIDA || 0;
              this.giftProducts =
                this.selectedProduct.RF_PRODUCTOS_MUESTRA || 0;
              this.wasteProducts =
                this.selectedProduct.RF_PRODUCTOS_DESECHADOS || 0;
              this.date = this.selectedProduct.RI_FECHA;
            }
          } else {
            console.error('Error al cargar producto:', response.mensaje);
          }
        },
        (error) => {
          console.error('Error en la solicitud:', error);
        }
      );
  }
  // En tu método de 'saveProduct'
async saveProduct() {
  if (this.selectedProduct) {
    const updateData = {
      accion: 'actualizar_cantidad_inicial',
      ri_codigo: this.selectedProduct.RI_CODIGO,
      nueva_cantidad: this.initialQuantity,
    };

    this.http.post<any>(
      'https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_gad.php',
      updateData
    ).subscribe(
      async (response) => {
        if (response.estado) {
          await this.showToast('Cantidad inicial actualizada correctamente.');
          this.router.navigate(['/inventariomenu'], { state: { updated: true } }); // Navegar con estado
        } else {
          console.error('Error al actualizar cantidad inicial:', response.mensaje);
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
}

async saveFinal() {
  if (this.selectedProduct) {
    if (this.selledQuantity > this.initialQuantity) {
      await this.showToast(
        'La cantidad final no debe exceder el valor de la cantidad Inicial.',
        'danger'
      );
      return;
    }

    const totalUsed = this.selledQuantity + this.giftProducts + this.wasteProducts;
    if (totalUsed > this.initialQuantity) {
      await this.showToast(
        'La cantidad final no debe exceder el valor de la cantidad Inicial.',
        'danger'
      );
      return;
    }

    const updateData = {
      accion: 'actualizar_registro_final',
      rf_codigo: this.selectedProduct.RF_CODIGO,
      ri_codigo: this.selectedProduct.RI_CODIGO,
      cantidad_vendida: this.selledQuantity,
      productos_muestra: this.giftProducts,
      productos_desechados: this.wasteProducts,
      dinero_total: this.selledQuantity * this.selectedPvp,
    };

    this.http.post<any>('https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_gad.php', updateData).subscribe(
      async (response) => {
        if (response.estado) {
          await this.showToast('Registro final actualizado correctamente.');
          this.router.navigate(['/inventariomenu'], { state: { updated: true } }); // Navegar con estado
        } else {
          console.error('Error al actualizar registro final:', response.mensaje);
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
}



  
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: color,
    });
    toast.present();
  }
}