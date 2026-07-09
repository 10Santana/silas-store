export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Recebe os itens e o total enviados pelo index.html
        const { itens, total } = req.body;

        // Formata os itens para o padrão que o Mercado Pago exige
        const itemsFormatados = itens.map(item => ({
            id: "1",
            title: item.nome,
            unit_price: Number(item.preco) + 20.00,
            quantity: 1,
            currency_id: 'BRL'
        }));

        // Chama a API do Mercado Pago
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer APP_USR-7092247682103222-070701-c610f9f1eea74f513efcefc53cd6ca6b-582592742 ', // Substitua pelo seu Token real
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: itemsFormatados,
                back_urls: { 
                    success: "https://silas-store-beta.vercel.app/", 
                    failure: "https://silas-store-beta.vercel.app/" 
                },
                auto_return: "approved"
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro do Mercado Pago:", data);
            return res.status(response.status).json({ error: data.message || "Erro ao criar preferência" });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Erro no servidor:", error);
        return res.status(500).json({ error: error.message });
    }
}