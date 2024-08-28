import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Chart } from 'chart.js';
import { ReportService } from 'src/app/services/report/report.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  content_loaded = false;
  productos = [];
  totalGanancias: number = 0;
  totalCantidadVendida: number = 0; // Total de cantidad vendida
  myChart: Chart<'bar'> | null = null;
  myChart2: Chart<'pie'> | null = null;

  codigo: string = '';
  searchTerm: string = '';
  stockAlerts: string[] = [];
  constructor(private authService: AuthService, private reportService: ReportService, private alertController: AlertController) { }

  verificarStock(codigo: string) {
    let datos = {
      accion: 'lproductos',
      cod_persona: this.codigo,
    };
    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado === true) {
        // Verificar stock mínimo con lógica dinámica
        this.stockAlerts = this.authService.checkStockMinimo(res.datos);
        if (this.stockAlerts.length > 0) {
          this.showStockAlert();
        }
      } else {
        this.authService.showToast(res.mensaje);
      }
    });
  }

  async showStockAlert() {
    const alert = await this.alertController.create({
      header: 'Alertas de Stock',
      message: this.stockAlerts.join('<br>'),
      buttons: ['OK']
    });

    await alert.present();
  }

  private generarColoresHexadecimales(cantidad: number): string[] {
    const colores: string[] = [];
    const letrasHex = '89ABCDEF';

    while (colores.length < cantidad) {
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letrasHex[Math.floor(Math.random() * letrasHex.length)];
      }

      if (!colores.includes(color)) {
        colores.push(color);
      }
    }

    return colores;
  }


  ngOnInit() {
    // Fake timeout
    setTimeout(() => {
      this.content_loaded = true;
    }, 2000);
  }
}

