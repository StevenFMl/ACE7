import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ActionSheetController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
//import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  edit_profile_form: FormGroup;
  submit_attempt: boolean = false;

  txt_nombre:string="";
  txt_apellido:string="";
  txt_cedula:string="";
  persona: string="";
  correo: string="";
  nombre: string="";
  apellido: string="";
  cedula: string="";
  imgUrl: any = null;
  img: any = null;


  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private router: Router) { 
        
      this.authService.getSession('persona').then((res:any)=>{
        this.persona=res;
        
        });
      this.authService.getSession('correo').then((res:any)=>{
          this.correo=res;
          
          });
          this.authService.getSession('nombre').then((res:any)=>{
            this.nombre=res;
            
            });
            this.authService.getSession('apellido').then((res:any)=>{
              this.apellido=res;
              
              });
              this.authService.getSession('cedula').then((res:any)=>{
                this.cedula=res;
                
                });
                this.authService.getSession('imgUrl').then((res: any) => {
                  this.imgUrl = res;
                });
        }

  ngOnInit() {

    // Setup form
    this.edit_profile_form = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required]

    });


  }

  async actnombre() {
  const nombreImg = 'avatar_user_' + this.cedula; // Nombre de la imagen
  let datos = {
    accion: "actnombre",
    cedula: this.cedula,
    nombre: this.txt_nombre ? this.txt_nombre : this.nombre,
    apellido: this.txt_apellido ? this.txt_apellido : this.apellido,
    imgUrl: 'https://dominant-crow-certainly.ngrok-free.app/WsMunicipioIonic/uploads/' + nombreImg + '.jpg',
  };
  
  this.authService.postData(datos).subscribe((res: any) => {
    if (res.estado === true) {
      this.authService.showToast2(res.mensaje2);
      // Navegar al home
      this.navController.navigateRoot('/home');
    } else {
      this.authService.showToast(res.mensaje);
    }
  });

  if (this.img != null) {
    const formData = new FormData();
    formData.append('image', this.img);
    formData.append('userId', nombreImg);

    this.authService.uploadIMG(formData).subscribe(
      (res: any) => {
        this.authService.showToast2(res.mensaje);
      },
      (error) => {
        console.error(error);
        this.authService.showToast('Error al subir la imagen');
      }
    );
  }
}

  // Update profile picture
  async updateProfilePicture() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Elija una foto existente ',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Elegir de la galería ',
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
                reader.onload = async (e: any) => {
                  this.imgUrl = e.target.result;
                };
                reader.readAsDataURL(file);
              }
            });
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }


  
  // Submit form
  submit() {

    this.submit_attempt = true;

    // If form valid
    if (this.edit_profile_form.valid) {

      // Save form ...

      // Display success message and go back
      this.toastService.presentToast('Guardado', 'Perfil guardado correctamente', 'top', 'success', 2000);
      this.navController.back();

    } else {

      // Display error message
      this.toastService.presentToast('Error', 'Por favor, llene todos los campos', 'top', 'danger', 2000);
    }
  }
}