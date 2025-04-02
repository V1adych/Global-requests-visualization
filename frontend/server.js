const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, '.')));

app.get('/data', async (req, res) => {
    try {
        const response = await fetch('http://backend:8000/get-data');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from backend:', error);
        res.status(500).json({ error: error.toString() });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${5000}`);
});
