/**
 * js/charts.js
 * Configuración y actualización de los gráficos interactivos de Chart.js.
 */

// Instancias globales de gráficos
let nutritionChartInstance = null;
let anemiaChartInstance = null;
let trendChartInstance = null;

// Colores de los gráficos
const CHART_COLORS = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  pink: '#ec4899',
  normalGlow: 'rgba(16, 185, 129, 0.7)',
  anemiaGlow: 'rgba(239, 68, 68, 0.75)'
};

/**
 * Obtiene la configuración de estilos de texto y cuadrículas según el tema activo.
 */
function getChartThemeOptions() {
  const isLight = document.body.classList.contains('light-theme');
  const textColor = isLight ? '#475569' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';
  const fontName = 'Outfit';

  return { textColor, gridColor, fontName };
}

/**
 * Agrupa y cuenta a los pacientes por su estado nutricional.
 */
function getNutritionStats(patients) {
  const stats = { normal: 0, sobrepeso: 0, obesidad: 0, delgadez: 0 };
  
  patients.forEach(p => {
    const sev = p.nutritionSeverity;
    if (sev === 'normal') stats.normal++;
    else if (sev === 'sobrepeso') stats.sobrepeso++;
    else if (sev === 'obesidad' || sev === 'obesidad-severa') stats.obesidad++;
    else if (sev === 'delgadez' || sev === 'delgadez-severa') stats.delgadez++;
  });
  
  return [stats.normal, stats.sobrepeso, stats.obesidad, stats.delgadez];
}

/**
 * Agrupa y cuenta la anemia por grupos de edad.
 */
function getAnemiaStatsByAge(patients) {
  // Categorías: Lactantes (6-11m), Niños CRED (1-4a), Niños Escuela (5-11a), Adolescentes (12-17a), Gestantes, Adultos
  const groups = [
    { name: 'Lactantes (6-11m)', filter: p => p.ageTotalMonths >= 6 && p.ageTotalMonths < 12 && !p.isPregnant, normal: 0, anemia: 0 },
    { name: 'Niños CRED (1-4a)', filter: p => p.ageTotalMonths >= 12 && p.ageTotalMonths < 60 && !p.isPregnant, normal: 0, anemia: 0 },
    { name: 'Niños Escuela (5-11a)', filter: p => p.ageTotalMonths >= 60 && p.ageTotalMonths < 144 && !p.isPregnant, normal: 0, anemia: 0 },
    { name: 'Adolescentes (12-17a)', filter: p => p.ageTotalMonths >= 144 && p.ageTotalMonths < 216 && !p.isPregnant, normal: 0, anemia: 0 },
    { name: 'Gestantes (Cualquier edad)', filter: p => p.isPregnant, normal: 0, anemia: 0 },
    { name: 'Adultos (18a+ No Gestantes)', filter: p => p.ageTotalMonths >= 216 && !p.isPregnant, normal: 0, anemia: 0 }
  ];

  groups.forEach(group => {
    const groupPatients = patients.filter(group.filter);
    groupPatients.forEach(p => {
      if (p.isAnemic) group.anemia++;
      else group.normal++;
    });
  });

  return {
    labels: groups.map(g => g.name),
    normalData: groups.map(g => g.normal),
    anemiaData: groups.map(g => g.anemia)
  };
}

/**
 * Genera una tendencia histórica realista basada en el sector seleccionado.
 */
function getComplianceTrend(sectorId) {
  // Valores base para simular la evolución mensual (Ene - Jun 2026)
  const baseTrends = {
    all: [68, 70, 71, 74, 75, 78],
    1: [78, 80, 81, 83, 85, 86],   // CS San Vicente
    2: [65, 68, 70, 71, 72, 74],   // CS San Luis
    3: [55, 58, 60, 62, 64, 65],   // CS Cerro Azul
    4: [40, 42, 42, 45, 46, 45],   // PS Santa Barbara
    5: [80, 82, 85, 86, 88, 89],   // PS Santa Cruz
    6: [48, 50, 52, 53, 53, 55],   // PS Herbay Bajo
    7: [35, 38, 38, 40, 40, 42],   // PS Herbay Alto
    8: [70, 72, 75, 76, 79, 80],   // PS Arena Alta
    9: [74, 76, 78, 80, 82, 83],   // PS Cerro Alegre
    10: [85, 87, 88, 90, 91, 93]   // PS Clarita
  };

  return baseTrends[sectorId || 'all'] || baseTrends['all'];
}

/**
 * Inicializa todos los gráficos.
 */
function initCharts(patients, sectorId = null) {
  const { textColor, gridColor, fontName } = getChartThemeOptions();
  
  // Destruir gráficos previos si existen
  if (nutritionChartInstance) nutritionChartInstance.destroy();
  if (anemiaChartInstance) anemiaChartInstance.destroy();
  if (trendChartInstance) trendChartInstance.destroy();

  const filteredPatients = sectorId ? patients.filter(p => p.sectorId === sectorId) : patients;

  // 1. GRÁFICO NUTRICIONAL (DONA)
  const nutritionCtx = document.getElementById('nutritionChart').getContext('2d');
  const nutritionData = getNutritionStats(filteredPatients);
  
  nutritionChartInstance = new Chart(nutritionCtx, {
    type: 'doughnut',
    data: {
      labels: ['Normal', 'Sobrepeso', 'Obesidad', 'Delgadez'],
      datasets: [{
        data: nutritionData,
        backgroundColor: [CHART_COLORS.green, CHART_COLORS.yellow, CHART_COLORS.red, CHART_COLORS.blue],
        borderColor: 'transparent',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { family: fontName, size: 12, weight: '500' }
          }
        },
        tooltip: {
          titleFont: { family: fontName },
          bodyFont: { family: fontName }
        }
      },
      cutout: '65%'
    }
  });

  // 2. GRÁFICO DE ANEMIA POR EDAD (BARRAS HORIZONTALES)
  const anemiaCtx = document.getElementById('anemiaChart').getContext('2d');
  const anemiaStats = getAnemiaStatsByAge(filteredPatients);
  
  anemiaChartInstance = new Chart(anemiaCtx, {
    type: 'bar',
    data: {
      labels: anemiaStats.labels,
      datasets: [
        {
          label: 'Sin Anemia',
          data: anemiaStats.normalData,
          backgroundColor: CHART_COLORS.normalGlow,
          borderColor: CHART_COLORS.green,
          borderWidth: 1
        },
        {
          label: 'Con Anemia',
          data: anemiaStats.anemiaData,
          backgroundColor: CHART_COLORS.anemiaGlow,
          borderColor: CHART_COLORS.red,
          borderWidth: 1
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            font: { family: fontName, size: 11 }
          }
        },
        tooltip: {
          titleFont: { family: fontName },
          bodyFont: { family: fontName }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: fontName } }
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { color: textColor, font: { family: fontName } }
        }
      }
    }
  });

  // 3. GRÁFICO DE TENDENCIA DE CUMPLIMIENTO (LÍNEA CON GRADIENTE)
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  const trendData = getComplianceTrend(sectorId);
  
  // Crear gradiente de área
  const gradient = trendCtx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  trendChartInstance = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Meta de Cumplimiento (%)',
        data: trendData,
        fill: true,
        backgroundColor: gradient,
        borderColor: CHART_COLORS.indigo,
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.indigo,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: fontName },
          bodyFont: { family: fontName }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: fontName } }
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: fontName },
            callback: value => value + '%'
          }
        }
      }
    }
  });
}

/**
 * Actualiza los datos de los gráficos de acuerdo al sector seleccionado.
 */
function updateChartsData(patients, sectorId = null) {
  if (!nutritionChartInstance || !anemiaChartInstance || !trendChartInstance) return;

  const filteredPatients = sectorId ? patients.filter(p => p.sectorId === sectorId) : patients;

  // Actualizar Nutricional
  const nutritionData = getNutritionStats(filteredPatients);
  nutritionChartInstance.data.datasets[0].data = nutritionData;
  nutritionChartInstance.update();

  // Actualizar Anemia
  const anemiaStats = getAnemiaStatsByAge(filteredPatients);
  anemiaChartInstance.data.datasets[0].data = anemiaStats.normalData;
  anemiaChartInstance.data.datasets[1].data = anemiaStats.anemiaData;
  anemiaChartInstance.update();

  // Actualizar Tendencia
  const trendData = getComplianceTrend(sectorId);
  trendChartInstance.data.datasets[0].data = trendData;
  trendChartInstance.update();
}

/**
 * Actualiza el tema visual de los gráficos sin recrearlos.
 */
function updateChartsTheme() {
  if (!nutritionChartInstance || !anemiaChartInstance || !trendChartInstance) return;
  
  const { textColor, gridColor } = getChartThemeOptions();

  // Actualizar tema nutricional
  nutritionChartInstance.options.plugins.legend.labels.color = textColor;
  nutritionChartInstance.update();

  // Actualizar tema anemia
  anemiaChartInstance.options.plugins.legend.labels.color = textColor;
  anemiaChartInstance.options.scales.x.grid.color = gridColor;
  anemiaChartInstance.options.scales.x.ticks.color = textColor;
  anemiaChartInstance.options.scales.y.ticks.color = textColor;
  anemiaChartInstance.update();

  // Actualizar tema tendencia
  trendChartInstance.options.scales.y.grid.color = gridColor;
  trendChartInstance.options.scales.y.ticks.color = textColor;
  trendChartInstance.options.scales.x.ticks.color = textColor;
  trendChartInstance.update();
}
