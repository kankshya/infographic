// sketch_layer1.js
// Baseline 1985 shell that forms and fades in with mouse wheel

let layer1;
let phData1 = [];
let tProgress = 0;  // 0..1 how far the shell is drawn
let fade = 0;       // 0..255 overall opacity
let table1;

function preload() {
table1 = loadTable("../ocean_data.csv", "csv", "header");


}

function resetShell() {
  tProgress = 0;
  fade = 0;
}

function setup() {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  createCanvas(w, h);
  layer1 = new Riso("sunflower");

  // load pH data (only to find 1985 / be consistent with main sketch)
  for (let r = 0; r < table1.getRowCount(); r++) {
    let dateStr = table1.getString(r, "date");
    let phStr = table1.getString(r, "ph");
    if (!dateStr || !phStr) continue;

    let year = int(dateStr.substring(0, 4));
    let ph = float(phStr);

    if (!isNaN(year) && !isNaN(ph)) {
      phData1.push({ year, ph });
    }
  }

  phData1.sort((a, b) => a.year - b.year);
}

function windowResized() {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  resizeCanvas(w, h);
}

function draw() {
  clearRiso();
  background(245);

  if (phData1.length === 0) {
    drawRiso();
    return;
  }

  // baseline position
  let baseX = width * 0.5;
  let baseY = height * 0.5;
 const maxR = Math.max(width, height) * 0.7; // very large radius

  // apply fade to layer1 strokes via alpha factor in drawShellBaseline
  drawShellBaseline(layer1, baseX, baseY, 260, 0.55, 0.0, 0.0, 1.9);


 if (window.parent) {
    window.parent.postMessage(
      {
        type: "shell-progress",
        progress: tProgress, // 0..1
      },
      "*"
    );
  }


  drawRiso();

  // label
//  noStroke();
  fill(40);
  textAlign(CENTER, TOP);
  textSize(18);
 /* text("Baseline shell (1985)", baseX, baseY + 260 + 40); */
}

// mouse wheel controls how much of the shell is drawn and how visible it is
function mouseWheel(event) {
  let step = 0.0015;          // speed of growth
  let delta = event.delta * step;

  // scroll down → progress forward (larger tProgress), scroll up → back
  tProgress += delta;
  tProgress = constrain(tProgress, 0, 1);

  // fade ties to progress
  fade = map(tProgress, 0, 1, 0, 255);
}

// Baseline shell for layer1 only
function drawShellBaseline(
  layer,
  cx,
  cy,
  maxR,
  thickness,
  acidity,   // keep for compatibility, always 0 here
  wobbleAmp,
  spiralExp
) {
  layer.push();
  layer.translate(cx, cy);
  layer.noFill();
  layer.strokeWeight(2);

  let bands = 16;
  let turns = 12.7;
  let maxAngle = TWO_PI * turns;

  let effectiveThickness = thickness * lerp(1.0, 0.9, acidity);

  for (let b = 0; b < bands; b++) {
    let bt = b / (bands - 1);
    let rBase = lerp(maxR * (1 - effectiveThickness), maxR, bt);
    let rInner = rBase - maxR * effectiveThickness * 0.89;

    // alpha includes global fade
    let alpha = lerp(35, 230, bt) * (fade / 255.0);
    layer.stroke(255, alpha);

    let steps = 200;
    layer.beginShape();
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;

      // only draw up to tProgress
      if (t > tProgress) break;

      let angle = t * maxAngle;

      // original power-law spiral radius
      let spiralR = maxR * pow(t, spiralExp);

      let localR = lerp(rInner, rBase, t);
      let totalR = spiralR + localR * 0.35;

      let baseWobble = map(noise(bt * 1.2, t * 3.1), 0, 1, -2, 2);
      let extraWobble = map(noise(bt * 4.0, t * 7.0), 0, 1, -1, 1) * wobbleAmp;
      let wobble = baseWobble + extraWobble;

      let r = totalR + wobble;

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

      window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "reset-shell") return;
  resetShell();
});
