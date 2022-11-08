import { /* inject, */ BindingScope, injectable} from '@loopback/core';
// Nuevas librerias
import {repository} from '@loopback/repository';
import {configuracion} from '../config/config';
import {Usuario} from '../models';
import {UsuarioRepository} from '../repositories';

const jwt = require('jsonwebtoken');
const generator = require("password-generator");
const cryptoJS = require("crypto-js");

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(@repository(UsuarioRepository)
  public usuarioRepository: UsuarioRepository) { }

  /*
   * Add service methods here
   */
  //Generacion de claves
  generarClave() {
    let clave = generator(8, false);
    return clave;
  }

  cifrarClave(clave: String) {
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }

  //JWT
  generarTokenJWT(usuario: Usuario) {
    let token = jwt.sign({
      data: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre + " " + usuario.apellidos
      }
    }, configuracion.claveJWT)

    return token
  }

  validarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, configuracion.claveJWT);
      return datos;
    } catch (error) {
      return false;
    }
  }

  //Autenticacion
  identificarPersona(correo: string, password: string) {
    try {
      let user = this.usuarioRepository.findOne({where: {correo: correo, password: password}})
      if (user) {
        return user;
      }
      return false;
    } catch {
      return false;
    }
  }
}
