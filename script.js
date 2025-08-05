const products = [
  { id: 1, name: "Product 1", price: 1000, img: "assets/photo/photo1.jpg" },
  { id: 2, name: "Product 2", price: 800, img: "assets/photo/photo2.jpg" },
  { id: 3, name: "Product 3", price: 900, img: "assets/photo/photo3.jpg" },
  { id: 4, name: "Product 4", price: 700, img: "assets/photo/photo4.jpg" },
  { id: 5, name: "Product 5", price: 650, img: "assets/photo/photo5.jpg" },
  { id: 6, name: "Product 6", price: 950, img: "assets/photo/photo6.jpg" },
];

const productGrid = document.getElementById("productGrid");
const selectedList = document.getElementById("selectedList");
const progressBar = document.querySelector(".progress-bar");
const progressText = document.querySelector(".progress-text");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const addToCartBtn = document.getElementById("addToCart");

let selected = [];

function renderProducts() {
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <button class="add-btn" data-id="${p.id}">Add to Bundle</button>
    `;
    productGrid.appendChild(card);
  });

  bindButtons();
}

function bindButtons() {
  const buttons = document.querySelectorAll(".add-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = +btn.dataset.id;
      const prod = products.find((p) => p.id === id);
      const exists = selected.find((s) => s.id === id);

      if (!exists) {
        selected.push(prod);
        btn.classList.add("active");
        btn.textContent = "Added ✓";
      } else {
        selected = selected.filter((s) => s.id !== id);
        btn.classList.remove("active");
        btn.textContent = "Add to Bundle";
      }

      updateSidebar();
    });
  });
}

function updateSidebar() {
  selectedList.innerHTML = "";
  let subtotal = 0;

  selected.forEach((item) => {
    subtotal += item.price;
    const div = document.createElement("div");
    div.className = "selected-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <span>${item.name} - ₹${item.price}</span>
    `;
    selectedList.appendChild(div);
  });

  const discount = selected.length >= 3 ? Math.floor(subtotal * 0.3) : 0;
  const total = subtotal - discount;

  progressText.textContent = `${selected.length} / 3 Selected`;
  progressBar.style.width = `${Math.min((selected.length / 3) * 100, 100)}%`;

  subtotalEl.textContent = subtotal;
  discountEl.textContent = discount;
  totalEl.textContent = total;

  if (selected.length >= 3) {
    addToCartBtn.classList.add("active");
    addToCartBtn.disabled = false;
  } else {
    addToCartBtn.classList.remove("active");
    addToCartBtn.disabled = true;
  }
}

addToCartBtn.addEventListener("click", () => {
  if (selected.length >= 3) {
    console.log("Selected bundle:", selected);
    alert("Bundle added! Check console.");
  }
});

renderProducts();
