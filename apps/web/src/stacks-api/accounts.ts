import { createQueryKeys } from "@lukemorales/query-key-factory"

import { AccountsApi, Configuration } from "@stacks/blockchain-api-client"
import { StacksNetwork } from "@stacks/network"
const SNAPSHOT_BLOCK_HEIGHT = 141500
throw new Error("set SNAPSHOT_BLOCK_HEIGHT to something")

export const accountsQK = createQueryKeys("accounts", {
  balances: ({
    address,
    network,
  }: {
    address: string
    network: StacksNetwork
  }) => ({
    queryKey: [address, network],
    queryFn: async () => {
      const apiClientConfig = new Configuration({
        basePath: network.coreApiUrl,
      })
      const accountsApi = new AccountsApi(apiClientConfig)

      return accountsApi.getAccountBalance({
        principal: address,
        unanchored: false,
        untilBlock: `${SNAPSHOT_BLOCK_HEIGHT}`,
      })
    },
  }),
})
