const fs = require('fs');
const searchAndExtractProductUrls = require('./src/productSearch');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = 3100;
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('For output of product URLs visit /search/:productName');
});

const databaseResponse = async (productName) => {
    const isExists = await prisma.product.findUnique({
        where: {
            name: productName
        }
    });
    return isExists;
}

app.get('/search/:productName', async (req, res) => {
    const productName = req.params.productName;
    const domains = [
        'https://www.amazon.in',
        'https://www.flipkart.com',
        'https://www.snapdeal.com',
        'https://www.jiomart.com',
        'https://www.bigbasket.com',
        'https://www.ajio.com',
        'https://www.meesho.com',
    ];

    if(await databaseResponse(productName)){
        const data = await databaseResponse(productName);
        res.json(JSON.parse(data.data));
    }else{
        const groupedUrls = await searchAndExtractProductUrls(productName, domains);
        res.json(groupedUrls);
        try {
            await prisma.product.create({
                data: {
                    name: productName,
                    data: JSON.stringify(groupedUrls),
                },
            });
        } catch (error) {
            console.error('Error saving product URLs:', error);
        }
    };
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    try {
        prisma.$connect();
        console.log('Database connected');
    } catch (error) {
        console.log('Error connecting to the database:', error);
    }
});
