const newProductNameInput = document.getElementById('new-product-name');
const addProductBtn = document.getElementById('add-product-btn');
const productListArea = document.querySelector('.product-list-area');
const remainingItemsContainer = document.getElementById('remaining-items'); 
const boughtItemsContainer = document.getElementById('bought-items');     

let products = [];
let nextProductId = 1;

function saveProducts() {
    try {
        localStorage.setItem('shoppingListProducts', JSON.stringify(products));
    } catch (e) {
        console.error("Error saving products to localStorage:", e);
    }
}

function loadProducts() {
    try {
        const storedProducts = localStorage.getItem('shoppingListProducts');
        if (storedProducts) {
            return JSON.parse(storedProducts);
        }
    } catch (e) {
        console.error("Error loading or parsing products from localStorage:", e);
       
    }
    return null;
}

function createProductElement(product) {
    const productEntry = document.createElement('div');
    productEntry.classList.add('product-entry');
    if (product.bought) {
        productEntry.classList.add('bought-item'); 
    }
    productEntry.dataset.id = product.id; 

    let nameElement;
    if (product.editing) {
        nameElement = document.createElement('input');
        nameElement.type = 'text';
        nameElement.classList.add('product-name-input');
        nameElement.value = product.name;

        nameElement.addEventListener('blur', (event) => {
            const newName = event.target.value.trim();
            if (newName && newName !== product.name) { 
                product.name = newName;
            }
            product.editing = false; 
            renderProducts(); 
        });
        nameElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.target.blur(); 
            }
        });
        setTimeout(() => nameElement.focus(), 0); 
    } else {
        nameElement = document.createElement('span');
        nameElement.classList.add('product-name');
        nameElement.textContent = product.name;
        nameElement.addEventListener('click', () => {
            if (!product.bought) { 
                product.editing = true;
                renderProducts(); 
            }
        });
    }
    productEntry.appendChild(nameElement);
    const quantityControls = document.createElement('div');
    quantityControls.classList.add('quantity-controls');

    const minusBtn = document.createElement('button');
    minusBtn.classList.add('quantity-btn', 'minus');
    minusBtn.dataset.tooltip = "Зменшити кількість";
    minusBtn.textContent = '-';
    minusBtn.disabled = product.quantity <= 1; 
    minusBtn.addEventListener('click', () => {
        if (product.quantity > 1) {
            product.quantity--;
            renderProducts(); 
        }
    });

    const quantityInput = document.createElement('input');
    quantityInput.type = 'text'; 
    quantityInput.classList.add('quantity-input', 'readonly');
    quantityInput.value = product.quantity;
    quantityInput.readOnly = true; 

    const plusBtn = document.createElement('button');
    plusBtn.classList.add('quantity-btn', 'plus');
    plusBtn.dataset.tooltip = "Збільшити кількість";
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => {
        product.quantity++;
        renderProducts(); 
    });

    quantityControls.appendChild(minusBtn);
    quantityControls.appendChild(quantityInput);
    quantityControls.appendChild(plusBtn);

    const statusButton = document.createElement('button');
    statusButton.classList.add('status-button');
    if (product.bought) {
        statusButton.classList.add('bought');
        statusButton.textContent = 'Куплено'; 
        statusButton.dataset.tooltip = 'Позначити товар як не куплений';
    } else {
        statusButton.classList.add('not-bought');
        statusButton.textContent = 'Не куплено'; 
        statusButton.dataset.tooltip = 'Позначити товар як куплений';
    }
    statusButton.addEventListener('click', () => {
        product.bought = !product.bought; 
        product.editing = false; 
        renderProducts(); 
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.dataset.tooltip = 'Видалити товар';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => {
        products = products.filter(item => item.id !== product.id);
        renderProducts(); 
    });

    if (!product.bought) { 
        productEntry.appendChild(quantityControls); 
        productEntry.appendChild(statusButton);     
        productEntry.appendChild(deleteButton);     
    } else { 
        productEntry.appendChild(statusButton); 
    }
    return productEntry;
}

function updateStatusSummary() {
    remainingItemsContainer.innerHTML = '';
    boughtItemsContainer.innerHTML = '';

    const remainingProducts = products.filter(p => !p.bought);
    const boughtProducts = products.filter(p => p.bought);

    remainingProducts.forEach(product => {
        const span = document.createElement('span');
        span.classList.add('status-badge');
        span.innerHTML = `${product.name} <span class="status-amount">${product.quantity}</span>`;
        remainingItemsContainer.appendChild(span);
    });

    boughtProducts.forEach(product => {
        const span = document.createElement('span');
        span.classList.add('status-badge', 'bought-badge'); 
        span.innerHTML = `${product.name} <span class="status-amount">${product.quantity}</span>`;
        boughtItemsContainer.appendChild(span);
    });
}

function renderProducts() {
    const addProductSection = document.querySelector('.add-product-section');
    if (addProductSection && productListArea.contains(addProductSection)) {
        productListArea.removeChild(addProductSection);
    }
    productListArea.innerHTML = '';

    if (addProductSection) {
        productListArea.prepend(addProductSection);
    }
    products.forEach(product => {
        const productElement = createProductElement(product);   // Створюємо HTML для кожного товару
        productListArea.appendChild(productElement);
    });
    updateStatusSummary(); 
    saveProducts();
}

function addProduct() {
    const productName = newProductNameInput.value.trim(); 
    if (productName) { 
        const newProduct = {
            id: nextProductId++,
            name: productName,
            quantity: 1, 
            bought: false, 
            editing: false 
        };
        products.push(newProduct); 
        newProductNameInput.value = '';
    
        setTimeout(() => {
            newProductNameInput.focus();
        }, 0); 
        renderProducts(); 
    }
}

addProductBtn.addEventListener('click', addProduct); 
newProductNameInput.addEventListener('keydown', (event) => { 
    if (event.key === 'Enter') { 
        addProduct(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loadedProducts = loadProducts();
    if (loadedProducts) {
        products = loadedProducts;
        if (products.length > 0) {
            nextProductId = Math.max(...products.map(p => p.id)) + 1;
        } else {
            nextProductId = 1;
        }
    } else {
        products = [
            { id: nextProductId++, name: 'Помідори', quantity: 3, bought: false, editing: false },
            { id: nextProductId++, name: 'Печиво', quantity: 2, bought: true, editing: false },
            { id: nextProductId++, name: 'Молоко', quantity: 1, bought: false, editing: false }
        ];
    }
    renderProducts();
});

