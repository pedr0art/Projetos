const { io } = require("socket.io-client");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Informe seu token JWT: ", (token) => {
    const socket = io("ws://localhost:3001", {
        auth: { token }
    });

    socket.on("connect", () => {
        console.log("✅ Conectado com sucesso!");

        const roomId = 1; // ID numérico da sala existente
        socket.emit("joinRoom", roomId);

        rl.question("Digite sua mensagem: ", (msg) => {
            socket.emit("sendMessage", {
                roomId,
                message: msg
            });
        });
    });

    socket.on("receiveMessage", (msg) => {
        console.log("📩 Nova mensagem:", msg);
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Erro de conexão:", err.message);
    });
});
