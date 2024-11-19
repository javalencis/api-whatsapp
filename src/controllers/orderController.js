import {
    getOrderDetails,
    getPaymentDetails,
    sendPayment,
    cancelOrder,
} from "../services/orderService.js";
import { sendTemplate } from "../services/messageService.js";
import { removeCountryCode } from "../utils/utils.js";
import { sendMessage } from "../services/messageService.js";
import { sendOrderId } from "../services/messageService.js";

export const handleWebhook = async (req, res) => {
    const orderData = req.body;
    if (!orderData.OrderId) {
        console.log(orderData);
        return res.status(200).send("Nueva configuración o error");
    }

    const order = await getOrderDetails(orderData.OrderId);
    const phone = removeCountryCode(order.clientProfileData.phone);
    const name = order.clientProfileData.firstName;

    res.status(200).send("Notificación recibida correctamente");

    if (["3007526144", "3012642378", "3167422116"].includes(phone)) {
        setTimeout(async () => {
            await sendMessage("57" + phone, name);
            await sendOrderId("57" + phone, orderData.OrderId);
            await sendTemplate(phone);
            console.log(`Mensaje enviado a ${phone} después de 15 minutos`);
        }, process.env.DELAYMSN);
    }
};

export const approvePayment = async (req, res) => {
    const { orderId } = req.body;
    try {
        const paymentData = await getPaymentDetails(orderId);
        if (paymentData.status == "Cancelled") {
            return res.status(400).json({
                message: "El pago se encuentra cancelado",
            });
        }
        if (paymentData.isActive) {
            await sendPayment(orderId, paymentData.payments[0].id);
            return res.status(200).json({ message: "Pago aprobado" });
        } else {
            return res.status(400).json({
                message: `El pago no está activo para el pedido ${orderId}`,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: `Error al procesar el pago para el pedido ${orderId}`,
            error: error.message,
        });
    }
};

export const cancelOrderHandler = async (req, res) => {
    const { orderId } = req.body;
    try {
        await cancelOrder(orderId);
        return res.status(200).json({ message: "Pedido cancelado" });
    } catch (error) {
        return res.status(500).json({
            message: `Error al cancelar el pedido ${orderId}`,
            error: error.message,
        });
    }
};

export const handleWebhookMetaValidation = async (req, res) => {
    if (
        req.query["hub.mode"] == "subscribe" &&
        req.query["hub.verify_token"] == "validacionwebhookmeta"
    ) {
        res.send(req.query["hub.challenge"]);
    } else {
        res.sendStatus(400);
    }
};

export const handleWebhookMeta = async (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
};
