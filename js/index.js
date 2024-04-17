// code.js
/* loader */ 
window.addEventListener('load', function() {
    const loaderAnimation = document.getElementById('loader-animation');
    const images = [
    'img/loading1.png',
    'img/loading2.png',
    'img/loading3.png',
    'img/loading4.png',
    'img/loading4-1.png',
    'img/loading5.png',
    'img/loading6.png',
    'img/loading7.png',
    'img/loading8.png',
    'img/loading9.png',
    'img/loading10.png',
    'img/loading11.png',
  ];
  let currentIndex = 0;
  let animationInterval;

  function animateLoader() {
    loaderAnimation.src = images[currentIndex];
    currentIndex = (currentIndex + 1) % images.length;

    if (currentIndex === 0) {
      clearInterval(animationInterval);
      const loader = document.getElementById('loader');
      loader.style.display = 'none';
    }
  }

  function startAnimation() {
    animationInterval = setInterval(animateLoader, 1500 / images.length);
  }

  function preloadImages() {
    const promises = images.map(imageSrc => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });
    });

    Promise.all(promises)
      .then(startAnimation)
      .catch(err => console.error('Error preloading images:', err));
  }

  preloadImages();
});
  

/*змінні: 
*тиск в МПа = 1000кПа
*Rd - відстань масштабування;
*distance - відстань(м);
*mass - еквівалентна маса тротилу(кг)
*/ 
   
/* Метод Гельфанда */
 function peakPressure_Gelfand(distance, mass) {
    let Rd = distance / (mass ** (1/3));
    let P;

    if (Rd >= 8) {
        P = 8000 * Math.exp(-10.46 * Math.pow(Rd, 0.1));
    } else if (Rd >= 0.1) {
        P = 1700 * Math.exp(-7.14 * Math.pow(Rd, 0.28)) + 0.0156;
    } else {
        
        P = null;
    }

    return P;
}

/* метод Генріха-Майора (1979) */
function peakPressure_Major(distance, mass) {
    let R = distance / Math.pow(2 * mass, 1/3); /* формула повітряного типу. Вибух наземного типу включатиме відбиту хвилю, в ідалі повністю, тому ми маємо подвоїти масу, аналогічно формули Садовского*/
    let P;

    if (R >= 1 && R <= 10) {
        P = (0.0649 / R) + (0.397 / Math.pow(R, 2)) + (0.322 / Math.pow(R, 3));
    } else if (R >= 0.3 && R < 1) {
        P = (0.607 / R) - (0.032 / Math.pow(R, 2)) + (0.209 / Math.pow(R, 3));
    } else if (R >= 0.05 && R < 0.3) {
        P = (1.380 / R) + (0.543 / Math.pow(R, 2)) - (0.035 / Math.pow(R, 3)) + (0.000613 / Math.pow(R, 4));
    } else {
       
        P = null;
    }

    return P;
}
/*Метод Садовского*/   
function peakPressure_Sadovsky(distance, mass) {
    Rd = (mass/1000)**(1/3)
    return (1.06*Rd/distance) + (4.3*Rd**2)/(distance**2) + (1400*Rd**3)/(distance**3);
}
   
/* конвертер маси */   
function convertMass(kgmass) {
    if (kgmass < 1) {
        return (kgmass * 1000).toFixed(1) + " г";
    } else if (kgmass < 1000) {
        return kgmass.toFixed(2) + " кг";
    } else if (kgmass < 1000000) {
        return (kgmass / 1000).toFixed(3) + " т";
    } else if (kgmass < 1000000000) {
        return (kgmass / 1000000).toFixed(3) + " кт";
    } else {
        return (kgmass / 1000000000).toFixed(3) + " Мт";
    }
}
 
const options = document.querySelector('.options');
const equivalentValueElement = document.querySelector('.equivalent-value');
let equivalentValue = 1; //за замовчуванням = тротил
var searchLine = document.querySelector(".select-expl");

searchLine.onclick = function () {
    let list = this.nextElementSibling;    
    if (list.style.maxHeight) {
        this.classList.remove("open");              
        list.style.maxHeight = null;
        list.style.boxShadow = null;    
        list.style.opacity = null;
        document.querySelector(".dimming-options").classList.remove("dim-active");
        document.querySelector("body").classList.remove("dim-overflow");                      
    } else {
        triggerVibration(45)         
        this.classList.add("open")
        list.style.maxHeight = "75vh";
        list.style.opacity = "1";           
        
        document.querySelector(".dimming-options").classList.add("dim-active");
        document.querySelector("body").classList.add("dim-overflow");
        options.addEventListener('click', (event) => {
            const clickedOption = event.target;    
                if (clickedOption.classList.contains('option')) {
                    this.classList.remove("open");
                    const selectedOptionText = clickedOption.textContent;
                    searchLine.textContent = `${selectedOptionText}`;
                    equivalentValue = clickedOption.getAttribute('data-value');
                    equivalentValueElement.textContent = `${equivalentValue}`;      
                             
                    list.style.maxHeight = null;
                    list.style.boxShadow = null;    
                    list.style.opacity = null;
                    document.querySelector(".dimming-options").classList.remove("dim-active");
                    document.querySelector("body").classList.remove("dim-overflow");
                 }                       
         });                           
    }
};  
                   
//масса
var massInput = document.getElementById('massInput');
var TNTresContainer = document.getElementById('TNTres');
var TNTres = null;
let userInput = null;

function updateTNTres() {
    var equivalent = equivalentValue
    if (userInput) {
        document.querySelector(".label-mass").classList.add("active");
        TNTres = userInput * equivalent;
        TNTresContainer.textContent = `тротиловий еквівалент: ${convertMass(TNTres)}`; } 
        
    else {
        const TNTres = null;
        TNTresContainer.textContent = ""; 
      }
    }
massInput.addEventListener('input', function() {
    var inputText = massInput.value;
    var parsedNumber = parseFloat(inputText);  
    if (!isNaN(parsedNumber) && parsedNumber > 0) {
        userInput = parsedNumber; 
    } else {
        userInput = null;
    }  
    updateTNTres();
});

//дистанція 
var Distance = document.getElementById('Distance');
var PressureContainer = document.getElementById('Pressure');
let distInput = null;
var pressure = null;

function updatePressure() { 
    if (distInput && TNTres) {
        document.querySelector(".label-pressure").classList.add("active");
        
        if (selectedMethod == 1) {
            pressure = (peakPressure_Sadovsky(distInput, TNTres) * 1000).toFixed(2);
        } else if (selectedMethod == 0) {
            pressure = (peakPressure_Gelfand(distInput, TNTres) * 1000).toFixed(2);
        }  
        
        highlightIntervals(pressure);
        PressureContainer.textContent = `тиск: ${pressure} кПа =  ${(pressure * 0.0101972).toFixed(2)} ат`; }         
    else {        
        PressureContainer.textContent = "";        
    }
};
      
Distance.addEventListener('input', function() {
    var inputTx = Distance.value;
    var parsedDist = parseFloat(inputTx);
  
    if (!isNaN(parsedDist) && parsedDist > 0) {
        distInput = parsedDist; } 
        else {
        distInput = null;
        }  
    updatePressure();
    });

 
setInterval(function() { 
  updatePressure(); updateTNTres();
}, 500);

//підказка
function changeImage(imageId, loadImg, newAddress) {
    var imageElement = document.getElementById(imageId); 
    imageElement.style.opacity = 0;
    imageElement.src = loadImg
    setTimeout(function() {
      imageElement.src = newAddress;
      imageElement.style.opacity = 1; 
    }, 200); 
  }
  
//ховер  маса
document.querySelector("#massInput").addEventListener("focus", function() {  
    triggerVibration(45)    
    document.querySelector("#massInput").style.border = "2px solid var(--mass-color)"; 
  
    });
document.querySelector("#massInput").addEventListener("blur", function() {
    if (!userInput){
       
        document.querySelector("#massInput").style.border = "1px solid var(--border-color)";
        document.querySelector(".label-mass").classList.remove("active");
        }    
    });
    
//ховер тиск
document.querySelector("#Distance").addEventListener("focus", function() {  
    triggerVibration(45)
    
    document.querySelector("#Distance").style.border = "2px solid var(--dist-color)"; 
    });
document.querySelector("#Distance").addEventListener("blur", function() {
    if (!distInput){
        
        document.querySelector("#Distance").style.border = "1px solid var(--border-color)"; 
        document.querySelector(".label-pressure").classList.remove("active");
        }    
    });
    
//пошук 
var label = document.querySelectorAll(".option");
var searchInput = document.getElementById("search");

function search() {
  let searchVal = searchInput.value.trim().toUpperCase();
  label.forEach((item) => {
    let optionText = item.textContent.trim().toUpperCase();
    if (optionText.indexOf(searchVal) === -1) {
      item.style.display = "none";
    } else {
      item.style.display = "flex";
    }
  });
}
searchInput.addEventListener("keyup", search);

//вібро
function triggerVibration(duration) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  } else if (typeof window.navigator.msVibrate === "function") {
    //  IE (MS Edge) 
    window.navigator.msVibrate(duration);
  } else {
    // 
    const start = Date.now();
    const interval = setInterval(function() {
      if (Date.now() - start >= duration) {
        clearInterval(interval);
      }
      
    }, 12); 
  }
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


/* підсвітка значень таблиці*/
function highlightIntervals(pressure) {
  const tableRows = document.querySelectorAll(".tbl-content table tbody tr");

  tableRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const n = cells.length;
   
    for (let i = 1; i < n; i++) {
      const cell = cells[i];
      const interval = cell.textContent.trim();
      const min = parseInterval(interval);

      cell.classList.remove("highlight");

      if (i < n - 1) {
        const closestCell = cells[i+1];
        const closestInterval = closestCell.textContent.trim();
        const closestMin = parseInterval(closestInterval);
        
        if (pressure >= min && pressure < closestMin) {
           cell.classList.add("highlight");
           }
       } else if (i == n-1 && pressure >= min){
           cell.classList.add("highlight");
           }
      }
  });
}
function parseInterval(interval) {
  let min = null;
  let max = null;

  if (interval.includes("-")) {
    [min, max] = interval.split("-").map(parseFloat);
  } else {
    min = parseFloat(interval);
    max = null;
  }
  return min;
}

/* toggle */
let selectedMethod = 0;

    function toggleOption(option) {
      if (option === selectedMethod) {
        return;
      }

      // Скасувати попередній вибір
      document.querySelectorAll(".option-button")[selectedMethod].classList.remove("selected");

      // Вибір нової опції
      selectedMethod = option;
      document.querySelectorAll(".option-button")[selectedMethod].classList.add("selected");   
      updatePressure()   
    }

    // Обрати метод за замовчуванням 
    document.querySelectorAll(".option-button")[0].classList.add("selected");

/* ripple affect*/    
  function createRipple(event) {
  const button = event.currentTarget;

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];

  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

const buttons = document.getElementsByTagName("button");
for (const button of buttons) {
  button.addEventListener("click", createRipple);
}
    
