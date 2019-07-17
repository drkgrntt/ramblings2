/**
 * NavMenu displayed at the top of every view.
 * 
 * props include:
 *   logo: String - The source for the logo image displayed at the top right
 */

import React, { Component } from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'

class NavMenu extends Component {

  onClick() {

    const checkbox = document.getElementById('nav-menu-checkbox')

    checkbox.classList.toggle('checked')
  }


  renderAuthenticator() {

    if (!!this.props.currentUser) {
      return (
        <Link href="/profile">
          <li onClick={() => this.onClick()} className="nav-menu__item">
            <a>Profile</a>
          </li>
        </Link>
      )
    }

    return (
      <Link href="/login">
        <li onClick={() => this.onClick()} className="nav-menu__item">
          <a>Login</a>
        </li>
      </Link>
    )
  }


  render() {

    return (
      <nav>
        <ul className="nav-menu">

          <Link href="/blog">
            <div className="nav-menu__logo">
              <img src={this.props.logo} />
            </div>
          </Link>

          <div className="nav-menu__items">

            <label
              onClick={() => this.onClick()}
              id="nav-menu-checkbox"
              className="nav-menu__item nav-menu__item--hamburger"
            ></label>

            <Link href="/blog">
              <li onClick={() => this.onClick()} className="nav-menu__item">
                <a>Home</a>
              </li>
            </Link>

            <Link href="/about">
              <li onClick={() => this.onClick()} className="nav-menu__item">
                <a>About</a>
              </li>
            </Link>

            <Link href="/blog_all" as="/blog/all">
              <li onClick={() => this.onClick()} className="nav-menu__item">
                <a>All Blog Posts</a>
              </li>
            </Link>

            {this.renderAuthenticator()}

          </div>

        </ul>
      </nav>
    )
  }
}


const mapStateToProps = state => {
  return { settings: state.settings, currentUser: state.currentUser }
}


export default connect(mapStateToProps)(NavMenu)