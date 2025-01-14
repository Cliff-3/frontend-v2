import {
  DAIE_USDTE_POOL_NAME,
  DAIE_USDTE_POOL_TOKENS,
  DAI_DAIE_POOL_NAME,
  DAI_DAIE_POOL_TOKENS,
  DUSDT_USDT_POOL_NAME,
  DUSDT_USDT_POOL_TOKENS,
  DWETH_ETH_POOL_NAME,
  DWETH_ETH_POOL_TOKENS,
  ETH_WETHE_POOL_NAME,
  ETH_WETHE_POOL_TOKENS,
  GAS_PRICE_BIGNUMBER,
  GAS_PRICE_DEFAULT,
  PoolName,
  RENBTC_WBTC_POOL_NAME,
  RENBTC_WBTC_POOL_TOKENS,
  TOKENS_MAP,
  TRANSACTION_TYPES,
  TSD_POOL_NAME,
  TSD_POOL_TOKENS,
  Token,
  USDCE_POOL_NAME,
  USDCE_POOL_TOKENS,
  USDT_DAI_POOL_NAME,
  USDT_DAI_POOL_TOKENS,
  USDT_USDTE_POOL_NAME,
  USDT_USDTE_POOL_TOKENS,
  WBTC_WBTCE_POOL_NAME,
  WBTC_WBTCE_POOL_TOKENS,
  YAK_POOL_NAME,
  YAK_POOL_TOKENS,
  ZBTC_WBTC_POOL_NAME,
  ZBTC_WBTC_POOL_TOKENS,
  ZDAI_DAI_POOL_NAME,
  ZDAI_DAI_POOL_TOKENS,
  ZETH_ETH_POOL_NAME,
  ZETH_ETH_POOL_TOKENS,
  ZUSDC_USDC_POOL_NAME,
  ZUSDC_USDC_POOL_TOKENS,
  ZUSDT_USDT_POOL_NAME,
  ZUSDT_USDT_POOL_TOKENS,
} from "../constants"
import { useAllContracts, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatDeadlineToNumber } from "../utils"
import { getFormattedTimeString } from "../utils/dateTime"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useToast } from "./useToast"

interface ApproveAndSwapStateArgument {
  fromTokenSymbol: string
  toTokenSymbol: string
  fromAmount: BigNumber
  toAmount: BigNumber
}

export function useApproveAndSwap(
  poolName?: PoolName,
): (state: ApproveAndSwapStateArgument) => Promise<void> {
  poolName = poolName || ZDAI_DAI_POOL_NAME
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const { account } = useActiveWeb3React()
  const { addToast, clearToasts } = useToast()
  const {
    slippageCustom,
    slippageSelected,
    transactionDeadlineCustom,
    transactionDeadlineSelected,
    allowInfiniteApproval,
  } = useSelector((state: AppState) => state.user)
  let POOL_TOKENS: Token[]
  if (poolName === DWETH_ETH_POOL_NAME) {
    POOL_TOKENS = DWETH_ETH_POOL_TOKENS
  } else if (poolName === ZETH_ETH_POOL_NAME) {
    POOL_TOKENS = ZETH_ETH_POOL_TOKENS
  } else if (poolName === ZBTC_WBTC_POOL_NAME) {
    POOL_TOKENS = ZBTC_WBTC_POOL_TOKENS
  } else if (poolName === ZDAI_DAI_POOL_NAME) {
    POOL_TOKENS = ZDAI_DAI_POOL_TOKENS
  } else if (poolName === ZUSDT_USDT_POOL_NAME) {
    POOL_TOKENS = ZUSDT_USDT_POOL_TOKENS
  } else if (poolName === DUSDT_USDT_POOL_NAME) {
    POOL_TOKENS = DUSDT_USDT_POOL_TOKENS
  } else if (poolName === ZUSDC_USDC_POOL_NAME) {
    POOL_TOKENS = ZUSDC_USDC_POOL_TOKENS
  } else if (poolName === RENBTC_WBTC_POOL_NAME) {
    POOL_TOKENS = RENBTC_WBTC_POOL_TOKENS
  } else if (poolName === USDT_DAI_POOL_NAME) {
    POOL_TOKENS = USDT_DAI_POOL_TOKENS
  } else if (poolName === WBTC_WBTCE_POOL_NAME) {
    POOL_TOKENS = WBTC_WBTCE_POOL_TOKENS
  } else if (poolName === ETH_WETHE_POOL_NAME) {
    POOL_TOKENS = ETH_WETHE_POOL_TOKENS
  } else if (poolName === USDT_USDTE_POOL_NAME) {
    POOL_TOKENS = USDT_USDTE_POOL_TOKENS
  } else if (poolName === DAI_DAIE_POOL_NAME) {
    POOL_TOKENS = DAI_DAIE_POOL_TOKENS
  } else if (poolName === DAIE_USDTE_POOL_NAME) {
    POOL_TOKENS = DAIE_USDTE_POOL_TOKENS
  } else if (poolName === YAK_POOL_NAME) {
    POOL_TOKENS = YAK_POOL_TOKENS
  } else if (poolName === TSD_POOL_NAME) {
    POOL_TOKENS = TSD_POOL_TOKENS
  } else if (poolName === USDCE_POOL_NAME) {
    POOL_TOKENS = USDCE_POOL_TOKENS
  } else {
    throw new Error("useApproveAndSwap requires a valid pool name")
  }

  return async function approveAndSwap(
    state: ApproveAndSwapStateArgument,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!swapContract) throw new Error("Swap contract is not loaded")

      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = tokenContracts?.[state.fromTokenSymbol] as Erc20
      if (tokenContract == null) return
      const fromToken = TOKENS_MAP[state.fromTokenSymbol]
      await checkAndApproveTokenForTrade(
        tokenContract,
        swapContract.address,
        account,
        state.fromAmount,
        allowInfiniteApproval,
        {
          onTransactionStart: () => {
            return addToast(
              {
                type: "pending",
                title: `${getFormattedTimeString()} Approving spend for ${
                  fromToken.name
                }`,
              },
              {
                autoDismiss: false, // TODO: be careful of orphan toasts on error
              },
            )
          },
          onTransactionSuccess: () => {
            return addToast({
              type: "success",
              title: `${getFormattedTimeString()} Successfully approved spend for ${
                fromToken.name
              }`,
            })
          },
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      let minToMint = state.toAmount
      console.debug(`MinToMint 1: ${minToMint.toString()}`)

      minToMint = subtractSlippage(minToMint, slippageSelected, slippageCustom)
      console.debug(`MinToMint 2: ${minToMint.toString()}`)
      const clearMessage = addToast({
        type: "pending",
        title: `${getFormattedTimeString()} Starting your Swap...`,
      })

      const indexFrom = POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === state.fromTokenSymbol,
      )
      const indexTo = POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === state.toTokenSymbol,
      )
      const deadline = formatDeadlineToNumber(
        transactionDeadlineSelected,
        transactionDeadlineCustom,
      )
      const swapTransaction = await swapContract.swap(
        indexFrom,
        indexTo,
        state.fromAmount,
        minToMint,
        Math.round(new Date().getTime() / 1000 + 60 * deadline),
        GAS_PRICE_DEFAULT
          ? {}
          : {
              gasPrice: GAS_PRICE_BIGNUMBER,
            },
      )
      await swapTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.SWAP]: Date.now(),
        }),
      )
      clearMessage()
      addToast({
        type: "success",
        title: `${getFormattedTimeString()} Swap completed, giddyup! 🤠`,
      })
      return Promise.resolve()
    } catch (e) {
      console.error(e)
      clearToasts()
      addToast({
        type: "error",
        title: `${getFormattedTimeString()} Unable to complete your transaction`,
      })
    }
  }
}
