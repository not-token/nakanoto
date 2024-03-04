import { createQueryKeys } from "@lukemorales/query-key-factory"

import { AccountsApi, Configuration } from "@stacks/blockchain-api-client"
import { StacksNetwork } from "@stacks/network"

export const accountsQK = createQueryKeys("accounts", {
  balances: ({
    address,
    network,
    untilBlock,
  }: {
    address: string
    network: StacksNetwork
    untilBlock?: string
  }) => ({
    queryKey: [address, network, untilBlock],
    queryFn: async () => {
      const apiClientConfig = new Configuration({
        basePath: network.coreApiUrl,
      })
      const accountsApi = new AccountsApi(apiClientConfig)

      return accountsApi.getAccountBalance({
        principal: address,
        unanchored: false,
        untilBlock,
      })
    },
  }),
})
