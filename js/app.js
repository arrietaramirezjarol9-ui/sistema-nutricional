/**
 * js/app.js
 * Controlador principal de la Single Page Application.
 */

// Estado de la aplicación
let currentSectorId = null;
let editingPatientId = null;

// Esperar a que el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar base de datos e interfaz
  initializeDatabase();
  initTheme();
  setupAuthentication();
  setupNavigation();
  setupMapInteractions();
  setupPatientForm();
  setupPatientsList();
});

// --- AUTENTICACIÓN Y SEGURIDAD (LOGIN SCREEN) ---
function setupAuthentication() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const errorMsg = document.getElementById('loginErrorMessage');
  const logoutBtn = document.getElementById('logoutBtn');

  // Verificar estado de sesión
  const checkAuth = () => {
    const isAuthenticated = sessionStorage.getItem('sistema_nutricional_auth') === 'true';
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('appContainer');

    if (isAuthenticated) {
      loginContainer.style.display = 'none';
      appContainer.style.display = 'flex';
      
      // Renderizar datos una vez autenticado para inicializar gráficos
      renderDashboard();
      renderPatientsTable();
    } else {
      loginContainer.style.display = 'flex';
      appContainer.style.display = 'none';
    }
  };

  // Evento submit de inicio de sesión
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      // Credenciales institucionales por defecto
      if (email === 'nutricionista@minsa.gob.pe' && password === 'minsa2026') {
        sessionStorage.setItem('sistema_nutricional_auth', 'true');
        errorMsg.style.display = 'none';
        checkAuth();
      } else {
        errorMsg.style.display = 'flex';
        // Reiniciar animación de shake
        errorMsg.style.animation = 'none';
        void errorMsg.offsetWidth; // Forzar reflow para reiniciar la animación CSS
        errorMsg.style.animation = 'shake 0.3s ease';
      }
    });
  }

  // Evento de cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Desea cerrar la sesión del sistema?')) {
        sessionStorage.removeItem('sistema_nutricional_auth');
        window.location.reload(); // Recargar limpia el estado de forma segura
      }
    });
  }

  // Ejecución inicial de verificación
  checkAuth();
}

// --- TEMA (CLARO / OSCURO) ---
function initTheme() {
  const savedTheme = localStorage.getItem('sistema_nutricional_theme');
  const themeToggle = document.getElementById('themeToggleBtn');
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.innerHTML = '<span class="material-symbols">dark_mode</span>';
  } else {
    document.body.classList.remove('light-theme');
    themeToggle.innerHTML = '<span class="material-symbols">light_mode</span>';
  }
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('sistema_nutricional_theme', isLight ? 'light' : 'dark');
    themeToggle.innerHTML = isLight 
      ? '<span class="material-symbols">dark_mode</span>' 
      : '<span class="material-symbols">light_mode</span>';
    
    // Actualizar colores de los gráficos
    if (typeof updateChartsTheme === 'function') {
      updateChartsTheme();
    }
  });
}

// --- NAVEGACIÓN DE PESTAÑAS (SPA ROUTING) ---
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      
      // Desactivar items previos
      navItems.forEach(nav => nav.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));
      
      // Activar actual
      item.classList.add('active');
      const targetContent = document.getElementById(`${tabId}-view`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // Si entra a Dashboard, actualizar gráficos
      if (tabId === 'dashboard') {
        renderDashboard();
      } else if (tabId === 'patients') {
        renderPatientsTable();
      } else if (tabId === 'register' && !editingPatientId) {
        resetPatientForm();
      }
    });
  });
}

// --- ANIMACIÓN DE CONTADORES (COUNT UP) ---
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  // Si no es un número (ej. tiene % o es un decimal flotante), manejamos el formato
  const hasPercent = String(end).includes('%');
  const hasFloat = String(end).includes('.') && !hasPercent;
  
  const endNum = parseFloat(String(end).replace('%', ''));
  const startNum = parseFloat(String(start).replace('%', ''));
  
  if (isNaN(endNum)) {
    obj.innerHTML = end;
    return;
  }

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = progress * (endNum - startNum) + startNum;
    
    if (hasPercent) {
      obj.innerHTML = Math.round(currentValue) + '%';
    } else if (hasFloat) {
      obj.innerHTML = currentValue.toFixed(1);
    } else {
      obj.innerHTML = Math.round(currentValue);
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}

// --- RENDERIZADO DEL DASHBOARD ---
function renderDashboard() {
  const patients = getPatients();
  const sectors = getSectors();
  
  // Filtrar pacientes si hay sector activo
  const filteredPatients = currentSectorId 
    ? patients.filter(p => p.sectorId === currentSectorId) 
    : patients;
  
  // 1. Mostrar/Ocultar Badge de Sector seleccionado
  const sectorBadge = document.getElementById('selectedSectorBadge');
  const sectorTitle = document.getElementById('selectedSectorTitleText');
  
  if (currentSectorId) {
    const activeSector = sectors.find(s => s.id === currentSectorId);
    sectorTitle.innerHTML = `<span class="material-symbols">location_on</span> Jurisdicción: ${activeSector.name} (${activeSector.category})`;
    sectorBadge.style.display = 'flex';
  } else {
    sectorBadge.style.display = 'none';
  }
  
  // 2. Calcular Métricas Clínicas
  const totalCount = filteredPatients.length;
  const anemiaPatients = filteredPatients.filter(p => p.isAnemic);
  const anemiaRate = totalCount > 0 ? parseFloat(((anemiaPatients.length / totalCount) * 100).toFixed(1)) : 0;
  
  const shortStaturePatients = filteredPatients.filter(p => p.isShortStature);
  const shortStatureRate = totalCount > 0 ? parseFloat(((shortStaturePatients.length / totalCount) * 100).toFixed(1)) : 0;
  
  // Tasa de cumplimiento general en base a los pacientes del sector o la media de los sectores
  let compliance = 0;
  if (currentSectorId) {
    const activeSector = sectors.find(s => s.id === currentSectorId);
    compliance = activeSector.compliance;
  } else {
    // Media general
    const sumCompliance = sectors.reduce((acc, curr) => acc + curr.compliance, 0);
    compliance = Math.round(sumCompliance / sectors.length);
  }

  // 3. Obtener valores previos para animar desde ellos (opcional, por simplicidad animamos desde 0)
  const prevMonitored = parseInt(document.getElementById('metricMonitored').innerHTML) || 0;
  const prevAnemia = parseFloat(document.getElementById('metricAnemia').innerHTML) || 0;
  const prevMalnutrition = parseFloat(document.getElementById('metricMalnutrition').innerHTML) || 0;
  const prevCompliance = parseInt(document.getElementById('metricCompliance').innerHTML) || 0;
  
  animateValue('metricMonitored', prevMonitored, totalCount, 600);
  animateValue('metricAnemia', prevAnemia, anemiaRate + '%', 600);
  animateValue('metricMalnutrition', prevMalnutrition, shortStatureRate + '%', 600);
  animateValue('metricCompliance', prevCompliance, compliance + '%', 600);

  // 4. Actualizar estado y colores del Mapa SVG
  updateMapPathsColors(sectors);
  
  // 5. Inicializar o Actualizar Gráficos de Chart.js
  if (!nutritionChartInstance) {
    initCharts(patients, currentSectorId);
  } else {
    updateChartsData(patients, currentSectorId);
  }
}

// --- INTERACCIONES DEL MAPA SVG ---
function setupMapInteractions() {
  const paths = document.querySelectorAll('.map-sector-path');
  const tooltip = document.getElementById('mapTooltip');
  const resetBtn = document.getElementById('resetSectorFilter');
  
  paths.forEach(path => {
    const sectorId = parseInt(path.getAttribute('data-sector-id'));
    
    // Hover
    path.addEventListener('mouseover', (e) => {
      const sectors = getSectors();
      const sector = sectors.find(s => s.id === sectorId);
      if (!sector) return;
      
      tooltip.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 2px;">${sector.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px;">Categoría: ${sector.category}</div>
        <div style="display: flex; justify-content: space-between; gap: 15px;">
          <span>Monitoreados:</span> <strong>${sector.patientsCount}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 15px;">
          <span>Cumplimiento:</span> <strong style="color: ${sector.statusColor === 'green' ? 'var(--color-green)' : sector.statusColor === 'yellow' ? 'var(--color-yellow)' : 'var(--color-red)'}">${sector.compliance}%</strong>
        </div>
      `;
      tooltip.classList.add('visible');
    });

    path.addEventListener('mousemove', (e) => {
      // Posición del tooltip al lado del cursor
      tooltip.style.left = (e.pageX + 15) + 'px';
      tooltip.style.top = (e.pageY + 10) + 'px';
    });

    path.addEventListener('mouseout', () => {
      tooltip.classList.remove('visible');
    });

    // Clic en Sector
    path.addEventListener('click', () => {
      paths.forEach(p => p.classList.remove('active'));
      path.classList.add('active');
      currentSectorId = sectorId;
      renderDashboard();
    });
  });

  // Quitar filtro del sector
  resetBtn.addEventListener('click', () => {
    paths.forEach(p => p.classList.remove('active'));
    currentSectorId = null;
    renderDashboard();
  });
}

/**
 * Pinta los sectores del mapa con sus colores dinámicos
 */
function updateMapPathsColors(sectors) {
  sectors.forEach(sector => {
    const path = document.querySelector(`.map-sector-path[data-sector-id="${sector.id}"]`);
    if (path) {
      path.classList.remove('green', 'yellow', 'red');
      path.classList.add(sector.statusColor);
      
      // Ajustar clases activas
      if (currentSectorId === sector.id) {
        path.classList.add('active');
      } else {
        path.classList.remove('active');
      }
    }
  });
}

// --- MÓDULO DE REGISTRO: FORMULARIO REACTIVO ---
function setupPatientForm() {
  const form = document.getElementById('patientRegisterForm');
  const birthdateInput = document.getElementById('pBirthdate');
  const sexInput = document.getElementById('pSex');
  const weightInput = document.getElementById('pWeight');
  const heightInput = document.getElementById('pHeight');
  const perimeterInput = document.getElementById('pAbdominal');
  const hbInput = document.getElementById('pHemoglobin');
  const altitudeInput = document.getElementById('pAltitude');
  const sectorSelect = document.getElementById('pSector');
  
  const pregnantRow = document.getElementById('pregnantFormRow');
  const perimeterRow = document.getElementById('perimeterFormRow');
  const pregnantCheck = document.getElementById('pPregnant');
  
  // Reactividad al cambiar edad o sexo
  const handleDemographicChange = () => {
    const birthdate = birthdateInput.value;
    const sex = sexInput.value;
    
    if (!birthdate) return;
    
    const ageInfo = calculateAge(birthdate);
    
    // 1. Mostrar gestación solo si es mujer en edad fértil (>= 12 años)
    if (sex === 'female' && ageInfo.years >= 12) {
      pregnantRow.style.display = 'flex';
    } else {
      pregnantRow.style.display = 'none';
      pregnantCheck.checked = false;
    }

    // 2. Mostrar perímetro abdominal solo para adultos (>= 18 años)
    if (ageInfo.years >= 18) {
      perimeterRow.style.display = 'flex';
    } else {
      perimeterRow.style.display = 'none';
      perimeterInput.value = '';
    }

    // Cambiar la altitud sugerida por defecto al cambiar de sector
    updateSuggestedAltitude();
    // Ejecutar cálculos en tiempo real
    runLiveCalculations();
  };

  birthdateInput.addEventListener('change', handleDemographicChange);
  sexInput.addEventListener('change', handleDemographicChange);
  sectorSelect.addEventListener('change', updateSuggestedAltitude);

  // Escuchar entradas antropométricas
  [weightInput, heightInput, perimeterInput, hbInput, altitudeInput, pregnantCheck].forEach(el => {
    el.addEventListener('input', runLiveCalculations);
  });

  // Envío del Formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dni = document.getElementById('pDni').value.trim();
    const names = document.getElementById('pNames').value.trim();
    const birthdate = birthdateInput.value;
    const sex = sexInput.value;
    const sectorId = parseInt(sectorSelect.value);
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const perimeter = perimeterInput.value ? parseFloat(perimeterInput.value) : null;
    const hemoglobin = parseFloat(hbInput.value);
    const altitude = parseInt(altitudeInput.value) || 0;
    
    // Checks de metas
    const credComplete = document.getElementById('pCredCheck').checked;
    const supplementReceived = document.getElementById('pSupplementCheck').checked;
    const counselingReceived = document.getElementById('pCounselingCheck').checked;

    // Validaciones básicas
    if (!/^\d{8}$/.test(dni)) {
      alert('El DNI debe tener exactamente 8 dígitos.');
      return;
    }
    if (!names) {
      alert('Por favor, ingrese el nombre del paciente.');
      return;
    }
    if (!birthdate || isNaN(weight) || isNaN(height) || isNaN(hemoglobin)) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const patient = {
      id: editingPatientId || String(Date.now()),
      dni,
      names,
      birthdate,
      sex,
      sectorId,
      isPregnant: pregnantCheck.checked,
      weight,
      height,
      abdominalPerimeter: perimeter,
      hemoglobin,
      altitude,
      credComplete,
      supplementReceived,
      counselingReceived
    };

    savePatient(patient);
    
    // Mensaje de éxito y limpieza
    alert(editingPatientId ? 'Paciente actualizado exitosamente.' : 'Paciente registrado exitosamente.');
    resetPatientForm();
    
    // Ir a pestaña de pacientes
    document.querySelector('.nav-item[data-tab="patients"]').click();
  });

  // Botón cancelar
  document.getElementById('cancelFormBtn').addEventListener('click', () => {
    resetPatientForm();
    document.querySelector('.nav-item[data-tab="patients"]').click();
  });
}

/**
 * Coloca la altitud por defecto en base al establecimiento de salud seleccionado
 */
function updateSuggestedAltitude() {
  const sectorSelect = document.getElementById('pSector');
  const altitudeInput = document.getElementById('pAltitude');
  
  const sectorId = parseInt(sectorSelect.value);
  const sector = SECTORS_CONFIG.find(s => s.id === sectorId);
  if (sector && !altitudeInput.value) {
    altitudeInput.value = sector.altitude;
  }
}

/**
 * Corre los cálculos clínicos en pantalla reactivamente
 */
function runLiveCalculations() {
  const birthdate = document.getElementById('pBirthdate').value;
  const sex = document.getElementById('pSex').value;
  const weight = parseFloat(document.getElementById('pWeight').value);
  const height = parseFloat(document.getElementById('pHeight').value);
  const hemoglobin = parseFloat(document.getElementById('pHemoglobin').value);
  const altitude = parseInt(document.getElementById('pAltitude').value) || 0;
  const isPregnant = document.getElementById('pPregnant').checked;

  const resultBox = document.getElementById('liveClinicalResults');
  
  // Elementos de pantalla
  const previewImc = document.getElementById('liveIMC');
  const previewImcClass = document.getElementById('liveIMCClass');
  const previewHbCorr = document.getElementById('liveHbCorr');
  const previewAnemia = document.getElementById('liveAnemiaClass');
  const previewTalla = document.getElementById('liveTallaClass');
  const alertContainer = document.getElementById('clinicalAlertContainer');

  if (!birthdate || isNaN(weight) || isNaN(height)) {
    resultBox.style.opacity = '0.5';
    previewImc.innerText = '-';
    previewImcClass.innerHTML = '-';
    previewHbCorr.innerText = '-';
    previewAnemia.innerHTML = '-';
    previewTalla.innerHTML = '-';
    alertContainer.style.display = 'none';
    return;
  }

  resultBox.style.opacity = '1';
  
  // 1. IMC
  const imc = calculateBMI(weight, height);
  previewImc.innerText = imc.toFixed(2);

  // 2. Altitud y Hb ajustada
  const hbCorr = getHemoglobinCorrection(altitude);
  const hbAdjusted = parseFloat((hemoglobin - hbCorr).toFixed(2));
  previewHbCorr.innerText = isNaN(hbAdjusted) ? '-' : `${hbAdjusted} g/dL (Ajuste: -${hbCorr})`;

  // 3. Edad total
  const ageInfo = calculateAge(birthdate);

  // 4. Clasificación anemia
  const anemiaInfo = classifyAnemia(ageInfo.totalMonths, sex, isPregnant, hbAdjusted);
  previewAnemia.innerHTML = `<span class="badge ${anemiaInfo.severity}">${anemiaInfo.class}</span>`;

  // 5. Estado Nutricional y Talla Baja
  const nutritionalInfo = classifyNutritionalStatus(ageInfo.totalMonths, sex, imc, height);
  previewImcClass.innerHTML = `<span class="badge ${nutritionalInfo.nutritionSeverity}">${nutritionalInfo.nutritionClass}</span>`;
  previewTalla.innerHTML = `<span class="badge ${nutritionalInfo.heightSeverity}">${nutritionalInfo.heightClass}</span>`;

  // 6. Generar Alertas Clínicas Dinámicas
  let alerts = [];
  if (anemiaInfo.isAnemic) {
    alerts.push(`<strong>Alerta de Anemia:</strong> El paciente requiere tratamiento terapéutico con sulfato ferroso y consejería nutricional inmediata.`);
  }
  if (nutritionalInfo.isShortStature) {
    alerts.push(`<strong>Alerta de Talla Baja:</strong> Retraso en crecimiento lineal. Evaluar hábitos alimenticios, CRED completo y derivar a Pediatría/Nutrición.`);
  }
  if (nutritionalInfo.nutritionSeverity === 'sobrepeso' || nutritionalInfo.nutritionSeverity === 'obesidad-severa') {
    alerts.push(`<strong>Alerta de Exceso de Peso:</strong> Coordinar pautas de alimentación saludable y actividad física para mitigar riesgo metabólico.`);
  }

  if (alerts.length > 0) {
    alertContainer.innerHTML = alerts.map(alert => `
      <div class="clinical-alert">
        <span class="material-symbols">warning</span>
        <div>${alert}</div>
      </div>
    `).join('');
    alertContainer.style.display = 'block';
  } else {
    alertContainer.style.display = 'none';
  }
}

/**
 * Resetea y limpia el formulario
 */
function resetPatientForm() {
  editingPatientId = null;
  document.getElementById('patientRegisterForm').reset();
  document.getElementById('registerViewTitle').innerText = 'Registrar Nuevo Paciente';
  document.getElementById('pDni').disabled = false;
  document.getElementById('pregnantFormRow').style.display = 'none';
  document.getElementById('perimeterFormRow').style.display = 'none';
  
  // Limpiar panel clínico
  runLiveCalculations();
}

// --- MÓDULO DE PACIENTES: LISTADO, BÚSQUEDA Y FILTRADO ---
function setupPatientsList() {
  const searchInput = document.getElementById('searchPatient');
  const sectorFilter = document.getElementById('filterSector');
  const nutritionFilter = document.getElementById('filterNutrition');
  const anemiaFilter = document.getElementById('filterAnemia');

  // Precargar los sectores en el select de filtrado y en el del formulario
  const sectors = getSectors();
  
  const filterSectorEl = document.getElementById('filterSector');
  const pSectorEl = document.getElementById('pSector');
  
  filterSectorEl.innerHTML = '<option value="">Todos los Sectores</option>';
  pSectorEl.innerHTML = '';
  
  sectors.forEach(s => {
    filterSectorEl.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    pSectorEl.innerHTML += `<option value="${s.id}">${s.name}</option>`;
  });

  // Vincular eventos de filtro
  [searchInput, sectorFilter, nutritionFilter, anemiaFilter].forEach(el => {
    el.addEventListener('input', renderPatientsTable);
  });
}

function renderPatientsTable() {
  const query = document.getElementById('searchPatient').value.toLowerCase().trim();
  const sectorVal = document.getElementById('filterSector').value;
  const nutritionVal = document.getElementById('filterNutrition').value;
  const anemiaVal = document.getElementById('filterAnemia').value;
  
  const patients = getPatients();
  const sectors = getSectors();
  const tbody = document.getElementById('patientsTableBody');
  tbody.innerHTML = '';

  // Filtrado
  const filtered = patients.filter(p => {
    // Filtro búsqueda (Nombre o DNI)
    const matchesQuery = p.names.toLowerCase().includes(query) || p.dni.includes(query);
    
    // Filtro sector
    const matchesSector = !sectorVal || p.sectorId === parseInt(sectorVal);
    
    // Filtro nutrición
    let matchesNutrition = true;
    if (nutritionVal) {
      if (nutritionVal === 'normal') matchesNutrition = p.nutritionSeverity === 'normal';
      else if (nutritionVal === 'sobrepeso') matchesNutrition = p.nutritionSeverity === 'sobrepeso';
      else if (nutritionVal === 'obesidad') matchesNutrition = p.nutritionSeverity === 'obesidad' || p.nutritionSeverity === 'obesidad-severa';
      else if (nutritionVal === 'delgadez') matchesNutrition = p.nutritionSeverity === 'delgadez' || p.nutritionSeverity === 'delgadez-severa';
      else if (nutritionVal === 'tallabaja') matchesNutrition = p.isShortStature;
    }

    // Filtro anemia
    let matchesAnemia = true;
    if (anemiaVal) {
      if (anemiaVal === 'con_anemia') matchesAnemia = p.isAnemic;
      else if (anemiaVal === 'sin_anemia') matchesAnemia = !p.isAnemic;
    }

    return matchesQuery && matchesSector && matchesNutrition && matchesAnemia;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron pacientes con los filtros seleccionados.</td></tr>`;
    return;
  }

  // Pintar tabla
  filtered.forEach(p => {
    const sectorName = sectors.find(s => s.id === p.sectorId)?.name || 'Desconocido';
    const ageDisplay = p.ageYears > 0 ? `${p.ageYears} años` : `${p.ageTotalMonths} meses`;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${p.dni}</td>
      <td style="font-weight: 500;">${p.names} ${p.isPregnant ? '<span style="color: var(--accent-secondary); font-size: 11px; font-weight:700;">(Gestante)</span>' : ''}</td>
      <td>${ageDisplay}</td>
      <td>${sectorName}</td>
      <td><strong>${p.imc.toFixed(1)}</strong></td>
      <td><span class="badge ${p.nutritionSeverity}">${p.nutritionClass}</span></td>
      <td><span class="badge ${p.anemiaSeverity}">${p.anemiaClass}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="action-btn" onclick="editPatient('${p.id}')" title="Editar">
            <span class="material-symbols" style="font-size:16px;">edit</span>
          </button>
          <button class="action-btn delete" onclick="deletePatientAction('${p.id}')" title="Eliminar">
            <span class="material-symbols" style="font-size:16px;">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- ACCIONES DE PACIENTES GLOBALMENTE ACCESIBLES ---

window.editPatient = function(id) {
  const patients = getPatients();
  const patient = patients.find(p => p.id === id);
  if (!patient) return;

  editingPatientId = patient.id;
  
  // Cargar datos
  document.getElementById('pDni').value = patient.dni;
  document.getElementById('pDni').disabled = true; // No permitir cambiar DNI
  document.getElementById('pNames').value = patient.names;
  document.getElementById('pBirthdate').value = patient.birthdate;
  document.getElementById('pSex').value = patient.sex;
  document.getElementById('pSector').value = patient.sectorId;
  document.getElementById('pWeight').value = patient.weight;
  document.getElementById('pHeight').value = patient.height;
  document.getElementById('pAltitude').value = patient.altitude;
  
  if (patient.abdominalPerimeter) {
    document.getElementById('pAbdominal').value = patient.abdominalPerimeter;
  }
  document.getElementById('pHemoglobin').value = patient.hemoglobin;
  
  // Metas checkboxes
  document.getElementById('pCredCheck').checked = patient.credComplete;
  document.getElementById('pSupplementCheck').checked = patient.supplementReceived;
  document.getElementById('pCounselingCheck').checked = patient.counselingReceived;

  // Cambiar título
  document.getElementById('registerViewTitle').innerText = 'Editar Datos de Paciente';

  // Mostrar checkbox gestante / perímetro si aplica
  const ageInfo = calculateAge(patient.birthdate);
  const pregnantRow = document.getElementById('pregnantFormRow');
  const perimeterRow = document.getElementById('perimeterFormRow');
  const pregnantCheck = document.getElementById('pPregnant');
  
  if (patient.sex === 'female' && ageInfo.years >= 12) {
    pregnantRow.style.display = 'flex';
    pregnantCheck.checked = patient.isPregnant;
  } else {
    pregnantRow.style.display = 'none';
    pregnantCheck.checked = false;
  }

  if (ageInfo.years >= 18) {
    perimeterRow.style.display = 'flex';
  } else {
    perimeterRow.style.display = 'none';
  }

  // Ejecutar cálculos
  runLiveCalculations();

  // Ir a pestaña de registro
  document.querySelector('.nav-item[data-tab="register"]').click();
};

window.deletePatientAction = function(id) {
  if (confirm('¿Está seguro de que desea eliminar permanentemente a este paciente?')) {
    deletePatient(id);
    renderPatientsTable();
    // Si estamos en el dashboard, refrescar estadísticas
    const dashboardTab = document.querySelector('.nav-item[data-tab="dashboard"]');
    if (dashboardTab.classList.contains('active')) {
      renderDashboard();
    }
  }
};
