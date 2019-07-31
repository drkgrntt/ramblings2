import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { setCurrentUser } from '../store'

class Subscribe extends Component {

  unsubscribe() {

    const confirm = window.confirm('Are you sure you want to unsubscribe?')

    if (confirm) {
      axios.post('/api/unsubscribe')
        .then(res => {
          this.props.setCurrentUser(res.data)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }


  subscribe() {

    axios.post('/api/subscribe')
      .then(res => {
        this.props.setCurrentUser(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }


  renderUnsubscribe() {

    return (
      <Fragment>
        <p>You are subscribed!</p>
        <button
          className="button button-secondary"
          onClick={() => this.unsubscribe()}
        >
          Unsubscribe
        </button>
      </Fragment>
    )
  }


  renderSubscribe() {

    return (
      <Fragment>
        <p>You are not subscribed! Would you like to recieve emails whenever I post?</p>
        <button
          className="button button-primary"
          onClick={() => this.subscribe()}
        >
          Subscribe
        </button>
      </Fragment>
    )
  }


  render() {

    return (
      <div className="subscribe">
        {this.props.currentUser.isSubscribed ? this.renderUnsubscribe() : this.renderSubscribe()}
      </div>
    )
  }
}


const mapStateToProps = state => {
  return { currentUser: state.currentUser }
}


export default connect(mapStateToProps, { setCurrentUser })(Subscribe)