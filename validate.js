
function validatePlan() {
    const requiredItems = ["Handwash Sink", "3-Compartment Sink", "Potable Water Tank", "Wastewater Tank", "Refrigerator", "Flat Top Griddle", "Stove", "Service Window", "Service Counter", "Work Table", "Generator", "Propane Tank"];
    const canvasItems = Array.from(document.querySelectorAll('#canvas .draggable')).map(el => el.innerText.trim());
    const missingItems = requiredItems.filter(item => !canvasItems.includes(item));
    
    const messageBox = document.createElement('div');
    messageBox.style.position = 'fixed';
    messageBox.style.top = '20px';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translateX(-50%)';
    messageBox.style.backgroundColor = '#fff';
    messageBox.style.border = '2px solid #333';
    messageBox.style.padding = '1rem';
    messageBox.style.zIndex = 1000;
    messageBox.style.maxWidth = '400px';
    messageBox.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    
    if (missingItems.length > 0) {
        messageBox.innerHTML = '<strong>Missing Required Items:</strong><ul>' + 
            missingItems.map(item => '<li>' + item + '</li>').join('') + '</ul>';
    } else {
        messageBox.innerHTML = '<strong style="color:green;">Your plan includes all required elements.</strong>';
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '1rem';
    closeBtn.onclick = () => messageBox.remove();
    messageBox.appendChild(closeBtn);

    document.body.appendChild(messageBox);
}
