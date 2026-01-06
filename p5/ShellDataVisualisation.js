let layer1;
let layer2;
let phData = [];
let yearIndex = 0;
let table;

let yearProgress = 0;

function preload() {
  // force absolute path so it does NOT resolve to index.html
  table = loadTable("/ocean_data.csv", "csv", "header");
}


function setup() {
 const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  createCanvas(w, h);

  layer1 = new Riso("sunflower");
  layer2 = new Riso("fluorescentpink");

  if (!table || table.getRowCount() === 0) {
    console.error("ocean_data.csv did not load or is empty");
    return;
  }

  function windowResized() {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  resizeCanvas(w, h);
}

  console.log("CSV columns:", table.columns);  // <— add this

  const dateColIndex = table.columns.findIndex(
    (c) => c && c.toLowerCase().trim() === "date"
  );
  const phColIndex = table.columns.findIndex(
    (c) => c && c.toLowerCase().trim() === "ph"
  );

  if (dateColIndex === -1 || phColIndex === -1) {
    console.error("CSV is missing 'date' or 'ph' columns", table.columns);
    return;
  }


  for (let r = 0; r < table.getRowCount(); r++) {
    const dateStr = table.getString(r, dateColIndex);
    const phStr = table.getString(r, phColIndex);
    if (!dateStr || !phStr) continue;

    const year = int(dateStr.substring(0, 4));
    const ph = float(phStr);
    if (!isNaN(year) && !isNaN(ph)) {
      phData.push({ year, ph });
    }
  }

  phData.sort((a, b) => a.year - b.year);
}


function draw() {
clearRiso();
background(245);

if (phData.length === 0) {
drawRiso();
return;
}

let base = phData.find(d => d.year === 1985);
if (!base) {
drawRiso();
return;
}

  yearIndex = constrain(yearIndex, 0, phData.length - 1);
  yearProgress = yearIndex / (phData.length - 1); // 0..1

let minPH = min(phData.map(d => d.ph));
let maxPH = max(phData.map(d => d.ph));

yearIndex = constrain(yearIndex, 0, phData.length - 1);

// in data draw()
let baseX = width * 0.5;
let baseY = height * 0.5;


drawShell(layer1, baseX, baseY, 260, 0.55, 0.0, 0.0, 0.0, 1.9, 0.0);

let d = phData[yearIndex];

if (d.year === 1985) {
drawShell(layer2, baseX, baseY, 260, 0.55, 0.0, 0.0, 0.0, 1.9, 0.0);
} else {
let rawAcidity = map(d.ph, maxPH, minPH, 0, 1);
let acidity = pow(rawAcidity, 1.5);
let idxFromBase = d.year - 1985;

text
// horizontal-only drift, farther away
let driftX = acidity * 120 + idxFromBase * 6;
let driftY = 0;
  
let wobbleStrength = lerp(1, 2, acidity);     // less noisy
let spiralExp = lerp(1.9, 2.0, acidity);      // minimal exponent shift
let warpAmount = lerp(0.0, 0.03, acidity);    // half the warp


drawShell(
  layer2,
  baseX + driftX,
  baseY + driftY,
  260,
  0.55,
  acidity,
  wobbleStrength,
  idxFromBase * 0.15,
  spiralExp,
  warpAmount
);
}

drawRiso();

// YEAR LABELS LIKE THE REFERENCE IMAGE
noStroke();
fill(158, 146, 146);
textSize(160);

// 1) Static 1985 label over yellow shell (left)
textAlign(LEFT, CENTER);
let label1985X = width * 0.2;   // left margin
let label1985Y = baseY - 200;     // roughly vertical centre of shell
text("1985", label1985X, label1985Y);

 
// 2) Moving label for current pink shell year (right)
let dYear = phData[yearIndex].year;

if (dYear >= 1986) {
  // recompute drift so label matches pink shell position
  let rawAcidityLabel = map(d.ph, maxPH, minPH, 0, 1);
  let acidityLabel = pow(rawAcidityLabel, 1.5);
  let idxFromBaseLabel = dYear - 1985;
  let driftXLabel = acidityLabel * 120 + idxFromBaseLabel * 6;
  let driftYLabel = 0;

  // place it slightly to the right / lower than the pink shell centre
  let labelYearX = baseX + driftXLabel + 100;
  let labelYearY = baseY + 200;

  text(dYear, labelYearX, labelYearY);
}
}

function mouseWheel(event) {
let step = 0.2; // smaller = slower
let delta = event.delta * step;

if (delta > 1) {
yearIndex++;
} else if (delta < -1) {
yearIndex--;
}

yearIndex = constrain(yearIndex, 0, phData.length - 1);
}
function drawShell(layer, cx, cy, maxR, thickness, acidity, wobbleAmp, phase, spiralExp, warpAmount) {
layer.push();
layer.translate(cx, cy);
layer.noFill();
layer.stroke(255);
layer.strokeWeight(2);

let bands = 16;
let turns = 12.7;
let maxAngle = TWO_PI * turns;

let effectiveThickness = thickness * lerp(1.0, 0.9, acidity);

for (let b = 0; b < bands; b++) {
let bt = b / (bands - 1);
let rBase = lerp(maxR * (1 - effectiveThickness), maxR, bt);
let rInner = rBase - maxR * effectiveThickness * 0.89;

text
let alpha = lerp(35, 230, bt);
layer.stroke(255, alpha);

let steps = 200;
layer.beginShape();
for (let i = 0; i <= steps; i++) {
  let t = i / steps;

  let angle = t * maxAngle;

// original power-law radius
let rPower = maxR * pow(t, spiralExp);

// very small golden-ratio bias
const PHI = (1 + Math.sqrt(5)) / 2;
let rFibTiny = maxR * 0.02 * pow(PHI, 0.02 * angle);

// blend: mostly original, 5% Fibonacci
let spiralR = lerp(rPower, rPower + rFibTiny, 0.05);

  let localR = lerp(rInner, rBase, t);
  let totalR = spiralR + localR * 0.35;

  let baseWobble = map(noise(bt * 1.2, t * 3.1 + phase), 0, 1, -2, 2);
  let extraWobble = map(noise(bt * 4.0, t * 7.0 + phase), 0, 1, -1, 1) * wobbleAmp;
  let wobble = baseWobble + extraWobble;

  let r = totalR + wobble;

  if (warpAmount > 0) {
    let warp = sin(angle * 3.0) * warpAmount * maxR * t;
    r += warp;
  }

  if (t < 0.009) {
    r = 0.09;
  }

  let x = r * cos(angle);
  let y = r * sin(angle);
  layer.vertex(x, y);
}
layer.endShape();
}

layer.pop();
}

if (window.parent) {
    window.parent.postMessage(
      { type: "data-progress", progress: yearProgress },
      "*"
    );
  }
