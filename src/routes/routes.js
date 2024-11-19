import { Router } from "express";
import {
    handleWebhook,
    approvePayment,
    cancelOrderHandler,
    handleWebhookMeta,
} from "../controllers/orderController.js";

const router = Router();

router.post("/webhook/orders", handleWebhook);
router.post("/order", approvePayment);
router.post("/order/cancel", cancelOrderHandler);
router.post("/webhook/meta", handleWebhookMeta);

export default router;
