const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8080;

const dataDir = '/sigapriya_PV_dir'

app.use(express.json());

app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) {
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(dataDir, file);

    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
        }

        fs.appendFileSync(filePath, data);

        res.json({ file, message: 'Success.' });
    } catch (err) {
        console.error('Error occurred while storing the file:', err.message);
        res.status(500).json({ file, error: 'Error while storing the file to the storage.' });
    }
});

app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    if (!file) {
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(dataDir, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: 'File not found.' });
    }

    try {
        const response = await axios.post('http://container2-service:8081/calculateTotalProduct', { file: filePath, product });
        res.json(response.data);
    } catch (err) {
        console.error('Error occurred while making request to container2:', err.message);
        const errMsg = err.response ? err.response.data : { file, error: 'Internal server error' };
        res.status(err.response ? err.response.status : 500).json(errMsg);
    }
});

app.listen(port, () => {
    console.log(`Frontend service running on port ${port}`);
});
