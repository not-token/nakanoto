import { mergeQueryKeys } from "@lukemorales/query-key-factory"
import { contractsQK } from "./contracts"
import { accountsQK } from "./accounts"

export const queries = mergeQueryKeys(contractsQK, accountsQK)
