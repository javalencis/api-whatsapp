import { Router } from "express";
import {
    handleWebhook,
    approvePayment,
    cancelOrderHandler,
} from "../controllers/orderController.js";

const router = Router();

router.post("/webhook/orders", handleWebhook);
router.post("/order", approvePayment);
router.post("/order/cancel", cancelOrderHandler);

export default router;
