const express = require("express");

const app = express();
const PORT = 3000;

// ===============================
// Middleware
// ===============================

// Global logger middleware
function logger(req, res, next) {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
}

// Request timing middleware
function timer(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Request completed in ${duration} ms`
        );
    });

    next();
}

// Route-specific middleware
function checkApiKey(req, res, next) {
    if (req.headers["x-api-key"] === "12345") {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

// Apply global middleware
app.use(logger);
app.use(timer);

// Parse JSON request bodies
app.use(express.json());


// ===============================
// Part (a) - Basic Routes
// ===============================

// Basic route
app.get("/", (req, res) => {
    res.send("Welcome to ExpressJS!");
});

// Route parameter
app.get("/user/:id", (req, res) => {
    const id = req.params.id;
    res.send(`User ID: ${id}`);
});

// Query parameters
app.get("/search", (req, res) => {
    const q = req.query.q || "";
    const limit = req.query.limit || 10;

    res.send(`Searching for '${q}', limit ${limit}`);
});

// URL building using req.originalUrl
app.get("/url", (req, res) => {
    res.json({
        message: "Current URL",
        originalUrl: req.originalUrl
    });
});

// Redirect example
app.get("/home", (req, res) => {
    res.redirect("/");
});


// ===============================
// Part (b) - Books Resource
// ===============================

let books = [
    {
        id: 1,
        title: "The Hobbit",
        author: "Tolkien"
    },
    {
        id: 2,
        title: "Dune",
        author: "Herbert"
    }
];

let nextId = 3;


// GET /books - Get all books
app.get("/books", (req, res) => {
    res.json(books);
});


// GET /books/:id - Get one book
app.get("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).send("Book Not Found");
    }

    res.json(book);
});


// POST /books - Add a new book
app.post("/books", (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({
            error: "Title and author are required"
        });
    }

    const newBook = {
        id: nextId++,
        title: title,
        author: author
    };

    books.push(newBook);

    res.status(201).json(newBook);
});


// DELETE /books/:id - Delete a book
app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).send("Book Not Found");
    }

    books.splice(index, 1);

    res.status(204).send();
});


// ===============================
// Route-specific middleware
// ===============================

app.get("/protected", checkApiKey, (req, res) => {
    res.send("You have accessed the protected route.");
});


// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
    res.status(404).send("Route Not Found");
});


// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});