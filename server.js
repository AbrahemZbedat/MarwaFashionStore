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



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// פונקציה לקרוא את הקובץ JSON


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

app.get('/admin_panel', isAuthenticated, (req, res) => {
    const ads = readAds();
    const products = readProducts();
    res.render('admin_panel', { ads, products });
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
    const filePath = path.join(__dirname, 'products.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Route to get products



app.get('/products', (req, res) => {
    const products = readProducts(); // או readProducts1()
    res.json(products);
});




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
/**************** */
function saveProducts(products) {
    const filePath = path.join(__dirname, 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
}

/**************** */
app.post('/add-item', upload.array('images'), (req, res) => {
    const { title, price, sizes, colors, brand, category } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    if (!title || !price || !sizes || !colors || !brand || !category) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const products = readProducts1();
    const newItem = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title,
        price,
        sizes: sizes.split(','),
        colors: colors.split(','),
        brand,
        category,
        images
    };

    products.push(newItem);
    fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2));
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

    fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2));
    res.json({ success: true });
});



//end admin panel section
/******************************************************************************************************************** */

// קריאת מוצרים מקובץ או מאגר כלשהו
const readProducts1 = () => {
  // לדוגמה: החזר מערך של מוצרים
  return require('./products.json'); // אתה יכול להתאים את זה בהתאם למבנה שלך
};



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.get('/', (req, res) => {
  const allProducts = readProducts1(); // או readProducts אם אתה מעדיף
  const ads = readAds();

  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 20;

  const search = (req.query.search || '').toLowerCase();
  const brand = req.query.brand || '';
  const category = req.query.category || '';
  const price = req.query.price || '';

  let filtered = allProducts.filter(p => {
    return (
      p.title.toLowerCase().includes(search) &&
      (brand === '' || p.brand === brand) &&
      (category === '' || p.category === category)
    );
  });

  if (price === 'low') {
    filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (price === 'high') {
    filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  res.render('index', {
    products: paginatedProducts,
    currentPage: page,
    totalPages,
    query: req.query,
    ads // ⬅️ נשלח ל־index.ejs
  });
});


// דף פרטים למוצר
app.get('/item/:id', (req, res) => {
  const products = readProducts1();
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (product) {
    res.render('item', { product, products }); // הוספת products
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


app.get('/cart.html', (req, res) => {
    res.render('cart'); // ודא שיש לך קובץ cart.ejs (או cart.pug) בתיקיית views
});
/**************************************** */

// נתיב לדף הראשי

//mail send - order information
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abrahem.zbedat9@gmail.com', // החלף במייל שלך
        pass: 'Enter your pass'
    }
});

app.post('/api/place-order', (req, res) => {
    const newOrder = req.body;
    const ordersData = JSON.parse(fs.readFileSync('orders.json'));
    newOrder.id = ordersData.length + 1; // ID חדש
    ordersData.push(newOrder);

    try {
        fs.writeFileSync('orders.json', JSON.stringify(ordersData));

        // חישוב סך הכל מחיר פריטים
        const totalItemsPrice = newOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // הוספת עלות משלוח
        const shippingCost = 35;
        const totalPrice = totalItemsPrice + shippingCost;

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
            
            סך הכל מחיר פריטים: ₪${totalItemsPrice.toFixed(2)}
            עלות משלוח: ₪${shippingCost}
            סך הכל מחיר הזמנה כולל משלוח: ₪${totalPrice.toFixed(2)}
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
    console.log('Received request to toggle status for order ID:', orderId);

    const order = orders.find(o => o.id == orderId); // חיפוש ההזמנה לפי מזהה

    if (order) {
        // החלפת הסטטוס להזמנה
        order.status = order.status === 'בוצע' ? 'לא בוצע' : 'בוצע';
        console.log('Order found, new status:', order.status);

        // כתיבה מחדש של ההזמנות לקובץ JSON
        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
            if (err) {
                console.error('Error saving file:', err); // לוג נוסף אם יש שגיאה בכתיבה
                return res.status(500).json({ message: 'Error saving updated orders.' });
            }

            console.log('Order status updated successfully');
            res.status(200).json({ message: 'סטטוס עודכן בהצלחה.' });
        });
    } else {
        console.error('Order not found');
        res.status(404).json({ message: 'ההזמנה לא נמצאה.' });


    }

    console.log('Toggling status for order ID:', orderId);

});

/********************************** */


// Get all orders
app.get('/api/get-orders', async (req, res) => {
    try {
        const orders = await readOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).send('Error reading orders');
    }
});
/*************************************** */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// קריאת המודעות
function readAds() {
  const data = fs.readFileSync('ads.json', 'utf8');
  return JSON.parse(data);
}

// כתיבת המודעות
function writeAds(ads) {
  fs.writeFileSync('ads.json', JSON.stringify(ads, null, 2));
}


// דף ניהול מודעות


app.get('/admin', isAuthenticated, (req, res) => {
  const ads = readAds();
  res.render('admin_panel', { ads }); // מרנדר את admin_panel.ejs מתיקיית views
});


// הוספת מודעה
app.post('/add-ad', (req, res) => {
  const { newAd } = req.body;
  if (newAd && newAd.trim() !== "") {
    const ads = readAds();
    ads.push(newAd.trim());
    writeAds(ads);
  }
  res.redirect('/admin');
});

// מחיקת מודעה לפי אינדקס
app.post('/delete-ad', (req, res) => {
  const { index } = req.body;
  const ads = readAds();
  if (index >= 0 && index < ads.length) {
    ads.splice(index, 1);
    writeAds(ads);
  }
  res.redirect('/admin');
});

/************************************** */


/********************************** */
// הפעלת השרת
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
