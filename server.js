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
// פונקציה לבדוק אם המשתמש מחובר
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    }
    res.status(403).send('Unauthorized'); // מחזיר שגיאה אם לא מחובר
}

// נתיבים לדפים המוגנים
app.get('/admin-orders.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'admin-orders.html')); // הגיש את הקובץ המוגן מהתיקייה 'private'
});

app.get('/admin_panel.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'admin_panel.html')); // הגיש את הקובץ המוגן מהתיקייה 'private'
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
const products = [];

function readProducts() {
    const filePath = path.join(__dirname, 'PRODUCTS.JSON');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Route to get products
app.get('/products', (req, res) => {
    const products = readProducts();
    res.json(products);
});





app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// פונקציה לקרוא את הקובץ JSON
function readProducts() {
    const filePath = path.join(__dirname, 'PRODUCTS.JSON');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}









/************************** */
// הגדרת תיקיית הסטטיים
app.use(express.static(path.join(__dirname, 'public')));

// הגדרת Multer לשמירת קבצים
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// פונקציה לקרוא את קובץ ה-JSON
function readProducts() {
    const filePath = path.join(__dirname, 'PRODUCTS.JSON');
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

/**************** */


/**************** */
// נתיב להוספת פריט
app.post('/add-item', upload.array('images'), (req, res) => {
    const { title, price, sizes, colors } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    if (!title || !price || !sizes || !colors) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const products = readProducts();
    const newItem = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title,
        price,
        sizes: sizes.split(','),
        colors: colors.split(','),
        images
    };

    products.push(newItem);
    fs.writeFileSync(path.join(__dirname, 'PRODUCTS.JSON'), JSON.stringify(products, null, 2));
    res.json({ success: true });
});

// נתיב לעדכון פריט
app.post('/update-item', upload.array('images'), (req, res) => {
    const { id, title, price, sizes, colors } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    if (!id) {
        return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(id));

    if (productIndex === -1) return res.status(404).json({ success: false });

    products[productIndex] = {
        ...products[productIndex],
        title: title || products[productIndex].title,
        price: price || products[productIndex].price,
        sizes: sizes ? sizes.split(',') : products[productIndex].sizes,
        colors: colors ? colors.split(',') : products[productIndex].colors,
        images: images.length ? images : products[productIndex].images
    };

    fs.writeFileSync(path.join(__dirname, 'PRODUCTS.JSON'), JSON.stringify(products, null, 2));
    res.json({ success: true });
});



app.use(express.urlencoded({ extended: true }));

app.post('/delete-item', express.urlencoded({ extended: true }), (req, res) => {
    console.log('Request body:', req.body); // לוגים לקבלת פרטים על הבקשה

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(id));

    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    products.splice(productIndex, 1);

    fs.writeFileSync(path.join(__dirname, 'PRODUCTS.JSON'), JSON.stringify(products, null, 2));
    res.json({ success: true });
});



//end admin panel section
/******************************************************************************************************************** */

app.get('/', (req, res) => {
    const products = readProducts();
    res.render('index', { products });
});
// נתיב לדף הפרטים של מוצר
app.get('/item/:id', (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.render('item', { product });
    } else {
        res.status(404).send('ITEM NOT FOUND');
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

// נתיב לדף הראשי
app.get('/', (req, res) => {
    res.render('index', { products });
});
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
/*
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
*/
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

/********************************** */
app.use(bodyParser.json());
app.use(express.static('public'));

// מסלול לשמירת הזמנה
app.post('/api/place-order', (req, res) => {
    const orderDetails = req.body;
    
    // שמירת ההזמנה ב-JSON
    const ordersFile = './orders.json';
    let orders = [];
    if (fs.existsSync(ordersFile)) {
        const data = fs.readFileSync(ordersFile);
        orders = JSON.parse(data);
    }
    orders.push(orderDetails);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    // שליחת אימייל
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'abrahem.zbedat9@gmail.com', // החלף באימייל שלך
            pass: 'fzcw zkwx xgsg mahk' // החלף בסיסמה שלך
        }
    });

  

    const mailOptions = {
        from: 'abrahem.zbedat9@gmail.com',
        to: 'abrahem.zbedat9@gmail.com',
        subject: 'הזמנתך התקבלה - Marwa Fashion Store',
        text: `שלום ${orderDetails.name},\nתודה על הזמנתך ב-Marwa Fashion Store!\nסכום לתשלום: ₪${orderDetails.total}.\nהפריטים שהוזמנו:\n${orderDetails.items.map(item => item.name).join(', ')}.\n\nכתובת למשלוח: ${orderDetails.address}, ${orderDetails.city}, ${orderDetails.postalCode}.`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.json({ orderId: orders.length }); // מחזיר את מספר ההזמנה
});

/******************************* */
const ordersFilePath = path.join(__dirname, 'orders.json');
let orders = [];

fs.readFile(ordersFilePath, 'utf-8', (err, data) => {
    if (!err) {
        orders = JSON.parse(data); // Parse JSON and assign it to the orders variable
    } else {
        console.log('Error reading orders file:', err);
    }
});


app.patch('/api/toggle-status/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const order = orders.find(o => o.id == orderId);

    if (order) {
        order.status = order.status === 'בוצע' ? 'לא בוצע' : 'בוצע';

        // Save the updated orders to the JSON file
        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
            if (err) {
                res.status(500).json({ message: 'Error saving updated orders.' });
            } else {
                res.status(200).json({ message: 'סטטוס עודכן בהצלחה.' });
            }
        });
    } else {
        res.status(404).json({ message: 'ההזמנה לא נמצאה.' });
    }
});

/********************************** */
function readOrders() {
    return new Promise((resolve, reject) => {
        fs.readFile(ordersFilePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });
}

// Utility function to write orders to JSON file
function writeOrders(orders) {
    return new Promise((resolve, reject) => {
        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Get all orders
app.get('/api/get-orders', async (req, res) => {
    try {
        const orders = await readOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).send('Error reading orders');
    }
});

// Return multiple orders to uncompleted status
app.post('/api/return-orders', async (req, res) => {
    try {
        const orders = await readOrders();
        const orderIds = req.body.orderIds;
        orderIds.forEach(id => {
            const order = orders.find(o => o.id === parseInt(id, 10));
            if (order) {
                order.status = 'לא בוצע'; // Set status to 'not completed'
            }
        });
        await writeOrders(orders);
        res.status(200).send('Orders status updated');
    } catch (err) {
        res.status(500).send('Error updating order statuses');
    }
});


// הפעלת השרת
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
