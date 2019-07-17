/**
 * Layout wrapping all views
 * 
 * props include:
 *   children: Component - The page rendered
 */

import React from 'react'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import NavMenu from './NavMenu'

export default props => (
  <div className="app">

    <Head>
      <title>Ramblings | A Blog</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://fonts.googleapis.com/css?family=Indie+Flower" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:600" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700|Montserrat:200,300,400,500,600,700" rel="stylesheet" />
      <script src="https://js.stripe.com/v3/"></script>
    </Head>

    <NavMenu
      logo='https://cardinia.pozi.com/img/font-awesome/black/paint-brush.svg'
    />

    <Header
      mainTitle="Ramblings"
    />

    <main>
      {props.children}
    </main>

    <Footer />

  </div>
)
