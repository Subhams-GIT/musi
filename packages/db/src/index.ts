import { PrismaClient } from '@prisma/client'

export { prisma } from './client' // exports instance of prisma 
export * from "../generated/prisma" 
export type { PrismaClient } from '@prisma/client' // exports generated types from prismap