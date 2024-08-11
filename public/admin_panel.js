document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-items')
        .then(response => response.json())
        .then(data => {
            const itemsList = document.getElementById('itemsList');
            itemsList.innerHTML = '';
            data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `ID: ${item.id}, Title: ${item.title}, Price: ${item.price}`;
                itemsList.appendChild(listItem);
            });
        });
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

document.getElementById('deleteItemForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch('/delete-item', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
          alert(data.message);
          location.reload();  // Reload to update the list of items
      });
});
