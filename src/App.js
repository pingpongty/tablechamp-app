import React, { Component } from 'react';
import './App.css';
import firebaseData from "./firebase-key";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";


class App extends Component {
  state = {
    auth: true,
    username: "",
    firebaseData: null
  }
  componentDidMount(){
    this.initFirebase();
  }
  initFirebase(){
    firebase.initializeApp(firebaseData);
    firebase.auth().onAuthStateChanged((auth)=>{
      if(!auth){
        this.setState({
          auth: false
        })
      } else {
        this.setState({
          auth: true
        })
        const db = firebase.database();
        db.ref("/v2").on("value", (snap) => {
          console.log(snap.val());
          this.setState({
            firebaseData: snap.val()
          })
        })
      }
    })
  }
  tryLogin = (username, password) => {
    firebase.auth().signInWithEmailAndPassword(username, password).catch((e)=>{
      console.log(e);
    })
  }
  setUsername = () => {
    const db = firebase.database();
    db.ref("/v2/users").push({
      username: this.state.username
    });
    this.setState({
      username: ""
    });

  }
  updateUsername = (e) => {
    this.setState({
      username: e.target.value
    })
  }
  toggleAddScore = () => {
    this.setState({
      addScoreModal: !this.state.addScoreModal
    })
  }
  addGame = (game) => {
    const db = firebase.database();
    db.ref("/v2/games").push(game);
    this.toggleAddScore();
  }
  renderMain(){
    if(this.state.firebaseData){
      const results = extractScoresAndRankUsers(this.state.firebaseData);
      const top3 = results.slice(0,3);
      const rest = results.slice(3);
      return (
        
        <div style={{padding:20}}>
          <div style={{display:"flex"}}>
            <div style={{color:"white"}}>
              <div>Unicity</div>
              <div>Table Tennis</div>
           </div>
            <div style={{marginLeft:"auto"}}>
              <button className="add-score-button" onClick={this.toggleAddScore}>Add Score</button>
            </div>
          </div>
          <div>
          <div>
            {
              top3.map((user, index)=>{
                return (<Player player={user} rank={index+1} top3={true} key={user.username}/>)
              })
            }
          </div>
      <div style={{display:"grid", gridTemplateColumns: "repeat(3, 1fr)", gridColumnGap: 10}}>
        {
          rest.map((user, index)=>{
            return (
              <Player player={user} rank={index+4} key={user.username}/>
            )
          })
        }
      </div>
      </div>
      <Modal show={this.state.addScoreModal} offClick={this.toggleAddScore}>
        <div style={{backgroundColor:"white", width:"50vw", margin:"auto"}}>
          <AddGame data={this.state.firebaseData} onAdd={this.addGame} />
        </div>
      </Modal>
    </div>
      );
    } else {
      return null;
    }
  }
  render() {
    return (
      <div className="App" style={{height: "100vh", backgroundColor:"#1c2242"}}>
        {this.state.auth ? this.renderMain() : <Login onLogin={this.tryLogin} />}
      </div>
    );
  }
}

class Login extends Component {
  state = {
    username: "",
    password: ""
  }
  login = (e) => {
    e.preventDefault();

    this.props.onLogin(this.state.username, this.state.password)
  }
  updateUsername = (e) => {
    this.setState({
      username: e.target.value
    })
  }
  updatePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }
  render(){

    return (
      <div style={{display:"flex", flexDirection:"column", height:"100vh"}}>
        <h1>Unicity Table Tennis Login</h1>
        <small>The Grand Entrance</small>
        <div style={{width:500, margin:"auto", boxShadow:"1px 1px 1px #f4f4f4, -1px -1px 1px #f4f4f4", padding:20}}>
        <form className="form" onSubmit={this.login}>
          <div className="form-group">
            <label>Email</label>
            <input type="text" placeholder="Email" className="form-control" onChange={this.updateUsername} value={this.state.username}/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Password" className="form-control" onChange={this.updatePassword} value={this.state.password}/>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary btn-block" >Login</button>
          </div>
        </form>
      </div>
      </div>

    )
  }
}

class Player extends Component {
  state = {
    expandedView: false
  }

  render(){
    const {player} = this.props;
    let topStyles = {};
    if(this.props.top3){
      topStyles = {
        backgroundColor:"#283350",
        fontSize:30
      }
    } 
    return (
      <div className="player" style={{...topStyles}}>
          <div style={{marginRight:10}}>
            {this.props.rank}
          </div>
          <div>
            {player.username}
          </div>
          <div style={{marginLeft:"auto", marginRight:10}}>
            <div style={{fontSize:10}}>Score</div>
            <div>
              {player.score}
            </div>
          </div>
          <div>
            <div style={{fontSize:10}}>W-L</div>
            <div>
              {player.wins}-{player.losses}
            </div>

          </div>
      </div>
    )
  }
}

class Modal extends Component {
  close = (e) => {
    if(e.target === this.parent){
      this.props.offClick();
    }
  }
  setRef = (ref) => {
    this.parent = ref;
  }
  render(){
    if(this.props.show){
      return (
        <div ref={this.setRef} style={{backgroundColor:"rgba(0,0,0,.5)", position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"center"}} onClick={this.close}>
          {this.props.children}
        </div>
      )
    } else {
      return null;
    }
  }
}

class AddGame extends Component {
  state = {
    player1: "",
    player2: "",
    score1: 0,
    score2: 0
  }
  setPlayer = (side, id) => () => {
    if(side === 1){
      this.setState({
        player1: id
      })
    } else {
      this.setState({
        player2: id
      })
    }
  }
  setScore = (side, score) => () => {
    if(side === 1){
      this.setState({
        score1: score
      })
      if(score === 1 || score === 0){
        this.setState({
          score2: 2
        })
      }
    } else {
      this.setState({
        score2: score
      })
      if(score === 1 || score === 0){
        this.setState({
          score1: 2
        })
      }
    }
  }
  addTheGame = () => {
    let result = {};
    const {player1, player2, score1, score2} = this.state;
    const people = [player1, player2];
    const scores = [score1, score2];
    let winner;
    let loser;
    if(score1 > score2){
      winner = 0;
      loser = 1;
    } else {
      winner = 1;
      loser = 2;
    }
    result.winner = people[winner];
    result.score = [scores[winner], scores[loser]];
    result.season = this.props.data.season;
    result.date = Date.now();
    result.loser = people[loser];


    this.props.onAdd(result);
  }
  renderPlayers(side){
    const players = Object.entries(this.props.data.users).map(([id, user])=> {
      const {player1, player2} = this.state;
      let disabled = false;
      if(id === player1 || id === player2){
        disabled = true
      }
      return (
        <button onClick={this.setPlayer(side, id)} disabled={disabled} key={id}>{user.username}</button>
      )
    })

    return (
      <div>{players}</div>
    )
  }
  getPlayerName(side){
    if(side === 1){
      if(this.state.player1){
        return this.props.data.users[this.state.player1].username
      } else {
        return "Player 1";
      }
    } else {
      if(this.state.player2){
        return this.props.data.users[this.state.player2].username
      } else {
        return "Player 2";
      }
    }
  }
  renderPossibleScores(side){
    const all = [0, 1, 2];
    const {score1, score2} = this.state;
    const inside = all.map((num)=>{
      let disabled = false;
      if(score1 === 2 || score2 === 2){
        if(num === 2){
          disabled = true;
        }
      }

      return (<button disabled={disabled} onClick={this.setScore(side, num)} key={num}>{num}</button>)
    });

    return (
      <div>
        <div>Score</div>
        <div>
          {inside}
        </div>
        <div>
        </div>
      </div>
    )
  }
  renderScore(side){
    const styles ={
      textAlign:"center",
      fontSize:100,
      fontWeight:"bold"
    }
    const {score1, score2} = this.state;
    const scores = [score1, score2];
    return (
      <div style={styles}>
        {scores[side - 1]}
      </div>
    )
  }
  render(){
    const {score1, score2, player1, player2} = this.state;
    const nums = [1, 2]
    const enabledButton = score1 !== score2 && player1 && player2;
    const inside = nums.map((num)=>{
      return (
        <div key={num}>
          <div style={{fontSize:30, marginBottom:10}}>{this.getPlayerName(num)}</div>
          <div>
            {this.renderPlayers(num)}
          </div>
          <div>
            {this.renderPossibleScores(num)}
          </div>
          <div>
            {this.renderScore(num)}
          </div>
        </div>
      )
    })
    return (
      <div style={{padding:10}}>
      <div style={{display:"grid", gridTemplateColumns: "repeat(2, 1fr)", gridColumnGap:10}}>
        
        {inside}
      </div>
      <hr />
      <div>
        <button disabled={!enabledButton} className="btn btn-primary btn-lg" onClick={this.addTheGame}>Add Score</button>
      </div>
    </div>
    )
  }
}

function extractScoresAndRankUsers(firebaseData){
  const games = firebaseData.games || {};
  const season = firebaseData.season;
  const users = Object.entries(firebaseData.users).map(([id, user])=>{
    const result = {
      username: user.username,
      games: [],
      score: 0,
      wins: 0,
      losses: 0
    }
    Object.entries(games).forEach(([game_id,game])=>{
      if(game.season !== season) return;
      if(game.winner === id){
      console.log(id, game);
        result.games.push({
          result: "win",
          id:game_id,
          opponent: firebaseData.users[game.winner].username,
          score: game.score
        })
        result.wins++;
        result.score += 2;
        if(game.score[1] === 0){
          result.score++;
        }
      } else if(game.loser === id){
        result.games.push({
          result: "loss",
          id:game_id,
          opponent: firebaseData.users[game.winner].username,
          score: game.score
        })
        result.losses++;
        if(game.score[1]){
          result.score++;
        }
      }
    });

      return result;

  });

    return users.sort((a, b)=>{
      if(a.score > b.score){
        return -1;
      } else if(a.score < b.score){
        return 1;
      } else {
        return 0;
      }
    })
}

export default App;
