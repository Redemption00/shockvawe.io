
/* ріпл */
document.querySelector('.icon-info').addEventListener('click', function (e) {

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  const rect = this.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;

  const oldRipples = this.getElementsByClassName('ripple');
  Array.from(oldRipples).forEach(oldRipple => oldRipple.remove());

  this.appendChild(ripple);

  ripple.addEventListener('animationend', () => ripple.remove());
});

/* фото info */
document.addEventListener('DOMContentLoaded', function () {
  const mainImage = document.querySelector('#info');

  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const expandedImage = document.createElement('img');
    expandedImage.src = 'img/info-large.png';
    expandedImage.alt = 'Expanded Image';
    expandedImage.className = 'expanded-image';

    const closeIcon = document.createElement('div');
    closeIcon.className = 'close-icon';
    closeIcon.textContent = '×';

    overlay.appendChild(expandedImage);
    overlay.appendChild(closeIcon);

    return overlay;
  }

  function showOverlay(overlay, expandedImage) {
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = '1';
      expandedImage.style.opacity = '1';
    }, 0);
  }

  function hideOverlay(overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 500);
  }

  mainImage.addEventListener('click', function () {
    if (!mainImage.overlay) {
      mainImage.overlay = createOverlay();
      const expandedImage = mainImage.overlay.querySelector('.expanded-image');
      showOverlay(mainImage.overlay, expandedImage);

      const closeIcon = mainImage.overlay.querySelector('.close-icon');
      closeIcon.addEventListener('click', function (event) {
        event.stopPropagation();
        hideOverlay(mainImage.overlay);
        mainImage.overlay = null;
      });
    } else {
      hideOverlay(mainImage.overlay);
      mainImage.overlay = null;
    }
  });

  if (mainImage.complete) {
    mainImage.dispatchEvent(new Event('load'));
  }
});
//end ripple

//список змінних  
let ExplosiveMass = null;
let CylinderMass = null;
let CylinderDiameter = null;
let CylinderThickness = null;
let MottValue = null;
let GurneyValue = null;

// Дефолтний список інтервалів
let Values = [0, 0.1, 0.5, 1, 2, 5, 10, 100];
let isCalculationAllowed = false;

// Фвльтр. інтервалів
function filterMassValues(values, Mmax) {
    let filteredValues = values.filter(value => value <= Mmax);
    if (filteredValues[filteredValues.length - 1] !== Mmax) {
        filteredValues.push(Mmax);
    }
    return filteredValues;
}

// Функція для обчислення функці розподілу N(m)
function calculateN(m, Mk) {
    return Math.exp(-Math.sqrt(m) / Mk) * (CylinderMass / (2 * Mk ** 2));
}

// обчислення
function performCalculations() {
    // Розрахунок Mk
    const Mk = MottValue * 
        Math.pow(CylinderThickness, 5 / 6) * 
        Math.pow(CylinderDiameter / 2, 1 / 3) * 
        (1 + (2 * CylinderThickness / CylinderDiameter));

    // Розрахунок шв.
    const speed = (GurneyValue / Math.sqrt(0.5 + CylinderMass / ExplosiveMass)).toFixed(2);

    // Розрахунок максимальної маси
    const Mmax = Math.pow(Mk * Math.log(CylinderMass / (2 * Mk)), 2).toFixed(1);
    // Відобразити 
    document.getElementById("resultSection").style.display = "block";    
    // Відображення швидкості
    document.getElementById("speedCalculation").textContent = `Початкова швидкість розльоту: ${speed} м/с`;

    // Відображення максимальної маси уламків
    document.getElementById("maxMassCalculation").textContent = `Максимальна маса уламків: ${Mmax} г`;

    // таблиця результатів
    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = ""; // Очистити таблицю

    // фільтрування значень мас у відповідності до Mmax
    const massValues = filterMassValues(Values, Mmax);

    // зповнення таблиці
    for (let i = 0; i < massValues.length - 1; i++) {
        const m1 = massValues[i];
        const m2 = massValues[i + 1];
        const N_m1 = calculateN(m1, Mk);
        const N_m2 = calculateN(m2, Mk);
        const numParticles = N_m1 - N_m2;

        const row = document.createElement("tr");

        const massRangeCell = document.createElement("td");
        massRangeCell.textContent = `${m1} до ${m2}`;
        row.appendChild(massRangeCell);

        const numParticlesCell = document.createElement("td");
        numParticlesCell.textContent = numParticles.toFixed(2);
        row.appendChild(numParticlesCell);

        tableBody.appendChild(row);
    }
    
    scrollToBottom();

    // Блок кнопки 
    const button = document.querySelector("button");
    button.disabled = true;
    isCalculationAllowed = false;
}

// Перевірка валідності змінних, активація кнопки
function validateInputs() {
    if (GurneyValue > 0 &&
        MottValue > 0 &&
        CylinderMass > 0 &&
        ExplosiveMass > 0 &&
        CylinderDiameter > 0 &&
        CylinderThickness > 0) {
        isCalculationAllowed = true;
        document.querySelector("button").disabled = false;
    } else {
        isCalculationAllowed = false;
        document.querySelector("button").disabled = true;
    }
}

// Обробка введення значень
const textFields = document.querySelectorAll('.mdc-text-field');
textFields.forEach(field => {
    const inputElement = field.querySelector('.mdc-text-field__input');

    inputElement.addEventListener('input', () => {
        const value = inputElement.value.trim();

        if (/^-?\d*(\.\d+)?$/.test(value)) {
            field.classList.remove('mdc-text-field--invalid');

            switch (field.id) {
                case 'explosiveMass':
                    ExplosiveMass = parseFloat(value);
                    break;
                case 'cylinderMass':
                    CylinderMass = parseFloat(value);
                    break;
                case 'cylinderDiameter':
                    CylinderDiameter = parseFloat(value);
                    break;
                case 'cylinderThickness':
                    CylinderThickness = parseFloat(value);
                    break;
            }
        } else {
            field.classList.add('mdc-text-field--invalid');
            switch (field.id) {
                case 'explosiveMass':
                    ExplosiveMass = null;
                    break;
                case 'cylinderMass':
                    CylinderMass = null;
                    break;
                case 'cylinderDiameter':
                    CylinderDiameter = null;
                    break;
                case 'cylinderThickness':
                    CylinderThickness = null;
                    break;
            }
        }
        validateInputs();
    });
});

// Ініціалізація MDC TextField
textFields.forEach(field => {
    new mdc.textField.MDCTextField(field);
});

// Ініціалізація dropmenu
const select = new mdc.select.MDCSelect(document.querySelector('.mdc-select'));
select.listen('MDCSelect:change', () => {
    const selectedItem = select.menu.items[select.selectedIndex];

    MottValue = parseFloat(selectedItem.dataset.mott);
    GurneyValue = parseFloat(selectedItem.dataset.gurney);

    validateInputs();
});

// Прив'язка
document.querySelector("button").addEventListener("click", () => {
    if (isCalculationAllowed) {
        performCalculations();
    }
});

// Початкова ініціалізація
validateInputs();

//прогор
function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

/* меню */
document.getElementById("expand").addEventListener("click", function() {
  document.getElementById("sideMenu").classList.add("menu-open");
  document.querySelector(".dimming-menu").classList.add("dim-active");
  document.querySelector("body").classList.add("dim-overflow");      
});
document.getElementById("close").addEventListener("click", function() {
  document.getElementById("sideMenu").classList.remove("menu-open");
  document.querySelector(".dimming-menu").classList.remove("dim-active");
  document.querySelector("body").classList.remove("dim-overflow");      
});

                            
