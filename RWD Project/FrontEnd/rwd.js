 // All interactive code inside a single DOMContentLoaded handler (no duplicates)
  document.addEventListener('DOMContentLoaded', function () {
    // Utilities
    function parsePrice(price) {
      if (typeof price === 'number') return price;
      return Number(String(price).replace(/[^0-9.-]+/g, '')) || 0;
    }

    function formatINR(amount) {
      return '₹' + Number(amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    // persist cart locally
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// optional helper to load (already done inline but useful to have)
function loadCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}


    // State
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Elements
    const cartButton = document.getElementById('cartButton');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartCountEl = document.getElementById('cartCount');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Auth elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const authModal = document.getElementById('authModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const toggleAuth = document.getElementById('toggleAuth');
    const authTitle = document.getElementById('authTitle');
    const authForm = document.getElementById('authForm');

    // Search & category
    const searchBar = document.getElementById('searchBar');
    const categoryButtons = document.querySelectorAll('#products .category-filter [data-filter]');
    const productCards = document.querySelectorAll('.product-card');
    let selectedCategory = 'all';

    // Save and load
    fetch("http://localhost:5000/cart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user_id: 1, product_id: 2, quantity: 1 })
}).then(res => res.json()).then(data => console.log("Cart updated:", data));


    // Cart UI
    function updateCartUI() {
      cartItemsEl.innerHTML = '';
      if (!cart.length) {
        cartItemsEl.innerHTML = '<p class="text-center">Your cart is empty</p>';
        cartTotalEl.textContent = 'Total: ₹0.00';
        cartCountEl.textContent = '0';
        return;
      }

      let total = 0;
      cart.forEach((item) => {
        const itemPrice = parsePrice(item.price);
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        const itemNode = document.createElement('div');
        itemNode.className = 'cart-item';
        itemNode.innerHTML = `
          <img src="${item.image}" class="cart-item-img" alt="${item.name}">
          <div class="cart-item-details">
            <h6>${item.name}</h6>
            <p class="cart-item-price">${formatINR(itemPrice)}</p>
            <p>Qty: <button class="btn btn-sm btn-outline-secondary decrease" data-id="${item.id}">-</button>
            <span class="mx-2">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary increase" data-id="${item.id}">+</button></p>
            <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">Remove</button>
          </div>
        `;
        cartItemsEl.appendChild(itemNode);
      });

      cartTotalEl.textContent = 'Total: ' + formatINR(total);
      cartCountEl.textContent = cart.reduce((acc, it) => acc + it.quantity, 0);
      saveCart();
    }

    // Add to cart handler
    function addToCart(id, name, price, image) {
      const parsedPrice = parsePrice(price);
      const existing = cart.find(i => i.id === id);
      if (existing) existing.quantity += 1;
      else cart.push({ id, name, price: parsedPrice, image, quantity: 1 });
      updateCartUI();
    }

    // Wire up add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = this.dataset.price;
        const image = this.dataset.image;
        addToCart(id, name, price, image);
        // optional: open cart
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
      });
    });

    // Cart sidebar open/close
    cartButton.addEventListener('click', function (e) {
      e.preventDefault();
      cartSidebar.classList.add('open');
      cartOverlay.classList.add('open');
    });
    closeCartBtn.addEventListener('click', function () { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); });
    cartOverlay.addEventListener('click', function () { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); });

    // Cart actions (delegate)
    cartItemsEl.addEventListener('click', function (e) {
      const id = e.target.getAttribute('data-id');
      if (!id) return;
      const itemIndex = cart.findIndex(i => i.id === id);
      if (itemIndex === -1) return;

      if (e.target.classList.contains('increase')) {
        cart[itemIndex].quantity += 1;
        updateCartUI();
      }
      if (e.target.classList.contains('decrease')) {
        if (cart[itemIndex].quantity > 1) cart[itemIndex].quantity -= 1;
        else cart.splice(itemIndex, 1);
        updateCartUI();
      }
      if (e.target.classList.contains('remove-item')) {
        cart.splice(itemIndex, 1);
        updateCartUI();
      }
    });

    // Checkout (simple example)
    checkoutBtn.addEventListener('click', function () {
      if (!cart.length) { alert('Your cart is empty'); return; }
      alert('Checkout — total ' + cartTotalEl.textContent);
      // clear cart for demo
      cart = [];
      updateCartUI();
      cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open');
    });

    // Initialize cart UI
    updateCartUI();

    // Search and category filter
    function filterProducts() {
      const search = (searchBar.value || '').toLowerCase();
      productCards.forEach(card => {
        const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const categoryMatch = selectedCategory === 'all' || card.dataset.category === selectedCategory;
        const searchMatch = title.includes(search);
        card.style.display = (categoryMatch && searchMatch) ? 'block' : 'none';
      });
    }

    // Category buttons
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        selectedCategory = this.dataset.filter;
        categoryButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterProducts();
      });
    });

    searchBar.addEventListener('input', filterProducts);

    // Auth modal handlers
    function openModal(mode) {
      authModal.style.display = 'block';
      modalOverlay.style.display = 'block';
      authTitle.textContent = mode;
      authForm.querySelector('button').textContent = mode;
    }
    function closeAuthModal() { authModal.style.display = 'none'; modalOverlay.style.display = 'none'; }

    loginBtn.addEventListener('click', () => openModal('Login'));
    signupBtn.addEventListener('click', () => openModal('Sign Up'));
    closeModal.addEventListener('click', closeAuthModal);
    modalOverlay.addEventListener('click', closeAuthModal);
    toggleAuth.addEventListener('click', () => {
      if (authTitle.textContent === 'Login') { authTitle.textContent = 'Sign Up'; authForm.querySelector('button').textContent = 'Sign Up'; toggleAuth.textContent = 'Already have an account? Login'; }
      else { authTitle.textContent = 'Login'; authForm.querySelector('button').textContent = 'Login'; toggleAuth.textContent = "Don't have an account? Sign Up"; }
    });

    authForm.addEventListener('submit', function (e) { e.preventDefault(); alert(authTitle.textContent + ' successful!'); closeAuthModal(); });

  }); // DOMContentLoaded

