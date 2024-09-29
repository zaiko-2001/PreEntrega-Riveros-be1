import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const productsFilePath = './productos.json';

// Función auxiliar para leer los productos desde el archivo JSON
const readProductsFromFile = async () => {
    try {
        const data = await fs.readFile(productsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Función auxiliar para escribir los productos en el archivo JSON
const writeProductsToFile = async (products) => {
    try {
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error escribiendo en el archivo de productos:', error);
    }
};

// GET: Listar todos los productos (con opción de límite)
router.get('/', async (req, res) => {
    const { limit } = req.query;
    const products = await readProductsFromFile();
    if (limit) {
        return res.status(200).json(products.slice(0, limit));
    }
    res.status(200).json(products);
});

// GET: Obtener producto por ID
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    const products = await readProductsFromFile();
    const product = products.find(p => p.id === pid);

    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// POST: Agregar un nuevo producto
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails.' });
    }

    const products = await readProductsFromFile();
    const newId = (products.length > 0 ? Math.max(...products.map(p => p.id)) : 0) + 1;

    const newProduct = {
        id: newId.toString(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || []
    };

    products.push(newProduct);
    await writeProductsToFile(products);

    res.status(201).json(newProduct);
});

// PUT: Actualizar producto por ID
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const products = await readProductsFromFile();
    const index = products.findIndex(p => p.id === pid);

    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = { ...products[index], ...req.body, id: products[index].id }; // Mantener el ID
    products[index] = updatedProduct;

    await writeProductsToFile(products);
    res.status(200).json(updatedProduct);
});

// DELETE: Eliminar producto por ID
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    let products = await readProductsFromFile();
    const index = products.findIndex(p => p.id === pid);

    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products = products.filter(p => p.id !== pid);
    await writeProductsToFile(products);

    res.status(200).json({ message: 'Producto eliminado' });
});

export default router;
