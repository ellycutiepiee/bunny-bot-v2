import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// FORCE the correct URL for NextAuth
process.env.NEXTAUTH_URL = "https://bunny-bot.com";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  // Force secure cookies (Cloudflare handles HTTPS)
  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      // Force redirect_uri in authorization
      authorization: { params: { redirect_uri: "https://bunny-bot.com/api/auth/callback/discord" } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Force all redirects to go to the public domain
      return url.startsWith("/") ? `https://bunny-bot.com${url}` : url;
    },
  },
};
