document.querySelectorAll('.draggable').forEach(item => {
  item.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', item.textContent);
  });
});

const canvas = document.getElementById('canvas');
canvas.addEventListener('dragover', e => {
  e.preventDefault();
});

canvas.addEventListener('drop', e => {
  e.preventDefault();
  const label = e.dataTransfer.getData('text/plain');
  const newItem = document.createElement('div');
  newItem.className = 'dropped draggable';
  newItem.textContent = label;
  newItem.style.left = e.offsetX + 'px';
  newItem.style.top = e.offsetY + 'px';
  newItem.setAttribute('contenteditable', 'true');
  canvas.appendChild(newItem);
  enableInteract(newItem);
});

function enableInteract(el) {
  interact(el).draggable({
    listeners: {
      move (event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  }).resizable({
    edges: { left: true, right: true, bottom: true, top: true }
  }).on('resizemove', function (event) {
    let target = event.target;
    let x = parseFloat(target.getAttribute('data-x')) || 0;
    let y = parseFloat(target.getAttribute('data-y')) || 0;

    target.style.width = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }).gesturable({
    listeners: {
      move (event) {
        const angle = (parseFloat(event.target.getAttribute('data-angle')) || 0) + event.da;
        event.target.style.transform += ' rotate(' + angle + 'deg)';
        event.target.setAttribute('data-angle', angle);
      }
    }
  });
}

function exportAsPNG() {
  html2canvas(document.getElementById('canvas')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'floor_plan.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

function exportAsPDF() {
  html2canvas(document.getElementById('canvas')).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('floor_plan.pdf');
  });
}
