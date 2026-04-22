Auditoría y Refactorización de Código
Actividad 6: Detectives del Código

Materia: Proyecto de Implementación de Sitios Web Dinámicos
Alumno: Jheysmar Mendieta Mamani
Curso: 7° 2°

# Introducción

En esta actividad se realizó una auditoría de código sobre un generador de contraseñas.
El objetivo fue aplicar principios de Clean Code y Refactorización, mejorando la legibilidad, mantenibilidad y seguridad del sistema.

# Código Original (Versión Sucia)

function gen(l, o) {
  let c = '';
  if(o.l) c += 'abcdefghijklmnopqrstuvwxyz';
  if(o.u) c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(o.n) c += '0123456789';
  if(o.s) c += '!@#$%^&*()';

  let p = '';
  for(let i=0;i<l;i++){
    p += c[Math.floor(Math.random()*c.length)];
  }

  return p;
}

# Problemas Detectados

- Nombres de variables poco descriptivos (l, o, c, p)
- No hay separación de responsabilidades
- Uso de Math.random() (menos seguro)
- Falta de validaciones
- Código difícil de mantener
- No hay documentación

# Código Refactorizado (Versión Profesional)

'use strict';

const CHARACTER_SETS = {
  lower:   'abcdefghijklmnopqrstuvwxyz',
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const activeOptions = {
  lower:   true,
  upper:   true,
  numbers: true,
  symbols: true
};

let currentPassword = '';

/** Genera una contraseña segura en base a opciones seleccionadas */
function generateSecurePassword(passwordLength, characterOptions) {
  let characterPool = '';

  for (const [setName, isActive] of Object.entries(characterOptions)) {
    if (isActive) characterPool += CHARACTER_SETS[setName];
  }

  if (characterPool === '') return '';

  let generatedPassword = '';

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = getSecureRandomIndex(characterPool.length);
    generatedPassword += characterPool[randomIndex];
  }

  return generatedPassword;
}

/** Genera un índice aleatorio seguro */
function getSecureRandomIndex(max) {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
}

# Mejoras Aplicadas

1. Nombres descriptivos
gen → generateSecurePassword
c → characterPool
p → generatedPassword

2. Seguridad mejorada
Se reemplazó Math.random() por crypto.getRandomValues()
Generación de números aleatorios más segura

3. Modularización
Se separaron responsabilidades en funciones:

- generateSecurePassword
- getSecureRandomIndex
- calculateEntropy
- evaluateStrength

4. Uso de constantes
Se definieron estructuras claras:

const CHARACTER_SETS
const STRENGTH_LEVELS

Esto evita valores “mágicos” en el código.

5. Mejor lógica y legibilidad
- Uso de Object.entries()
- Uso de reduce() para cálculos
- Código más limpio y entendible

6. Documentación
Se agregaron comentarios explicando:

- Qué hace cada función
- Parámetros
- Retornos

# Conclusión

La refactorización permitió transformar un código funcional pero desordenado en un sistema profesional, aplicando buenas prácticas de desarrollo.

Se logró:

- Mejorar la claridad del código
- Aumentar la seguridad
- Facilitar futuras modificaciones