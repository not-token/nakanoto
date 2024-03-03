import { useConnect } from "@stacks/connect-react"
import { useQuery } from "@tanstack/react-query"
import { queries } from "../stacks-api/queries"
import { userSession } from "../user-session"
import { StacksMainnet } from "@stacks/network"
import React, { useCallback, useMemo } from "react"
import { AddressBalanceResponse } from "@stacks/blockchain-api-client"
import {
  FungibleConditionCode,
  FungiblePostCondition,
  PostConditionMode,
  createAssetInfo,
  createFungiblePostCondition,
} from "@stacks/transactions"
const network = new StacksMainnet()
const deployerAddress = "SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ"
type tokenDescriptor = `${string}.${string}::${string}`

const mnoTokenId: tokenDescriptor = `${deployerAddress}.micro-nthng::micro-nothing`
const wmnoTokenId: tokenDescriptor = `${deployerAddress}.wrapped-nothing-v8::wrapped-nthng`

const createTokenPC = (
  tokenId: tokenDescriptor,
  amount: number,
  owner: string,
) => {
  const [tokenAddress, contractToken] = tokenId.split(".") as [string, string]
  const [contractName, tokenName] = contractToken.split("::") as [
    string,
    string,
  ]
  return amount
    ? createFungiblePostCondition(
        owner,
        FungibleConditionCode.Equal,
        amount,
        createAssetInfo(tokenAddress, contractName, tokenName),
      )
    : null
}

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
  return (
    (balances?.fungible_tokens[tokenId] as { balance: number })?.balance || 0
  )
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
    address = userSession.loadUserData()?.profile.stxAddress.mainnet
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
  const wmnoBalance = useMemo(() => {
    return data ? Number(getTokenBalance(data, wmnoTokenId)) : 0
  }, [data])

  const lockFn = useCallback(
    (provider: "leather" | "xverse", fnName: string) => {
      doContractCall(
        {
          contractAddress: deployerAddress,
          contractName: "genesis-wrapper",
          functionName: fnName,
          functionArgs: [],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [
            createTokenPC(wmnoTokenId, wmnoBalance, address),
            createTokenPC(mnoTokenId, mnoBalance, address),
          ].filter((item) => item) as FungiblePostCondition[],
          network,
        },
        providers[provider],
      )
    },
    [doContractCall],
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-8">
        <p className="text-lg font-bold">
          Use one of the wallets to rewrap $MNO and $WMNO to $NOT
        </p>
        <p className="text-base">
          You will commit all the $MNO and $WMNO in your wallet
          <br />
          please make sure to check the contract and post conditions
          <br />
        </p>
        {mnoBalance + wmnoBalance ? (
          <p className=" ">
            As long as these tokens are in your wallet
            <br />
            you will be eligible to wrap them
            <br />
            <br />
            if you transferred them to a different wallet you will have to
            <br />
            transfer them back or top up just enough to get this amount
            <br />
            <br /> {wmnoBalance ? wmnoBalance + " $WMNO" : null} <br />{" "}
            {mnoBalance ? mnoBalance + " $MNO" : null}
          </p>
        ) : null}
        <a
          href={import.meta.env.BASE_URL + "Nothing.pdf"}
          target="_blank"
          className="underline underline-offset-4"
          rel="noopener noreferrer"
        >
          Read explainer here
        </a>
        <Walleton onClick={(provider) => lockFn(provider, "genesis-wrap")}>
          Wrap all
        </Walleton>
      </div>

      {/* <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-bold">You can always</p>
        <Walleton
          onClick={(provider) => lockFn(provider, "genesis-unwrap-wmno")}
        >
          Unwrap all
        </Walleton>
      </div> */}
    </div>
  )
}

export default ContractCallVote
