import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const cartsFilePath = './carrito.json';

// Función auxiliar para leer los carritos desde el archivo JSON
const readCartsFromFile = async () => {
    try {
        const data = await fs.readFile(cartsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Función auxiliar para escribir los carritos en el archivo JSON
const writeCartsToFile = async (carts) => {
    try {
        await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    } catch (error) {
        console.error('Error escribiendo en el archivo de carritos:', error);
    }
};

// POST: Crear un nuevo carrito
router.post('/', async (req, res) => {
    const carts = await readCartsFromFile();
    const newId = (carts.length > 0 ? Math.max(...carts.map(c => c.id)) : 0) + 1;

    const newCart = {
        id: newId.toString(),
        products: []
    };

    carts.push(newCart);
    await writeCartsToFile(carts);

    res.status(201).json(newCart);
});

// GET: Listar productos del carrito por ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const carts = await readCartsFromFile();
    const cart = carts.find(c => c.id === cid);

    if (cart) {
        res.status(200).json(cart.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// POST: Agregar producto al carrito por ID de carrito y producto
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const carts = await readCartsFromFile();
    const cartIndex = carts.findIndex(c => c.id === cid);

    if (cartIndex === -1) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const cart = carts[cartIndex];
    const existingProductIndex = cart.products.findIndex(p => p.product === pid);

    if (existingProductIndex !== -1) {
        // Si el producto ya existe, incrementa la cantidad
        cart.products[existingProductIndex].quantity += 1;
    } else {
        // Si el producto no existe, agregarlo con cantidad 1
        cart.products.push({ product: pid, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await writeCartsToFile(carts);

    res.status(200).json(cart);
});  


export default router;
