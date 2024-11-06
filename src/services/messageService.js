import axios from "axios";

let authToken = null;
let tokenExpiration = null;

const getAuthToken = async () => {
    try {
        const response = await axios.get(
            "https://whatsapp.broadcastermobile.com/whatsapp-bsp-api-endpoint-ws/services/v1/auth/token",
            {
                headers: {
                    "Api-Key": process.env.WP_APIKEY_AUTH,
                    "Api-Token": process.env.WP_APITOKEN_AUTH,
                },
            }
        );
        authToken = response.data.token;
        console.log(authToken);
        tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;
        return authToken;
    } catch (error) {
        console.error(
            "Error al obtener el token de autenticación:",
            error.message
        );
        throw error;
    }
};

const getValidToken = async () => {
    if (!authToken || Date.now() >= tokenExpiration) {
        console.log(
            "Token expirado o no disponible. Obteniendo nuevo token..."
        );
        return await getAuthToken();
    }
    return authToken;
};

export const sendMessage = async (toNumber, messageText) => {
    try {
        const token = await getValidToken();

        await axios.post(
            "https://whatsapp.broadcastermobile.com/whatsapp-bsp-api-endpoint-ws/services/v1/messaging",
            {
                from: "573164433820",
                to: toNumber,
                type: "template",
                template: {
                    language: "es",
                    name: process.env.TEMPLATE_INICIAL,
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: messageText,
                                },
                            ],
                        },
                    ],
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error) {
        console.error(
            "Error al enviar mensaje:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const sendOrderId = async (toNumber, messageText) => {
    try {
        const token = await getValidToken();
        setTimeout(async () => {
            await axios.post(
                "https://whatsapp.broadcastermobile.com/whatsapp-bsp-api-endpoint-ws/services/v1/messaging",
                {
                    from: "573164433820",
                    to: toNumber,
                    type: "text",
                    text: messageText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        }, 1000);
        console.log("Envio de orderID ");
    } catch (error) {
        console.error(
            "Error al enviar mensaje:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const sendTemplate = async (phone) => {
    try {
        await axios.post(
            "https://management.broadcasterbot.com/v1/companies/1938/simplifiedTemplates/sendings/",
            {
                templateName: process.env.TEMPLATE_FINAL,
                bodyParameters: [],
                workgroupId: 2433,
                agentId: 4090,
                name: "API",
                country: "CO",
                phone: phone,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WP_TOKEN_TEMPLATE}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error(
            "Error al enviar mensaje a Broadcasterbot:",
            error.response?.data || error.message
        );
    }
};
