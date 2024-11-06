import vtexApi from "../api/vtexApi.js";

export const getOrderDetails = async (orderId) => {
    try {
        const response = await vtexApi.get(`orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(
            `Error al obtener detalles del pedido ${orderId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

export const getPaymentDetails = async (orderId) => {
    try {
        const response = await vtexApi.get(
            `orders/${orderId}/payment-transaction`
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error al obtener detalles del pago para el pedido ${orderId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

export const sendPayment = async (orderId, paymentId) => {
    try {
        const response = await vtexApi.post(
            `orders/${orderId}/payments/${paymentId}/payment-notification`
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error al aprobar pago para el pedido ${orderId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

export const cancelOrder = async (orderId) => {
    try {
        const response = await vtexApi.post(`orders/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        console.error(
            `Error al cancelar el pedido ${orderId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};
