import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/database";
import { LoginSchema } from "@repo/shared";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("Authorize called with:", { email: credentials?.email });
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          const user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (!user || !user.password) {
            console.log("User not found or no password");
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(
            password,
            user.password
          );
          
          if (passwordsMatch) {
            console.log("Login successful");
            return user;
          }
          console.log("Password mismatch");
        } else {
          console.log("Validation failed");
        }
        
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
