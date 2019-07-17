/**
 * SectionCards will display a section of card-like components
 * 
 * props include:
 *   title: String - The title to display above the cards
 *   perRow: Integer - How many cards will fit on one row at full width - must be 3 or 4
 *   readMore: Boolean - If true, a link to the full post will render at the bottom of each card
 *   path: String - The path to use for the read more link before the post id ('/{path}/a1s2d3f4g5h6j7')
 *   contentLength: String - How many characters to show in the card content
 *   emptyMessage: String - Message to display if there are no posts
 *   infoProps: Object {
 *     before: String - Text to display before the property
 *     property: String - The property of the post to render
 *     after: String - Text to display after the property
 *   }
 *   posts: Array [Object - The post to be rendered as a card]
 */

 
import React, { Component } from 'react'
import _ from 'lodash'
import renderHTML from 'react-render-html'
import Link from 'next/link'
import Media from '../Media'

class SectionCards extends Component {

  constructor(props) {

    super(props)

    this.state = { searchText: '', posts: props.posts }
  }


  renderReadMore(post) {

    if (this.props.readMore) {
      const path = this.props.path ? this.props.path : 'posts'

      return (
        <Link href={`/${path}_show?id=${post._id}`} as={`/${path}/${post._id}`}>
          <a className="section-cards__link">Read More</a>
        </Link>
      )
    }
  }


  renderInfoProps(post) {

    return _.map(this.props.infoProps, prop => {
      return (
        <div key={`${post._id}-${prop.property}`} className="section-cards__info">
          <span className="section-cards__info--before">{prop.before}</span>
          <span className="section-cards__info--prop">{post[prop.property]}</span>
          <span className="section-cards__info--after">{prop.after}</span>
        </div>
      )
    })
  }


  renderPosts() {

    const { contentLength, emptyMessage, path } = this.props
    const { posts } = this.state

    if (posts.length !== 0) {

      // Set defaults for characterCount
      const characterCount = contentLength || 300

      return _.map(posts, post => {
        let postContent = post.content.length >= characterCount ? `${post.content.substring(0, characterCount).trim()} . . .` : post.content

        return (
          <li key={post._id} className="section-cards__card">
            <h3 className="section-cards__title">{post.title}</h3>
            <Link href={`/${path}_show?id=${post._id}`} as={`/${path}/${post._id}`}>
              <a className="section-cards__image--link"><Media className="section-cards__image" src={post.mainMedia} alt={post.title} /></a>
            </Link>
            {this.renderInfoProps(post)}
            <div className="section-cards__content">{renderHTML(postContent)}</div>
            {this.renderReadMore(post)}
          </li>
        )
      })
    } else {
      return <h3 className="heading-tertiary">{emptyMessage ? emptyMessage : ''}</h3>
    }
  }


  onSearchTextChange(event) {

    this.setState({ searchText: event.target.value })

    let foundPosts = []

    // Go through each post
    _.map(this.props.posts, post => {

      let isFound = false

      // If we are searching for the title and we haven't already included the post, include it
      if (post.title.toLowerCase().includes(event.target.value.toLowerCase()) && !isFound) {
        foundPosts.push(post)
      }
    })

    this.setState({ posts: foundPosts })
  }


  render() {

    const { perRow, title } = this.props
    const listCountClass = perRow ? `section-cards__list--${perRow}` : 'section-cards__list--3'

    return (
      <section className='section-cards'>
        <div className="section-cards__top">
          <h2 className='heading-secondary--light section-cards__header'>{title}</h2>
          <input
            className="section-cards__search--input"
            type="text"
            placeholder="Search by Title"
            id="posts-search"
            name="search"
            value={this.state.searchText}
            onChange={event => this.onSearchTextChange(event)}
          />
        </div>
        <ul className={`section-cards__list ${listCountClass}`}>
          {this.renderPosts()}
        </ul>
      </section>
    )
  }
}


export default SectionCards
