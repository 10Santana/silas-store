export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { dadosEntrega, itens } = req.body;

        const itemsFormatados = itens.map(item => ({
            id: "1",
            title: item.nome,
            unit_price: Number(item.preco),
            quantity: 1,
            currency_id: 'BRL'
        }));

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer APP_USR-7092247682103222-070701-c610f9f1eea74f513efcefc53cd6ca6b-582592742 ', // VERIFIQUE SEU TOKEN
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: itemsFormatados,
                payer: {
                    name: dadosEntrega.nome,
                    phone: { number: String(dadosEntrega.whatsapp) },
                    address: { street_name: dadosEntrega.endereco }
                },
                back_urls: { 
                    success: "https://silas-store-beta.vercel.app/", 
                    failure: "https://silas-store-beta.vercel.app/" 
                },
                auto_return: "approved"
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Erro Mercado Pago:", data);
            throw new Error(data.message || "Erro ao criar preferência");
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}