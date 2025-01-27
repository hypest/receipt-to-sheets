const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle QR code URL processing
app.post('/process-url', async (req, res) => {
    let browser;
    try {
        const { url } = req.body;
        
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        const iframeHandles = await page.$$('iframe');
        
        let tableData = [];
        
        // First try to find table in main page
        tableData = await page.evaluate(() => {
            const tables = document.querySelectorAll('table');
            if (tables.length === 0) return [];
            
            const firstTable = tables[0];
            const headers = [];
            const data = [];
            
            // Get headers from first row
            const headerRow = firstTable.querySelector('tr');
            if (!headerRow) return [];
            
            headerRow.querySelectorAll('th, td').forEach(cell => {
                headers.push(cell.textContent.trim());
            });
            
            // Get data rows and convert to objects
            const rows = Array.from(firstTable.querySelectorAll('tr')).slice(1);
            rows.forEach(row => {
                const rowData = {};
                const cells = row.querySelectorAll('td');
                if (cells.length === headers.length) {
                    cells.forEach((cell, index) => {
                        rowData[headers[index]] = cell.textContent.trim();
                    });
                    data.push(rowData);
                }
            });
            
            return data;
        });
        
        // If no table found in main page, check iframes
        if (tableData.length === 0 && iframeHandles.length > 0) {
            for (const frameHandle of iframeHandles) {
                const frame = await frameHandle.contentFrame();
                if (!frame) continue;
                
                await frame.waitForSelector('table', { timeout: 5000 }).catch(() => null);
                
                tableData = await frame.evaluate(() => {
                    const tables = document.querySelectorAll('table');
                    if (tables.length === 0) return [];
                    
                    const firstTable = tables[0];
                    const headers = [];
                    const data = [];
                    
                    // Get headers from first row
                    const headerRow = firstTable.querySelector('tr');
                    if (!headerRow) return [];
                    
                    headerRow.querySelectorAll('th, td').forEach(cell => {
                        headers.push(cell.textContent.trim());
                    });
                    
                    // Get data rows and convert to objects
                    const rows = Array.from(firstTable.querySelectorAll('tr')).slice(1);
                    rows.forEach(row => {
                        const rowData = {};
                        const cells = row.querySelectorAll('td');
                        if (cells.length === headers.length) {
                            cells.forEach((cell, index) => {
                                rowData[headers[index]] = cell.textContent.trim();
                            });
                            data.push(rowData);
                        }
                    });
                    
                    return data;
                });
                
                if (tableData.length > 0) break;
            }
        }
        
        await browser.close();
        res.json({ success: true, data: tableData });
    } catch (error) {
        if (browser) await browser.close();
        res.json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 