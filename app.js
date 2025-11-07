// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE MENU TOGGLE ---
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    // --- CART DRAWER LOGIC ---
    const cartBtn = document.getElementById('openCart');
    const closeCartBtn = document.getElementById('closeCart');
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const addCartBtns = document.querySelectorAll('.add-cart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountEl = document.getElementById('cartCount');

    let cart = []; // This will store our cart items

    // Function to open the cart
    const openCart = () => {
        cartPanel.classList.add('is-open');
        cartOverlay.classList.add('is-open');
    };

    // Function to close the cart
    const closeCart = () => {
        cartPanel.classList.remove('is-open');
        cartOverlay.classList.remove('is-open');
    };

    // Open/Close cart
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Add to cart
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Get product info from the 'data-' attributes
            const product = e.target.closest('.product-card');
            const name = product.getAttribute('data-name');
            const price = parseFloat(product.getAttribute('data-price'));
            const img = product.getAttribute('data-img');
            
            // Check if item already exists in cart
            const existing = cart.find(item => item.name === name);

            if (existing) {
                existing.qty++; // Increase quantity
            } else {
                cart.push({ name, price, img, qty: 1 }); // Add new item
            }

            updateCart();
            openCart(); // Open cart when item is added
        });
    });

    // Update cart display
    function updateCart() {
        cartItemsContainer.innerHTML = ''; // Clear the cart display
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                total += item.price * item.qty;
                totalItems += item.qty;

                // Create new cart item element
                const div = document.createElement('div');
                div.classList.add('cart-item');
                div.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)} &times; ${item.qty}</p>
                        <button class="cart-item-remove" data-name="${item.name}">Remove</button>
                    </div>
                `;

                // Add event listener for the new remove button
                div.querySelector('.cart-item-remove').addEventListener('click', (e) => {
                    const nameToRemove = e.target.getAttribute('data-name');
                    cart = cart.filter(p => p.name !== nameToRemove);
                    updateCart(); // Re-render the cart
                });

                cartItemsContainer.appendChild(div);
            });
        }

        // Update totals
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
        cartCountEl.textContent = totalItems;
    }
    
    // Initial cart update on page load (in case cart is saved in localStorage)
    updateCart(); 

});