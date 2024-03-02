import { defaultEndpointsFactory } from "express-zod-api";
import z from "zod";
import { prismaClient } from "../prisma/prisma-client.js";

export const getTotalVotesEndpoint = defaultEndpointsFactory.build({
  method: "get",

  input: z.object({}),
  output: z.object({
    totalVotes: z.number(),
  }),
  handler: async () => {
    const {
      _sum: { tokenAmount: totalVotes },
    } = await prismaClient.vote.aggregate({
      _sum: {
        tokenAmount: true,
      },
    });
    return {
      totalVotes: totalVotes || 0,
    };
  },
});
