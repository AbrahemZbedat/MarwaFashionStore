const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

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


// הפעלת השרת
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
