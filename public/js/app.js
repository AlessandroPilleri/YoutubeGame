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
    let w = 4000/(frequencyData.length/1.5);
    let precedentFrequency = new Uint8Array(frequencyData);
    console.log(precedentFrequency);
    let content = canvas.getContext('2d');

    let world = planck.World();
    console.log(world);

    let bars = [];
    for (let index = 0; index < frequencyData.length/1.5; index++) {
        let body = world.createBody({
            type: 'dynamic',
            position: planck.Vec2(index*w*2, 0)
        });
        body.createFixture({
            shape: planck.Box(w, 400/2)
        });

        bars.push(body);
    }

    console.log(bars.length);

    let x = false;
    let start = -1;

    function update() {
        let now = new Date().getTime();
        if (start === -1) {
            start = now;
        }
        let delta = now - start;
        start = now;
        analyser.getByteFrequencyData(frequencyData);
        content.clearRect(0, 0, 4000, 400);
        content.fillStyle = 'black';
        content.fillRect(0, 0, 4000, 400);

        for (let index = 0; index < frequencyData.length/1.5; index++) {

            let direction = frequencyData[index] - precedentFrequency[index];
            let f = bars[index].getWorldVector(planck.Vec2(0, direction * 1000));
            let p = bars[index].getWorldPoint(planck.Vec2(0, 0));
            bars[index].applyLinearImpulse(f, p, true);
            precedentFrequency[index] = frequencyData[index];
        }
        world.step(delta);

        for (let body = world.getBodyList(); body; body = body.getNext()) {
            for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                content.beginPath();
                fixture.m_shape.m_vertices.forEach( (vertex) => {
                    content.lineTo(vertex.x + body.getPosition().x, 400 - vertex.y - body.getPosition().y);

                });
                content.strokeStyle = "red";
                content.lineWidth = "2";
                content.stroke();
                content.closePath();

                if (body.getPosition().y > 400) {
                    console.log(body.getPosition());
                    x = true;
                }
            }
        }
        requestAnimationFrame(update);
    }

    audioTag.addEventListener('canplay', () => {
        let source = context.createMediaElementSource(audioTag);
        source.connect(analyser);
        analyser.connect(context.destination);
        update();
    })
});