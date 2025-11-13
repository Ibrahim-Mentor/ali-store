// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL ELEMENTS ---
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    // Cart Drawer Elements
    const cartBtn = document.getElementById('openCart');
    const closeCartBtn = document.getElementById('closeCart');
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const addCartBtns = document.querySelectorAll('.add-cart'); // On index.html
    
    // Cart Data Elements (shared)
    const cartCountEl = document.getElementById('cartCount');
    
    // Cart Drawer Elements
    const cartItemsContainer = document.getElementById('cartItems'); // In drawer
    const cartTotalEl = document.getElementById('cartTotal'); // In drawer

    // Cart Page Elements
    const cartPageItemsContainer = document.getElementById('cart-page-items'); // On cart.html
    const summarySubtotalEl = document.getElementById('summary-subtotal'); // On cart.html
    const summaryTotalEl = document.getElementById('summary-total'); // On cart.html

    // --- 2. GLOBAL CART STATE ---
    
    // Load cart from localStorage or start with an empty array
    let cart = loadCart();

    // --- 3. FUNCTIONS ---

    // Load cart from localStorage
    function loadCart() {
        const cartJson = localStorage.getItem('azmCart');
        return cartJson ? JSON.parse(cartJson) : [];
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('azmCart', JSON.stringify(cart));
    }

    // --- MOBILE MENU ---
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    // --- CART DRAWER LOGIC ---
    const openCart = () => {
        cartPanel.classList.add('is-open');
        cartOverlay.classList.add('is-open');
    };

    const closeCart = () => {
        cartPanel.classList.remove('is-open');
        cartOverlay.classList.remove('is-open');
    };

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // --- REUSABLE "ADD TO CART" FUNCTION ---
    function addItemToCart(name, price, img) {
        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name, price, img, qty: 1 });
        }

        saveCart();
        updateAllCartDisplays();
        openCart();
    }

    // --- ADD TO CART (FROM PRODUCT GRID on index.html) ---
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = e.target.closest('.product-card');
            const name = product.getAttribute('data-name');
            const price = parseFloat(product.getAttribute('data-price'));
            const img = product.getAttribute('data-img');
            
            addItemToCart(name, price, img);
        });
    });

    // --- 4. PDP (PRODUCT DETAIL PAGE) LOGIC ---
    const pdpAddToCartBtn = document.getElementById('pdp-add-to-cart');
    
    // This code only runs if we are on the product.html page
    if (pdpAddToCartBtn) {
        // 1. Get data from URL to populate page
        const params = new URLSearchParams(window.location.search);
        const name = params.get('name');
        const price = parseFloat(params.get('price'));
        const img = params.get('img');
        const desc = params.get('desc'); // Get the new description

        // 2. Populate the page elements
        document.getElementById('pdp-image').src = img;
        document.getElementById('pdp-image').alt = name;
        document.getElementById('pdp-name').textContent = name;
        document.getElementById('pdp-price').textContent = `$${price.toFixed(2)}`;
        document.getElementById('pdp-description').textContent = desc;

        // 3. Add click listener for the PDP "Add to Cart" button
        pdpAddToCartBtn.addEventListener('click', () => {
            addItemToCart(name, price, img);
        });
    }


    // --- 5. UNIVERSAL UPDATE FUNCTION ---
    // This one function will update all parts of the site that show cart info
    function updateAllCartDisplays() {
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.qty;
            totalItems += item.qty;
        });

        // 1. Update Header Cart Count (Global)
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
        }

        // 2. Update Cart Drawer (if it exists on the page)
        if (cartItemsContainer) {
            renderCartDrawer(total, totalItems);
        }

        // 3. Update Dedicated Cart Page (if it exists on the page)
        if (cartPageItemsContainer) {
            renderCartPage(total);
        }
    }

    // --- 6. RENDER FUNCTIONS (No changes from your file) ---
    
    // --- RENDER CART DRAWER ---
    function renderCartDrawer(total, totalItems) {
        cartItemsContainer.innerHTML = ''; // Clear drawer
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
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
                div.querySelector('.cart-item-remove').addEventListener('click', () => {
                    removeFromCart(item.name);
                });
                cartItemsContainer.appendChild(div);
            });
        }
        
        if (cartTotalEl) {
            cartTotalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    // --- RENDER DEDICATED CART PAGE ---
    function renderCartPage(total) {
        cartPageItemsContainer.innerHTML = ''; // Clear page content

        if (cart.length === 0) {
            cartPageItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty. <a href="index.html#shop">Go shopping!</a></p>';
        } else {
            cart.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('cart-page-item');
                const itemTotal = item.price * item.qty;
                
                div.innerHTML = `
                    <div class="item-product">
                        <img src="${item.img}" alt="${item.name}" class="item-img">
                        <div>
                            <h4 class="item-name">${item.name}</h4>
                            <p class="item-price">$${item.price.toFixed(2)}</p>
                            <button class="item-remove-btn" data-name="${item.name}">Remove</button>
                        </div>
                    </div>
                    <div class="item-quantity">
                        <input type="number" class="item-qty-input" value="${item.qty}" min="1" data-name="${item.name}">
                    </div>
                    <div class="item-total">$${itemTotal.toFixed(2)}</div>
                `;
                
                // Add event listeners for this new item
                div.querySelector('.item-remove-btn').addEventListener('click', () => {
                    removeFromCart(item.name);
                });
                
                div.querySelector('.item-qty-input').addEventListener('change', (e) => {
                    const newQty = parseInt(e.target.value);
                    updateCartQuantity(item.name, newQty);
                });

                cartPageItemsContainer.appendChild(div);
            });
        }

        // Update summary
        if (summarySubtotalEl) summarySubtotalEl.textContent = `$${total.toFixed(2)}`;
        if (summaryTotalEl) summaryTotalEl.textContent = `$${total.toFixed(2)}`;
    }


    // --- 7. MODIFY CART FUNCTIONS (No changes from your file) ---

    function removeFromCart(nameToRemove) {
        cart = cart.filter(p => p.name !== nameToRemove);
        saveCart();
        updateAllCartDisplays();
    }

    function updateCartQuantity(name, newQty) {
        const item = cart.find(p => p.name === name);
        if (item) {
            if (newQty > 0) {
                item.qty = newQty;
            } else {
                // If qty is 0 or less, remove it
                cart = cart.filter(p => p.name !== name);
            }
            saveCart();
            updateAllCartDisplays();
        }
    }

    // --- 8. INITIAL PAGE LOAD ---
    // Run this function once when the page loads to show the correct cart state
    updateAllCartDisplays(); 

});