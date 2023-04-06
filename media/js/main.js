const main = () => {
    const image = document.querySelector("#bg-img");
    const pseudonym = document.querySelector(".pseudonym");

    if (image.complete) 
        return;

    image.classList.add("to-reveal");
    pseudonym.classList.add("to-reveal");

    let counter = 0;

    const reveal = () => {
        if (++counter < 2) return;

        image.classList.add("revealed");
        pseudonym.classList.add("revealed");
    }

    image.onload = reveal;
    setInterval(reveal, 500);
}

document.addEventListener("DOMContentLoaded", main);