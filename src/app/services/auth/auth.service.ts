import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  server: string = "https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_gad.php";
  private toastQueue: Array<{ message: string, duration: number, position: 'top' | 'bottom', color: string }> = [];
  private isToastActive: boolean = false;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController,
    private storage: Storage
  ) {
    this.init();
  }

  // Inicializa el almacenamiento
  private async init() {
    await this.storage.create();
  }

  postData(body: any) {

    let head = new HttpHeaders({ 'Content-Type': 'application/json, charset:utf-8' });
    let options = {
      headers: head
    };
    return this.http.post(this.server, JSON.stringify(body), options).pipe(
      catchError((error: any) => {
        alert(JSON.stringify(error))
        return throwError(() => new Error('Error del servidor. Por favor, intenta nuevamente más tarde.'));
      })
    );
  }

  // Verificar stock
  checkStockMinimo(productos: any[]): string[] {
    let alertMessages: string[] = [];
    const umbralCritico = 100;
    const productosAgrupados = new Map();

    productos.forEach((producto) => {
      // Agrupar productos por nombre y tomar la menor cantidad
      if (!productosAgrupados.has(producto.nombre)) {
        productosAgrupados.set(producto.nombre, producto.cantidad_inicial);
      } else {
        productosAgrupados.set(
          producto.nombre,
          Math.min(productosAgrupados.get(producto.nombre), producto.cantidad_inicial)
        );
      }
    });

    // Verificar stock mínimo después de agrupar
    productosAgrupados.forEach((cantidad_inicial, nombre) => {
      if (cantidad_inicial < umbralCritico) {
        alertMessages.push(`¡Atención! El stock del producto ${nombre} es bajo.`);
      }
    });

    return alertMessages;
  }

  public uploadIMG(formData: FormData) {
    return this.http.post("https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_img.php", formData);
  }

  async creatSession(id: string, valor: string) {
    await this.storage.set(id, valor);  // Usa el método set del Storage
  }

  async closeSession() {
    await this.storage.clear();  // Usa el método clear del Storage
    this.navCtrl.navigateRoot(['/login']);
  }

  async getSession(id: string) {
    return await this.storage.get(id);  // Usa el método get del Storage
  }

  // Sign in
  async login(email: string, password: string) {
    let sample_user = {
      email: email,
      password: password
    };
    return sample_user;
  }

  // Sign up
  async registro(email: string, password: string) {
    let sample_user = {
      email: email,
      password: password
    };
    return sample_user;
  }

  // Sign out
  async signOut() {
    this.router.navigateByUrl('/login');
  }

  private async processQueue() {
    if (this.isToastActive || this.toastQueue.length === 0) {
      return;
    }

    this.isToastActive = true;
    const toastData = this.toastQueue.shift();

    if (toastData) {
      const toast = await this.toastCtrl.create({
        message: toastData.message,
        duration: toastData.duration,
        position: toastData.position,
        color: toastData.color
      });

      toast.present();
      setTimeout(() => {
        this.isToastActive = false;
        this.processQueue();
      }, toastData.duration + 500);
    }
  }

  public showToast(message: string) {
    this.toastQueue.push({ message, duration: 500, position: 'top', color: 'danger' });
    this.processQueue();
  }

  public showToast1(message: string) {
    this.toastQueue.push({ message, duration: 500, position: 'bottom', color: 'warning' });
    this.processQueue();
  }

  public showToast2(message: string) {
    this.toastQueue.push({ message, duration: 500, position: 'top', color: 'success' });
    this.processQueue();
  }
}