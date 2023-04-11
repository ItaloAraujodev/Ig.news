import { stripe } from "@/services/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react"; 

export default async function subs(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const session = await getSession({ req });

        const stripeCustomer = await stripe.customers.create({
            email: session?.user?.email!,
        })
        
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.id,
            payment_method_types: ['card'], // Tipo de pagamento
            billing_address_collection: 'required', // Aqui da dizendo que o endereço da pessoa é obrigatorio
            line_items: [
                {
                    price: 'price_1MtcViDc1nUAjpNxXs3jjdL4', quantity: 1 
                }
            ],
            mode: 'subscription', // Assinatura
            allow_promotion_codes: true, // Permitindo que usuario utilize cupom se tiver
            success_url: process.env.STRIPE_SUCCESS_URL!, // Se de sucesso usuario sera redirecionado para essa pagina
            cancel_url: process.env.STRIPE_CANCEL_URL!, // se não de sucesso usuario sera redirecionado para essa pagina
        });
        return res.status(200).json({ sessionId: stripeCheckoutSession.id })

    } else {
        res.setHeader('Allow', 'POST') // Aqui diz para o front que essa rota aceita POST
        res.status(405).end('Method not allowed')
    }
}