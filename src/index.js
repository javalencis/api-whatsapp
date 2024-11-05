import axios from "axios";
import { error } from "console";
import express from "express";
import Bull from "bull";

import { removeCountryCode } from "./utils/utils.js";
import { sendMessage, sendOrderId } from "./middleware/sendMessage.js";
const app = express();
app.use(express.json());

const whatsappQueue = new Bull("whatsappQueue", {
    redis: {
        url: process.env.REDIS_URL,
    },
});

whatsappQueue.process(async (job) => {
    const { phone, name, orderId } = job.data;
    try {
        await sendMessage("57" + phone, name);
        await sendOrderId("57" + phone, orderId);
        await sendTemplate(phone);
        console.log(`Mensaje enviado a ${phone} después de 2 horas`);
    } catch (error) {
        console.error(`Error al enviar mensajes a ${phone}:`, error.message);
    }
});

const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(
            `https://micco.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}`,
            {
                headers: {
                    "X-VTEX-API-AppKey": "vtexappkey-micco-FMQDKJ",
                    "X-VTEX-API-AppToken":
                        "SQDUINADCXSWSPLIWFBXRVWRQGIJVBWNWWWUVHINSWWTPTVJHYDNTSLWQPXRECIRZADHXKVYVAFOGKGFTMECPMZAASUKGBKNEEQWTJURRABXIAUFSZONQVAUYAHIDLXG",
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error al obtener detalles del pedido ${orderId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

const getPaymentDetails = async (orderId) => {
    try {
        const response = await axios.get(
            `https://micco.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}/payment-transaction`,
            {
                headers: {
                    "X-VTEX-API-AppKey": "vtexappkey-micco-FMQDKJ",
                    "X-VTEX-API-AppToken":
                        "SQDUINADCXSWSPLIWFBXRVWRQGIJVBWNWWWUVHINSWWTPTVJHYDNTSLWQPXRECIRZADHXKVYVAFOGKGFTMECPMZAASUKGBKNEEQWTJURRABXIAUFSZONQVAUYAHIDLXG",
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error al obtener detalles del pedido ${orderId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

const sendPayment = async (orderId, paymentId) => {
    try {
        const response = await axios({
            method: "post",
            url: `https://micco.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}/payments/${paymentId}/payment-notification`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-VTEX-API-AppKey": "vtexappkey-micco-FMQDKJ",
                "X-VTEX-API-AppToken":
                    "SQDUINADCXSWSPLIWFBXRVWRQGIJVBWNWWWUVHINSWWTPTVJHYDNTSLWQPXRECIRZADHXKVYVAFOGKGFTMECPMZAASUKGBKNEEQWTJURRABXIAUFSZONQVAUYAHIDLXG",
            },
        });
        return response;
    } catch (error) {
        console.error(
            `Error al aprobar pago`,
            error.response?.data || error.message
        );
        throw error;
    }
};

const cancelOrder = async (orderId) => {
    try {
        const response = await axios({
            method: "post",
            url: `https://micco.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}/cancel`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-VTEX-API-AppKey": "vtexappkey-micco-FMQDKJ",
                "X-VTEX-API-AppToken":
                    "SQDUINADCXSWSPLIWFBXRVWRQGIJVBWNWWWUVHINSWWTPTVJHYDNTSLWQPXRECIRZADHXKVYVAFOGKGFTMECPMZAASUKGBKNEEQWTJURRABXIAUFSZONQVAUYAHIDLXG",
            },
        });
        return response;
    } catch (error) {
        console.error(
            `Error al aprobar pago`,
            error.response?.data || error.message
        );
        throw error;
    }
};

const sendTemplate = async (phone) => {
    try {
        const response = await axios.post(
            "https://management.broadcasterbot.com/v1/companies/1938/simplifiedTemplates/sendings/",
            {
                templateName: "procesofinalcontraentrega",
                bodyParameters: [],
                workgroupId: 2433,
                agentId: 4090,
                name: "API",
                country: "CO",
                phone: phone,
            },
            {
                headers: {
                    Authorization:
                        "Bearer 7TDFvMq7s7BePvBzd33VN9FOd8ouWmZDO3oimyS8v5E=",
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Mensaje enviado a Broadcasterbot:", response.data);
    } catch (error) {
        console.error(
            "Error al enviar mensaje a Broadcasterbot:",
            error.response?.data || error.message
        );
    }
};

app.post("/webhook/orders", async (req, res) => {
    const orderData = req.body;
    if (orderData.OrderId) {
        console.log("Orden recibida:", orderData.OrderId);
    } else {
        console.log(orderData);
        return res.status(200).send("Nueva configuración o error");
    }

    const order = await getOrderDetails(orderData.OrderId);

    const phone = removeCountryCode(order.clientProfileData.phone);
    const name = order.clientProfileData.firstName;
    res.status(200).send("Notificación recibida correctamente");
    if (
        phone == "3003566925" ||
        phone == "3012642378" ||
        phone == "3167422116"
    ) {
        console.log("Guarda redis");
        whatsappQueue.add(
            { phone, name, orderId: orderData.OrderId },
            { delay: 16 * 60 * 1000 } // 2 horas en milisegundos
        );
    }
});

app.post("/order", async (req, res) => {
    const { orderId } = req.body;
    try {
        const paymentData = await getPaymentDetails(orderId);

        if (paymentData.isActive) {
            try {
                await sendPayment(orderId, paymentData.payments[0].id);

                return res.status(200).json({ messaje: "Pago aprobado" });
            } catch (error) {
                console.error(
                    `Error al aprobar el pago para el pedido ${orderId}:`,
                    error.message
                );
                return res.status(500).json({
                    message: `Error al intentar aprobar el pago para el pedido ${orderId}.`,
                    error: error.message,
                });
            }
        } else {
            return res.status(400).json({
                message: `El pago para el pedido ${orderId} no está activo.`,
                paymentStatus: paymentData.status,
            });
        }
    } catch (error) {
        console.error(
            `Error al obtener detalles del pago para el pedido ${orderId}:`,
            error.message
        );
        return res.status(500).json({
            message: `Error al obtener detalles del pago para el pedido ${orderId}.`,
            error: error.message,
        });
    }
});

app.post("/order/cancel", async (req, res) => {
    const { orderId } = req.body;
    try {
        await cancelOrder(orderId);
        return res.status(200).json({ messaje: "Pedido cancelado" });
    } catch (error) {
        console.error(
            `Error al cancelar pedido con ${orderId}:`,
            error.message
        );
        return res.status(500).json({
            message: `Error al cancelar pedido con  ${orderId}.`,
            error: error.message,
        });
    }
});
app.get("/", (req, res) => {
    console.log("mensaje simple");
    res.status(200).json({ message: "prueba" });
});

app.listen(3000, () => {
    console.log("Servidor escuchando en 3000");
});
