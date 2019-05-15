import React, { Component } from 'react'
import axios from 'axios'
import _ from 'lodash'
import Link from 'next/link'
import moment from 'moment'
import Router from 'next/router'
import renderHTML from 'react-render-html'
import CommentForm from '../components/CommentForm'
import Media from '../components/Media'

class PostShow extends Component {

  constructor(props) {

    super(props)

    this.state = {
      commentFormContent: '',
      comments: props.post.comments,
      editingComment: null,
      detached: false
    }
  }


  onDeleteClick() {

    const confirm = window.confirm('Are you sure you want to delete this post?')

    if (confirm) {
      axios.delete(`/api/posts/${this.props.post._id}`)
        .then(res => {
          Router.push('/posts')
        }).catch(error => {
          console.error(error)
        })
    }
  }


  handleSubmit(event) {

    event.preventDefault()

    const { post } = this.props
    const { commentFormContent, comments, editingComment } = this.state
    const commentObject = { content: commentFormContent }

    if (!editingComment) {
      axios.post(`/api/posts/${post._id}/comments`, commentObject)
        .then(res => {
          this.setState({ comments: [...comments, res.data], commentFormContent: '' })
        }).catch(err => {
          console.error(err)
        })
    } else {
      axios.put(`/api/posts/${post._id}/comments/${editingComment}`, commentObject)
        .then(res => {
          _.map(comments, (sComment, i) => {
            if (sComment._id === editingComment) {
              let newCommentState = [...comments]
              newCommentState[i].content = commentFormContent

              this.setState({ comments: newCommentState, commentFormContent: '', editingComment: null })
            }
          })
        }).catch(err => {
          console.error(err)
        })
    }
  }


  renderAuthentication() {

    const { post, currentUser, path } = this.props

    if (!!currentUser && (currentUser.isAdmin)) {
      return (
        <div className="post__buttons">
          <button className="button button-tertiary" onClick={() => this.onDeleteClick()}>Delete</button>
          <Link href={`/${path}_edit?id=${post._id}`} as={`/${path}/${post._id}/edit`}>
            <button className="button button-secondary">Edit</button>
          </Link>
        </div>
      )
    }
  }


  renderTags(tags) {

    return _.map(tags, (tag, i) => {
      if (i < tags.length - 1) {
        return <span key={tag}>{tag}, </span>
      } else {
        return <span key={tag}>{tag}</span>
      }
    })
  }


  renderTagsSection(tags) {

    const { currentUser } = this.props

    if (!!tags[0] && !!currentUser && currentUser.isAdmin) {
      return <p className="post__tags">Tags: <em>{this.renderTags(tags)}</em></p>
    }
  }


  renderMainMedia(media) {

    if (!!media) {
      return <div className="post__image"><Media src={media} /></div>
    }
  }


  onCommentDeleteClick(post, comment) {

    const confirm = window.confirm('Are you sure you want to delete this comment?')

    if (confirm) {
      axios.delete(`/api/${apiPath || path}/${post._id}/comments/${comment._id}`)
        .then(res => {
          _.map(this.state.comments, (sComment, i) => {
            if (sComment._id === res.data) {
              let newCommentState = [...this.state.comments]
              newCommentState.splice(i, 1)

              this.setState({ comments: newCommentState })
            }
          })
        }).catch(err => {
          console.error(err)
        })
    }
  }


  renderCommentAuth(comment) {

    const { currentUser, post } = this.props

    if (!!currentUser && (
      currentUser._id === comment.author._id ||
      currentUser.isAdmin
    )) {
      return (
        <div className="comment__buttons">
          <button className="button button-tertiary button-small" onClick={() => this.onCommentDeleteClick(post, comment)}>Delete</button>
          <button className="button button-secondary button-small" onClick={() => {
            this.setState({ editingComment: comment._id, commentFormContent: comment.content })
          }}>Edit</button>
        </div>
      )
    }
  }


  renderComments(comments) {

    if (!!comments[0]) {
      return _.map(comments, comment => {
        const { content, author, _id } = comment

        return (
          <div className="comment" key={_id}>
            <p className="comment__content">{renderHTML(content)}</p>
            <p className="comment__author">&mdash; {author.firstName ? author.firstName : author.email}</p>
            {this.renderCommentAuth(comment)}
          </div>
        )
      })
    } else {
      return <p className="comments__none">Leave a comment.</p>
    }
  }


  renderEditCommentState() {

    if (!!this.state.editingComment) {
      return (
        <div className="comment__editing">
          <span className="comment__editing--state">Editing</span>
          <button
            className="button button-small button-tertiary"
            onClick={() => this.setState({ editingComment: null, commentFormContent: '' })}
          >
            Stop Editing
          </button>
        </div>
      )
    }
  }


  renderCommentForm() {

    const { detached, commentFormContent } = this.state

    if (!!this.props.currentUser) {
      return (
        <div className="comment__form">
          {this.renderEditCommentState()}
          <CommentForm
            detached={detached}
            onDetachClick={() => this.setState({ detached: !detached })}
            content={commentFormContent}
            onChange={newContent => this.setState({ commentFormContent: newContent })}
            onSubmit={event => this.handleSubmit(event)}
          />
        </div>
      )
    } else {
      return (
        <p className="comment-form__login">
          <Link href="/login">Login</Link> to comment.
        </p>
      )
    }
  }


  renderCommentsSection() {

    const { settings, enableCommenting } = this.props

    if (settings.enableCommenting && enableCommenting) {
      return (
        <div>
          <div className="comments">
            <h3 className="heading-tertiary comments__title">Comments</h3>
            {this.renderComments(this.state.comments)}
          </div>
          {this.renderCommentForm()}
        </div>
      )
    }
  }


  render() {

    const { title, tags, mainMedia, content, created } = this.props.post
    const commentClass = this.state.detached ? 'u-padding-bottom-comment-box' : ''

    return (
      <div className={`posts-show-page ${commentClass}`}>
        <div className="post">
          <h2 className="heading-secondary post__title u-margin-bottom-small">{title || "(No title)"}</h2>
          <span>{moment(created).format('MMMM Do, YYYY')}</span>
          {this.renderTagsSection(tags)}
          {this.renderMainMedia(mainMedia)}
          <div className="post__content">{renderHTML(content)}</div>
          {this.renderAuthentication()}
        </div>

        {this.renderCommentsSection()}
      </div>
    )
  }
}

export default PostShow
