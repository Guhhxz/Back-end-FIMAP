const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'default_secret';
const expiresIn = process.env.JWT_EXPIRATION || '1h';

// Função para gerar um token JWT
const gerarToken = (payload) => {
    return jwt.sign(payload, secret, { expiresIn });
};

// Função para validar um token JWT
const validarToken = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error('Erro ao validar token JWT:', error.message);
        return null; // Retorna null se o token for inválido ou expirado
    }
};

module.exports = {
    gerarToken,
    validarToken,
};