import { useConnect } from "@stacks/connect-react"
import { useQuery } from "@tanstack/react-query"
import { queries } from "../stacks-api/queries"
import { userSession } from "../user-session"
import { StacksDevnet, StacksMainnet } from "@stacks/network"
import React, { useCallback, useMemo } from "react"
import { AddressBalanceResponse } from "@stacks/blockchain-api-client"
import { PostConditionMode } from "@stacks/transactions"
const network = import.meta.env.DEV ? new StacksDevnet() : new StacksMainnet()
const deployerAddress = import.meta.env.DEV
  ? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  : "SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ"

const mnoTokenId = deployerAddress + ".micro-nthng::micro-nothing"

function Walleton({
  onClick,
  children,
}: {
  onClick: (walletType: "xverse" | "leather") => void
  children: React.ReactNode
}) {
  const noWallets = useMemo(noProvidersAvailable, [])

  return (
    <>
      {providers.xverse ? (
        <button onClick={() => onClick("xverse")} type="button">
          {children} WITH XVERSE
        </button>
      ) : null}
      {providers.leather ? (
        <button onClick={() => onClick("leather")} type="button">
          {children} WITH LEATHER
        </button>
      ) : null}
      {noWallets ? (
        <button onClick={() => onClick("leather")} type="button">
          {children}
        </button>
      ) : null}
    </>
  )
}

const getTokenBalance = (balances: AddressBalanceResponse, tokenId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (balances?.fungible_tokens[tokenId] as any)?.balance
}
const providers = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xverse: (window as any)?.XverseProviders?.StacksProvider,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leather: (window as any)?.LeatherProvider,
}

const noProvidersAvailable = () => {
  return providers.xverse === undefined && providers.leather === undefined
}

function ContractCallVote() {
  const { doContractCall } = useConnect()
  let address = ""
  if (userSession.isUserSignedIn()) {
    address = import.meta.env.DEV
      ? userSession.loadUserData()?.profile.stxAddress.testnet
      : userSession.loadUserData()?.profile.stxAddress.mainnet
  }

  const { data } = useQuery({
    ...queries.accounts.balances({
      address,
      network,
    }),
  })
  const mnoBalance = useMemo(() => {
    return data ? Number(getTokenBalance(data, mnoTokenId)) : 0
  }, [data])

  const lockFnName = useMemo(() => {
    return mnoBalance ? "lock-mno-and-wmno" : "lock-wmno"
  }, [mnoBalance])

  const lockFn = useCallback(
    (provider: "leather" | "xverse", fnName: string) => {
      doContractCall(
        {
          contractAddress: deployerAddress,
          contractName: "not-lockup",
          functionName: fnName,
          functionArgs: [],
          postConditionMode: PostConditionMode.Allow,
          network,
        },
        providers[provider],
      )
    },
    [doContractCall],
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <Walleton onClick={(provider) => lockFn(provider, lockFnName)}>
        LOCK
      </Walleton>

      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-bold">You can always</p>
        <Walleton onClick={(provider) => lockFn(provider, "unlock-wmno")}>
          UNLOCK
        </Walleton>
      </div>
    </div>
  )
}

export default ContractCallVote
