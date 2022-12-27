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
    let toAnimate = document.getElementById("to-animate");
    let animation = new Animation(toAnimate);
    window.setInterval(animation.tick, 200);
}

window.onload = main;
