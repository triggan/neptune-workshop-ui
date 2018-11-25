import React, { Component } from 'react';
import logo from './gremlin-neptune.png';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ReactJson from 'react-json-view';
import './App.css';


/*
function async_get(url, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          console.log('responseText:' + xmlhttp.responseText);
          try {
              var data = JSON.parse(xmlhttp.responseText);
          } catch(err) {
              console.log(err.message + " in " + xmlhttp.responseText);
              return;
          }
          callback(data);
      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
} //end function async_get

var currentS3path = window.location.hostname
console.log(currentS3path)
var url = "https://" + currentS3path + "/api.json"
//var url = "https://s3.eu-central-1.amazonaws.com/neptunewsdtr/api.json"
console.log(url)

var apiResponse = ""
async_get(url, function(response) {
  apiResponse = JSON.parse(response.responseText);
});

console.log(apiResponse);
*/

var currentS3path = window.location.hostname;
console.log(currentS3path);
var url = "http://" + currentS3path + "/api.json";

var apigateway = "";

fetch(url)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) {
        apigateway = data.APIPATH;
        console.log(data);
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });


class App extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      name: "",
      graphoutput: "{}",
      traversal: "",
      showOutput: false
     };
    
    this.getGraphOutput = this.getGraphOutput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } //end constructor

  getGraphOutput(actorName) {
    var request = new XMLHttpRequest();
    var self = this;
    console.log("Inside React: " + apigateway)
    var requestURL = apigateway + "/actor/?actor=" + actorName
  
    request.open('GET', requestURL , true);
    request.onload = function () {
  
      // Begin accessing JSON data here
      var data = JSON.parse(this.response);
  
      if (request.status >= 200 && request.status < 400) {
        self.setState({
          graphoutput: data,
          showOutput: true
        });
      } else {
        return "ERROR";
      }
    }
  
    request.send();
  } //getGraphOutput

  handleSubmit(event) {
    var newTraversal = "g.V().has('name','" + event.target.movieInput.value + "').repeat(out().in().simplePath())" +
      ".until(has('name','Kevin Bacon')).path().by('name').by('title').limit(10)"
    this.getGraphOutput( event.target.movieInput.value );
    this.setState({
      name: event.target.movieInput.value,
      traversal: newTraversal
    })
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
            DAT310 - Building Your First Graph Application Using Amazon Neptune
          </p>
        </header>
        <br/>
        <form onSubmit={this.handleSubmit}>
          <TextField
            id="movieInput"
            label="Find the Six Degrees of Kevin Bacon:"
            style={{ margin: 8, width: 600 }}
            placeholder="<Insert Actor/Actress Name Here>"
            helperText="Ex: Jack Nicholson"
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
              <span id="graph-traversal">{this.state.traversal}</span>
            </p>
        </Paper>
        <br/>
        <Paper className="graph-output">
            <h3 align="left">Graph Traversal Output:</h3>
            <div align="left">
              { this.state.showOutput ? <ReactJson src={this.state.graphoutput} /> : null }
            </div>
        </Paper>
        <br/>
      </div>
    );
  }
}

export default App;
