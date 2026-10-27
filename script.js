const openingScreen = document.getElementById("openingScreen");
const openingFrame = document.getElementById("openingFrame");
const openingDescription = document.getElementById("openingDescription");
const enterGallery = document.getElementById("enterGallery");
const backToOpening = document.getElementById("backToOpening");

const frames = document.querySelectorAll(".pile .frame");

const lightbox = document.getElementById("lightbox");
const enlargedImage = document.getElementById("enlargedImage");
const zoomArea = document.getElementById("zoomArea");
const closeButton = document.getElementById("close");
const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");

let zoom = 1;
let activeFrame = null;
let highestLayer = 30;
let hideTimer = null;

// OPENING FRAME: FIRST CLICK ZOOMS IN AND REVEALS TEXT
openingScreen.addEventListener("click", function (event) {
    if (event.target.closest("button")) return;

    if (!openingScreen.classList.contains("zoomed")) {
        openingScreen.classList.add("zoomed");
    }
});

// ENTER THE PHOTO PILE
enterGallery.addEventListener("click", function () {
    openingScreen.classList.add("leaving");

    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
        openingScreen.style.display = "none";
    }, 850);
});

// GO BACK TO THE OPENING PAGE
backToOpening.addEventListener("click", function (event) {
    event.preventDefault();

    // cancel the pending "hide" from entering the gallery
    clearTimeout(hideTimer);

    // make the screen exist again, with the description already showing
    openingScreen.style.display = "block";
    openingScreen.classList.add("zoomed");

    // let the browser register the change, then fade back in
    void openingScreen.offsetWidth;
    openingScreen.classList.remove("leaving");

    // start the text at the top
    openingFrame.scrollTop = 0;
});

// MAKE ALL FRAMES MOVABLE
frames.forEach(function (frame) {
    let pointerDown = false;
    let moved = false;
    let suppressClick = false;

    let startX = 0;
    let startY = 0;
    let originalX = 0;
    let originalY = 0;

    frame.addEventListener("pointerdown", function (event) {
        if (event.button !== 0) return;

        pointerDown = true;
        moved = false;
        suppressClick = false;

        startX = event.clientX;
        startY = event.clientY;

        originalX = parseFloat(frame.style.getPropertyValue("--drag-x")) || 0;
        originalY = parseFloat(frame.style.getPropertyValue("--drag-y")) || 0;

        highestLayer++;
        frame.style.zIndex = highestLayer;

        frame.classList.add("dragging");
        frame.setPointerCapture(event.pointerId);
    });

    frame.addEventListener("pointermove", function (event) {
        if (!pointerDown) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            moved = true;
        }

        if (moved) {
            frame.style.setProperty("--drag-x", `${originalX + dx}px`);
            frame.style.setProperty("--drag-y", `${originalY + dy}px`);
        }
    });

    function finishDragging() {
        if (!pointerDown) return;

        pointerDown = false;
        frame.classList.remove("dragging");

        if (moved) {
            suppressClick = true;
        }
    }

    frame.addEventListener("pointerup", finishDragging);
    frame.addEventListener("pointercancel", finishDragging);

    // A DRAG MOVES THE FRAME; A CLICK OPENS THE PHOTO
    frame.addEventListener("click", function () {
        if (suppressClick) {
            suppressClick = false;
            return;
        }

        openPhoto(frame);
    });
});

// OPEN THE ENLARGED PHOTO VIEWER
function openPhoto(frame) {
    activeFrame = frame;

    const image = frame.querySelector("img");

    enlargedImage.src = image.src;
    enlargedImage.alt = image.alt;

    zoom = 1;
    updateZoom();

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

// CLOSE THE VIEWER
function closePhoto() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

closeButton.addEventListener("click", closePhoto);

lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
        closePhoto();
    }
});

// ZOOM IN AND OUT
function updateZoom() {
    enlargedImage.style.transform = `scale(${zoom})`;
}

zoomInButton.addEventListener("click", function () {
    zoom = Math.min(zoom + 0.25, 4);
    updateZoom();
});

zoomOutButton.addEventListener("click", function () {
    zoom = Math.max(zoom - 0.25, 1);
    updateZoom();
});

// SCROLL TO ZOOM
zoomArea.addEventListener("wheel", function (event) {
    event.preventDefault();

    if (event.deltaY < 0) {
        zoom = Math.min(zoom + 0.15, 4);
    } else {
        zoom = Math.max(zoom - 0.15, 1);
    }

    updateZoom();
}, { passive: false });

// ESCAPE CLOSES THE VIEWER
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closePhoto();
    }
});