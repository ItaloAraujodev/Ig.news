import { query as q} from 'faunadb';

import GitHubProvider from "next-auth/providers/github";
import NextAuth from 'next-auth';

import { fauna } from '../../../services/fauna';

export default NextAuth({
    providers: [
        GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
          authorization: {
            params: {
              scope: 'read:user',
            },
          },
        }),
      ],

      callbacks: {
        async signIn({ user, account, credentials }){
          const { email } = user;

          try {
            await fauna.query(
              q.If(
                q.Not(
                  q.Exists(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(email!)
                    )
                  )
                ),
                // Faça isso
                q.Create(
                  q.Collection('users'),
                  { data: { email } }
                ),
                // Elseif
                q.Get(
                  q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(email!)
                  )
                )

              )
            )
            return true;

          } catch {

            return false
          }
          
        }
      }
})