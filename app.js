const diagram = document.getElementById('diagram');
const svgLines = document.getElementById('svg-lines');
const svgCenterRing = document.getElementById('svg-center-ring');
const center = document.getElementById('center');

const lineTargetRadius = 95; 

// Mapeo SIMÉTRICO absoluto: Nodos 6 y 7 ahora tienen anclajes 'top-left' y 'top-right'
const nodeConfig = {
    0:   { left: 43, top: 16, anchor: 'bottom-right', targetDeg: -108 },
    36:  { left: 57, top: 16, anchor: 'bottom-left',  targetDeg: -72 }, 
    72:  { left: 65, top: 30, anchor: 'left',      targetDeg: -36 }, 
    108: { left: 70, top: 50, anchor: 'left',      targetDeg: 0 },    
    144: { left: 65, top: 70, anchor: 'left',      targetDeg: 36 },   
    180: { left: 57, top: 84, anchor: 'top-left',  targetDeg: 72 }, 
    216: { left: 43, top: 84, anchor: 'top-right', targetDeg: 108 }, 
    252: { left: 35, top: 70, anchor: 'right',     targetDeg: 144 },  
    288: { left: 30, top: 50, anchor: 'right',     targetDeg: 180 },  
    324: { left: 35, top: 30, anchor: 'right',     targetDeg: 216 }   
};

// 1. DIBUJAR LOS 10 QUESITOS CENTRALES
function drawCentralRing() {
    svgCenterRing.innerHTML = ''; 
    const numSegments = 10;
    const gapAngle = 8; 
    const cx = 100, cy = 100;
    const r_out = 90, r_in = 75;

    for (let i = 0; i < numSegments; i++) {
        const gapCenter = -18 + (360 / numSegments) * i; 
        const startDeg = gapCenter + (gapAngle / 2);
        const endDeg = gapCenter + (360 / numSegments) - (gapAngle / 2);
        
        const startRad = startDeg * (Math.PI / 180);
        const endRad = endDeg * (Math.PI / 180);
        
        const ox_start = cx + r_out * Math.cos(startRad);
        const oy_start = cy + r_out * Math.sin(startRad);
        const ox_end = cx + r_out * Math.cos(endRad);
        const oy_end = cy + r_out * Math.sin(endRad);
        
        const ix_start = cx + r_in * Math.cos(startRad);
        const iy_start = cy + r_in * Math.sin(startRad);
        const ix_end = cx + r_in * Math.cos(endRad);
        const iy_end = cy + r_in * Math.sin(endRad);
        
        const pathData = `M ${ox_start},${oy_start} A ${r_out} ${r_out} 0 0 1 ${ox_end},${oy_end} L ${ix_end},${iy_end} A ${r_in} ${r_in} 0 0 0 ${ix_start},${iy_start} Z`;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathData);
        path.setAttribute('fill', '#C2002F'); 
        svgCenterRing.appendChild(path);
    }
}

// 2. DIBUJAR LÍNEAS ORTOGONALES Y CIRCULITOS
function drawLines() {
    svgLines.innerHTML = '';
    const nodos = document.querySelectorAll('.nodo');
    
    const centerRect = center.getBoundingClientRect();
    const diagramRect = diagram.getBoundingClientRect();
    const centerX = centerRect.left + centerRect.width / 2 - diagramRect.left;
    const centerY = centerRect.top + centerRect.height / 2 - diagramRect.top;

    nodos.forEach((nodo) => {
        const angleStr = nodo.style.getPropertyValue('--angle').trim();
        const angle = parseInt(angleStr);
        const config = nodeConfig[angle];
        
        // Asignar posición de la caja
        nodo.style.left = `${config.left}%`;
        nodo.style.top = `${config.top}%`;

        const box = nodo.querySelector('.nodo-box');
        const boxRect = box.getBoundingClientRect();
        
        // Calcular de dónde sale la línea según la configuración
        let anchorX, anchorY;
        if (config.anchor === 'bottom') {
            anchorX = boxRect.left + boxRect.width / 2 - diagramRect.left;
            anchorY = boxRect.bottom - diagramRect.top;
        } else if (config.anchor === 'top') {
            anchorX = boxRect.left + boxRect.width / 2 - diagramRect.left;
            anchorY = boxRect.top - diagramRect.top;
        } else if (config.anchor === 'left') {
            anchorX = boxRect.left - diagramRect.left;
            anchorY = boxRect.top + boxRect.height / 2 - diagramRect.top;
        } else if (config.anchor === 'right') {
            anchorX = boxRect.right - diagramRect.left;
            anchorY = boxRect.top + boxRect.height / 2 - diagramRect.top;
        } else if (config.anchor === 'top-left') {
            anchorX = boxRect.left + 25 - diagramRect.left;
            anchorY = boxRect.top - diagramRect.top;
        } else if (config.anchor === 'top-right') {
            anchorX = boxRect.right - 25 - diagramRect.left;
            anchorY = boxRect.top - diagramRect.top;
        } else if (config.anchor === 'bottom-left') {
            anchorX = boxRect.left + 25 - diagramRect.left;
            anchorY = boxRect.bottom - diagramRect.top;
        } else if (config.anchor === 'bottom-right') {
            anchorX = boxRect.right - 25 - diagramRect.left;
            anchorY = boxRect.bottom - diagramRect.top;
        }

        // Hacia dónde apunta en el centro
        const targetRad = config.targetDeg * (Math.PI / 180);
        const targetX = centerX + lineTargetRadius * Math.cos(targetRad);
        const targetY = centerY + lineTargetRadius * Math.sin(targetRad);

        // Calcular codo perfectamente simétrico
        let pathData = "";
        if (config.anchor === 'left' || config.anchor === 'right') {
            const midX = anchorX + (targetX - anchorX) / 2;
            pathData = `M ${anchorX} ${anchorY} L ${midX} ${anchorY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        } else {
            // Aplica para 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
            const midY = anchorY + (targetY - anchorY) / 2;
            pathData = `M ${anchorX} ${anchorY} L ${anchorX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        }

        // 1. Dibujar Línea
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linejoin', 'round');
        svgLines.appendChild(path);

        // 2. Dibujar Círculo de la caja (Gris con borde negro)
        const boxDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        boxDot.setAttribute('cx', anchorX);
        boxDot.setAttribute('cy', anchorY);
        boxDot.setAttribute('r', '6.5');
        boxDot.setAttribute('fill', '#E2E2E2'); 
        boxDot.setAttribute('stroke', '#000');
        boxDot.setAttribute('stroke-width', '2.5');
        svgLines.appendChild(boxDot);

        // 3. Dibujar Punto negro final (En el centro)
        const endDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        endDot.setAttribute('cx', targetX);
        endDot.setAttribute('cy', targetY);
        endDot.setAttribute('r', '3');
        endDot.setAttribute('fill', '#000');
        svgLines.appendChild(endDot);
    });
}

function init() {
    drawCentralRing(); 
    setTimeout(drawLines, 100); 
}

window.addEventListener('load', init);
window.addEventListener('resize', init);

const popupData = [
    {
        numero: 'Punto 1',
        titulo: 'Estructura lógica y jerárquica',
        items: [
            'Uso de encabezados bien ordenados.',
            'Cada sección tiene un título significativo.'
        ]
    },
    {
        numero: 'Punto 2',
        titulo: 'Resumen contextual',
        items: [
            'Incluye un resumen contextual de lo que versa el material.'
        ]
    },
    {
        numero: 'Punto 3',
        titulo: 'Lenguaje claro y comprensible',
        items: [
            'Frases cortas.',
            'Párrafos breves.',
            'Utiliza un lenguaje comprensible, claro y sencillo.',
            'Explica los tecnicismos la primera vez que aparecen.'
        ]
    },
    {
        numero: 'Punto 4',
        titulo: 'Listas y organización del contenido',
        items: [
            'Utiliza listas para elementos múltiples.',
            'Divide la información compleja en bloques.',
            'Usa un glosario de términos.'
        ]
    },
    {
        numero: 'Punto 5',
        titulo: 'Tipografía y formato',
        items: [
            'Usa tamaño mínimo 12–14 pt.',
            'Evita mayúsculas prolongadas.',
            'Evita cursivas largas (dificultan la lectura).',
            'Usa negrita para resaltar, pero con moderación.',
            'No justifiques el texto a ambos lados (crea ríos de texto).'
        ]
    },
    {
        numero: 'Punto 6',
        titulo: 'Uso adecuado del color',
        items: [
            'No uses solo el color para transmitir información.',
            'No dependas únicamente del color y el estilo para resaltar información.'
        ]
    },
    {
        numero: 'Punto 7',
        titulo: 'Texto alternativo en las imágenes',
        items: [
            'Proporciona un texto alternativo (ALT) significativo.',
            'Explica el propósito, no la estética.',
            'En gráficos complejos, describe la información clave.'
        ]
    },
    {
        numero: 'Punto 8',
        titulo: 'Subtítulos en los vídeos',
        items: [
            'Incluye subtítulos en todos los vídeos.'
        ]
    },
    {
        numero: 'Punto 9',
        titulo: 'Narración en los vídeos',
        items: [
            'Describe de manera auditiva lo que aparece en la imagen, diapositiva o vídeo.'
        ]
    },
    {
        numero: 'Punto 10',
        titulo: 'Enlaces accesibles',
        items: [
            'Usa texto descriptivo: "Descargar informe anual (PDF)".',
            'Evita "haz clic aquí", "más info", "ver".'
        ]
    }
];

const overlay    = document.getElementById('popup-overlay');
const popupBox   = document.getElementById('popup-content');
const closeBtn   = document.getElementById('popup-close');
const elNumero   = document.getElementById('popup-number');
const elTitulo   = document.getElementById('popup-title');
const elLista    = document.getElementById('popup-list');

function openPopup(index) {
    const data = popupData[index];
    elNumero.textContent  = data.numero;
    elTitulo.textContent  = data.titulo;
    elLista.innerHTML = data.items.map(item => `<li>${item}</li>`).join('');

    popupBox.removeAttribute('data-aos-id');
    popupBox.classList.remove('aos-animate');

    overlay.classList.add('active');

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            popupBox.classList.add('aos-animate');
        });
    });
}

function closePopup() {
    popupBox.classList.remove('aos-animate');
    setTimeout(() => overlay.classList.remove('active'), 350);
}

closeBtn.addEventListener('click', closePopup);
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
});

// Asignar clicks a los nodos según su orden (0-9)
window.addEventListener('load', () => {
    const nodos = document.querySelectorAll('.nodo-box');
    const angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
    nodos.forEach((box, i) => {
        box.addEventListener('click', () => openPopup(i));
    });
});