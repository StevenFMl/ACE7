import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperer_c',
  templateUrl: './recuperer_c.page.html',
  styleUrls: ['./recuperer_c.page.scss'],
})
export class PasswordResetPage implements OnInit {
  reset_form: FormGroup;
  submit_attempt: boolean = false;
  current_year: number = new Date().getFullYear();
  show_code_input: boolean = false; // Usar esta propiedad en el HTML
  code_form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.reset_form = this.formBuilder.group({
      cedula: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
    });

    this.code_form = this.formBuilder.group({
      code: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])], // Para ingresar el código
    });
  }

  async resetPassword() {
    this.submit_attempt = true;

    if (this.reset_form.valid) {
      const loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: '<p>Enviando solicitud...</p><span>Por favor, espere.</span>',
        spinner: 'crescent',
      });
      await loading.present();

      const cedula = this.reset_form.value.cedula;
      const datos = { accion: 'recuperar_contrasena', cedula };

      this.http.post<any>("https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_gad.php", datos).subscribe(
        async (response) => {
          await loading.dismiss();
          if (response.estado) {
            await this.toastService.presentToast('Éxito', response.mensaje, 'top', 'success', 2000);
            this.show_code_input = true; // Muestra el formulario para el código si la respuesta es exitosa
          } else {
            await this.toastService.presentToast('Error', response.mensaje, 'top', 'danger', 2000);
          }
        },
        async (error) => {
          await loading.dismiss();
          await this.toastService.presentToast('Error', 'Error al enviar la solicitud de recuperación de contraseña.', 'top', 'danger', 2000);
        }
      );
    } else {
      await this.toastService.presentToast('Error', 'Por favor ingrese una cédula válida.', 'top', 'danger', 2000);
    }
  }

  async verifyCode() {
    if (this.code_form.valid) {
      const loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: '<p>Verificando código...</p><span>Por favor, espere.</span>',
        spinner: 'crescent',
      });
      await loading.present();

      const code = this.code_form.value.code;
      const datos = { accion: 'verificar_codigo', token: code };

      this.http.post<any>("https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/ws_gad.php", datos).subscribe(
        async (response) => {
          await loading.dismiss();
          if (response.estado) {
            await this.toastService.presentToast('Éxito', 'Código verificado. Proceda a cambiar su contraseña.', 'top', 'success', 2000);
            // Redirige a la página de cambio de contraseña, pasando el token como parámetro de consulta
            this.router.navigate(['/password-form'], { queryParams: { token: code } });
          } else {
            await this.toastService.presentToast('Error', 'Código incorrecto. Intente nuevamente.', 'top', 'danger', 2000);
          }
        },
        async (error) => {
          await loading.dismiss();
          await this.toastService.presentToast('Error', 'Error al verificar el código.', 'top', 'danger', 2000);
        }
      );
    } else {
      await this.toastService.presentToast('Error', 'Por favor ingrese un código válido.', 'top', 'danger', 2000);
    }
  }
}