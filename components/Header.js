import React from 'react'

const Header = props => {

    const { mainTitle, subTitle } = props

  return (
    <header className="header">
      <h1 className="heading-primary">
        <span className="heading-primary--main">{mainTitle}</span>
        <span className="heading-primary--sub">{subTitle}</span>
      </h1>
    </header>
  )
}


export default Header
