import { useConnect } from "@stacks/connect-react"
import { useQuery } from "@tanstack/react-query"
import { queries } from "../stacks-api/queries"
import { userSession } from "../user-session"
import { StacksMainnet, StacksMocknet } from "@stacks/network"
import React, { useCallback, useMemo } from "react"
import { AddressBalanceResponse } from "@stacks/blockchain-api-client"
import {
  FungibleConditionCode,
  FungiblePostCondition,
  PostConditionMode,
  ResponseOkCV,
  createAssetInfo,
  createFungiblePostCondition,
  cvToValue,
  hexToCV,
} from "@stacks/transactions"
const isDev = false

const SNAPSHOT_BLOCK_HEIGHT = isDev ? 4 : 141_576

const network = isDev ? new StacksMocknet() : new StacksMainnet()
const deployerAddress = isDev
  ? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  : "SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ"
type tokenDescriptor = `${string}.${string}::${string}`

const mnoTokenId: tokenDescriptor = `${deployerAddress}.micro-nthng::micro-nothing`
const wmnoTokenId: tokenDescriptor = `${deployerAddress}.wrapped-nothing-v8::wrapped-nthng`
const notTokenId: tokenDescriptor = `${deployerAddress}.nope::NOT`

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

const getTokenBalance = (
  balances: AddressBalanceResponse | undefined,
  tokenId: string,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Number(
    (balances?.fungible_tokens[tokenId] as { balance: number })?.balance || 0,
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
    const profile = userSession.loadUserData()?.profile.stxAddress
    address = isDev ? profile?.testnet : profile?.mainnet
  }

  const { data: snapShotBalances } = useQuery({
    ...queries.accounts.balances({
      address,
      network,
      untilBlock: SNAPSHOT_BLOCK_HEIGHT.toString(),
    }),
  })

  const { data: currentBalances } = useQuery({
    ...queries.accounts.balances({
      address,
      network,
    }),
  })

  const { mnoBalance: snapShotMNOBalance, wmnoBalance: snapShotWMNOBalance } =
    useMemo(() => {
      return {
        mnoBalance: snapShotBalances
          ? Number(getTokenBalance(snapShotBalances, mnoTokenId))
          : 0,
        wmnoBalance: snapShotBalances
          ? Number(getTokenBalance(snapShotBalances, wmnoTokenId))
          : 0,
      }
    }, [snapShotBalances])

  const { mnoBalance: currentMNOBalance, wmnoBalance: currentWMNOBalance } =
    useMemo(() => {
      return {
        mnoBalance: getTokenBalance(currentBalances, mnoTokenId),
        wmnoBalance: getTokenBalance(currentBalances, wmnoTokenId),
      }
    }, [currentBalances])
  const eligibleAmounts = useMemo(
    () => snapShotMNOBalance + snapShotWMNOBalance,
    [snapShotBalances],
  )

  const isEligibleToWrap = useMemo(() => {
    const currentBalance = currentMNOBalance + currentWMNOBalance
    return eligibleAmounts > 0 && currentBalance >= eligibleAmounts
  }, [currentBalances, eligibleAmounts])

  const wrap = useCallback(
    (provider: "leather" | "xverse") => {
      doContractCall(
        {
          contractAddress: deployerAddress,
          contractName: "napper",
          functionName: "wrap",
          functionArgs: [],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [
            createTokenPC(wmnoTokenId, snapShotWMNOBalance, address),
            createTokenPC(
              mnoTokenId,
              snapShotMNOBalance + snapShotWMNOBalance,
              address,
            ),
            createTokenPC(
              mnoTokenId,
              snapShotWMNOBalance,
              `${deployerAddress}.wrapped-nothing-v8`,
            ),
          ].filter((item) => item) as FungiblePostCondition[],
          network,
        },
        providers[provider],
      )
    },
    [doContractCall],
  )

  const { data: supply } = useQuery({
    ...queries.contracts.readOnly({
      address: deployerAddress,
      name: "nope",
      fnName: "get-total-supply",
      args: [],
      network,
      sender: address,
    }),
  })

  const totalSupply = useMemo(() => {
    if (supply) {
      const okCV = hexToCV(supply.result!) as ResponseOkCV
      return Number(cvToValue(okCV.value))
    }
    return 0
  }, [supply])

  const percentageWrapped = useMemo(() => {
    if (totalSupply) {
      return Math.floor((totalSupply / 89e12) * 100)
    }
  }, [totalSupply])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-lg font-bold">{percentageWrapped}% wrapped</h2>
        <p className="text-lg font-bold">
          Use one of the wallets to rewrap $MNO and $WMNO to $NOT
        </p>
        <p className="text-base">
          You will commit all the $MNO and $WMNO in your wallet
          <br />
        </p>
        {snapShotMNOBalance + snapShotWMNOBalance ? (
          <div className=" ">
            <p className="text-lg font-bold block mb-2">ELIGIBLE AMOUNTS:</p>
            <p>
              {snapShotWMNOBalance ? snapShotWMNOBalance + " $WMNO" : null}
              <br />
              {snapShotMNOBalance ? snapShotMNOBalance + " $MNO" : null}
            </p>
            <br />
          </div>
        ) : null}
        <a
          href={import.meta.env.BASE_URL + "Nothing.pdf"}
          target="_blank"
          className="underline underline-offset-4"
          rel="noopener noreferrer"
        >
          Read explainer here
        </a>
        {isEligibleToWrap ? (
          <Walleton onClick={(provider) => wrap(provider)}>Wrap all</Walleton>
        ) : (
          <p className="text-red-500 text-center">You are not eligible brah</p>
        )}
      </div>
    </div>
  )
}

export default ContractCallVote
