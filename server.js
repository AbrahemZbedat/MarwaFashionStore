const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public')); // להגיש את קבצי ה-HTML

// הגדרת session
app.use(session({
    secret: '123', // שנה למפתח סודי כלשהו
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // שים true אם אתה משתמש ב-HTTPS
}));

// סיסמת המנהל
const ADMIN_PASSWORD = '12345';

// נתיב לכניסת מנהל
app.post('/admin/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true; // סימון המשתמש כמנהל
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
});

// פונקציה לבדוק אם המשתמש מחובר
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    }
    res.status(403).send('Unauthorized'); // מחזיר שגיאה אם לא מחובר
}

// נתיבים לדפים המוגנים
app.get('/all-orders.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'all-orders.html')); // הגיש את הקובץ
});

app.get('/admin-panel.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html')); // הגיש את הקובץ
});






/*********************************************************************** */
// הגדרת EJS כתבנית
app.set('view engine', 'ejs');

// הגדרת תיקיית תבניות
app.set('views', path.join(__dirname, 'views'));

// הגדרת תיקיית הסטטיים
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public')); // מאפשר גישה לקבצים בתיקיית public

/*************************************************************************************** */
// Admin panel section
const products = [
    {
        id: 1,
        title: 'Brouse',
        images: ['imgs/clothes/brouse.jpg'], // Update to images array
        price: '100',
        sizes: ['S', 'M', 'L'],
        colors: ['Red', 'Blue']
    },
    {
        id: 2,
        title: 'Shirt',
        images: ['imgs/clothes/shirt.jpg'], // Update to images array
        price: '260',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White']
    },
    {
        id: 3,
        title: 'Dress1',
        images: ['imgs/clothes/dress.jpg','imgs/clothes/dress2.jpg'], // Update to images array
        price: '260',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White']
    },
    {
        id: 4,
        title: 'Dress2',
        images: ['imgs/clothes/dress4.jpg','imgs/clothes/dress5.jpg','imgs/clothes/dress6.jpg'], // Update to images array
        price: '220',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White']
    },
    {
        id: 5,
        title: 'Dress3',
        images: ['imgs/clothes/d2.jpg','imgs/clothes/d3.jpg','imgs/clothes/d4.jpg','imgs/clothes/d5.jpg'], // Update to images array
        price: '200',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White']
    },  {
        id: 6,
        title: 'Dress3',
        images: ['imgs/clothes/d7.jpg','imgs/clothes/d8.jpg','imgs/clothes/d9.jpg'], // Update to images array
        price: '190',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White']
    }
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Define the upload destination
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original file name
    }
});

const upload = multer({ storage });

// Add new item
app.post('/add-item', upload.array('images', 10), (req, res) => {
    const { title, price, sizes, colors } = req.body;
    const images = req.files.map(file => path.join('uploads', file.filename));
    
    const newItem = {
        id: products.length + 1,
        title,
        price,
        sizes: sizes.split(',').map(size => size.trim()),
        colors: colors.split(',').map(color => color.trim()),
        images // Store the array of images
    };
    
    products.push(newItem);
    res.json({ message: 'Item added successfully' });
});

// Update existing item
app.post('/update-item', upload.array('images', 10), (req, res) => {
    const { id, title, price, sizes, colors } = req.body;
    const item = products.find(p => p.id === parseInt(id));

    if (item) {
        if (title) item.title = title;
        if (price) item.price = price;
        if (sizes) item.sizes = sizes.split(',').map(size => size.trim());
        if (colors) item.colors = colors.split(',').map(color => color.trim());
        if (req.files.length > 0) {
           
            const images = req.files.map(file => path.join('uploads', file.filename));
            item.images = images; // Update with new images
        }
        res.json({ message: 'Item updated successfully' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Get all items
app.get('/get-items', (req, res) => {
    res.json(products);
});

// Delete item
// Delete item
// Delete item
app.delete('/delete-item', (req, res) => {
    const { id } = req.body; // קח את ה-ID מהבקשה

    // מצא את האינדקס של הפריט
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        products.splice(index, 1); // מחק את הפריט
        res.json({ message: 'Item deleted successfully' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});




//end admin panel section
/******************************************************************************************************************** */

// נתיב לדף הראשי
app.get('/', (req, res) => {
    res.render('index', { products });
});

// נתיב לדף הפרטים של מוצר
app.get('/item/:id', (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        res.render('item', { product });
    } else {
        res.status(404).send('Product not found');
    }
});
// Serve static files (e.g., CSS, images, etc.)
app.use(express.static('public'));

// Routes for other pages
app.get('/contact.html', (req, res) => {
    res.render('contact');
});

app.get('/location.html', (req, res) => {
    res.render('location');
});
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/cart.html', (req, res) => {
    res.render('cart'); // ודא שיש לך קובץ cart.ejs (או cart.pug) בתיקיית views
});
/**************************************** */

//mail send - order information
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abrahem.zbedat9@gmail.com', // החלף במייל שלך
        pass: 'fzcw zkwx xgsg mahk'
    }
});

app.post('/api/place-order', (req, res) => {
    const newOrder = req.body;
    const ordersData = JSON.parse(fs.readFileSync('orders.json'));
    newOrder.id = ordersData.length + 1; // ID חדש
    ordersData.push(newOrder);

    try {
        fs.writeFileSync('orders.json', JSON.stringify(ordersData));

        // חישוב סך הכל מחיר הזמנה
        const totalPrice = newOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // הכנת פרטי ההזמנה לאימייל
        const orderDate = new Date().toLocaleDateString();
        const orderDetails = `
            שם מלא: ${newOrder.name || 'לא ידוע'}
            אימייל: ${newOrder.email || 'לא ידוע'}
            מספר טלפון: ${newOrder.phone || 'לא ידוע'}
            כתובת: ${newOrder.address || 'לא ידוע'}, ${newOrder.city || 'לא ידוע'}, ${newOrder.postalCode || 'לא ידוע'}
            שיטת תשלום: ${newOrder.paymentMethod || 'לא ידוע'}
            תאריך הזמנה: ${orderDate}
            פרטי פריטים:
            ${newOrder.items.map(item => {
                const itemName = item.title || 'לא ידוע';
                const itemQuantity = item.quantity || 0;
                const itemPrice = item.price ? (item.price * itemQuantity).toFixed(2) : 'לא ידוע';
                return `- ${itemName} (${itemQuantity}) - ₪${itemPrice}`;
            }).join('\n')}
            
            סך הכל מחיר הזמנה: ₪${totalPrice.toFixed(2)}
        `;

        // שליחת המייל
        const mailOptions = {
            from: 'abrahem.zbedat9@gmail.com', // החלף במייל שלך
            to: 'abrahem.zbedat9@gmail.com', // מייל שלך לקבלת ההזמנה
            subject: 'הזמנה חדשה מ-Marwa Fashion Store',
            text: `התקבלה הזמנה חדשה:\n\n${orderDetails}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('שגיאה בהזמנה. אנא נסה שוב.');
            }
            console.log('Email sent:', info.response);
            res.json({ orderId: newOrder.id });
        });

    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).send('שגיאה בשמירת ההזמנה');
    }
});


/************************************* */
app.get('/api/get-order/:orderId', (req, res) => {
    const ordersData = JSON.parse(fs.readFileSync('orders.json'));
    const order = ordersData.find(o => o.id === parseInt(req.params.orderId));

    if (order) {
        res.json(order);
    } else {
        res.status(404).send('ההזמנה לא נמצאה');
    }
});

app.patch('/api/toggle-status/:orderId', (req, res) => {
    const ordersData = JSON.parse(fs.readFileSync('orders.json'));
    const order = ordersData.find(o => o.id == req.params.orderId);

    if (order) {
        order.status = order.status ? null : 'בוצע'; // מחליף את הסטטוס
        try {
            fs.writeFileSync('orders.json', JSON.stringify(ordersData, null, 2));
            res.json(order);
        } catch (error) {
            console.error("Error updating order status:", error);
            res.status(500).send('שגיאה בעדכון הסטטוס');
        }
    } else {
        res.status(404).send('הזמנה לא נמצאה');
    }
});

// Endpoint למחיקת הזמנה
app.delete('/api/delete-order/:orderId', (req, res) => {
    let ordersData = JSON.parse(fs.readFileSync('orders.json'));
    const initialLength = ordersData.length;
    ordersData = ordersData.filter(o => o.id != req.params.orderId);

    if (ordersData.length < initialLength) {
        try {
            fs.writeFileSync('orders.json', JSON.stringify(ordersData, null, 2));
            res.sendStatus(200);
        } catch (error) {
            console.error("Error deleting order:", error);
            res.status(500).send('שגיאה במחיקת ההזמנה');
        }
    } else {
        res.status(404).send('הזמנה לא נמצאה');
    }
});

// Endpoint לקבלת הזמנה לפי ID
app.get('/api/get-order/:orderId', (req, res) => {
    const ordersData = JSON.parse(fs.readFileSync('orders.json'));
    const order = ordersData.find(o => o.id == req.params.orderId);
    if (order) {
        res.json(order);
    } else {
        res.status(404).send('הזמנה לא נמצאה');
    }
});

// Endpoint לקבלת כל ההזמנות
app.get('/api/get-orders', (req, res) => {
    try {
        const ordersData = JSON.parse(fs.readFileSync('orders.json'));
        res.json(ordersData);
    } catch (error) {
        console.error("Error reading orders:", error);
        res.status(500).send('שגיאה בהשגת ההזמנות');
    }
});


// הפעלת השרת
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
