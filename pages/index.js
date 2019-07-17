import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import BlogPage from './blog'

class Landing extends Component {

  static async getInitialProps(context) {

    let posts = []

    if (!!context.res) {
      posts = context.query.posts
    } else {
      const response = await axios.get(`/api/published_posts`)
      posts = response.data
    }

    return { posts }
  }


  render() {

    return (
      <div className="landing">
        <BlogPage />
      </div>
    )
  }
}


const mapStateToProps = state => {
  return { posts: state.posts, settings: state.settings }
}


export default connect(mapStateToProps)(Landing)