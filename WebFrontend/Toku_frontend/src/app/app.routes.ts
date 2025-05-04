import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { UserSettingsComponent } from './pages/user-settings/user-settings.component';
import { GroupSettingsComponent } from './pages/group-settings/group-settings.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'changepass', component: ChangePasswordComponent},
    {path: 'main', component: MainPageComponent, children: 
        [{path: 'user-settings', component: UserSettingsComponent}],
    },
    {path: 'group-settings', component: GroupSettingsComponent},
];
