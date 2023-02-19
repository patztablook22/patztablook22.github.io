function Animation(element) {
    this.element = element;
    this.content = element.innerHTML;

    this.tick = () => {
        let length = this.element.innerHTML.length;
        let index = Math.floor(Math.random() * length);
        let width = 3;
        for (let i = index; i < index + width; i++) {
            if (this.content[i] == '\n') {
                index += width;
                break;
            }
        }

        this.element.innerHTML = this.content.substring(0, index + width) + this.content.substring(index, this.content.length);
    }
}

const main = () => {
    let toAnimate0 = document.getElementById("to-animate0");
    let toAnimate1 = document.getElementById("to-animate1");
    let toAnimate2 = document.getElementById("to-animate2");
    let animation0 = new Animation(toAnimate0);
    let animation1 = new Animation(toAnimate1);
    let animation2 = new Animation(toAnimate1);

    window.setInterval(() => {
        animation0.tick();
        animation1.tick();
        animation2.tick();
    }, 250);
}

window.onload = main;
