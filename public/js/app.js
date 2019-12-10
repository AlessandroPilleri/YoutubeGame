const url = document.querySelector('#url');
const start = document.querySelector('#start');
const audioTag = document.querySelector('#audio');
const canvas = document.querySelector('#canvas');
const fps = document.querySelector('#fps');


start.addEventListener('click', () => {
    let tmp = url.value.split('?');
    console.log(tmp);
    let videoId = tmp[1];
    console.log(videoId);

    audioTag.innerHTML = "<source src=\"/bcgaudio?" + videoId + "\" type=\"audio/mp3\">";

    let context = new AudioContext();
    let analyser = context.createAnalyser();
    analyser.fftSize = 32;
    console.log(analyser.frequencyBinCount);

    let frequencyData = new Uint8Array(analyser.frequencyBinCount);
    console.log(frequencyData.length);
    let w = 1000/frequencyData.length;
    let precedentFrequency = new Uint8Array(frequencyData);
    let content = canvas.getContext('2d');

    let world = planck.World();
    console.log(world);

    let bars = [];
    for (let index = 0; index < frequencyData.length; index++) {
        let body = world.createBody({
            type: 'dynamic',
            position: planck.Vec2(w/2 + index*w, 0)
        });
        body.createFixture({
            shape: planck.Box(w/2, 400/2)
        });

        bars.push(body);
    }

    console.log(bars.length);

    let x = false;
    let start = -1;
    let count = 0;
    function update() {
        let now = new Date().getTime();
        if (start === -1) {
            start = now;
        }
        let delta = now - start;
        start = now;
        analyser.getByteFrequencyData(frequencyData);
        content.clearRect(0, 0, 1000, 400);
        content.fillStyle = 'black';
        content.fillRect(0, 0, 1000, 400);

        for (let index = 0; index < frequencyData.length; index++) {
            let direction = frequencyData[index] - precedentFrequency[index];
            let f = bars[index].getWorldVector(planck.Vec2(0, direction * 1000));
            let p = bars[index].getWorldPoint(planck.Vec2(0, 0));
            bars[index].applyLinearImpulse(f, p, true);
            let fixture = bars[index].getFixtureList();
            content.beginPath();
            fixture.m_shape.m_vertices.forEach( (vertex) => {
                content.lineTo(vertex.x + bars[index].getPosition().x, 400 - vertex.y - bars[index].getPosition().y);

            });
            content.strokeStyle = "red";
            content.lineWidth = "2";
            content.stroke();
            content.closePath();
            precedentFrequency[index] = frequencyData[index];
        }
        world.step(delta);
        count++;
        requestAnimationFrame(update);
    }

    audioTag.addEventListener('canplay', () => {
        let source = context.createMediaElementSource(audioTag);
        source.connect(analyser);
        analyser.connect(context.destination);
        update();
        setInterval( () => {
            fps.innerHTML = count;
            count = 0;
        }, 1000)
    })
});