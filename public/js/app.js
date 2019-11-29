const url = document.querySelector('#url');
const start = document.querySelector('#start');
const audioTag = document.querySelector('#audio');
const canvas = document.querySelector('#canvas');

start.addEventListener('click', () => {
    let tmp = url.value.split('?');
    console.log(tmp);
    let videoId = tmp[1];
    console.log(videoId);

    audioTag.innerHTML = "<source src=\"/bcgaudio?" + videoId + "\" type=\"audio/mp3\">";

    let context = new AudioContext();
    let analyser = context.createAnalyser();

    let frequencyData = new Uint8Array(analyser.frequencyBinCount);
    let content = canvas.getContext('2d');

    function update() {
        requestAnimationFrame(update);
        analyser.getByteFrequencyData(frequencyData);
        let w = 400/frequencyData.length;

        content.clearRect(0, 0, 400, 400);
        content.fillStyle = 'black';
        content.fillRect(0, 0, 400, 400);
        for (let index = 0; index < frequencyData.length; index++) {
            content.fillStyle = 'red';
            content.fillRect(index * w, 0, w, frequencyData[index]);
        }
    }

    audioTag.addEventListener('canplay', () => {
        let source = context.createMediaElementSource(audioTag);
        source.connect(analyser);
        analyser.connect(context.destination);
        update();
    })
});