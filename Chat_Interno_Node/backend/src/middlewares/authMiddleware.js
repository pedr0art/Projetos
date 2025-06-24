const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  // Pega o cabeçalho Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  // Bearer TOKEN
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, jwtSecret);
    // Adiciona o payload decodificado à requisição para uso posterior
    req.user = decoded;
    next();
  } catch (err) {
    // Token inválido ou expirado
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};
