export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const { itens, dadosEntrega } = req.body;

        const itemsMercadoPago = itens.map(item => ({
            id: item.id.toString(),
            title: item.nome,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: parseFloat(item.preco)
        }));

        const response = await fetch('https://api.mercadopago.com/v1/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer APP_USER-7092247682103222-070701-c610f9f1eea74f513efcefc53d6ca6b-582592742`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: itemsMercadoPago,
                payer: {
                    name: dadosEntrega.nome,
                    phone: {
                        number: dadosEntrega.whatsapp
                    }
                },
                back_urls: {
                    success: "https://silas-store-beta.vercel.app",
                    failure: "https://silas-store-beta.vercel.app",
                    pending: "https://silas-store-beta.vercel.app"
                },
                auto_return: "approved"
            })
        });

        const dados = await response.json();

        if (dados.init_point) {
            return res.status(200).json({ url: dados.init_point });
        } else {
            return res.status(400).json({ error: 'Erro ao criar preferência de pagamento', detalhes: dados });
        }

    } catch (erro) {
        return res.status(500).json({ error: 'Erro interno no servidor de pagamentos', detalhes: erro.message });
    }
}