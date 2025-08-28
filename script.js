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
  // Snap to grid (24px)
  const gridSize = 24;
  let x = Math.round(e.offsetX / gridSize) * gridSize;
  let y = Math.round(e.offsetY / gridSize) * gridSize;
  const newItem = document.createElement('div');
  newItem.className = 'dropped draggable';
  newItem.setAttribute('tabindex', '0');
  // Make label not editable by default
  newItem.innerHTML = `<span class="item-label" contenteditable="false">${label}</span>`;
  newItem.style.left = x + 'px';
  newItem.style.top = y + 'px';

  // Add delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = '&times;';
  delBtn.title = 'Delete';
  delBtn.onclick = (ev) => {
    ev.stopPropagation();
    newItem.remove();
  };
  newItem.appendChild(delBtn);

  // Add rotate handle
  const rotateHandle = document.createElement('div');
  rotateHandle.className = 'rotate-handle';
  rotateHandle.title = 'Rotate';
  rotateHandle.innerHTML = '&#8635;';
  newItem.appendChild(rotateHandle);

  // Double click to edit label
  const labelSpan = newItem.querySelector('.item-label');
  labelSpan.addEventListener('dblclick', function(e) {
    e.stopPropagation();
    labelSpan.setAttribute('contenteditable', 'true');
    labelSpan.focus();
    // Select all text for convenience
    document.execCommand('selectAll', false, null);
  });
  // Remove contenteditable on blur or Enter
  labelSpan.addEventListener('blur', function() {
    labelSpan.setAttribute('contenteditable', 'false');
  });
  labelSpan.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      labelSpan.blur();
    }
  });

  canvas.appendChild(newItem);
  enableInteract(newItem, gridSize);
  enableRotate(newItem, rotateHandle);
});



function enableInteract(el, gridSize = 24) {
  let resizingEnabled = true;
  let interactable = interact(el)
    .draggable({
      listeners: {
        move(event) {
          const target = event.target;
          let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
          // Snap to grid
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
          const angle = parseFloat(target.getAttribute('data-angle')) || 0;
          target.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      }
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      enabled: true
    })
    .on('resizemove', function (event) {
      if (!resizingEnabled) return;
      let target = event.target;
      let x = parseFloat(target.getAttribute('data-x')) || 0;
      let y = parseFloat(target.getAttribute('data-y')) || 0;

      target.style.width = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      x += event.deltaRect.left;
      y += event.deltaRect.top;

      // Snap to grid
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;

      const angle = parseFloat(target.getAttribute('data-angle')) || 0;
      target.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    });
  // Keyboard delete support
  el.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      el.remove();
    }
  });
  // Click to select
  el.addEventListener('click', function(e) {
    document.querySelectorAll('.dropped.selected').forEach(item => {
      item.classList.remove('selected');
      // Hide rotation handle on deselect
      let rh = item.querySelector('.rotate-handle');
      if (rh) rh.style.display = 'none';
    });
    el.classList.add('selected');
    // Show rotation handle only when selected
    let rh = el.querySelector('.rotate-handle');
    if (rh) rh.style.display = 'flex';
  });
  // Deselect on canvas click
  canvas.addEventListener('click', function(e) {
    if (e.target === canvas) {
      document.querySelectorAll('.dropped.selected').forEach(item => {
        item.classList.remove('selected');
        let rh = item.querySelector('.rotate-handle');
        if (rh) rh.style.display = 'none';
      });
    }
  });
  // Hide rotation handle by default
  let rh = el.querySelector('.rotate-handle');
  if (rh) rh.style.display = 'none';
  // Expose lock/unlock resizing for rotation
  el._lockResizing = () => { resizingEnabled = false; };
  el._unlockResizing = () => { resizingEnabled = true; };
}

// Rotation logic for rotate handle
function enableRotate(el, handle) {
  let rotating = false;
  let startAngle = 0;
  let startX = 0;
  let startY = 0;
  handle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    rotating = true;
    if (el._lockResizing) el._lockResizing(); // Lock resizing while rotating
    const rect = el.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
    startAngle = parseFloat(el.getAttribute('data-angle')) || 0;
    document.body.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', function(e) {
    if (!rotating) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    angle = Math.round(angle);
    el.setAttribute('data-angle', angle);
    const x = parseFloat(el.getAttribute('data-x')) || 0;
    const y = parseFloat(el.getAttribute('data-y')) || 0;
    el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
  });
  document.addEventListener('mouseup', function() {
    if (rotating) {
      rotating = false;
      if (el._unlockResizing) el._unlockResizing(); // Unlock resizing after rotating
      document.body.style.cursor = '';
    }
  });
}

// Reset canvas function
function resetCanvas() {
  document.querySelectorAll('#canvas .dropped').forEach(el => el.remove());
}

function hideAllRotationHandles() {
  document.querySelectorAll('.rotate-handle').forEach(h => h.style.display = 'none');
}

function exportAsPNG() {
  hideAllRotationHandles();
  setTimeout(() => {
    html2canvas(document.getElementById('canvas')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'floor_plan.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }, 50);
}

function exportAsPDF() {
  hideAllRotationHandles();
  setTimeout(() => {
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
  }, 50);
}
