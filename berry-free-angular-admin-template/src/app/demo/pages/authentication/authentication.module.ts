import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';


@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,CommonModule, AuthenticationRoutingModule]
})
export class AuthenticationModule {}
