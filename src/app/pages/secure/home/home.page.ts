import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Chart } from 'chart.js';
import { ReportService } from 'src/app/services/report/report.service';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  content_loaded = false;
  productos = [];
  totalGanancias: number = 0;
  totalCantidadVendida: number = 0;
  myChart: Chart<'bar'> | null = null;
  myChart2: Chart<'pie'> | null = null;

  codigo: string = '';
  searchTerm: string = '';
  stockAlerts: string[] = [];
  dateFrom: string = ''; // Nueva variable para la fecha de inicio
  dateTo: string = '';   // Nueva variable para la fecha de fin

  constructor(
    private authService: AuthService,
    private reportService: ReportService,
    private alertController: AlertController,
    private storage: Storage
  ) {
    this.init();
  }

  private async init() {
    await this.storage.create();
  }

  async ionViewWillEnter() {
    try {
      const res = await this.authService.getSession('codigo');
      this.codigo = res;
      await this.verificarStock(this.codigo);
      // Cargar datos al entrar en la vista
      this.getData();
    } catch (error) {
      console.error('Error al inicializar los datos', error);
      this.authService.showToast(
        'Error al cargar los datos. Por favor, intenta de nuevo.'
      );
    }
  }

  // Destruir gráficos al destruir la página
  ngOnDestroy() {
    if (this.myChart) {
      this.myChart.destroy();
      this.myChart = null;
    }
    if (this.myChart2) {
      this.myChart2.destroy();
      this.myChart2 = null;
    }
  }

  // Método para actualizar los gráficos
  private actualizarGraficos() {
    if (this.myChart) {
      this.myChart.destroy();
    }
    if (this.myChart2) {
      this.myChart2.destroy();
    }
    this.generarChart();
    this.generarChartPastel();
  }

  verificarStock(codigo: string) {
    let datos = {
      accion: 'verificarStock',
      cod_persona: this.codigo,
    };
    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado === true) {
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
      buttons: ['OK'],
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

  private async getData() {
    const codigoUsuario = await this.storage.get('codigo');
     // Establecer las fechas de inicio y fin (primer día del mes y hoy)
    this.dateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    this.dateTo = new Date().toISOString().split('T')[0];
    const datos = {
      accion: 'report',
      id_persona: codigoUsuario,
      page: 1,
      items_per_page: 1000000000,
      dateFrom: this.dateFrom,
    dateTo: this.dateTo,
    };

    this.reportService.getDataReport(datos).subscribe((res: any) => {
      if (res.estado) {
        let products = res?.productos;

        if (products && Array.isArray(products)) {
          // Agrupar productos y calcular ganancias y cantidad
          const productosAgrupados = products.reduce((acc, producto) => {
            const nombre = producto.nombre;

            if (!acc[nombre]) {
              acc[nombre] = {
                ...producto,
                RF_CANTIDAD_VENDIDA: parseFloat(producto.RF_CANTIDAD_VENDIDA),
                cuanto_gana: parseFloat(producto.cuanto_gana),
              };
            } else {
              acc[nombre].RF_CANTIDAD_VENDIDA += parseFloat(producto.RF_CANTIDAD_VENDIDA);
              acc[nombre].cuanto_gana += parseFloat(producto.cuanto_gana);
            }

            return acc;
          }, {});

          // Convertir a array y ordenar
          this.productos = Object.values(productosAgrupados)
            .sort((a: any, b: any) => b.RF_CANTIDAD_VENDIDA - a.RF_CANTIDAD_VENDIDA)
            .slice(0, 4);

          const colors = this.generarColoresHexadecimales(this.productos.length);

          this.productos = this.productos.map((d: any, index: number) => ({
            name: d.nombre,
            value: parseFloat(d.RF_CANTIDAD_VENDIDA).toFixed(2), // Cantidad con dos decimales
            ganancias: parseFloat(d.cuanto_gana).toFixed(2), // Ganancias con dos decimales
            color: colors[index],
          }));

          // Calcular total de ganancias y cantidad vendida con dos decimales
          this.totalGanancias = parseFloat(
            this.productos.reduce((total, producto) => total + parseFloat(producto.ganancias), 0).toFixed(2)
          );
          this.totalCantidadVendida = parseFloat(
            this.productos.reduce((total, producto) => total + parseFloat(producto.value), 0).toFixed(2)
          );

          // Actualizar gráficos
          this.actualizarGraficos();
        } else {
          this.authService.showToast(res.mensaje);
        }
      } else {
        this.authService.showToast(res.mensaje);
      }
    });
  }

  generarChart() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    this.myChart = new Chart<'bar'>(ctx, {
      type: 'bar',
      data: {
        labels: this.productos.map((x) => x.name),
        datasets: [
          {
            label: 'Productos más vendidos',
            data: this.productos.map((x) => parseFloat(x.value)), // Convertir a número con decimales
            backgroundColor: this.productos.map((x) => x.color),
            borderColor: this.productos.map((x) => x.color),
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  generarChartPastel() {
    const canvas = document.getElementById('myChart2') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    this.myChart2 = new Chart<'pie'>(ctx, {
      type: 'pie',
      data: {
        labels: this.productos.map((x) => x.name),
        datasets: [
          {
            label: 'Ganancias por producto',
            data: this.productos.map((x) => parseFloat(x.ganancias)), // Convertir a número con decimales
            backgroundColor: this.productos.map((x) => x.color),
            borderColor: this.productos.map((x) => x.color),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.content_loaded = true;
    }, 2000);
  }
}