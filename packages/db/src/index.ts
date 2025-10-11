
import prisma from './client'
export type  { PrismaClient } from '@prisma/client';
export default prisma;            // default export: the client
// export type PrismaClient from ''        // named export: the class
