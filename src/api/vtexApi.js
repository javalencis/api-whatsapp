import axios from "axios";

const vtexApi = axios.create({
    baseURL: "https://micco.vtexcommercestable.com.br/api/oms/pvt/",
    headers: {
        "X-VTEX-API-AppKey": process.env.VTEX_APPKEY,
        "X-VTEX-API-AppToken": process.env.VTEX_APPTOKEN,
        "Content-Type": "application/json",
    },
});

export default vtexApi;
