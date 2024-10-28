// authMiddleware.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.log("Empfangener Token:", token);

    if (!token) return res.status(401).json({ message: "Kein Token bereitgestellt" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token-Überprüfung fehlgeschlagen:", err);
            return res.status(403).json({ message: "Token ist ungültig" });
        }
        req.user = user;
        next();
    });
};
