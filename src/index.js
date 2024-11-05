// Importamos los módulos 
const express = require("express"); // Importa el módulo de Express para crear el servidor
const app = express(); // Crea una instancia de la aplicación Express
const path = require("node:path"); // Importa el módulo 'path' para manejar rutas de archivos

// Cargar el archivo de variables de entorno para obtener el número de puerto
process.loadEnvFile(); // Carga las variables de entorno (en una función llamada 'loadEnvFile')
const PORT = process.env.PORT; // Define el puerto desde una variable de entorno

// Cargar los datos de autores y obras desde un archivo JSON
const datos = require("../data/ebooks.json"); // Carga el archivo de datos

// Ordenar datos alfabéticamente por apellido de los autores
datos.sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido, "es-ES"));

// Configurar la carpeta "public" para servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public"))); // Hace accesibles los archivos estáticos desde "../public"

// Configurar la ruta raíz para devolver el archivo "index.html"
app.get("/", (req, res) => {
    res.sendFile(__dirname + "index.html"); // Devuelve el archivo index.html cuando se accede a "/"
});

// API para devolver la lista completa de autores ordenados alfabéticamente
app.get("/api/", (req, res) => {
    res.json(datos); // Responde con los datos en formato JSON
});

// Ruta para filtrar autores por el apellido proporcionado en la URL
// Ejemplo de uso: /api/apellido/Dumas
app.get("/api/apellido/:apellido", (req, res) => {
    const apellido = req.params.apellido; // Obtiene el apellido del parámetro de la URL
    const autores = datos.filter((autor) =>
        autor.autor_apellido.toLowerCase().includes(apellido.toLowerCase())
    ); // Filtra los autores que contienen el apellido buscado

    if (autores.length == 0) {
        return res.status(404).send("Autor no encontrado"); // Envía error 404 si no se encuentran autores
    }
    res.json(autores); // Devuelve la lista de autores coincidentes en JSON
});

// Ruta para obtener un autor específico por nombre y apellido
// Ejemplo de uso: /api/nombre_apellido/Alexandre/Dumas
app.get("/api/nombre_apellido/:nombre/:apellido", (req, res) => {
    const nombre = req.params.nombre; // Obtiene el nombre del parámetro de la URL
    const apellido = req.params.apellido; // Obtiene el apellido del parámetro de la URL
    const autor = datos.filter(
        (autor) =>
            autor.autor_nombre.toLowerCase() === nombre.toLowerCase() &&
            autor.autor_apellido.toLowerCase() === apellido.toLowerCase()
    ); // Filtra los autores que coinciden con el nombre y apellido exactos

    if (autor.length === 0) {
        return res.status(404).send("autor no encontrado"); // Envía error 404 si no se encuentra el autor
    }
    res.json(autor); // Devuelve el autor coincidente en JSON
});

// Ruta para obtener autores por nombre y primeras letras del apellido
// Ejemplo de uso: /api/nombre/Alexandre?apellido=Du
app.get("/api/nombre/:nombre", (req, res) => {
    const nombre = req.params.nombre; // Obtiene el nombre del parámetro de la URL
    const apellido = req.query.apellido; // Obtiene el apellido parcial del parámetro de consulta

    if (apellido == undefined) {
        return res.status(404).send("Falta el parámetro apellido"); // Envía error si falta el parámetro apellido
    }

    const autores = datos.filter(
        (autor) =>
            autor.autor_nombre.toLowerCase() === nombre.toLowerCase() &&
            autor.autor_apellido
                .toLowerCase()
                .startsWith(apellido.toLowerCase())
    ); // Filtra los autores que coinciden con el nombre exacto y el inicio del apellido

    if (autores.length == 0) {
        return res.status(404).send("Autor no encontrado"); // Envía error 404 si no se encuentran autores
    }
    res.json(autores); // Devuelve la lista de autores coincidentes en JSON
});

// Ruta para obtener las obras publicadas en un año específico
app.get("/api/edicion/:year", (req, res) => {
    const year = req.params.year; // Obtiene el año del parámetro de la URL

    const editionYear = datos.flatMap((autor) =>
        autor.obras.filter((obra) => obra.edicion == year)
    ); // Filtra las obras editadas en el año especificado

    if (editionYear.length == 0) {
        return res.status(404).send(`Ninguna obra coincide con el año ${year}`); // Envía error 404 si no se encuentran obras
    }
    res.json(editionYear); // Devuelve la lista de obras coincidentes en JSON
});

//  maneja errores 404 cuando una ruta no es encontrada
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "../public", "404.html")); // Devuelve el archivo 404.html para rutas inexistentes
});

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`); // Muestra un mensaje indicando que el servidor está escuchando
});
