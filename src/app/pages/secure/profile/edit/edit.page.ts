import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ActionSheetController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  edit_profile_form: FormGroup;
  submit_attempt: boolean = false;

  persona: string = '';
  correo: string = '';
  nombre: string = '';
  apellido: string = '';
  cedula: string = '';
  imgUrl: any = null;
  img: any = null;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private navController: NavController,
    private actionSheetController: ActionSheetController
  ) {
    this.initializeData();
  }

  ngOnInit() {
    // Setup form
    this.edit_profile_form = this.formBuilder.group({
      nombre: [this.nombre, Validators.required],
      apellido: [this.apellido, Validators.required]
    });
  }

  // Initialize session data
  async initializeData() {
    this.persona = await this.authService.getSession('persona');
    this.correo = await this.authService.getSession('correo');
    this.nombre = await this.authService.getSession('nombre');
    this.apellido = await this.authService.getSession('apellido');
    this.cedula = await this.authService.getSession('cedula');
    this.imgUrl = await this.authService.getSession('imgUrl');
  }

  // Update name and picture
  async actnombre() {
    const nombreImg = 'avatar_user_' + this.cedula;
    let datos = {
      accion: "actnombre",
      cedula: this.cedula,
      nombre: this.edit_profile_form.value.nombre || this.nombre,
      apellido: this.edit_profile_form.value.apellido || this.apellido,
      imgUrl: 'https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/uploads/' + nombreImg + '.jpg',
    };
  
    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado) {
        this.toastService.presentToast('Guardado', 'Perfil actualizado con éxito', 'top', 'success', 2000);
        this.navController.navigateRoot('/home');
      } else {
        this.toastService.presentToast('Error', res.mensaje, 'top', 'danger', 2000);
      }
    });

    if (this.img != null) {
      const formData = new FormData();
      formData.append('image', this.img);
      formData.append('userId', nombreImg);

      this.authService.uploadIMG(formData).subscribe(
        (res: any) => {
          this.toastService.presentToast('Imagen actualizada', res.mensaje, 'top', 'success', 2000);
        },
        (error) => {
          console.error(error);
          this.toastService.presentToast('Error', 'Error al subir la imagen', 'top', 'danger', 2000);
        }
      );
    }
  }

  async updateProfilePicture() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Elija una foto existente',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Elegir de la galería',
          icon: 'images',
          handler: () => {
            const inputElement = document.createElement('input');
            inputElement.type = 'file';
            inputElement.accept = 'image/*';
            inputElement.click();
  
            inputElement.addEventListener('change', async (event: any) => {
              const file = event.target.files[0];
              this.img = file;
              if (file) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                  this.imgUrl = e.target.result;
                };
                reader.readAsDataURL(file);
              }
            });
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
}