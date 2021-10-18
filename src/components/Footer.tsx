import "./Footer.scss"

import React, { ReactElement } from "react"
import { AppState } from "../state"
import { SOCIALS } from "../constants/socialLinks"
import { useSelector } from "react-redux"

function Footer(): ReactElement {
  const { isDarkMode } = useSelector((state: AppState) => state.user)

  return (
    <div className="container footer text-center">
      <div className="row">
        <div className="col">
          <div>© 2021 by Gondola Finance</div>
          <div>
            <ul>
              {SOCIALS.map((social) => (
                <li key={social.url}>
                  <a href={social.url} target="blank">
                    <img
                      className="logo"
                      alt="logo"
                      src={isDarkMode ? social.iconDark : social.icon}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
