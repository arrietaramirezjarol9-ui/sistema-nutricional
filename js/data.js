/**
 * js/data.js
 * Base de datos semilla, constantes de la OMS/MINSA y lógica de cálculos clínicos.
 */

// Sectores de la Microred San Vicente de Cañete
const SECTORS_CONFIG = [
  { id: 1, name: 'C.S. San Vicente', category: 'I-3', target: 450, altitude: 40 },
  { id: 2, name: 'C.S. San Luis', category: 'I-3', target: 280, altitude: 30 },
  { id: 3, name: 'C.S. Cerro Azul', category: 'I-3', target: 220, altitude: 8 },
  { id: 4, name: 'P.S. Santa Bárbara', category: 'I-2', target: 120, altitude: 20 },
  { id: 5, name: 'P.S. Santa Cruz', category: 'I-2', target: 100, altitude: 35 },
  { id: 6, name: 'P.S. Herbay Bajo', category: 'I-2', target: 150, altitude: 15 },
  { id: 7, name: 'P.S. Herbay Alto', category: 'I-1', target: 90, altitude: 120 },
  { id: 8, name: 'P.S. Arena Alta', category: 'I-1', target: 110, altitude: 140 },
  { id: 9, name: 'P.S. Cerro Alegre', category: 'I-1', target: 130, altitude: 180 },
  { id: 10, name: 'P.S. Clarita', category: 'I-1', target: 80, altitude: 90 }
];

// Curvas de crecimiento simplificadas de la OMS (Talla y Crecimiento para Niños y Adolescentes < 18 años)
// Edades especificadas en meses.
const HEIGHT_CURVES = {
  male: [
    { age: 0, median: 49.9, sd: 2.6 },
    { age: 6, median: 67.6, sd: 2.7 },
    { age: 12, median: 75.7, sd: 2.7 },
    { age: 18, median: 82.3, sd: 3.0 },
    { age: 24, median: 87.8, sd: 3.2 },
    { age: 36, median: 96.1, sd: 3.6 },
    { age: 48, median: 103.3, sd: 4.0 },
    { age: 60, median: 110.0, sd: 4.4 },
    { age: 84, median: 121.7, sd: 5.1 },
    { age: 108, median: 132.6, sd: 5.9 },
    { age: 120, median: 137.8, sd: 6.3 },
    { age: 144, median: 149.1, sd: 7.4 },
    { age: 168, median: 163.2, sd: 7.9 },
    { age: 192, median: 172.9, sd: 7.2 },
    { age: 216, median: 176.0, sd: 6.5 }
  ],
  female: [
    { age: 0, median: 49.1, sd: 2.5 },
    { age: 6, median: 65.7, sd: 2.6 },
    { age: 12, median: 74.0, sd: 2.6 },
    { age: 18, median: 80.7, sd: 2.9 },
    { age: 24, median: 86.4, sd: 3.1 },
    { age: 36, median: 95.1, sd: 3.5 },
    { age: 48, median: 102.7, sd: 3.9 },
    { age: 60, median: 109.4, sd: 4.3 },
    { age: 84, median: 120.8, sd: 5.1 },
    { age: 108, median: 132.2, sd: 6.0 },
    { age: 120, median: 138.3, sd: 6.5 },
    { age: 144, median: 150.8, sd: 7.2 },
    { age: 168, median: 157.6, sd: 6.4 },
    { age: 192, median: 159.8, sd: 5.7 },
    { age: 216, median: 160.2, sd: 5.5 }
  ]
};

const BMI_CURVES = {
  male: [
    { age: 0, median: 13.4, sd: 1.0 },
    { age: 6, median: 17.5, sd: 1.2 },
    { age: 12, median: 16.8, sd: 1.2 },
    { age: 18, median: 16.5, sd: 1.1 },
    { age: 24, median: 16.3, sd: 1.1 },
    { age: 36, median: 15.8, sd: 1.0 },
    { age: 48, median: 15.5, sd: 1.0 },
    { age: 60, median: 15.3, sd: 1.0 },
    { age: 84, median: 15.4, sd: 1.2 },
    { age: 108, median: 15.9, sd: 1.6 },
    { age: 120, median: 16.2, sd: 1.8 },
    { age: 144, median: 17.2, sd: 2.2 },
    { age: 168, median: 18.5, sd: 2.6 },
    { age: 192, median: 19.8, sd: 2.8 },
    { age: 216, median: 20.9, sd: 2.8 }
  ],
  female: [
    { age: 0, median: 13.2, sd: 1.0 },
    { age: 6, median: 16.8, sd: 1.2 },
    { age: 12, median: 16.3, sd: 1.2 },
    { age: 18, median: 16.0, sd: 1.1 },
    { age: 24, median: 15.8, sd: 1.1 },
    { age: 36, median: 15.4, sd: 1.0 },
    { age: 48, median: 15.2, sd: 1.0 },
    { age: 60, median: 15.0, sd: 1.0 },
    { age: 84, median: 15.1, sd: 1.2 },
    { age: 108, median: 15.8, sd: 1.6 },
    { age: 120, median: 16.2, sd: 1.8 },
    { age: 144, median: 17.4, sd: 2.2 },
    { age: 168, median: 18.7, sd: 2.4 },
    { age: 192, median: 19.7, sd: 2.4 },
    { age: 216, median: 20.3, sd: 2.4 }
  ]
};

// Tabla de Ajuste de Hemoglobina por Altitud (Norma Técnica MINSA Perú)
const ALTITUDE_CORRECTIONS = [
  { min: 0, max: 999, correction: 0.0 },
  { min: 1000, max: 1199, correction: 0.1 },
  { min: 1200, max: 1499, correction: 0.2 },
  { min: 1500, max: 1799, correction: 0.4 },
  { min: 1800, max: 2199, correction: 0.6 },
  { min: 2200, max: 2499, correction: 0.9 },
  { min: 2500, max: 2799, correction: 1.2 },
  { min: 2800, max: 2999, correction: 1.6 },
  { min: 3000, max: 3299, correction: 2.0 },
  { min: 3300, max: 3499, correction: 2.4 },
  { min: 3500, max: 3799, correction: 2.9 },
  { min: 3800, max: 3999, correction: 3.5 },
  { min: 4000, max: 4299, correction: 4.1 },
  { min: 4300, max: 4499, correction: 4.8 },
  { min: 4500, max: 4799, correction: 5.5 },
  { min: 4800, max: 4999, correction: 6.3 },
  { min: 5000, max: 9999, correction: 7.2 }
];

// --- FUNCIONES DE CÁLCULO CLÍNICO ---

/**
 * Calcula la edad en años y meses a partir de la fecha de nacimiento.
 */
function calculateAge(birthdateStr) {
  const birthdate = new Date(birthdateStr);
  const today = new Date();
  
  let years = today.getFullYear() - birthdate.getFullYear();
  let months = today.getMonth() - birthdate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthdate.getDate())) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birthdate.getDate()) {
    months--;
    if (months < 0) {
      months += 12;
      years--;
    }
  }

  const totalMonths = (years * 12) + months;
  return { years, months, totalMonths };
}

/**
 * Calcula el Índice de Masa Corporal (IMC).
 * peso en kg, talla en cm.
 */
function calculateBMI(weight, heightCm) {
  if (!weight || !heightCm) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(2));
}

/**
 * Obtiene el descuento de hemoglobina basado en la altitud en m.s.n.m.
 */
function getHemoglobinCorrection(altitude) {
  if (isNaN(altitude) || altitude < 0) return 0;
  const match = ALTITUDE_CORRECTIONS.find(item => altitude >= item.min && altitude <= item.max);
  return match ? match.correction : 0;
}

/**
 * Clasifica la anemia de acuerdo a la hemoglobina ajustada, edad, sexo y estado de gestación.
 * Basado en las normas del MINSA.
 */
function classifyAnemia(ageMonths, sex, isPregnant, hbAdjusted) {
  if (hbAdjusted === null || hbAdjusted === undefined || isNaN(hbAdjusted) || hbAdjusted <= 0) {
    return { class: 'No Registrado', severity: 'none', isAnemic: false };
  }

  // 1. Gestante (cualquier edad)
  if (isPregnant) {
    if (hbAdjusted >= 11.0) return { class: 'Sin Anemia', severity: 'normal', isAnemic: false };
    if (hbAdjusted >= 10.0) return { class: 'Anemia Leve', severity: 'leve', isAnemic: true };
    if (hbAdjusted >= 7.0) return { class: 'Anemia Moderada', severity: 'moderada', isAnemic: true };
    return { class: 'Anemia Severa', severity: 'severa', isAnemic: true };
  }

  // 2. Niños de 6 a 59 meses (0.5 a <5 años)
  if (ageMonths >= 6 && ageMonths < 60) {
    if (hbAdjusted >= 11.0) return { class: 'Sin Anemia', severity: 'normal', isAnemic: false };
    if (hbAdjusted >= 10.0) return { class: 'Anemia Leve', severity: 'leve', isAnemic: true };
    if (hbAdjusted >= 7.0) return { class: 'Anemia Moderada', severity: 'moderada', isAnemic: true };
    return { class: 'Anemia Severa', severity: 'severa', isAnemic: true };
  }

  // 3. Niños de 5 a 11 años (60 a <144 meses)
  if (ageMonths >= 60 && ageMonths < 144) {
    if (hbAdjusted >= 11.5) return { class: 'Sin Anemia', severity: 'normal', isAnemic: false };
    if (hbAdjusted >= 11.0) return { class: 'Anemia Leve', severity: 'leve', isAnemic: true };
    if (hbAdjusted >= 8.0) return { class: 'Anemia Moderada', severity: 'moderada', isAnemic: true };
    return { class: 'Anemia Severa', severity: 'severa', isAnemic: true };
  }

  // 4. Adolescentes de 12 a 14 años (144 a <180 meses)
  if (ageMonths >= 144 && ageMonths < 180) {
    if (hbAdjusted >= 12.0) return { class: 'Sin Anemia', severity: 'normal', isAnemic: false };
    if (hbAdjusted >= 11.0) return { class: 'Anemia Leve', severity: 'leve', isAnemic: true };
    if (hbAdjusted >= 8.0) return { class: 'Anemia Moderada', severity: 'moderada', isAnemic: true };
    return { class: 'Anemia Severa', severity: 'severa', isAnemic: true };
  }

  // 5. Adultos (Mujeres de 15 años a más no gestantes)
  if (sex === 'female' && ageMonths >= 180) {
    if (hbAdjusted >= 12.0) return { class: 'Sin Anemia', severity: 'normal', isAnemic: false };
    if (hbAdjusted >= 11.0) return { class: 'Anemia Leve', severity: 'leve', isAnemic: true };
    if (hbAdjusted >= 8.0) return { class: 'Anemia Moderada', severity: 'moderada', isAnemic: true };
    return { class: 'Anemia Severa', severity: 'severa', isAnemic: true };
  }

  // 6. Adultos (Varones de 15 años a más)
  if (sex === 'male' && ageMonths >= 180) {
    if (hbAdjusted >= 13.0) return { class: 'Sin Anemia', severity: 'normal', isAnemic: false };
    if (hbAdjusted >= 11.0) return { class: 'Anemia Leve', severity: 'leve', isAnemic: true };
    if (hbAdjusted >= 8.0) return { class: 'Anemia Moderada', severity: 'moderada', isAnemic: true };
    return { class: 'Anemia Severa', severity: 'severa', isAnemic: true };
  }

  // Niños menores de 6 meses (se evalúa de manera individualizada en CRED, se considera normal >= 10.5 o 11)
  return { class: 'Sin Anemia (Ref. Lactante)', severity: 'normal', isAnemic: false };
}

/**
 * Función auxiliar de interpolación lineal para curvas OMS
 */
function interpolateOMSValue(ageMonths, curve) {
  if (ageMonths <= curve[0].age) return { median: curve[0].median, sd: curve[0].sd };
  if (ageMonths >= curve[curve.length - 1].age) return { median: curve[curve.length - 1].median, sd: curve[curve.length - 1].sd };

  for (let i = 0; i < curve.length - 1; i++) {
    const p1 = curve[i];
    const p2 = curve[i + 1];
    if (ageMonths >= p1.age && ageMonths <= p2.age) {
      const ratio = (ageMonths - p1.age) / (p2.age - p1.age);
      const median = p1.median + ratio * (p2.median - p1.median);
      const sd = p1.sd + ratio * (p2.sd - p1.sd);
      return { median, sd };
    }
  }
  return { median: 0, sd: 1 };
}

/**
 * Clasifica el estado nutricional e identifica talla baja.
 */
function classifyNutritionalStatus(ageMonths, sex, bmi, heightCm) {
  // Adultos >= 18 años (216 meses)
  if (ageMonths >= 216) {
    let nutritionClass = 'Normal';
    let nutritionSeverity = 'normal';

    if (bmi < 16.0) {
      nutritionClass = 'Delgadez Severa (Grado III)';
      nutritionSeverity = 'delgadez-severa';
    } else if (bmi >= 16.0 && bmi < 17.0) {
      nutritionClass = 'Delgadez Moderada (Grado II)';
      nutritionSeverity = 'delgadez';
    } else if (bmi >= 17.0 && bmi < 18.5) {
      nutritionClass = 'Delgadez Leve (Grado I)';
      nutritionSeverity = 'delgadez';
    } else if (bmi >= 18.5 && bmi < 25.0) {
      nutritionClass = 'Normal';
      nutritionSeverity = 'normal';
    } else if (bmi >= 25.0 && bmi < 30.0) {
      nutritionClass = 'Sobrepeso';
      nutritionSeverity = 'sobrepeso';
    } else if (bmi >= 30.0 && bmi < 35.0) {
      nutritionClass = 'Obesidad Grado I';
      nutritionSeverity = 'obesidad';
    } else if (bmi >= 35.0 && bmi < 40.0) {
      nutritionClass = 'Obesidad Grado II';
      nutritionSeverity = 'obesidad-severa';
    } else {
      nutritionClass = 'Obesidad Grado III (Mórbida)';
      nutritionSeverity = 'obesidad-severa';
    }

    return {
      nutritionClass,
      nutritionSeverity,
      heightClass: 'No Aplica (Adulto)',
      heightSeverity: 'normal',
      isShortStature: false
    };
  }

  // Menores de 18 años: Usamos curvas de la OMS e interpolación
  const sexKey = sex === 'female' ? 'female' : 'male';
  const heightRef = interpolateOMSValue(ageMonths, HEIGHT_CURVES[sexKey]);
  const bmiRef = interpolateOMSValue(ageMonths, BMI_CURVES[sexKey]);

  // Cálculo de Desviaciones Estándar (Z-Scores)
  const zHeight = (heightCm - heightRef.median) / heightRef.sd;
  const zBmi = (bmi - bmiRef.median) / bmiRef.sd;

  // Clasificación de Crecimiento (Talla para la Edad)
  let heightClass = 'Talla Normal';
  let heightSeverity = 'normal';
  let isShortStature = false;

  if (zHeight < -3) {
    heightClass = 'Talla Baja Severa';
    heightSeverity = 'talla-baja-severa';
    isShortStature = true;
  } else if (zHeight < -2) {
    heightClass = 'Talla Baja';
    heightSeverity = 'talla-baja';
    isShortStature = true;
  } else if (zHeight < -1) {
    heightClass = 'Riesgo de Talla Baja';
    heightSeverity = 'riesgo-talla-baja';
  } else if (zHeight > 2) {
    heightClass = 'Talla Alta';
    heightSeverity = 'normal';
  }

  // Clasificación Nutricional (IMC para la Edad)
  let nutritionClass = 'Normal';
  let nutritionSeverity = 'normal';

  if (zBmi < -3) {
    nutritionClass = 'Delgadez Severa';
    nutritionSeverity = 'delgadez-severa';
  } else if (zBmi < -2) {
    nutritionClass = 'Delgadez';
    nutritionSeverity = 'delgadez';
  } else if (zBmi > 2) {
    nutritionClass = 'Obesidad';
    nutritionSeverity = 'obesidad-severa';
  } else if (zBmi > 1) {
    nutritionClass = 'Sobrepeso';
    nutritionSeverity = 'sobrepeso';
  }

  return {
    nutritionClass,
    nutritionSeverity,
    heightClass,
    heightSeverity,
    isShortStature
  };
}

// --- GESTIÓN DE PACIENTES (LOCALSTORAGE) ---

// Pacientes Semilla (Datos realistas)
const SEED_PATIENTS = [
  // C.S. San Vicente (id: 1)
  {
    id: '10000001',
    dni: '73024859',
    names: 'Liam Mateo Quispe Rojas',
    birthdate: '2023-08-15', // ~2 años y 10 meses
    sex: 'male',
    sectorId: 1,
    isPregnant: false,
    weight: 12.8,
    height: 90.5,
    abdominalPerimeter: null,
    hemoglobin: 11.2,
    altitude: 40,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-05-12'
  },
  {
    id: '10000002',
    dni: '61984257',
    names: 'Valentina Sofia Diaz Huamán',
    birthdate: '2021-04-10', // ~5 años
    sex: 'female',
    sectorId: 1,
    isPregnant: false,
    weight: 22.5,
    height: 108.0,
    abdominalPerimeter: null,
    hemoglobin: 9.8, // Anemia moderada
    altitude: 40,
    credComplete: true,
    supplementReceived: false,
    counselingReceived: true,
    dateRegistered: '2026-06-01'
  },
  {
    id: '10000003',
    dni: '45871236',
    names: 'Maria Esperanza Luján Reyes',
    birthdate: '1998-11-22', // 27 años
    sex: 'female',
    sectorId: 1,
    isPregnant: true, // Gestante
    weight: 68.2,
    height: 156.0,
    abdominalPerimeter: 88,
    hemoglobin: 10.4, // Anemia leve
    altitude: 40,
    credComplete: false,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-18'
  },
  {
    id: '10000004',
    dni: '78451296',
    names: 'Carlos Alberto Sanchez Ruiz',
    birthdate: '1989-05-14', // Adulto
    sex: 'male',
    sectorId: 1,
    isPregnant: false,
    weight: 92.5,
    height: 172.0,
    abdominalPerimeter: 104, // Obesidad abdominal
    hemoglobin: 14.5,
    altitude: 40,
    credComplete: false,
    supplementReceived: false,
    counselingReceived: false,
    dateRegistered: '2026-04-20'
  },

  // C.S. San Luis (id: 2)
  {
    id: '10000005',
    dni: '71258963',
    names: 'Thiago Alessandro Flores Perez',
    birthdate: '2024-11-05', // ~1.5 años
    sex: 'male',
    sectorId: 2,
    isPregnant: false,
    weight: 9.1,
    height: 77.0, // Talla baja
    abdominalPerimeter: null,
    hemoglobin: 10.1, // Anemia leve
    altitude: 30,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-02'
  },
  {
    id: '10000006',
    dni: '72365948',
    names: 'Mia Camilia Guerrero Torres',
    birthdate: '2022-01-30', // ~4 años
    sex: 'female',
    sectorId: 2,
    isPregnant: false,
    weight: 16.2,
    height: 103.5,
    abdominalPerimeter: null,
    hemoglobin: 12.1,
    altitude: 30,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-05-25'
  },

  // C.S. Cerro Azul (id: 3)
  {
    id: '10000007',
    dni: '70258169',
    names: 'Daniela Fernanda Castro Soto',
    birthdate: '2019-07-12', // ~7 años
    sex: 'female',
    sectorId: 3,
    isPregnant: false,
    weight: 31.0, // Sobrepeso
    height: 119.5,
    abdominalPerimeter: null,
    hemoglobin: 11.8,
    altitude: 8,
    credComplete: true,
    supplementReceived: false,
    counselingReceived: true,
    dateRegistered: '2026-06-11'
  },
  {
    id: '10000008',
    dni: '60147852',
    names: 'Lucas Benjamin Medina Lopez',
    birthdate: '2025-06-01', // ~1 año
    sex: 'male',
    sectorId: 3,
    isPregnant: false,
    weight: 7.2, // Delgadez
    height: 71.0,
    abdominalPerimeter: null,
    hemoglobin: 8.5, // Anemia moderada
    altitude: 8,
    credComplete: false,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-15'
  },

  // P.S. Santa Bárbara (id: 4) - Cumplimiento bajo
  {
    id: '10000009',
    dni: '80259631',
    names: 'Angel Sebastian Ramos Choque',
    birthdate: '2023-02-18', // ~3 años
    sex: 'male',
    sectorId: 4,
    isPregnant: false,
    weight: 11.5, // Delgadez/Talla Baja
    height: 89.0, // Talla baja
    abdominalPerimeter: null,
    hemoglobin: 7.8, // Anemia moderada
    altitude: 20,
    credComplete: false,
    supplementReceived: false,
    counselingReceived: false,
    dateRegistered: '2026-06-03'
  },
  {
    id: '10000010',
    dni: '79251483',
    names: 'Briana Luana Ortiz Mendoza',
    birthdate: '2024-03-24', // ~2 años
    sex: 'female',
    sectorId: 4,
    isPregnant: false,
    weight: 12.0,
    height: 85.0,
    abdominalPerimeter: null,
    hemoglobin: 9.2, // Anemia moderada
    altitude: 20,
    credComplete: false,
    supplementReceived: false,
    counselingReceived: true,
    dateRegistered: '2026-06-08'
  },

  // P.S. Santa Cruz (id: 5)
  {
    id: '10000011',
    dni: '74125896',
    names: 'Emma Victoria Salazar Gomez',
    birthdate: '2025-02-14', // ~1.3 años
    sex: 'female',
    sectorId: 5,
    isPregnant: false,
    weight: 10.5,
    height: 79.5,
    abdominalPerimeter: null,
    hemoglobin: 11.5,
    altitude: 35,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-10'
  },

  // P.S. Herbay Bajo (id: 6)
  {
    id: '10000012',
    dni: '75214896',
    names: 'Aarón David Cárdenas Candela',
    birthdate: '2020-09-08', // ~5.7 años
    sex: 'male',
    sectorId: 6,
    isPregnant: false,
    weight: 24.5, // Sobrepeso
    height: 112.5,
    abdominalPerimeter: null,
    hemoglobin: 11.6,
    altitude: 15,
    credComplete: true,
    supplementReceived: false,
    counselingReceived: true,
    dateRegistered: '2026-05-18'
  },
  {
    id: '10000013',
    dni: '70214859',
    names: 'Zoey Abigail Mendoza Pachas',
    birthdate: '2024-05-12', // ~2 años
    sex: 'female',
    sectorId: 6,
    isPregnant: false,
    weight: 9.8, // Talla baja/Delgadez
    height: 80.0, // Talla baja
    abdominalPerimeter: null,
    hemoglobin: 10.3, // Anemia leve
    altitude: 15,
    credComplete: false,
    supplementReceived: true,
    counselingReceived: false,
    dateRegistered: '2026-06-12'
  },

  // P.S. Herbay Alto (id: 7) - Cumplimiento bajo
  {
    id: '10000014',
    dni: '70147258',
    names: 'Gael Josué Yactayo Campos',
    birthdate: '2023-11-20', // ~2.5 años
    sex: 'male',
    sectorId: 7,
    isPregnant: false,
    weight: 10.8, // Delgadez
    height: 86.0, // Talla baja
    abdominalPerimeter: null,
    hemoglobin: 9.5, // Anemia moderada (ajustada por altitud será menor)
    altitude: 120, // Altitud 120m (Hb corregida = 9.5 - 0.0 = 9.5, altitud baja)
    credComplete: false,
    supplementReceived: false,
    counselingReceived: false,
    dateRegistered: '2026-06-04'
  },
  {
    id: '10000015',
    dni: '72583691',
    names: 'Luciana Valeria Navarro Rivas',
    birthdate: '2022-07-04', // ~4 años
    sex: 'female',
    sectorId: 7,
    isPregnant: false,
    weight: 13.5, // Talla baja
    height: 94.0, // Talla baja
    abdominalPerimeter: null,
    hemoglobin: 10.2, // Anemia leve
    altitude: 120,
    credComplete: false,
    supplementReceived: false,
    counselingReceived: true,
    dateRegistered: '2026-06-09'
  },

  // P.S. Arena Alta (id: 8)
  {
    id: '10000016',
    dni: '73695248',
    names: 'Iker Santiago Quispe Huamán',
    birthdate: '2025-01-05', // ~1.5 años
    sex: 'male',
    sectorId: 8,
    isPregnant: false,
    weight: 11.2,
    height: 82.0,
    abdominalPerimeter: null,
    hemoglobin: 11.4,
    altitude: 140,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-05-30'
  },

  // P.S. Cerro Alegre (id: 9)
  {
    id: '10000017',
    dni: '78541236',
    names: 'Camila Isabella Arias Vega',
    birthdate: '2020-03-12', // ~6 años
    sex: 'female',
    sectorId: 9,
    isPregnant: false,
    weight: 20.8,
    height: 114.5,
    abdominalPerimeter: null,
    hemoglobin: 12.0,
    altitude: 180,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-11'
  },

  // P.S. Clarita (id: 10)
  {
    id: '10000018',
    dni: '79658412',
    names: 'Dylan Gabriel Rojas Paredes',
    birthdate: '2024-08-20', // ~1.8 años
    sex: 'male',
    sectorId: 10,
    isPregnant: false,
    weight: 11.8,
    height: 84.5,
    abdominalPerimeter: null,
    hemoglobin: 12.2,
    altitude: 90,
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-14'
  },

  // Pacientes adicionales de prueba para robustez de métricas y altitud alta
  {
    id: '10000019',
    dni: '48956321',
    names: 'Sofia Inés Chumpitaz Yactayo',
    birthdate: '2001-02-15',
    sex: 'female',
    sectorId: 1,
    isPregnant: false,
    weight: 54.0,
    height: 158.0,
    abdominalPerimeter: 74,
    hemoglobin: 12.5,
    altitude: 40,
    credComplete: false,
    supplementReceived: false,
    counselingReceived: true,
    dateRegistered: '2026-06-19'
  },
  {
    id: '10000020',
    dni: '47589632',
    names: 'Juan Carlos Espinoza Ramos',
    birthdate: '1992-09-09',
    sex: 'male',
    sectorId: 8,
    isPregnant: false,
    weight: 78.5,
    height: 168.0,
    abdominalPerimeter: 96, // Sobrepeso
    hemoglobin: 13.8,
    altitude: 3200, // PRUEBA ALTITUD ALTA (3200m)
    // Hb corregida = 13.8 - 2.0 = 11.8. Para varón >= 15 es anemia leve (límite es 13).
    credComplete: false,
    supplementReceived: false,
    counselingReceived: false,
    dateRegistered: '2026-06-20'
  },
  {
    id: '10000021',
    dni: '70258963',
    names: 'Liam Gael Condori Machaca',
    birthdate: '2025-09-10', // ~9 meses
    sex: 'male',
    sectorId: 9,
    isPregnant: false,
    weight: 8.8,
    height: 72.0,
    abdominalPerimeter: null,
    hemoglobin: 10.8, // Sin anemia a nivel del mar, pero a 3800m...
    altitude: 3800, // PRUEBA ALTITUD EXTREMA
    // Hb corregida = 10.8 - 3.5 = 7.3. Anemia moderada.
    credComplete: true,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-19'
  },
  {
    id: '10000022',
    dni: '75489632',
    names: 'Alessandra Jimena Torres Paz',
    birthdate: '2005-12-10', // 20 años
    sex: 'female',
    sectorId: 3,
    isPregnant: true, // Gestante a gran altitud
    weight: 64.0,
    height: 154.0,
    abdominalPerimeter: 86,
    hemoglobin: 12.8,
    altitude: 2500, // Altitud 2500m
    // Hb corregida = 12.8 - 1.2 = 11.6. Gestante sin anemia (límite 11).
    credComplete: false,
    supplementReceived: true,
    counselingReceived: true,
    dateRegistered: '2026-06-20'
  }
];

/**
 * Inicializa y procesa los datos clínicos agregando clasificaciones al vuelo.
 */
function processPatientData(patient) {
  const ageInfo = calculateAge(patient.birthdate);
  const imc = calculateBMI(patient.weight, patient.height);
  const hbCorrection = getHemoglobinCorrection(patient.altitude);
  const hbAdjusted = parseFloat((patient.hemoglobin - hbCorrection).toFixed(2));
  
  const anemiaInfo = classifyAnemia(ageInfo.totalMonths, patient.sex, patient.isPregnant, hbAdjusted);
  const nutritionalInfo = classifyNutritionalStatus(ageInfo.totalMonths, patient.sex, imc, patient.height);

  // Un paciente es considerado "cumplidor" de sus metas individuales si:
  // - Si es niño < 5 años: CRED completo, suplementación recibida (si la requiere/tiene anemia o preventivo), y tamizaje hecho.
  // - Si es gestante: Suplementación y consejería recibida.
  // - En general: si recibe tamizaje (Hb no nula) y consejería.
  let isCompliant = false;
  if (ageInfo.totalMonths < 60) { // Niño < 5 años
    isCompliant = patient.credComplete && patient.supplementReceived && (patient.hemoglobin > 0);
  } else if (patient.isPregnant) {
    isCompliant = patient.supplementReceived && patient.counselingReceived;
  } else {
    isCompliant = patient.counselingReceived || (patient.hemoglobin > 0);
  }

  return {
    ...patient,
    ageYears: ageInfo.years,
    ageMonths: ageInfo.months,
    ageTotalMonths: ageInfo.totalMonths,
    imc,
    hbCorrection,
    hbAdjusted,
    anemiaClass: anemiaInfo.class,
    anemiaSeverity: anemiaInfo.severity,
    isAnemic: anemiaInfo.isAnemic,
    nutritionClass: nutritionalInfo.nutritionClass,
    nutritionSeverity: nutritionalInfo.nutritionSeverity,
    heightClass: nutritionalInfo.heightClass,
    heightSeverity: nutritionalInfo.heightSeverity,
    isShortStature: nutritionalInfo.isShortStature,
    isCompliant
  };
}

/**
 * Inicializa el localStorage si está vacío.
 */
function initializeDatabase() {
  if (!localStorage.getItem('sistema_nutricional_pacientes')) {
    localStorage.setItem('sistema_nutricional_pacientes', JSON.stringify(SEED_PATIENTS));
  }
}

/**
 * Obtiene la lista completa de pacientes procesados.
 */
function getPatients() {
  initializeDatabase();
  const raw = JSON.parse(localStorage.getItem('sistema_nutricional_pacientes')) || [];
  return raw.map(processPatientData);
}

/**
 * Guarda o actualiza un paciente.
 */
function savePatient(patientData) {
  const patients = JSON.parse(localStorage.getItem('sistema_nutricional_pacientes')) || [];
  const index = patients.findIndex(p => p.dni === patientData.dni || p.id === patientData.id);
  
  if (index >= 0) {
    patients[index] = { ...patients[index], ...patientData };
  } else {
    patientData.id = patientData.id || String(Date.now());
    patientData.dateRegistered = patientData.dateRegistered || new Date().toISOString().split('T')[0];
    patients.push(patientData);
  }
  
  localStorage.setItem('sistema_nutricional_pacientes', JSON.stringify(patients));
  return patientData;
}

/**
 * Elimina un paciente por ID.
 */
function deletePatient(id) {
  let patients = JSON.parse(localStorage.getItem('sistema_nutricional_pacientes')) || [];
  patients = patients.filter(p => p.id !== id && p.dni !== id);
  localStorage.setItem('sistema_nutricional_pacientes', JSON.stringify(patients));
}

/**
 * Obtiene los sectores con sus tasas de cumplimiento calculadas dinámicamente.
 * Esto asegura que el mapa se actualice automáticamente cuando se agregan pacientes!
 */
function getSectors() {
  const patients = getPatients();
  
  return SECTORS_CONFIG.map(sector => {
    const sectorPatients = patients.filter(p => p.sectorId === sector.id);
    
    // Cálculo dinámico de cumplimiento
    let complianceRate = 0;
    if (sectorPatients.length > 0) {
      const compliantCount = sectorPatients.filter(p => p.isCompliant).length;
      // Fórmula de cumplimiento: porcentaje de pacientes que cumplen metas + ponderación por cobertura
      const patientCoverage = Math.min((sectorPatients.length / (sector.target * 0.1)) * 100, 100); // Meta de cobertura: registrar al menos 10% del grupo meta
      const clinicalCompliance = (compliantCount / sectorPatients.length) * 100;
      
      complianceRate = Math.round((clinicalCompliance * 0.7) + (patientCoverage * 0.3));
    } else {
      // Si no hay pacientes registrados en el sistema, usamos un valor semilla por defecto
      const seedCompliances = {
        1: 85, 2: 72, 3: 64, 4: 45, 5: 88, 6: 53, 7: 40, 8: 79, 9: 82, 10: 91
      };
      complianceRate = seedCompliances[sector.id] || 50;
    }

    // Clasificación de color
    let statusColor = 'red'; // Bajo < 50
    if (complianceRate >= 80) {
      statusColor = 'green'; // Alto >= 80
    } else if (complianceRate >= 50) {
      statusColor = 'yellow'; // Medio 50-79
    }

    return {
      ...sector,
      patientsCount: sectorPatients.length,
      compliance: complianceRate,
      statusColor
    };
  });
}
