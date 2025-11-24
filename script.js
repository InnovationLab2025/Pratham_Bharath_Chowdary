
const products = [
    { id: 1, name: 'Laptop Pro', price: 90000.00, category: 'Electronics', image: 'C:\\Users\\hp\\OneDrive\\文件\\college\\E_commerce_project\\Assets\\laptop.png' },
    { id: 2, name: 'Cotton T-Shirt', price: 450.00, category: 'Apparel', image: 'C:\\Users\\hp\\OneDrive\\文件\\college\\E_commerce_project\\Assets\\tshirt.png' },
    { id: 3, name: 'Novels', price: 285.00, category: 'Books', image: 'C:\\Users\\hp\\OneDrive\\文件\\college\\E_commerce_project\\Assets\\books.png' },
    { id: 4, name: 'Smart Watch', price: 1850.00, category: 'Electronics', image: 'C:\\Users\\hp\\OneDrive\\文件\\college\\E_commerce_project\\Assets\\watch.png' },
    { id: 5, name: 'Denim Jeans', price: 600.00, category: 'Apparel', image: 'C:\\Users\\hp\\OneDrive\\文件\\college\\E_commerce_project\\Assets\\pant.png' },
];

const productListEl = document.getElementById('product-list');
const cartItemsEl = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax-amount');
const finalTotalEl = document.getElementById('final-total');
const maxPriceEl = document.getElementById('max-price');
const priceValueEl = document.getElementById('price-value');
const searchInputEl = document.getElementById('search-input');
const sortSelectEl = document.getElementById('sort-select');
const categorySelectEl = document.getElementById('category-select');
const shippingSelectEl = document.getElementById('shipping-select');
const discountDisplayEl = document.getElementById('discount-display');
const discountAmountEl = document.getElementById('discount-amount');
const TAX_RATE = 0.10; 
const VALID_COUPON = 'SAVE10';
const DISCOUNT_PERCENT = 0.10; 

let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
let discountApplied = 0;

/**
 * 💡 User Feedback (Toasts/Popups)
 * Shows a temporary notification toast.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.prepend(toast); 

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500); 
    }, 3000);
}

function renderProducts() {
    let filteredProducts = [...products];
    const searchValue = searchInputEl.value.toLowerCase();
    const maxPrice = parseFloat(maxPriceEl.value);
    const selectedCategory = categorySelectEl.value;
    const sortBy = sortSelectEl.value;

    filteredProducts = filteredProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchValue);
        const matchesPrice = p.price <= maxPrice;
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesPrice && matchesCategory;
    });

    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    productListEl.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productListEl.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No products found matching your criteria.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <p class="price">${product.price.toFixed(2)}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productListEl.appendChild(card);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    searchInputEl.addEventListener('input', renderProducts);
    categorySelectEl.addEventListener('change', renderProducts);
    sortSelectEl.addEventListener('change', renderProducts);
    maxPriceEl.addEventListener('input', () => {
        priceValueEl.textContent = maxPriceEl.value; 
        renderProducts();
    });
});


/**
 * Adds a product to the cart.
 * @param {number} productId - The ID of the product to add.
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    showToast(`${product.name} added to cart!`, 'success');
    saveCart();
    renderCart();
}

/**
 * Updates the quantity of a cart item.
 * @param {number} productId - The ID of the product.
 * @param {number} change - The change in quantity (+1 or -1).
 */
function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1); 
            showToast('Item removed from cart!', 'error');
        } else {
            showToast(`Quantity updated for ${cart[itemIndex].name}`, 'success');
        }
        
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function renderCart() {
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
        updateCartSummary(); 
        return;
    }

    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-details">
                <strong>${item.name}</strong>
                <span>$${item.price.toFixed(2)} each</span>
            </div>
            <div class="quantity-controls">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        cartItemsEl.appendChild(itemEl);
    });

    updateCartSummary();
}

function updateCartSummary() {
    let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    let totalDiscount = subtotal * discountApplied; 
    let discountedSubtotal = subtotal - totalDiscount;

    const shippingCost = parseFloat(shippingSelectEl.value);
    const tax = discountedSubtotal * TAX_RATE;
    const finalTotal = discountedSubtotal + tax + shippingCost;

    subtotalEl.textContent = subtotal.toFixed(2);
    discountAmountEl.textContent = totalDiscount.toFixed(2);
    taxEl.textContent = tax.toFixed(2);
    finalTotalEl.textContent = finalTotal.toFixed(2);
}

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input').value.toUpperCase();

    if (couponInput === VALID_COUPON) {
        discountApplied = DISCOUNT_PERCENT;
        discountDisplayEl.textContent = `Coupon ${VALID_COUPON} applied! (${(DISCOUNT_PERCENT * 100)}% off)`;
        showToast('Discount applied successfully!', 'success');
    } else {
        discountApplied = 0;
        discountDisplayEl.textContent = 'Invalid or expired coupon.';
        showToast('Invalid coupon code.', 'error');
    }

    updateCartSummary();
}