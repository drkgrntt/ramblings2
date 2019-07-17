/**
 * Header displayed in every view
 * 
 * props include:
 *   mainTitle: String - Text displayed in big letters
 *   subTitle: String - Smaller text displayed under the main Title
 */

import React, { Component } from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'

class Header extends Component {

  renderAuthenticator() {

    if (!!this.props.currentUser) {
      return (
        <Link href="/profile">
          <a className="header__menu-item header__menu-item--4"><li>Profile</li></a>
        </Link>
      )
    }

    return (
      <Link href="/login">
        <a className="header__menu-item header__menu-item--2"><li>Login</li></a>
      </Link>
    )
  }


  renderNav() {

    const { settings, currentUser } = this.props

    if ((settings && settings.enableMenu) || (currentUser && currentUser.isAdmin)) {
      return (
        <ul className="header__menu">
          {this.renderAuthenticator()}
        </ul>
      )
    }
  }


  render() {

    const { mainTitle, subTitle } = this.props

    return (
      <header className="header">
        <h1 className="heading-primary">
          <span className="heading-primary--main">{mainTitle}</span>
          <span className="heading-primary--sub">{subTitle}</span>
        </h1>
        {/*this.renderNav()*/}
      </header>
    )
  }
}


const mapStateToProps = state => {
  return { currentUser: state.currentUser, settings: state.settings }
}


export default connect(mapStateToProps)(Header)
