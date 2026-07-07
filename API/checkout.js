// api/checkout.js

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
                'Authorization': `Bearer APP_USR-8249237627440279-070701-567e4b90a35016d1872b502ad8160848-352545494`, 
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

        if (!response.ok || !data.init_point) {
            return res.status(400).json({ error: 'Erro ao gerar preferência', detalhes: data });
        }

        return res.status(200).json({ url: data.init_point });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}