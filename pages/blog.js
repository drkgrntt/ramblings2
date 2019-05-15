import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import Link from 'next/link'
import _ from 'lodash'
import keys from '../config/keys'
import PostsFilter from '../components/PostsFilter'
import SectionStandard from '../components/SectionStandard'

class BlogPage extends Component {

  static async getInitialProps() {

    const rootUrl = keys.rootURL ? keys.rootURL : ''
    const blogs = await axios.get(`${rootUrl}/api/published_blogs`)

    return { blogs: blogs.data }
  }


  renderAllBlogsLink() {

    const { blogs } = this.props

    if (blogs.length > 5) {
      return (
        <Link href="/blog_all" as="/blog/all">
          <a className="blog-page__button button button-secondary u-margin-bottom-small">See all blog posts</a>
        </Link>
      )
    }
  }


  render() {

    return (
      <div className="blog-page">
        <PostsFilter
          component={SectionStandard}
          posts={this.props.blogs}
          settings={{
            maxPosts: 5
          }}
          componentProps={{
            contentLength: 200,
            mediaLeft: true,
            readMore: true,
            path: 'blog'
          }}
        />

        {this.renderAllBlogsLink()}
      </div>
    )
  }
}


const mapStateToProps = state => {
  return { blogs: state.blogs }
}


export default connect(mapStateToProps)(BlogPage)
