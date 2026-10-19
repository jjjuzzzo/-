/**
 * Main Client Scripts for PC Repair & Tech Service Website
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initActiveNavLink();
  initCategoryFilters();
  initPricingCalculator();
  initContactForms();
  initFaqAccordion();
  initModalWindow();
  checkPrefilledCalculatorService();
});

/**
 * Mobile Navigation Menu
 */
function initMobileNavigation() {
  const burgerButton = document.getElementById("burgerButton");
  const mainNav = document.getElementById("mainNav");

  if (!burgerButton || !mainNav) return;

  burgerButton.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    const isOpen = mainNav.classList.contains("open");
    burgerButton.setAttribute("aria-expanded", isOpen.toString());
  });

  // Close navigation menu when a link is clicked
  const navLinks = mainNav.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      burgerButton.setAttribute("aria-expanded", "false");
    });
  });
}

/**
 * Mark Current Navigation Link as Active
 */
function initActiveNavLink() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href").toLowerCase();
    const isCurrent =
      currentPath.endsWith(linkHref) ||
      (currentPath.endsWith("/") && linkHref === "index.html") ||
      (currentPath === "" && linkHref === "index.html");

    if (isCurrent) {
      link.classList.add("active");
    }
  });
}

/**
 * Services Page Category Filter
 */
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll(".service-card[data-category]");

  if (filterButtons.length === 0 || serviceCards.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.getAttribute("data-filter");

      serviceCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        if (selectedCategory === "all" || cardCategory === selectedCategory) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/**
 * Interactive Price Calculator
 */
function initPricingCalculator() {
  const calcForm = document.getElementById("pricingCalculator");
  if (!calcForm) return;

  const deviceSelect = document.getElementById("calcDeviceType");
  const checkboxes = calcForm.querySelectorAll(".calc-service-cb");
  const totalDisplay = document.getElementById("calcTotalAmount");
  const breakdownList = document.getElementById("calcBreakdownList");
  const orderWithCalcBtn = document.getElementById("orderWithCalcBtn");

  function recalculate() {
    let total = 0;
    const selectedItems = [];

    // Device base fee (e.g., laptops/all-in-one might have a small disassembly multiplier/fee)
    if (deviceSelect) {
      const selectedOption = deviceSelect.options[deviceSelect.selectedIndex];
      const deviceFee = parseInt(selectedOption.getAttribute("data-fee") || "0", 10);
      if (deviceFee > 0) {
        total += deviceFee;
        selectedItems.push({
          title: `Сложность (${selectedOption.text})`,
          price: deviceFee,
        });
      }
    }

    checkboxes.forEach((cb) => {
      if (cb.checked) {
        const price = parseInt(cb.getAttribute("data-price") || "0", 10);
        const title = cb.getAttribute("data-title") || "Услуга";
        total += price;
        selectedItems.push({ title, price });
      }
    });

    if (totalDisplay) {
      totalDisplay.textContent = `${total.toLocaleString("ru-RU")} ₽`;
    }

    if (breakdownList) {
      breakdownList.innerHTML = "";
      if (selectedItems.length === 0) {
        breakdownList.innerHTML =
          '<div class="summary-row"><span>Услуги не выбраны</span><span>0 ₽</span></div>';
      } else {
        selectedItems.forEach((item) => {
          const row = document.createElement("div");
          row.className = "summary-row";
          row.innerHTML = `<span>${item.title}</span><strong>${item.price.toLocaleString(
            "ru-RU"
          )} ₽</strong>`;
          breakdownList.appendChild(row);
        });
      }
    }

    return { total, selectedItems };
  }

  // Event listeners
  if (deviceSelect) {
    deviceSelect.addEventListener("change", recalculate);
  }

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", recalculate);
  });

  if (orderWithCalcBtn) {
    orderWithCalcBtn.addEventListener("click", () => {
      const { total, selectedItems } = recalculate();
      if (selectedItems.length === 0) {
        alert("Пожалуйста, выберите хотя бы одну услугу для оформления заявки.");
        return;
      }

      const summaryText = selectedItems
        .map((item) => `${item.title} (${item.price} руб.)`)
        .join(", ");
      localStorage.setItem("pcRepairCalcSelected", summaryText);
      localStorage.setItem("pcRepairCalcTotal", total.toString());

      window.location.href = "contacts.html?from=calc";
    });
  }

  recalculate();
}

/**
 * Check if User came from Calculator with Pre-selected Items
 */
function checkPrefilledCalculatorService() {
  const currentPath = window.location.pathname.toLowerCase();
  if (!currentPath.includes("contacts")) return;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("from") === "calc") {
    const savedServices = localStorage.getItem("pcRepairCalcSelected");
    const savedTotal = localStorage.getItem("pcRepairCalcTotal");
    const problemInput = document.getElementById("issueDescription");

    if (savedServices && problemInput) {
      problemInput.value = `Расчет из калькулятора (примерно ${savedTotal} ₽):\n${savedServices}`;
      localStorage.removeItem("pcRepairCalcSelected");
      localStorage.removeItem("pcRepairCalcTotal");
    }
  }
}

/**
 * FAQ Accordion Toggle
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length === 0) return;

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close other opened FAQs
      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove("active");
      });

      if (!isActive) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  });
}

/**
 * Contact and Booking Form Submissions
 */
function initContactForms() {
  const forms = document.querySelectorAll(".ajax-form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = form.querySelector('input[name="clientName"]');
      const phoneInput = form.querySelector('input[name="clientPhone"]');

      if (!nameInput || !nameInput.value.trim()) {
        alert("Пожалуйста, введите ваше имя.");
        return;
      }

      const cleanPhone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
      if (cleanPhone.length < 10) {
        alert("Пожалуйста, введите корректный номер телефона (не менее 10 цифр).");
        return;
      }

      // Simulate successful network submission
      showSuccessModal(nameInput.value.trim());
      form.reset();
    });
  });
}

/**
 * Success Modal Management
 */
function initModalWindow() {
  const modal = document.getElementById("successModal");
  if (!modal) return;

  const closeBtn = document.getElementById("closeModalBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      hideModal();
    }
  });
}

function showSuccessModal(clientName) {
  const modal = document.getElementById("successModal");
  const modalText = document.getElementById("modalTextContent");
  if (!modal) return;

  if (modalText && clientName) {
    modalText.textContent = `${clientName}, ваша заявка успешно зарегистрирована. Дежурный мастер свяжется с вами в течение 10 минут для уточнения деталей.`;
  }

  modal.classList.add("active");
}

function hideModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.classList.remove("active");
  }
}
