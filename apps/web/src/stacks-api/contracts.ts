import { createQueryKeys } from "@lukemorales/query-key-factory"

import { Configuration, SmartContractsApi } from "@stacks/blockchain-api-client"
import { StacksNetwork } from "@stacks/network"

export const contractsQK = createQueryKeys("contracts", {
  interface: ({
    address,
    name,
    network,
  }: {
    address: string
    name: string
    network: StacksNetwork
  }) => ({
    queryKey: [address, name, network],
    queryFn: async () => {
      const apiClientConfig = new Configuration({
        basePath: network.coreApiUrl,
      })
      const contractsApi = new SmartContractsApi(apiClientConfig)

      return contractsApi.getContractInterface({
        contractAddress: address,
        contractName: name,
      })
    },
  }),
  readOnly: ({
    address,
    name,
    fnName,
    args,
    sender,
    network,
  }: {
    address: string
    name: string
    fnName: string
    args: string[]
    sender: string
    network: StacksNetwork
  }) => ({
    queryKey: [address, name, fnName, args, sender, network],
    queryFn: async () => {
      const apiClientConfig = new Configuration({
        basePath: network.coreApiUrl,
      })
      const contractsApi = new SmartContractsApi(apiClientConfig)

      return contractsApi.callReadOnlyFunction({
        contractAddress: address,
        contractName: name,
        functionName: fnName,
        readOnlyFunctionArgs: {
          arguments: args,
          sender,
        },
      })
    },
  }),
})
