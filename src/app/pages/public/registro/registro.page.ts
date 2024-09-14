import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TerminosCondicionesPage } from '../terminos-condiciones/terminos-condiciones.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  codigo: string = '';
  nacionalidades: any = [];
  ciudades: any = [];
  provincias: any = [];
  txt_nombre: string = '';
  txt_apellido: string = '';
  txt_fecha_nacimiento = '';
  sel_ecivil: string = '';
  txt_otro_ecivil: string = '';
  sel_etnia: string = '';
  txt_otra_etnia: string = '';
  sel_discapacidad: string = '';
  txt_tipodis: string = '';
  txt_porcentajedis: string = '';
  txt_ncarnetdis: string = '';
  sel_ocupacion: string = '';
  txt_otra_ocupacion: string = '';
  sel_nacionalidad: string = '51';
  sel_ciudad: string = '15';
  sel_provincia: string = '11';
  txt_parroquia: string = '';
  txt_barrio: string = '';
  txt_calle1: string = '';
  txt_calle2: string = '';
  sel_neducacion: string = '';
  sel_genero: string = '';
  txt_otro_genero: string = '';
  txt_cedula: string = '';
  txt_correo: string = '';
  txt_clave: string = '';
  txt_telefono: string = '';
  sel_tipoced: string = '';
  claveType: string = 'password';
  confClaveType: string = 'password';

  current_year: number = new Date().getFullYear();

  registro_form: FormGroup;
  submit_attempt: boolean = false;

  check_terminos: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController
  ) {
    this.authService.getSession('persona').then((res: any) => {
      this.lnacionalidades(this.codigo), this.lciudades(this.codigo);
      this.lprovincias(this.codigo);
      
    });
  }
  validateOnlyLetters(input: string): boolean {
    const lettersRegex = /^[A-Za-z\s]+$/;
    return lettersRegex.test(input); }


  ngOnInit() {
    // Setup form
    
    this.registro_form = this.formBuilder.group({
      tipo_documento: ['', Validators.required],
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      nombres: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      apellidos: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      fecha_nacimiento: ['', Validators.required],
      ecivil: ['', Validators.required],
      otroecivil: [''],
      etnia: ['', Validators.required],
      otraetnia: [''],
      discapacidad: ['', Validators.required],
      tipodis: [''],
      porcentajedis: [''],
      ncarnetdis: [''],
      ocupacion: ['', Validators.required],
      otraocupacion: [''],
      nacionalidad: ['', Validators.required],
      ciudad: ['', Validators.required],
      provincia: ['', Validators.required],
      parroquia: ['', Validators.required],
      barrio: ['', Validators.required],
      calle1: ['', Validators.required],
      calle2: ['', Validators.required],
      neducacion: ['', Validators.required],
      genero: ['', Validators.required],
      otrogenero: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10)]],
      clave: ['', [Validators.required,this.strongPasswordValidator(), Validators.minLength(8)]],
      conf_clave: ['', [Validators.required, Validators.minLength(8)]],
      terminos_condiciones: [false, Validators.requiredTrue],
    });
  }

  // Función openModal
  async openModal(modalName: string) {
    const modal = await this.modalController.create({
      component: TerminosCondicionesPage,
      componentProps: { modalName },
    });
    return await modal.present();
  }

  // Sign up
  async registrar() {
    console.log(this.registro_form.value);
    console.log(this.registro_form.status);

    // Check terminos y Condiciones
    if (this.registro_form.value.terminos_condiciones == false) {
      this.submit_attempt = true;
      return;
    }

    // Verificar si los campos obligatorios están vacíos
    if (
      this.registro_form.value.correo == '' ||
      this.registro_form.value.tipo_documento == '' ||
      this.registro_form.value.nombres == '' ||
      this.registro_form.value.apellidos == '' ||
      this.registro_form.value.fecha_nacimiento == '' ||
      this.registro_form.value.ecivil == '' ||
      this.registro_form.value.etnia == '' ||
      this.registro_form.value.discapacidad == '' ||
      this.registro_form.value.ocupacion == '' ||
      this.registro_form.value.nacionalidad == '' ||
      this.registro_form.value.ciudad == '' ||
      this.registro_form.value.provincia == '' ||
      this.registro_form.value.parroquia == '' ||
      this.registro_form.value.barrio == '' ||
      this.registro_form.value.calle1 == '' ||
      this.registro_form.value.calle2 == '' ||
      this.registro_form.value.neducacion == '' ||
      this.registro_form.value.genero == '' ||
      this.registro_form.value.cedula == '' ||
      this.registro_form.value.correo == '' ||
      this.registro_form.value.telefono == '' ||
      this.registro_form.value.clave == '' ||
      this.registro_form.value.conf_clave == ''
      
    ) {
      this.authService.showToast('Todos los campos son obligatorios y no pueden estar vacíos');
      return;
    }

    if (!this.validateOnlyLetters(this.registro_form.value.nombres)) {
      this.authService.showToast('El campo Nombres solo debe contener letras');
      return;
    }

    if (!this.validateOnlyLetters(this.registro_form.value.apellidos)) {
      this.authService.showToast('El campo Apellidos solo debe contener letras');
      return;
    }

    if (this.registro_form.value.clave !== this.registro_form.value.conf_clave) {
      this.authService.showToast('Las contraseñas no coinciden');
      return;
    }

    if (!this.validateEmail(this.registro_form.value.correo)) {
      this.authService.showToast('El correo electrónico no es válido');
      return;
    }

    if (!this.validatePhoneNumber(this.registro_form.value.telefono)) {
      this.authService.showToast('El número de teléfono no es válido');
      return;
    }

    if (this.registro_form.get('cedula').errors && this.registro_form.get('cedula').errors.cedulaEcuatoriana) {
      this.authService.showToast('La cedula no es válida');
      return;
    }

    // Validar otraetnia si etnia es "Otro"
    /* if (this.registro_form.value.etnia === 'otro') {
      if (!this.registro_form.value.otraetnia || this.registro_form.value.otraetnia.trim() === '') {
        this.authService.showToast('Debe especificar su etnia si selecciona "Otro"');
        return;
      }
    } else {
      this.registro_form.patchValue({ otraetnia: '' });
    } */

    let datos = {
      accion: 'n_usuario',
      cedula: this.txt_cedula,
      tipoced: this.sel_tipoced,
      nombre: this.txt_nombre,
      apellido: this.txt_apellido,
      ecivil: this.sel_ecivil,
      otroecivil: this.txt_otro_ecivil,
      etnia: this.sel_etnia,
      otraetnia: this.txt_otra_etnia,
      discapacidad: this.sel_discapacidad,
      tipodis: this.txt_tipodis,
      porcentajedis: this.txt_porcentajedis,
      ncarnetdis: this.txt_ncarnetdis,
      ocupacion: this.sel_ocupacion,
      otraocupacion: this.txt_otra_ocupacion,
      nacionalidad: this.sel_nacionalidad,
      ciudad: this.sel_ciudad,
      provincia: this.sel_provincia,
      parroquia: this.txt_parroquia,
      barrio: this.txt_barrio,
      calle1: this.txt_calle1,
      calle2: this.txt_calle2,
      fecha_nacimiento: this.txt_fecha_nacimiento,
      genero: this.sel_genero,
      otrogenero: this.txt_otro_genero,
      neducacion: this.sel_neducacion,
      telefono: this.txt_telefono,
      correo: this.txt_correo,
      clave: this.txt_clave,
      conf_clave: this.txt_clave,
      terminos_condiciones: this.registro_form.value.terminos_condiciones,
    };

    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado == true) {
        this.mostrarMensajeRegistroExitoso();
        this.router.navigate(['/login']);
        this.registro_form.reset(); 
      } else {
        this.authService.showToast(res.mensaje);
      }
    });
  }


  async mostrarMensajeRegistroExitoso() {
    const toast = await this.toastService.presentToast(
      'Éxito',
      '¡Se ha registrado correctamente!',
      'top',
      'success',
      3000
    );
  }
  

  validateEmail(correo: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(correo);
  }
  validatePhoneNumber(telefono: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(telefono);
  }
  cedulaEcuatorianaValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const cedula = control.value;
      if (cedula.length === 10) {
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;
        for (let i = 0; i < coeficientes.length; i++) {
          let resultado = parseInt(cedula.charAt(i)) * coeficientes[i];
          if (resultado > 9) {
            resultado -= 9;
          }
          suma += resultado;
        }
        const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);

        if (parseInt(cedula.charAt(9)) !== digitoVerificador) {
          return { cedulaEcuatoriana: true };
        }
      }
      return null;
    };
  }

  lnacionalidades(codigo: string) {
    let datos = {
      accion: 'lnacionalidad',
    };
    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado == true) {
        this.nacionalidades = res.datos;
      } else {
        this.nacionalidades.showToast(res.mensaje);
      }
    });
  }
  lciudades(codigo: string) {
    let datos = {
      accion: 'lciudad',
    };
    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado == true) {
        this.ciudades = res.datos;
      } else {
        this.ciudades.showToast(res.mensaje);
      }
    });
  }
  lprovincias(codigo: string) {
    let datos = {
      accion: 'lprovincia',
    };
    this.authService.postData(datos).subscribe((res: any) => {
      if (res.estado == true) {
        this.provincias = res.datos;
      } else {
        this.provincias.showToast(res.mensaje);
      }
    });
  }
  togglePasswordVisibility() {
    this.claveType = this.claveType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility() {
    this.confClaveType = this.confClaveType === 'password' ? 'text' : 'password';
  }
  strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const isValid =
        hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
      return !isValid ? { strongPassword: true } : null;
    };
  }

  
}