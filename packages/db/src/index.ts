import { PrismaClient } from "@prisma/client";
import prisma from './client'

export default prisma;            // default export: the client
export { PrismaClient };          // named export: the class
