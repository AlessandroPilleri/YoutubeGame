let context = new AudioContext();
let analyser = context.createAnalyser();

let frequencyData = new Uint8Array(analyser.frequencyBinCount);
console.log(frequencyData);

