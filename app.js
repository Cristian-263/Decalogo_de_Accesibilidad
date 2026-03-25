const diagram = document.getElementById('diagram');
const svgLines = document.getElementById('svg-lines');
const svgCenterRing = document.getElementById('svg-center-ring');
const center = document.getElementById('center');

const lineTargetRadius = 95; 

const nodeConfig = {
    0:   { left: 44, top: 20, anchor: 'bottom',    targetDeg: -108 },
    36:  { left: 56, top: 20, anchor: 'bottom',    targetDeg: -72 }, 
    72:  { left: 65, top: 35, anchor: 'left',      targetDeg: -36 }, 
    108: { left: 70, top: 50, anchor: 'left',      targetDeg: 0 },    
    144: { left: 65, top: 65, anchor: 'left',      targetDeg: 36 },   
    180: { left: 56, top: 80, anchor: 'top-left',  targetDeg: 72 },   
    216: { left: 44, top: 80, anchor: 'top-right', targetDeg: 108 },  
    252: { left: 35, top: 65, anchor: 'right',     targetDeg: 144 },  
    288: { left: 30, top: 50, anchor: 'right',     targetDeg: 180 },  
    324: { left: 35, top: 35, anchor: 'right',     targetDeg: 216 }   
};

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
        nodo.style.left = `${config.left}%`;
        nodo.style.top = `${config.top}%`;
        const box = nodo.querySelector('.nodo-box');
        const boxRect = box.getBoundingClientRect();
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
        }
        const targetRad = config.targetDeg * (Math.PI / 180);
        const targetX = centerX + lineTargetRadius * Math.cos(targetRad);
        const targetY = centerY + lineTargetRadius * Math.sin(targetRad);
        let pathData = "";
        if (config.anchor === 'left' || config.anchor === 'right') {
            const midX = anchorX + (targetX - anchorX) / 2;
            pathData = `M ${anchorX} ${anchorY} L ${midX} ${anchorY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        } else {
            const midY = anchorY + (targetY - anchorY) / 2;
            pathData = `M ${anchorX} ${anchorY} L ${anchorX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        }
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linejoin', 'round');
        svgLines.appendChild(path);
        const boxDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        boxDot.setAttribute('cx', anchorX);
        boxDot.setAttribute('cy', anchorY);
        boxDot.setAttribute('r', '6.5');
        boxDot.setAttribute('fill', '#E2E2E2'); 
        boxDot.setAttribute('stroke', '#000');
        boxDot.setAttribute('stroke-width', '2.5');
        svgLines.appendChild(boxDot);
        const endDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        endDot.setAttribute('cx', targetX);
        endDot.setAttribute('cy', targetY);
        endDot.setAttribute('r', '3');
        endDot.setAttribute('fill', '#000');
        svgLines.appendChild(endDot);
    });
}

// --- LÓGICA DEL POP-UP (NUEVA) ---
const apartadosData = [
    { title: "1. Estructura lógica y jerárquica", content: "<ul><li>Uso de encabezados bien ordenados.</li><li>Cada sección tiene un título significativo.</li></ul>" },
    { title: "2. Resumen contextual", content: "<p>Incluye un resumen contextual de lo que versa el material.</p>" },
    { title: "3. Lenguaje claro y comprensible", content: "<ul><li>Frases cortas y párrafos breves.</li><li>Lenguaje claro y sencillo.</li><li>Explica tecnicismos la primera vez.</li></ul>" },
    { title: "4. Listas y organización del contenido", content: "<ul><li>Usa listas para elementos múltiples.</li><li>Divide info compleja en bloques.</li><li>Usa glosario de términos.</li></ul>" },
    { title: "5. Tipografía y formato", content: "<ul><li>Tamaño mínimo 12–14 pt.</li><li>Evita mayúsculas prolongadas.</li><li>No justifiques el texto a ambos lados.</li></ul>" },
    { title: "6. Uso adecuado del color", content: "<p>No uses solo el color para transmitir información importante.</p>" },
    { title: "7. Texto alternativo en imágenes", content: "<ul><li>Proporciona ALT significativo.</li><li>Explica el propósito, no la estética.</li></ul>" },
    { title: "8. Subtítulos en los videos", content: "<ul><li>Incluir subtítulos en todos los materiales audiovisuales.</li></ul>" },
    { title: "9. Narración en los videos", content: "<ul><li>Describe de manera auditiva lo que aparece en la imagen o vídeo.</li></ul>" },
    { title: "10. Enlaces accesibles", content: "<ul><li>Usa texto descriptivo como 'Descargar informe (PDF)' en lugar de 'Haz clic aquí'.</li></ul>" }
];

const modal = document.getElementById('modal');
const modalBox = document.querySelector('.modal-box');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

function init() {
    drawCentralRing(); 
    setTimeout(drawLines, 100); 
    AOS.init(); // Inicializar AOS

    document.querySelectorAll('.nodo-box').forEach((box, index) => {
        box.addEventListener('click', () => {
            modalTitle.textContent = apartadosData[index].title;
            modalBody.innerHTML = apartadosData[index].content;
            modal.style.display = 'flex';
            
            // Forzar reinicio de animación zoom-in
            modalBox.classList.remove('aos-animate');
            setTimeout(() => modalBox.classList.add('aos-animate'), 10);
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                box.click();
            }
        });
    });
}

closeBtn.onclick = () => modal.style.display = 'none';
closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        modal.style.display = 'none';
    }
});
window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; }

// Tarjetas móviles
document.querySelectorAll('.mobile-card').forEach(card => {
    card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        modalTitle.textContent = apartadosData[index].title;
        modalBody.innerHTML = apartadosData[index].content;
        modal.style.display = 'flex';
        modalBox.classList.remove('aos-animate');
        setTimeout(() => modalBox.classList.add('aos-animate'), 10);
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});

window.addEventListener('load', init);
window.addEventListener('resize', () => { drawCentralRing(); drawLines(); });