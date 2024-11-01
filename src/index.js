import axios from "axios";
import { error } from "console";
import express from "express";
import https from "https";
import { removeCountryCode } from "./utils/utils.js";
const app = express();
app.use(express.json());

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
        const response = await axios.post(
            `https://micco.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}/payments/${paymentId}/payment-notification`,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-VTEX-API-AppKey": "vtexappkey-micco-FMQDKJ",
                    "X-VTEX-API-AppToken":
                        "SQDUINADCXSWSPLIWFBXRVWRQGIJVBWNWWWUVHINSWWTPTVJHYDNTSLWQPXRECIRZADHXKVYVAFOGKGFTMECPMZAASUKGBKNEEQWTJURRABXIAUFSZONQVAUYAHIDLXG",
                },
            }
        );
        return response;
    } catch (error) {
        console.error(
            `Error al aprobar pago`,
            error.response?.data || error.message
        );
        throw error;
    }
};

app.post("/webhook/orders", async (req, res) => {
    const orderData = req.body;
    console.log("Nueva notificación de orden recibida:", orderData);
    console.log(orderData.OrderId);

    // const order = await getOrderDetails(orderData.OrderId);
    // const paymentSystem =
    //     order.paymentData.transactions[0].payments[0].paymentSystem;

    // const phone = removeCountryCode(order.clientProfileData.phone);
    // const name = order.clientProfileData.firstName;

    // try {
    //     const response = await axios.post(
    //         "https://management.broadcasterbot.com/v1/companies/1938/simplifiedTemplates/sendings/",
    //         {
    //             templateName: "validarcontraentrega",
    //             bodyParameters: [name, orderData.OrderId], // Aquí puedes personalizar el contenido
    //             workgroupId: 2433,
    //             agentId: 4090,
    //             name: "API",
    //             country: "CO",
    //             phone: phone,
    //         },
    //         {
    //             headers: {
    //                 Authorization:
    //                     "Bearer 7TDFvMq7s7BePvBzd33VN9FOd8ouWmZDO3oimyS8v5E=",
    //                 "Content-Type": "application/json",
    //             },
    //         }
    //     );
    //     console.log("Mensaje enviado a Broadcasterbot:", response.data);
    // } catch (error) {
    //     console.error(
    //         "Error al enviar mensaje a Broadcasterbot:",
    //         error.response?.data || error.message
    //     );
    // }

    // Responde a VTEX confirmando la recepción
    res.status(200).send("Notificación recibida correctamente");
});

app.post("/order", async (req, res) => {
    const { orderId } = req.body;
    try {
        const paymentData = await getPaymentDetails(orderId);

        if (paymentData.isActive) {
            console.log(paymentData.payments.id);
            try {
                const approvedPayment = await sendPayment(
                    orderId,
                    paymentData.payments.id
                );
                console.log(approvedPayment);
                if (approvedPayment.success) {
                    return res
                        .status(200)
                        .send(
                            "Muchas gracias por tu confirmación. ¡La magia cada vez más cerca!"
                        );
                } else {
                    return res.status(400).json({
                        message: `El pago del pedido ${orderId} no pudo ser aprobado.`,
                        paymentStatus: "not approved",
                    });
                }
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

app.get("/", (req, res) => {
    console.log("mensaje simple");
    res.status(200).json({ message: "prueba" });
});

app.listen(3000, () => {
    console.log("Servidor escuchando en 3000");
});
