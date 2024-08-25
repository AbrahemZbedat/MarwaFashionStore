document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-items')
        .then(response => response.json())
        .then(data => {
            const itemsList = document.getElementById('itemsList');
            itemsList.innerHTML = '';
            data.forEach(item => {
                const listItem = document.createElement('li');
                
                // יצירת תמונה עבור המוצר
                const img = document.createElement('img');
                img.src = item.images[0]; // הצגת התמונה הראשונה
                img.alt = item.title;
                img.style.width = '100px'; // גודל התמונה
                img.style.height = 'auto';
                img.style.marginRight = '10px';

                // יצירת הטקסט של המוצר
                const text = document.createElement('span');
                text.textContent = `ID: ${item.id}, Title: ${item.title}, Price: ${item.price}`;

                listItem.appendChild(img);
                listItem.appendChild(text);
                itemsList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error:', error));
});


document.getElementById('addItemForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch('/add-item', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
          alert(data.message);
          location.reload();  // Reload to update the list of items
      });
});

document.getElementById('updateItemForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch('/update-item', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
          alert(data.message);
          location.reload();  // Reload to update the list of items
      });
});

document.getElementById('deleteItemForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // מונע את שליחת הטופס

    const id = document.getElementById('deleteId').value;

    const response = await fetch('/delete-item', {
        method: 'DELETE', // או 'POST' אם שינית את זה בטופס
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }), // שלח את ה-ID כגוף הבקשה
    });

    const data = await response.json();
    alert(data.message); // הצג את ההודעה
});



