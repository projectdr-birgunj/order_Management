window.addEventListener("load", () => {
  const numDots = 150; // Total number of dots
  const background = document.getElementById("background-dots");

  for (let i = 0; i < numDots; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";

    // Randomize position
    const x = Math.random() * 100; // Random x-position (0-100%)
    const y = Math.random() * 100; // Random y-position (0-100%)
    dot.style.left = `${x}vw`;
    dot.style.top = `${y}vh`;

    // Randomize animation duration and delay
    const duration = Math.random() * 3 + 1; // Duration between 2s and 5s
    const delay = Math.random() * 0.5; // Delay between 0s and 3s
    dot.style.animationDuration = `${duration}s`;
    dot.style.animationDelay = `${delay}s`;

    // Randomize dot size
    const size = Math.random() * 2; // Size between 2px and 5px
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;

    background.appendChild(dot);
  }
});
