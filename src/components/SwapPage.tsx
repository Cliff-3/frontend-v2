import "./SwapPage.scss"

import { Button, Center } from "@chakra-ui/react"
import React, { ReactElement, useMemo, useState } from "react"
import { SWAP_TYPES, getIsVirtualSwap } from "../constants"
import { commify, formatBNToPercentString, formatBNToString } from "../utils"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import DeadlineField from "./DeadlineField"
import Footer from "./Footer"
import InfiniteApprovalField from "./InfiniteApprovalField"
import Modal from "./Modal"
import { PayloadAction } from "@reduxjs/toolkit"
import ReviewSwap from "./ReviewSwap"
import SlippageField from "./SlippageField"
import SwapInput from "./SwapInput"
import type { TokenOption } from "../pages/Swap"
import TopMenu from "./TopMenu"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { isHighPriceImpact } from "../utils/priceImpact"
import { logEvent } from "../utils/googleAnalytics"
import { updateSwapAdvancedMode } from "../state/user"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

interface Props {
  tokenOptions: {
    from: TokenOption[]
    to: TokenOption[]
  }
  exchangeRateInfo: {
    pair: string
    exchangeRate: BigNumber
    priceImpact: BigNumber
    route: string[]
  }
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
  error: string | null
  swapType: SWAP_TYPES
  fromState: { symbol: string; value: string; valueUSD: BigNumber }
  toState: { symbol: string; value: string; valueUSD: BigNumber }
  onChangeFromAmount: (amount: string) => void
  onChangeFromToken: (tokenSymbol: string) => void
  onChangeToToken: (tokenSymbol: string) => void
  onConfirmTransaction: () => Promise<void>
  onClickReverseExchangeDirection: () => void
}

const SwapPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const {
    tokenOptions,
    exchangeRateInfo,
    error,
    fromState,
    toState,
    swapType,
    onChangeFromAmount,
    onChangeFromToken,
    onChangeToToken,
    onConfirmTransaction,
    onClickReverseExchangeDirection,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const fromToken = useMemo(() => {
    return tokenOptions.from.find(({ symbol }) => symbol === fromState.symbol)
  }, [tokenOptions.from, fromState.symbol])

  const { userSwapAdvancedMode: advanced } = useSelector(
    (state: AppState) => state.user,
  )
  const formattedPriceImpact = formatBNToPercentString(
    exchangeRateInfo.priceImpact,
    18,
  )
  const formattedExchangeRate = formatBNToString(
    exchangeRateInfo.exchangeRate,
    18,
    fromState.symbol == "mYAK" ? 9 : 4,
  )
  const formattedRoute = exchangeRateInfo.route.join(" > ")

  const formattedBalance = commify(
    formatBNToString(fromToken?.amount || Zero, fromToken?.decimals || 0, 6),
  )
  const isVirtualSwap = getIsVirtualSwap(swapType)

  return (
    <div className="swapPage">
      <TopMenu activeTab={"swap"} />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="swapForm">
                <div className="row">
                  <h3 className="swapTitle">{t("from")}</h3>
                  <div className="balanceContainer">
                    <span>{t("balance")}:</span>
                    &nbsp;
                    <a
                      onClick={() => {
                        if (fromToken == null) return
                        const amtStr = formatBNToString(
                          fromToken.amount,
                          fromToken.decimals || 0,
                        )
                        onChangeFromAmount(amtStr)
                      }}
                    >
                      {formattedBalance}
                    </a>
                  </div>
                </div>
                <div className="row">
                  <SwapInput
                    tokens={tokenOptions.from.filter(
                      ({ symbol }) => symbol !== toState.symbol,
                    )}
                    disabled={false}
                    onSelect={onChangeFromToken}
                    onChangeAmount={onChangeFromAmount}
                    selected={fromState.symbol}
                    inputValue={fromState.value}
                    inputValueUSD={fromState.valueUSD}
                    isSwapFrom={true}
                  />
                </div>
                <div style={{ height: "48px" }}></div>
                <div className="row">
                  <h3 className="swapTitle">{t("to")}</h3>
                </div>
                <div className="row">
                  <SwapInput
                    tokens={tokenOptions.to.filter(
                      ({ symbol }) => symbol !== fromState.symbol,
                    )}
                    disabled={fromState.symbol == ""}
                    onSelect={onChangeToToken}
                    selected={toState.symbol}
                    inputValue={toState.value}
                    inputValueUSD={toState.valueUSD}
                    isSwapFrom={false}
                  />
                </div>
                <div style={{ height: "24px" }}></div>
                {fromState.symbol && toState.symbol && (
                  <div className="row">
                    <div>
                      <span>{t("rate")}</span>
                      &nbsp;
                      <span>{exchangeRateInfo.pair}</span>
                      &nbsp;
                      <button
                        className="exchange"
                        onClick={onClickReverseExchangeDirection}
                      >
                        <svg
                          width="24"
                          height="20"
                          viewBox="0 0 24 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                            fill="#3800D6"
                          />
                          <path
                            d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                            fill="#3800D6"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="exchRate">{formattedExchangeRate}</span>
                  </div>
                )}
                <div className="row">
                  <span>{t("priceImpact")}</span>
                  <span>{formattedPriceImpact}</span>
                </div>
                {formattedRoute && (
                  <>
                    <div className="row">
                      <span>{t("route")}</span>
                      <span>{formattedRoute}</span>
                    </div>
                    {isVirtualSwap && (
                      <div className="row">
                        <span></span>
                        <span>
                          <a href="https://docs.saddle.finance/">
                            ({t("virtualSwap")})
                          </a>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {account && isHighPriceImpact(exchangeRateInfo.priceImpact) ? (
          <div className="exchangeWarning">
            {t("highPriceImpact", {
              rate: formattedPriceImpact,
            })}
          </div>
        ) : null}
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="infoSection">
                <div className="priceTable">
                  <span className="title">{t("price")}</span>
                  <span className="pair">{exchangeRateInfo.pair}</span>
                  <button
                    className="exchange"
                    onClick={onClickReverseExchangeDirection}
                  >
                    <svg
                      width="24"
                      height="20"
                      viewBox="0 0 24 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                        fill="#3800D6"
                      />
                      <path
                        d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                        fill="#3800D6"
                      />
                    </svg>
                  </button>
                  <span className="value">{formattedExchangeRate}</span>
                </div>
                <div className="cost">{"..."}</div>
                <div
                  className="title"
                  onClick={(): PayloadAction<boolean> =>
                    dispatch(updateSwapAdvancedMode(!advanced))
                  }
                >
                  {t("advancedOptions")}
                  {/* When advanced = true, icon will be upside down */}
                  <svg
                    className={classNames({ upsideDown: advanced })}
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.8252 0C16.077 0 16.3783 0.827943 15.487 1.86207L8.80565 9.61494C8.35999 10.1321 7.63098 10.1246 7.19174 9.61494L0.510262 1.86207C-0.376016 0.833678 -0.0777447 0 1.17205 0L14.8252 0Z"
                      fill="#00f4d7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="advancedOptions">
                <div
                  className={"tableContainer " + classNames({ show: advanced })}
                >
                  <div className="table">
                    <div className="parameter">
                      <InfiniteApprovalField />
                    </div>
                    <div className="parameter">
                      <SlippageField />
                    </div>
                    <div className="parameter">
                      <DeadlineField />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Center width="100%" py={6}>
          <Button
            variant="primary"
            size="lg"
            width="240px"
            onClick={(): void => {
              setCurrentModal("review")
            }}
            disabled={!!error || +toState.value <= 0}
          >
            {t("swap")}
          </Button>
        </Center>
        <div className={"error " + classNames({ showError: !!error })}>
          {error}
        </div>
        <Footer />
        <Modal
          isOpen={!!currentModal}
          onClose={(): void => setCurrentModal(null)}
        >
          {currentModal === "review" ? (
            <ReviewSwap
              onClose={(): void => setCurrentModal(null)}
              onConfirm={async (): Promise<void> => {
                setCurrentModal("confirm")
                logEvent("swap", {
                  from: fromState.symbol,
                  to: toState.symbol,
                })
                await onConfirmTransaction?.()
                setCurrentModal(null)
              }}
              data={{
                from: fromState,
                to: toState,
                exchangeRateInfo,
              }}
            />
          ) : null}
          {currentModal === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}
export default SwapPage
