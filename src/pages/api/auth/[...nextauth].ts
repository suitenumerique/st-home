import NextAuth, { AuthOptions } from "next-auth";
//import { ProConnectProvider } from "../../../lib/auth/ProConnectProvider";

export const authOptions: AuthOptions = {
  providers: [
    /*ProConnectProvider({
      clientId: process.env.PROCONNECT_CLIENT_ID,
      clientSecret: process.env.PROCONNECT_CLIENT_SECRET,
    }),*/
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
};

export default NextAuth(authOptions);
