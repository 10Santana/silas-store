// api/checkout.js
export default async function handler(req, res) {
    // Permite que o seu site envie dados para cá de forma segura
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

        // Organiza a lista de produtos para o Mercado Pago entender
        const itemsMercadoPago = itens.map(item => ({
            id: item.id.toString(),
            title: item.nome,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: parseFloat(item.preco)
        }));

        // Faz a chamada segura para o servidor do Mercado Pago
        const response = await fetch('https://api.mercadopago.com/v1/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 7092247682103222-070701-c610f9f1eea74f513efcefc53cd6ca6b-582592742`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: itemsMercadoPago,
                payer: {
                    name: dadosEntrega.nome,
                    phone: {
                        number: dadosEntrega.whatsapp
                    },
                    address: {
                        zip_code: dadosEntrega.cep,
                        street_name: dadosEntrega.rua,
                        street_number: parseInt(dadosEntrega.numero) || 0
                    }
                },
                back_urls: {
                    success: `https://${req.headers.host}`, 
                    failure: `https://${req.headers.host}`, 
                    pending: `https://${req.headers.host}`
                },
                auto_return: 'approved'
            })
        });

        const data = await response.json();

        // Devolve o link oficial do Pix/Cartão para o site do cliente
        return res.status(200).json({ url: data.init_point });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}