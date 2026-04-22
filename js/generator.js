'use strict'; // obliga a escribir código más “estricto” y evita errores raros

// Acá guardamos todos los tipos de caracteres que se pueden usar
const CHARACTER_SETS = {
  lower:   'abcdefghijklmnopqrstuvwxyz', // minúsculas
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // mayúsculas
  numbers: '0123456789',                 // números
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?' // símbolos
};

// Niveles de seguridad según la entropía (qué tan difícil es la contraseña)
const STRENGTH_LEVELS = [
  { minEntropy: 0,  label: 'Débil',      cssClass: 'debil',   bars: 1, color: '#ff3e6c' },
  { minEntropy: 36, label: 'Regular',    cssClass: 'regular', bars: 2, color: '#f4a261' },
  { minEntropy: 52, label: 'Buena',      cssClass: 'buena',   bars: 3, color: '#00c6ff' },
  { minEntropy: 70, label: 'Muy segura', cssClass: 'fuerte',  bars: 4, color: '#00ffa3' },
];

// Opciones activas (qué tipos de caracteres están habilitados)
const activeOptions = {
  lower:   true,
  upper:   true,
  numbers: true,
  symbols: true
};

let currentPassword = ''; // guarda la contraseña actual

// Genera la contraseña según la longitud y opciones
function generateSecurePassword(passwordLength, characterOptions) {
  let characterPool = '';

  // arma el “pool” de caracteres según lo que esté activado
  for (const [setName, isActive] of Object.entries(characterOptions)) {
    if (isActive) characterPool += CHARACTER_SETS[setName];
  }

  // si no hay ningún tipo seleccionado, no genera nada
  if (characterPool === '') return '';

  let generatedPassword = '';

  // arma la contraseña carácter por carácter
  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = getSecureRandomIndex(characterPool.length);
    generatedPassword += characterPool[randomIndex];
  }

  return generatedPassword;
}

// genera un número aleatorio más seguro que Math.random()
function getSecureRandomIndex(max) {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer); // usa la API del navegador
  return randomBuffer[0] % max;
}

// calcula la entropía (qué tan fuerte es la contraseña)
function calculateEntropy(poolSize, passwordLength) {
  if (poolSize === 0) return 0;
  return passwordLength * Math.log2(poolSize);
}

// según la entropía, devuelve el nivel de seguridad
function evaluateStrength(entropyBits) {
  let result = STRENGTH_LEVELS[0];

  for (const level of STRENGTH_LEVELS) {
    if (entropyBits >= level.minEntropy) result = level;
  }

  return result;
}

// función principal que se ejecuta al generar contraseña
function generatePassword() {
  const passwordLength = parseInt(document.getElementById('lengthSlider').value, 10);

  const password = generateSecurePassword(passwordLength, activeOptions);

  // si no se pudo generar
  if (!password) {
    document.getElementById('pwDisplay').textContent = 'Seleccioná al menos un tipo';
    clearStrengthBars();
    return;
  }

  currentPassword = password;
  document.getElementById('pwDisplay').textContent = password;

  // calcula el tamaño del pool de caracteres activos
  const poolSize = Object.entries(activeOptions)
    .filter(([_, isActive]) => isActive)
    .reduce((total, [name]) => total + CHARACTER_SETS[name].length, 0);

  // calcula seguridad
  const entropyBits = calculateEntropy(poolSize, passwordLength);
  const strength    = evaluateStrength(entropyBits);

  updateStrengthBars(strength);

  // resetea el botón de copiar
  document.getElementById('copyBtn').classList.remove('copied');
  document.getElementById('copyBtn').innerHTML = '<i class="fas fa-copy"></i>';
}

// actualiza las barras visuales de seguridad
function updateStrengthBars(strength) {
  for (let barNumber = 1; barNumber <= 4; barNumber++) {
    const barElement = document.getElementById('b' + barNumber);
    barElement.className = 'bar';

    if (barNumber <= strength.bars) {
      barElement.classList.add(strength.cssClass);
    }
  }

  // cambia el texto y color del nivel
  const strengthLabelEl = document.getElementById('strengthLabel');
  strengthLabelEl.textContent = strength.label;
  strengthLabelEl.style.color = strength.color;
}

// limpia las barras cuando no hay contraseña
function clearStrengthBars() {
  for (let barNumber = 1; barNumber <= 4; barNumber++) {
    document.getElementById('b' + barNumber).className = 'bar';
  }

  const labelEl = document.getElementById('strengthLabel');
  labelEl.textContent = '—';
  labelEl.style.color = '';
}

// activa o desactiva opciones (minúsculas, números, etc)
function toggle(optionName) {
  const activeCount = Object.values(activeOptions).filter(Boolean).length;

  // evita que se desactiven todas las opciones
  if (activeOptions[optionName] && activeCount === 1) return;

  activeOptions[optionName] = !activeOptions[optionName];

  const buttonEl = document.getElementById('opt-' + optionName);
  buttonEl.classList.toggle('active', activeOptions[optionName]);

  if (currentPassword) generatePassword();
}

// copia la contraseña al portapapeles
function copyPassword() {
  if (!currentPassword) return;

  navigator.clipboard.writeText(currentPassword).then(() => {
    const copyBtn = document.getElementById('copyBtn');

    // cambia el ícono cuando se copia
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.classList.add('copied');

    // vuelve al ícono normal después de 2 segundos
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
}

// cuando se mueve el slider de longitud
document.getElementById('lengthSlider').addEventListener('input', function () {
  document.getElementById('lengthVal').textContent = this.value;

  if (currentPassword) generatePassword();
});

// genera una contraseña apenas carga la página
generatePassword();