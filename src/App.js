import React, { Component } from 'react';
import logo from './gremlin-neptune.png';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ReactJson from 'react-json-view';
import './App.css';

var apigateway = "";

function setGraphTraversal(movieName) {
  return "g.V().hasLabel('movie').has('name','" + movieName + "').limit(5)";
} //setGraphTraversal

function getGraphOutput(traversal) {
  var request = new XMLHttpRequest();

  request.open('GET', apigateway , true);
  request.onload = function () {

    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      // DO something with response
    } else {
      return "ERROR";
    }
  }

  request.send();
} //getGraphOutput

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      name: "",
      graphoutput: "",
      traversal: "",
      showOutput: false
     };

    this.handleSubmit = this.handleSubmit.bind(this);
  } //end constructor

  handleSubmit(event) {
    var graphTrav = setGraphTraversal(event.target.movieInput.value);
    var graphResults = getGraphOutput( graphTrav );
    this.setState( { 
      traversal: graphTrav,
      graphoutput: graphResults
    } );
    console.log(event.target.movieInput.value)
    event.preventDefault();
  } //end handleSubmit

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Welcome to AWS re:Invent 2018 Workshop: <br/>
            DAT310 - Building a New Graph Application Using Amazon Neptune.
          </p>
        </header>
        <br/>
        <form onSubmit={this.handleSubmit}>
          <TextField
            id="movieInput"
            label="Enter Name of a Movie:"
            style={{ margin: 8, width: 600 }}
            placeholder="<Insert Movie Title Here>"
            helperText="Ex: Casablanca"
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          /><br/>
          <Button variant="contained" size="medium" color="primary" type="submit">
            Go!
          </Button>
        </form><br/><br/>
        <Paper className="graph-output">
            <h3 align="left">Graph Traversal:</h3>
            <p align="left">
              {this.state.traversal}
            </p>
        </Paper>
        <br/>
        <Paper className="graph-output">
            <h3 align="left">Graph Traversal Output:</h3>
            <div align="left">
              { this.state.showOutput ? <ReactJson src={this.state.graphoutput}/> : null }
            </div>
        </Paper>
      </div>
    );
  }
}

export default App;
