document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('itemsList');
    const addItemForm = document.getElementById('addItemForm');
    const updateItemForm = document.getElementById('updateItemForm');
    const deleteItemForm = document.getElementById('deleteItemForm');

    // פונקציה לטעינת הפריטים הקיימים
    function loadItems() {
        fetch('/products')
            .then(response => response.json())
            .then(products => {
                itemsList.innerHTML = '';
                products.forEach(product => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${product.title} - $${product.price} - Sizes: ${product.sizes.join(', ')} - Colors: ${product.colors.join(', ')}`;
                    itemsList.appendChild(listItem);
                });
            })
            .catch(err => console.error(err));
    }

    // הוספת פריט חדש
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addItemForm);
        const data = {
            title: formData.get('title'),
            price: formData.get('price'),
            sizes: formData.get('sizes'),
            colors: formData.get('colors'),
            images: formData.getAll('images') // assuming image upload
        };

        fetch('/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadItems(); // טען מחדש את הפריטים
            } else {
                alert(result.message);
            }
        })
        .catch(err => console.error(err));
    });

    // עדכון פריט קיים
    updateItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(updateItemForm);
        const data = {
            id: formData.get('id'),
            title: formData.get('title'),
            price: formData.get('price'),
            sizes: formData.get('sizes'),
            colors: formData.get('colors'),
            images: formData.getAll('images') // assuming image upload
        };

        fetch('/update-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadItems(); // טען מחדש את הפריטים
            } else {
                alert(result.message);
            }
        })
        .catch(err => console.error(err));
    });

    // מחיקת פריט
    deleteItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(deleteItemForm);
        const data = { id: formData.get('id') };

        fetch('/delete-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadItems(); // טען מחדש את הפריטים
            } else {
                alert(result.message);
            }
        })
        .catch(err => console.error(err));
    });

    // טען את הפריטים בהתחלה
    loadItems();
});
