import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod";
import { prismaClient } from "../prisma/prisma-client.js";
import createHttpError from "http-errors";
import { voteAgainstText, voteForText } from "../constants.js";
import { validateSig } from "../util/verifySignature.js";

export const submitVoteEndpoint = defaultEndpointsFactory.build({
  method: "post",
  input: z.object({
    signature: z.string().max(255),
    address: z.string().max(255),
    decision: z.enum(["yes", "no"]),
  }),
  output: z.object({}),
  handler: async ({ input: { signature, address, decision } }) => {
    const doesVoteExist = await prismaClient.vote.findFirst({
      where: {
        address,
      },
    });

    if (!doesVoteExist) {
      throw createHttpError(401, "Vote does not exist");
    }

    let messageToVerify: typeof voteAgainstText | typeof voteForText;
    if (decision === "yes") {
      messageToVerify = voteForText;
    } else {
      messageToVerify = voteAgainstText;
    }

    const isMessageVerified = validateSig(signature, messageToVerify);

    if (!isMessageVerified) {
      throw createHttpError(401, "Invalid signature");
    }

    await prismaClient.vote.create({
      data: {
        address,
        signature,
        tokenAmount: 0,
        decision: decision === "yes" ? "FOR" : "AGAINST",
      },
    });

    return {};
  },
});
