import { Routing } from "express-zod-api";
import { getTotalVotesEndpoint } from "./votes/get-total-votes.js";

export const routing: Routing = {
  v1: {
    votes: {
      total: getTotalVotesEndpoint,
      // submit
    },
  },
};
