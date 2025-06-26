const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const authenticateToken = require('./middlewares/authMiddleware'); // Importa o middleware

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
// Rota protegida para retornar dados do usuário autenticado
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Rotas públicas ou outras rotas da aplicação
app.use('/api', require('./routes'));

// WebSocket
require('./sockets/socketHandler')(io);

// Servidor escutando para acesso externo
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
