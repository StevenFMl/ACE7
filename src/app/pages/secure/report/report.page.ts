import { Component } from '@angular/core';
import { ReportService } from 'src/app/services/report/report.service';
import { Chart } from 'chart.js';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage {
  dateFrom: string;
  dateTo: string;
  reportType = 'daily_sales';
  reportData: any = [];
  exportFormat = '';

  currentPage = 1;
  totalPages = 1;
  isAccordionOpen = true;
  isShowChart = false;
  chart: Chart | undefined;

  constructor(private reportService: ReportService, private storage: Storage) {
    this.init();
  }

  private async init() {
    await this.storage.create();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.generateReport(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.generateReport(this.currentPage);
    }
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  loadChart() {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;

    if (ctx) {
      // Destroy previous chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.reportData.map((item) => item.nombre),
          datasets: [
            {
              label: 'Ganancias',
              data: this.reportData.map((item) => item.cuanto_gana),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
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
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async generateReport(page?: number) {
    const requestBody = {
      accion: 'report',
      id_persona: await this.storage.get('codigo'),
      dateFrom: this.formatDate(new Date(new Date(this.dateFrom).setDate(new Date(this.dateFrom).getDate() - 1))),
      dateTo: this.formatDate(new Date(this.dateTo)),
      items_per_page: 10,
      page: page || 1,
    };
  
    this.reportService.getDataReport(requestBody).subscribe((response: any) => {
      if (response.estado) {
        // Obtenemos los productos
        const productos = response.productos;
  
        // Agrupar productos por nombre y sumar las cantidades y otros campos
        const productosAgrupados = productos.reduce((acc: any, producto: any) => {
          const key = producto.nombre; // Agrupar por nombre del producto
  
          // Si ya existe el producto en el acumulador, sumamos cantidades y otros campos
          if (acc[key]) {
            acc[key].RF_CANTIDAD_VENDIDA += parseFloat(producto.RF_CANTIDAD_VENDIDA);
            acc[key].cuanto_gana += parseFloat(producto.cuanto_gana);
            acc[key].RS_PERDIDA_REGALADOS += parseFloat(producto.RS_PERDIDA_REGALADOS);
            acc[key].RS_PRODUCTOS_NO_VENDIDOS += parseFloat(producto.RS_PRODUCTOS_NO_VENDIDOS);
          } else {
            // Si no existe, agregamos el producto al acumulador
            acc[key] = {
              ...producto,
              RF_CANTIDAD_VENDIDA: parseFloat(producto.RF_CANTIDAD_VENDIDA),
              cuanto_gana: parseFloat(producto.cuanto_gana),
              RS_PERDIDA_REGALADOS: parseFloat(producto.RS_PERDIDA_REGALADOS),
              RS_PRODUCTOS_NO_VENDIDOS: parseFloat(producto.RS_PRODUCTOS_NO_VENDIDOS),
            };
          }
  
          return acc;
        }, {});
  
        // Convertimos de nuevo el objeto a array
        this.reportData = Object.values(productosAgrupados);
  
        // Paginación
        this.currentPage = response.pagination.current_page;
        this.totalPages = response.pagination.total_pages;
        this.isAccordionOpen = false;
  
        setTimeout(() => {
          this.loadChart();
        }, 500);
      } else {
        console.error('Error al generar el reporte', response.mensaje);
      }
    });
  }
  
}
