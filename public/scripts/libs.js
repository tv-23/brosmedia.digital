// Import CSS (optional if not handled elsewhere)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css";
import "swiper/css";

// Import JS libraries
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Bootstrap JS
import AOS from "aos"; // Animate on Scroll
import PureCounter from "@srexi/purecounterjs"; // Animated counters
import Swiper from "swiper"; // Slider/carousel

// Expose to window if you want global access (optional)
window.AOS = AOS;
window.PureCounter = PureCounter;
window.Swiper = Swiper;

// Initialize libraries
document.addEventListener("DOMContentLoaded", () => {
  // Animate on Scroll
  AOS.init();

  // PureCounter
  new PureCounter();

  // Example Swiper init (change selector to your HTML slider)
  const swiperElements = document.querySelectorAll(".swiper");
  swiperElements.forEach((el) => {
    new Swiper(el, {
      loop: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
  });
});
