const initSlider = () => {
    const imageList = document.querySelector(".sliding-wrapper .image-list");
    const slideButtons = document.querySelectorAll(".sliding-wrapper .slide-button");

    // Klone die Bilderliste, um eine Endlosschleife zu simulieren
    const imageItems = imageList.innerHTML;
    imageList.innerHTML += imageItems;  // Bildliste duplizieren

    // Funktion zum Scrollen der Bildliste
    const scrollImages = (direction) => {
        const scrollAmount = imageList.clientWidth * direction;
        imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    // Slide images according to the slide button clicks
    slideButtons.forEach(button => {
        button.addEventListener("click", () => {
            const direction = button.id === "prev-slide" ? -1 : 1;
            scrollImages(direction);
        });
    });


    // Reset scroll position to create endless loop effect
    imageList.addEventListener("scroll", () => {
        if (imageList.scrollRight >= imageList.scrollWidth / 2) {
            imageList.scrollRight = 0;
        } else if (imageList.scrollRight === 0) {
            imageList.scrollRight = imageList.scrollWidth / 2;
        }
    });

};

window.addEventListener("load", initSlider);
