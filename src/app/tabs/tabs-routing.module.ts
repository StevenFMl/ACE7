import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { ReloadGuard } from '../reload.guard'; // Importa tu guard

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../pages/secure/home/home.module').then(
            (m) => m.HomePageModule
          ),
        canActivate: [ReloadGuard], // Aplica el guard aquí
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
