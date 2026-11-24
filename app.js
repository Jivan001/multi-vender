const initialProducts = [{
    id: 'p1',
    name: 'Minimal Notebook',
    price: 129,
    category: 'Stationery',
    vendor: 'Paper Plane',
    emoji: '📓'
}, {
    id: 'p2',
    name: 'Focus Desk Lamp',
    price: 899,
    category: 'Electronics',
    vendor: 'Tech Corner',
    emoji: '💡'
}, {
    id: 'p3',
    name: 'Canvas Tote Bag',
    price: 349,
    category: 'Accessories',
    vendor: 'Craft Circle',
    emoji: '👜'
}, {
    id: 'p4',
    name: 'Gel Pen Set',
    price: 179,
    category: 'Stationery',
    vendor: 'Paper Plane',
    emoji: '🖊️'
}, {
    id: 'p5',
    name: 'Wireless Mouse',
    price: 649,
    category: 'Electronics',
    vendor: 'Tech Corner',
    emoji: '🖱️'
}, {
    id: 'p6',
    name: 'Laptop Sleeve',
    price: 599,
    category: 'Accessories',
    vendor: 'Craft Circle',
    emoji: '💻'
}];
const $ = s => document.querySelector(s);
const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
let products = JSON.parse(localStorage.getItem('cc-products') || 'null') || initialProducts;
let cart = JSON.parse(localStorage.getItem('cc-cart') || '[]');
let orders = JSON.parse(localStorage.getItem('cc-orders') || '[]');
function save() {
    localStorage.setItem('cc-products', JSON.stringify(products));
    localStorage.setItem('cc-cart', JSON.stringify(cart));
    localStorage.setItem('cc-orders', JSON.stringify(orders))
}
function vendors() {
    return [...new Set(products.map(p => p.vendor))]
}
function populateVendors() {
    const options = vendors().map(v => `<option>${v}</option>`).join('');
    $('#vendorFilter').innerHTML = '<option value="all">All vendors</option>' + options;
    $('#vendorSelect').innerHTML = options
}
function renderProducts() {
    let list = [...products]
      , q = $('#search').value.trim().toLowerCase()
      , cat = $('#category').value
      , vendor = $('#vendorFilter').value
      , sort = $('#sort').value;
    if (q)
        list = list.filter(p => `${p.name} ${p.vendor} ${p.category}`.toLowerCase().includes(q));
    if (cat !== 'all')
        list = list.filter(p => p.category === cat);
    if (vendor !== 'all')
        list = list.filter(p => p.vendor === vendor);
    if (sort === 'low')
        list.sort( (a, b) => a.price - b.price);
    if (sort === 'high')
        list.sort( (a, b) => b.price - a.price);
    $('#resultCount').textContent = `${list.length} product${list.length === 1 ? '' : 's'} shown`;
    $(' #productStat'.trim()).textContent = products.length;
    $('#productGrid').innerHTML = list.length ? list.map(p => `<article class="product-card"><div class="product-visual">${p.emoji}</div><div class="product-content"><span class="pill">${p.category}</span><h3>${p.name}</h3><p class="vendor-name">Sold by ${p.vendor}</p><div class="price-row"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" type="button">Add</button></div></div></article>`).join('') : '<div class="empty-state">No matching products. Try clearing a filter.</div>'
}
function renderCart() {
    const detailed = cart.map(i => ({
        ...products.find(p => p.id === i.id),
        qty: i.qty
    })).filter(i => i.id);
    const total = detailed.reduce( (s, i) => s + i.price * i.qty, 0);
    $('#cartCount').textContent = cart.reduce( (s, i) => s + i.qty, 0);
    $('#cartTotal').textContent = money(total);
    $('#cartItems').innerHTML = detailed.length ? detailed.map(i => `<div class="cart-item"><div class="cart-icon">${i.emoji}</div><div><strong>${i.name}</strong><small>${money(i.price)} each</small><div class="quantity"><button data-qty="-1" data-id="${i.id}" aria-label="Decrease ${i.name}">−</button><span>${i.qty}</span><button data-qty="1" data-id="${i.id}" aria-label="Increase ${i.name}">+</button></div></div><strong>${money(i.price * i.qty)}</strong></div>`).join('') : '<div class="empty-state">Your cart is empty. Add a product to begin.</div>';
    $('#checkoutButton').disabled = !detailed.length;
    save()
}
function renderVendors() {
    const cards = vendors().map(v => {
        const items = products.filter(p => p.vendor === v)
          , value = items.reduce( (s, p) => s + p.price, 0);
        return `<div class="vendor-card"><span>${v}</span><b>${items.length}</b><span>products · ${money(value)} listed</span></div>`
    }
    ).join('');
    $('#vendorCards').innerHTML = cards
}
function status(order) {
    return Math.min(3, Math.floor((Date.now() - order.created) / 4500))
}
function renderOrders() {
    if (!orders.length) {
        $('#ordersList').innerHTML = '<div class="empty-state">No demo orders yet. Checkout an item to see tracking and invoice features.</div>';
        return
    }
    $('#ordersList').innerHTML = orders.map(o => {
        let st = status(o)
          , labels = ['Order placed', 'Packed', 'Out for delivery', 'Delivered'];
        return `<article class="order-card"><div><strong>${o.id}</strong><div class="order-meta">${new Date(o.created).toLocaleString('en-IN')} · ${o.items.length} item(s) · ${money(o.total)}</div><div class="status-steps" aria-label="${labels[st]}">${[0, 1, 2, 3].map(n => `<span class="step ${n <= st ? 'active' : ''}"></span>`).join('')}</div><small>${labels[st]} <em>${st < 3 ? '(auto-advances in this demo)' : ''}</em></small></div><div class="order-actions"><button class="text-button" data-invoice="${o.id}">View invoice</button></div></article>`
    }
    ).join('')
}
function showToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout( () => t.classList.remove('show'), 2500)
}
function openCart() {
    $('#cartPanel').classList.add('open');
    $('#overlay').classList.add('open');
    $('#cartPanel').setAttribute('aria-hidden', 'false')
}
function closeCart() {
    $('#cartPanel').classList.remove('open');
    $('#overlay').classList.remove('open');
    $('#cartPanel').setAttribute('aria-hidden', 'true')
}
document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
        const id = add.dataset.add
          , item = cart.find(i => i.id === id);
        item ? item.qty++ : cart.push({
            id,
            qty: 1
        });
        renderCart();
        showToast('Added to cart');
        return
    }
    const qty = e.target.closest('[data-qty]');
    if (qty) {
        const item = cart.find(i => i.id === qty.dataset.id);
        item.qty += Number(qty.dataset.qty);
        if (item.qty < 1)
            cart = cart.filter(i => i !== item);
        renderCart();
        return
    }
    const inv = e.target.closest('[data-invoice]');
    if (inv)
        showInvoice(inv.dataset.invoice)
}
);
['search', 'category', 'vendorFilter', 'sort'].forEach(id => $('#' + id).addEventListener('input', renderProducts));
$('#clearFilters').onclick = () => {
    $('#search').value = '';
    $('#category').value = 'all';
    $('#vendorFilter').value = 'all';
    $('#sort').value = 'featured';
    renderProducts()
}
;
$('#openCart').onclick = openCart;
$('#closeCart').onclick = closeCart;
$('#overlay').onclick = closeCart;
$('#productForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.target);
    products.unshift({
        id: 'p' + Date.now(),
        name: d.get('name'),
        price: Number(d.get('price')),
        category: d.get('category'),
        vendor: d.get('vendor'),
        emoji: d.get('emoji') || '🛍️'
    });
    save();
    populateVendors();
    renderProducts();
    renderVendors();
    e.target.reset();
    showToast('Product added to this browser demo')
}
);
$('#checkoutButton').onclick = () => {
    if (cart.length)
        $('#checkoutDialog').showModal()
}
;
$('#checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(e.target)
      , items = cart.map(i => ({
        ...products.find(p => p.id === i.id),
        qty: i.qty
    }));
    const total = items.reduce( (s, i) => s + i.price * i.qty, 0);
    orders.unshift({
        id: 'CC-' + String(Date.now()).slice(-6),
        created: Date.now(),
        customer: d.get('customer'),
        address: d.get('address'),
        payment: d.get('payment'),
        items,
        total
    });
    cart = [];
    save();
    renderCart();
    renderOrders();
    closeCart();
    $('#checkoutDialog').close();
    e.target.reset();
    showToast('Simulated order placed successfully')
}
);
function showInvoice(id) {
    const o = orders.find(x => x.id === id);
    $('#invoiceContent').innerHTML = `<div class="invoice-title"><p class="eyebrow">DEMO INVOICE</p><h2>CampusCart</h2><p>${o.id} · ${new Date(o.created).toLocaleDateString('en-IN')}</p></div><p><strong>Customer:</strong> ${o.customer}<br><strong>Delivery:</strong> ${o.address}<br><strong>Payment:</strong> ${o.payment} <mark>simulated</mark></p><table class="invoice-lines"><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${o.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${money(i.price * i.qty)}</td></tr>`).join('')}</tbody></table><p class="invoice-total"><strong>Total: ${money(o.total)}</strong></p><p class="dialog-note">This invoice is a front-end demonstration only; it is not a tax or payment record.</p>`;
    $('#invoiceDialog').showModal()
}
$('#closeInvoice').onclick = () => $('#invoiceDialog').close();
$('#resetDemo').onclick = () => {
    if (confirm('Reset products, cart and orders for this browser?')) {
        products = [...initialProducts];
        cart = [];
        orders = [];
        save();
        populateVendors();
        renderProducts();
        renderCart();
        renderVendors();
        renderOrders();
        showToast('Demo data reset')
    }
}
;
populateVendors();
renderProducts();
renderCart();
renderVendors();
renderOrders();
setInterval(renderOrders, 5000);
