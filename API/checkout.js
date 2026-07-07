export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método não permitido"
        });
    }

    try {
        const { itens, dadosEntrega } = req.body;

        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({
                error: "Nenhum item enviado."
            });
        }

        const itemsMercadoPago = itens.map(item => ({
            id: String(item.id),
            title: item.title,
            quantity: item.quantity || 1,
            currency_id: "BRL",
            unit_price: Number(item.unit_price)
        }));

        const response = await fetch(
            "https://api.mercadopago.com/checkout/preferences",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: itemsMercadoPago,

                    payer: {
                        name: dadosEntrega?.nome || "",
                        surname: dadosEntrega?.sobrenome || "",
                        email: dadosEntrega?.email || "",
                        phone: {
                            number: dadosEntrega?.telefone || ""
                        },
                        address: {
                            zip_code: dadosEntrega?.cep || "",
                            street_name: dadosEntrega?.rua || "",
                            street_number: dadosEntrega?.numero || ""
                        }
                    },

                    back_urls: {
                        success: "https://silas-store-beta.vercel.app",
                        failure: "https://silas-store-beta.vercel.app",
                        pending: "https://silas-store-beta.vercel.app"
                    },

                    auto_return: "approved"
                })
            }
        );

        const dados = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Erro ao criar preferência de pagamento",
                detalhes: dados
            });
        }

        return res.status(200).json({
            url: dados.init_point
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            error: "Erro interno no servidor de pagamentos",
            detalhes: erro.message
        });
    }
}