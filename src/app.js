import express from 'express';
import productRouter from './routersProduct.js'; 
import cartRouter from './routersCart.js'


const PORT = 8080;
const app = express();

// Configuración para interpretar datos complejos en solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//router modularizado para la ruta /api/users
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);


app.listen(PORT, () => {
    console.log(`Server activo en puerto ${PORT}`);
});
