import { stripe } from "@/services/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from "faunadb";
import { fauna } from "@/services/fauna";
import { getSession } from "next-auth/react"; 


type User = {
    ref: {
        id: string;
    }
    data: {
        stripe_customer_id: string;
    }
}

export default async function subs(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const session = await getSession({ req });

        // Buscando o user
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session?.user?.email!)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        if(!customerId){
            const stripeCustomer = await stripe.customers.create({
                email: session?.user?.email!,
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id,
                        }
                    }
                )
            )

            customerId = stripeCustomer.id;
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
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