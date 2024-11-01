import axios from "axios";

let authToken = null;
let tokenExpiration = null;

const getAuthToken = async () => {
    try {
        const response = await axios.get(
            "https://whatsapp.broadcastermobile.com/whatsapp-bsp-api-endpoint-ws/services/v1/auth/token",
            {
                headers: {
                    "Api-Key": "296",
                    "Api-Token": "b1OoT93sALvqYFcnqy6ym162ouI=",
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
        console.log(token);
        const response = await axios.post(
            "https://whatsapp.broadcastermobile.com/whatsapp-bsp-api-endpoint-ws/services/v1/messaging",
            {
                from: "573164433820",
                to: toNumber,
                type: "template",
                template: {
                    language: "es",
                    name: "pinicialcontraentrega",
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
        console.log("Mensaje enviado:", response.data);
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

        const response = await axios.post(
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

        return response.data;
    } catch (error) {
        console.error(
            "Error al enviar mensaje:",
            error.response?.data || error.message
        );
        throw error;
    }
};
