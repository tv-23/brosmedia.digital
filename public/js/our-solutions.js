document.addEventListener("DOMContentLoaded", function () {
    const cardItems = document.querySelectorAll(".desktop-layout .card-item");
    const dots = document.querySelectorAll(".dot");
    const displayImage = document.getElementById("displayImage");
    const endMessage = document.getElementById("endMessage");

    // Image sources for each card
    const imageSources = [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=799&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=812&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    ];

    let currentIndex = 0;
    const totalItems = cardItems.length;
    let atLastCard = false;

    // Function to update the display based on current index
    function updateDisplay() {
      // Update active card
      cardItems.forEach((item, index) => {
        if (index === currentIndex) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // Update image
      displayImage.style.opacity = 0;
      setTimeout(() => {
        displayImage.src = imageSources[currentIndex];
        displayImage.style.opacity = 1;
      }, 200);

      // Update dots
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    // Mouse wheel navigation
    let lastScrollTime = 0;
    const scrollDelay = 300; // milliseconds

    // Listen on the whole window
    window.addEventListener(
      "wheel",
      function (e) {
        const desktopLayout = document.querySelector(".desktop-layout");
        if (!desktopLayout) return;

        // Only apply if mouse is over the desktop layout
        const rect = desktopLayout.getBoundingClientRect();
        if (
          e.clientY < rect.top ||
          e.clientY > rect.bottom ||
          e.clientX < rect.left ||
          e.clientX > rect.right
        )
          return;

        const now = Date.now();
        if (now - lastScrollTime < scrollDelay) return;
        lastScrollTime = now;

        e.preventDefault();

        if (e.deltaY < 0) {
          // Scroll up
          if (currentIndex > 0) {
            currentIndex--;
            updateDisplay();
          }
        } else {
          // Scroll down
          if (currentIndex < totalItems - 1) {
            currentIndex++;
            updateDisplay();
          }
        }
      },
      { passive: false },
    );

    // Click on card to navigate
    cardItems.forEach((card, index) => {
      card.addEventListener("click", function () {
        currentIndex = index;
        updateDisplay();
      });
    });

    // Click on dots to navigate
    dots.forEach((dot, index) => {
      dot.addEventListener("click", function () {
        currentIndex = index;
        updateDisplay();
      });
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        currentIndex = Math.max(0, currentIndex - 1);
        updateDisplay();
      } else if (e.key === "ArrowDown") {
        if (currentIndex < totalItems - 1) {
          currentIndex = Math.min(totalItems - 1, currentIndex + 1);
          updateDisplay();
        }
      }
    });


    // Initialize display
    if (cardItems.length > 0) {
      updateDisplay();
    }
  });