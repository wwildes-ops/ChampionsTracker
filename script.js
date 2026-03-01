function updateDiceList() {
  const type = document.getElementById("attackType").value;
  const diceSelect = document.getElementById("diceSelection");
  const bonusGroup = document.getElementById("stunBonusGroup");
  diceSelect.innerHTML = "";

  if (type === "killing") {
    bonusGroup.style.display = "block";
    const kOptions = [{label:"+1 Pip",b:0,m:"p"}, {label:"1/2 d6",b:0,m:"h"}];
    for (let i=1; i<=12; i++) {
      kOptions.push({label:i+"d6", b:i, m:"n"});
      kOptions.push({label:i+"d6+1", b:i, m:"p"});
      kOptions.push({label:i+" 1/2 d6", b:i, m:"h"});
    }
    kOptions.forEach(o => {
      let el = document.createElement("option");
      el.textContent = o.label;
      el.value = JSON.stringify(o);
      diceSelect.appendChild(el);
    });
  } else {
    bonusGroup.style.display = "none";
    for (let i=1; i<=25; i++) {
      let el = document.createElement("option");
      el.textContent = i + "d6";
      el.value = JSON.stringify({b:i, m:"n", label: i+"d6"});
      if(i===10) el.selected = true;
      diceSelect.appendChild(el);
    }
  }
}

function processRoll() {
  const type = document.getElementById("attackType").value;
  const data = JSON.parse(document.getElementById("diceSelection").value);
  const stunBonus = parseInt(document.getElementById("stunBonus").value) || 0;
  const kbType = document.getElementById("kbType").value;
  
  let stun = 0;
  let body = 0;
  let diceLabel = data.label;

  // 1. Roll Base Dice
  for (let i=0; i < data.b; i++) {
    let r = Math.floor(Math.random() * 6) + 1;
    if (type === "killing") {
      body += r;
    } else {
      if (type === "normal") stun += r;
      if (r === 1) body += 0;
      else if (r === 6) body += 2;
      else body += 1;
    }
  }

  // 2. Handle Modifiers (Pips/Half Dice)
  if (data.m === "p") {
    body += 1;
  } else if (data.m === "h") {
    let hr = Math.floor(Math.random() * 6) + 1;
    if (hr <= 3) body += 1; else if (hr <= 5) body += 2; else body += 3;
  }

  // 3. Handle Killing Stun Multiplier
  let logNote = "";
  if (type === "killing") {
    let br = Math.floor(Math.random() * 3) + 1;
    let fm = br + stunBonus;
    stun = body * fm;
    logNote = `(Mult: x${fm})`;
    document.getElementById("multiplierText").innerText = `Mult: x${fm} (Roll ${br} + Bonus ${stunBonus})`;
  } else {
    document.getElementById("multiplierText").innerText = "";
    if (type === "bodyOnly") stun = "—";
  }

 // --- NEW KNOCKBACK LOGIC ---
  let kbValue = 0;
  if (kbType !== "none") {
    let kbDiceCount = 2; // Default for Normal Attacks
    
    // Rule: Killing Attacks subtract an extra 1d6 (Total 3d6)
    if (type === "killing") kbDiceCount = 3;
    
    // Rule: Air/Flying targets subtract 1 less die
    if (kbType === "air") kbDiceCount -= 1;

    // Roll the KB Resistance
    let kbRollTotal = 0;
    for (let k = 0; k < kbDiceCount; k++) {
      kbRollTotal += Math.floor(Math.random() * 6) + 1;
    }
    
    kbValue = body - kbRollTotal;
    
    // Rule: Double Knockback happens after the subtraction
    if (kbType === "double" && kbValue > 0) {
      kbValue *= 2;
    }

    if (kbValue < 0) kbValue = 0;
  }

  // 5. Update Display
  document.getElementById("stunRes").innerText = stun;
  document.getElementById("bodyRes").innerText = body;
  document.getElementById("kbRes").innerText = kbValue;
  document.getElementById("rollTypeDisplay").innerText = `${type.toUpperCase()} - ${diceLabel}`;

  // 6. Add to History
  const log = document.getElementById("rollLog");
  const entry = document.createElement("li");
  entry.innerText = `${diceLabel} ${type}: ${stun}S, ${body}B, ${kbValue}m KB ${logNote}`;
  log.prepend(entry);
}

updateDiceList();

// Tab Switching Logic
function showTab(tabName) {
  // Hide all content
  document.getElementById('dice-screen').style.display = 'none';
  document.getElementById('stats-screen').style.display = 'none';
  
  // Show selected content
  document.getElementById(tabName + '-screen').style.display = 'block';
  
  // Update button visual state
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// Stat Calculation Logic
function changeStat(stat, amount) {
  const input = document.getElementById('val-' + stat);
  let current = parseInt(input.value) || 0;
  input.value = current + amount;
}

function takeRecovery() {
  const rec = parseInt(document.getElementById('val-rec').value) || 0;
  
  // Stats to recover
  const stats = ['stun', 'end'];

  stats.forEach(stat => {
    const currentInput = document.getElementById('val-' + stat);
    const maxInput = document.getElementById('max-' + stat);
    
    let current = parseInt(currentInput.value) || 0;
    let max = parseInt(maxInput.value) || 0;
    
    // Add REC but cap it at MAX
    let newValue = Math.min(current + rec, max);
    
    currentInput.value = newValue;
  });
}

function syncMax(stat) {
  const maxVal = document.getElementById('max-' + stat).value;
  document.getElementById('val-' + stat).value = maxVal;
}