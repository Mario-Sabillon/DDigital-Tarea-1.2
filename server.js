import express, { json } from 'express';
import users from './local_db/users.json' with { type: 'json' };
import { validateUser } from './schemas/user.js';
import { randomUUID } from 'node:crypto';

const app = express();

app.disable('x-powered-by');
app.use(json());

app.get('/', (req, res) => {
    res.send('Hola mundo desde Express js');
});

app.get('/users', (req, res) => {
    try {
        const response = {
            success: true,
            data: users
        };
        res.json(response);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.get('/users/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const parsedId = Number(userId);

        if (isNaN(parsedId)) {
            return res.status(400).json({
                success: false,
                message: 'El id debe ser un número'
            });
        }

        const user = users.find((user) => user.id === parsedId);

        if (!user) {
            return res.status(204).json({
                success: true,
                data: null
            });
        }

        const response = {
            success: true,
            data: user ?? null
        };

        res.status(200).send(response);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/users', (req, res) => {
    try {
        const data = req.body;
        const result = validateUser(data);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.errors.map(error => ({
                    message: error.message,
                    path: error.path[0]
                }))
            });
        }

        const id = randomUUID();
        result.data.id = id;
        users.push(result.data);

        res.status(201).json({
            success: true,
            data: result.data
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});