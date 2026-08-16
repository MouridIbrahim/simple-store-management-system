const authService =
    require("./auth.service");


const register = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });
        }

        const user =
            await authService.register({
                name,
                email,
                password
            });

        res.status(201).json({
            message:
                "User registered successfully",
            user
        });

    } catch (error) {

        next(error);
    }
};


const login = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const result =
            await authService.login({
                email,
                password
            });

        res.status(200).json(result);

    } catch (error) {

        next(error);
    }
};


const forgotPassword = async (
    req,
    res,
    next
) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const result =
            await authService.forgotPassword({ email });

        res.status(200).json(result);

    } catch (error) {

        next(error);
    }
};


const resetPassword = async (
    req,
    res,
    next
) => {

    try {

        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required"
            });
        }

        const result =
            await authService.resetPassword({ token, password });

        res.status(200).json(result);

    } catch (error) {

        next(error);
    }
};


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};