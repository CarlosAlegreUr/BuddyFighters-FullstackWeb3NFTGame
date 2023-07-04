const {
    generateNonce,
    authUser,
    generateJWT,
    checkNonceEmitted,
} = require("../services/authServices");

const JWT_SECRET = process.env.JWT_SECRET;

exports.getNonce = async (req, res, next) => {
    try {
        const nonce = await generateNonce();
        return res.json({ nonce });
    } catch (err) {
        next(err);
    }
};

exports.authenticate = async (req, res, next) => {
    try {
        const { address, nonce, signature } = req.body;
        if (!address || !nonce || !signature) {
            return res.status(400).json({
                message: "All fields are required: address, nonce, signature",
            });
        }

        const validNonce = await checkNonceEmitted(nonce);
        if (!validNonce) {
            return res.status(400).json({
                message: "You didn't request a nonce.",
            });
        }
        const auth = await authUser(address, nonce, signature);
        if (!auth) {
            return res
                .status(401)
                .json({ message: "Signature verification failed." });
        }

        const token = await generateJWT(address, JWT_SECRET);
        return res.json({ token });
    } catch (err) {
        next(err);
    }
};
