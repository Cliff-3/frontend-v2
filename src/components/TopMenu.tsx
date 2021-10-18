import "./TopMenu.scss"

import React, { ReactElement, useState } from "react"

import { AppState } from "../state"
import { Link } from "react-router-dom"
import ThemeChanger from "./ThemeChanger"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import logo from "../assets/icons/colour.png"
import logoDarkMode from "../assets/icons/colour.png"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
  const { t } = useTranslation()
  const { isDarkMode } = useSelector((state: AppState) => state.user)
  const [isMobileMenuHidden, setIsMobileMenuHidden] = useState(true)

  return (
    <div>
      <header className="top">
        <h1>
          <Link to="/">
            <img
              className="logo"
              alt="logo"
              src={isDarkMode ? logoDarkMode : logo}
            />
          </Link>
        </h1>

        <ul className="nav d-md-none">
          <li>
            <Link
              to="/"
              className={classNames({ active: activeTab === "swap" })}
            >
              {t("swap")}
            </Link>
          </li>
          <li>
            <Link
              to="/pools"
              className={classNames({ active: activeTab === "pools" })}
            >
              {t("Pools")}
            </Link>
          </li>
          <li>
            <Link
              to="/airdrop"
              className={classNames({ active: activeTab === "airdrop" })}
            >
              {t("Airdrop")}
            </Link>
          </li>
          {/* <li>
            <Link
              to="/risk"
              className={classNames({ active: activeTab === t("risk") })}
            >
              {t("risk")}
            </Link>
          </li> */}
        </ul>

        <Web3Status />
        <ThemeChanger />

        <div className="d-none d-md-block">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => {
              setIsMobileMenuHidden(!isMobileMenuHidden)
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              className="bi"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </button>
        </div>
      </header>
      <div
        className={classNames({
          "d-none": isMobileMenuHidden,
          "mobile-menu": true,
        })}
      >
        <ul>
          <li>
            <Link
              to="/"
              className={classNames({
                active: activeTab === "swap",
                "w-100": true,
                "d-block": true,
              })}
            >
              {t("swap")}
            </Link>
          </li>
          <li>
            <Link
              to="/pools"
              className={classNames({
                active: activeTab === "pools",
                "w-100": true,
                "d-block": true,
              })}
            >
              {t("Pools")}
            </Link>
          </li>
          <li>
            <Link
              to="/airdrop"
              className={classNames({
                active: activeTab === "airdrop",
                "w-100": true,
                "d-block": true,
              })}
            >
              {t("Airdrop")}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default TopMenu
