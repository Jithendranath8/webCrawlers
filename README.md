### README: Product URL Finder Backend

---

## **Overview**
This backend application extracts product URLs from e-commerce platforms (like Amazon, Flipkart, etc.) based on a product name provided via API. It uses **Puppeteer** for web scraping, applies URL filtering, and caches results in a **MySQL database** using **Prisma ORM**.  

---

## **Features**
1. **Dynamic Search**: Scrapes e-commerce platforms for product URLs based on a search term.
2. **Database Caching**: Saves results in a MySQL database to avoid redundant scraping.
3. **Optimized URL Filtering**: Extracts only valid product URLs using regular expressions.
4. **First Resolved Response**: Combines database queries and live scraping for the fastest response.
5. **Platform Grouping**: Returns URLs grouped by e-commerce platforms.

---

## **Endpoints**

### **GET `/search/:productName`**
Fetches product URLs for the given product name.  
1. Checks if the product data exists in the database.  
2. If found, returns data from the database.  
3. Otherwise, scrapes the data and stores it in the database before returning it.

---

## **Tech Stack**
- **Node.js**: Backend runtime environment.  
- **Express.js**: Web framework for routing.  
- **Puppeteer**: For scraping HTML content of search result pages.  
- **Prisma**: ORM for interacting with MySQL.  
- **MySQL**: Database to store product data.

---

## **Database Schema**
### **Product Table**
| Column | Type        | Description                       |
|--------|-------------|-----------------------------------|
| `id`   | `INTEGER`   | Auto-incremented primary key.    |
| `name` | `VARCHAR`   | Name of the searched product.    |
| `data` | `STRING`    | Grouped product URLs as STRING.  |

---

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone <repository_url>
cd <repository_name>
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the root directory with the following:
```env
DATABASE_URL="mysql://<username>:<password>@<host>:<port>/<database_name>"
```

### **4. Run Database Migrations**
```bash
npx prisma migrate dev
```

### **5. Start the Server**
```bash
npm start
```

---

## **How It Works**

### **1. Construct Search URLs**
Generates search URLs for multiple platforms based on the product name. Spaces in the product name are replaced with `-` or `%20` to match platform conventions.  

Example:  
For `productName = "pants"`, the URLs will be:  
- `https://www.amazon.in/s?k=pants`  
- `https://www.flipkart.com/search?q=pants`

---

### **2. Fetch HTML Content**
**Puppeteer** is used to scrape HTML content from these URLs:  
- Loads dynamic JavaScript-heavy content.  
- Optimized to skip unnecessary resources (e.g., images, fonts).

---

### **3. Extract and Filter URLs**
From the scraped HTML, it:  
1. Extracts all `href` links using a regular expression.
2. Filters valid product URLs based on predefined patterns:
   - `/dp/`, `/p/`, `/product/`, etc.
3. Normalizes relative URLs to absolute URLs.

---

### **4. Store in Database**
Scraped results are stored in the database using Prisma’s `create` function.  

Example:  
```javascript
await prisma.product.create({
    data: {
        name: productName,
        data: JSON.stringify(groupedUrls),
    },
});
```

---


## **Example Response**
```json
{
  "amazon": ["https://www.amazon.in/product1", "https://www.amazon.in/product2"],
  "flipkart": ["https://www.flipkart.com/product3", "https://www.flipkart.com/product4"],
  "snapdeal": ["https://www.snapdeal.com/product5"]
}
```

---

## **Advantages**
1. **Efficient Scraping**: Uses Puppeteer to dynamically scrape data.  
2. **Caching**: Saves results in MySQL for faster subsequent responses.  
3. **Scalable**: Easily extendable to more platforms.  
4. **Optimized Performance**: Returns the first resolved result, minimizing wait time.  

---

