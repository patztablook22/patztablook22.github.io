const main = () => {
    const image = document.querySelector("#bg-img");
    const pseudonym = document.querySelector(".pseudonym");

    if (image.complete) 
        return;

    image.classList.add("to-reveal");
    pseudonym.classList.add("to-reveal");

    const reveal = () => {
        image.classList.add("revealed");
        pseudonym.classList.add("revealed");
    }

    image.onload = reveal;
}

document.addEventListener("DOMContentLoaded", main);
