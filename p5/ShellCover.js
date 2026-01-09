let inks = [
"blue",
"green",
"yellow",
"red",
"fluorescentorange",
"fluorescentpink",
"teal",
"aqua",
"flatgold",
"sunflower"
];


let layers = [];
let shells = [];


function setup() {
const w = document.documentElement.clientWidth;
const h = document.documentElement.clientHeight;
createCanvas(w, h);
pixelDensity(1);
// ...



// one Riso layer per ink
for (let i = 0; i < inks.length; i++) {
layers.push(new Riso(inks[i]));
}


function windowResized() {
const w = document.documentElement.clientWidth;
const h = document.documentElement.clientHeight;
resizeCanvas(w, h);
}


// generate shell instances
let shellCount = 1;
for (let i = 0; i < shellCount; i++) {
let layer = random(layers);
let cx = random(width * -0.1, width * 0.9);
let cy = random(height * -0.1, height * 1.1);


text
let maxR = random(160, 360);
let thickness = random(0.45, 0.62);


let acidity = random(0.0, 1.0);
let wobbleAmp = lerp(1, 4.5, acidity);
let phase = random(TWO_PI);
let spiralExp = lerp(1.85, 2.1, acidity);
let warpAmount = lerp(0.0, 0.08, acidity);


let rotation = random(TWO_PI);
let strokeW = random(1.4, 2.6);


shells.push({
layer,
cx,
cy,
maxR,
thickness,
acidity,
wobbleAmp,
phase,
spiralExp,
warpAmount,
rotation,
strokeW
});
}


noLoop();
}


function draw() {
clearRiso();
background(20);


// large faint shells in the background
for (let i = 0; i < 10; i++) {
let layer = random(layers);
let cx = random(width);
let cy = random(height);
let maxR = random(20, 680);
let thickness = random(0.45, 0.58);
let acidity = random(0.1, 0.7);
let wobbleAmp = lerp(1, 3.5, acidity);
let phase = random(TWO_PI);
let spiralExp = lerp(1.9, 2.05, acidity);
let warpAmount = lerp(0.0, 0.08, acidity);



layer.push();
layer.translate(cx, cy);
layer.rotate(random(TWO_PI));
layer.strokeWeight(1);
drawShellShape(layer, 0, 0, maxR, thickness, acidity, wobbleAmp, phase, spiralExp, warpAmount);
layer.pop();
}


// foreground shells
for (let s of shells) {
s.layer.push();
s.layer.translate(s.cx, s.cy);
s.layer.rotate(s.rotation);
s.layer.strokeWeight(s.strokeW);
drawShellShape(
s.layer,
0,
0,
s.maxR,
s.thickness,
s.acidity,
s.wobbleAmp,
s.phase,
s.spiralExp,
s.warpAmount
);
s.layer.pop();
}


// draw all riso layers to the main canvas
drawRiso();


/* optional title band on main canvas
push();
noStroke();
fill(255);
rect(0, 0, width, 140);
fill(0);


pop();
*/
}



// shell drawing helper
function drawShellShape(layer, cx, cy, maxR, thickness, acidity, wobbleAmp, phase, spiralExp, warpAmount) {
layer.push();
layer.translate(cx, cy);
layer.noFill();
layer.stroke(255);


let bands = 15;
let turns = 12.7;
let maxAngle = TWO_PI * turns;


let effectiveThickness = thickness * lerp(1.0, 0.9, acidity);


for (let b = 0; b < bands; b++) {
let bt = b / (bands - 1);
let rBase = lerp(maxR * (1 - effectiveThickness), maxR, bt);
let rInner = rBase - maxR * effectiveThickness * 0.89;


text
let alpha = lerp(35, 255, bt);
layer.stroke(255, alpha);


let steps = 220;
layer.beginShape();
for (let i = 0; i <= steps; i++) {
let t = i / steps;
let angle = t * maxAngle;


let spiralR = maxR * pow(t, spiralExp);
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
