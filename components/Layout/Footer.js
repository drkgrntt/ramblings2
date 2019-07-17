/**
 * Footer for every view except those listed in excludeFooterRoutes
 * 
 * props include:
 *   ctaText: String - Heading text over the CTA button
 *   ctaButtonText: String - Text inside the CTA button
 */

import React from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'

const excludeFooterRoutes = [
  '/admin',
  '/posts_create',
  '/posts_all',
  '/blog_create'
]

const Footer = props => {

  // Only include the footer if the current route is not in the array
  if (!excludeFooterRoutes.includes(props.route)) {
    return (
      <footer className='footer'>

        {/* Credit section */}
        <div className="credit">
          <p className="credit__text">
            Website created by
            <a className="credit__link" href="https://derekgarnett.com"> Derek Garnett </a>
          </p>
        </div>

      </footer>
    )
  } else {
    return null
  }
}


const mapStateToProps = state => {
  return { route: state.route }
}


export default connect(mapStateToProps)(Footer)
