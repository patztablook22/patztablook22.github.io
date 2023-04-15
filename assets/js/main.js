const main = () => {
    const image = document.querySelector("#bg-img");
    const pseudonym = document.querySelector(".pseudonym");


    if (image.complete) {
        image.classList.remove("unrevealed");
        pseudonym.classList.remove("unrevealed");
        return;
    }

    image.classList.add("to-reveal");
    pseudonym.classList.add("to-reveal");

    let counter = 0;

    const reveal = () => {
        if (++counter < 2) return;

        image.classList.remove("unrevealed");
        pseudonym.classList.remove("unrevealed");
    }

    image.onload = reveal;
    setInterval(reveal, 500);
}

document.addEventListener("DOMContentLoaded", main);
