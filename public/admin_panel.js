

document.addEventListener('DOMContentLoaded', () => {
    fetch('/products') // נתיב GET שמחזיר את רשימת המוצרים
        .then(response => response.json())
        .then(products => {
            const itemsList = document.getElementById('itemsList');
            products.forEach(product => {
                const li = document.createElement('li');

                // יצירת תמונה
                const img = document.createElement('img');
                img.src = `/images/${product.images[0]}`; // תמונה ראשונה מתוך המוצרים
                img.alt = product.title;
                img.style.width = '100px'; // ניתן להתאים את רוחב התמונה לפי הצורך

                // יצירת טקסט
                const text = document.createElement('div');
                text.textContent = `ID: ${product.id}, Title: ${product.title}, Price: ${product.price}`;

                // הוספת התמונה והטקסט ל-<li>
                li.appendChild(img);
                li.appendChild(text);
                itemsList.appendChild(li);
            });
        });
});


document.addEventListener('DOMContentLoaded', () => {
    const addItemForm = document.getElementById('addItemForm');
    const updateItemForm = document.getElementById('updateItemForm');
  

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addItemForm);
        fetch('/add-item', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('Item added successfully!');
                  location.reload();
              } else {
                  alert('Failed to add item');
              }
          });
    });

    updateItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(updateItemForm);
        fetch('/update-item', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('Item updated successfully!');
                  location.reload();
              } else {
                  alert('Failed to update item');
              }
          });
    });

   
});


document.addEventListener('DOMContentLoaded', () => {
    const deleteItemForm = document.getElementById('deleteItemForm');

    deleteItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(deleteItemForm);
        fetch('/delete-item', {
            method: 'POST',
            body: new URLSearchParams(formData).toString(), // שימוש ב-URLSearchParams
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // הגדרת סוג התוכן
            }
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('Item deleted successfully!');
                  location.reload();
              } else {
                  alert('Failed to delete item');
              }
          });
    });
});
