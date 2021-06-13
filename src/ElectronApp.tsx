import * as React from 'react'
import styled from 'styled-components';
//import css from '../App.css';
import {setPassword, findCredentials} from 'keytar';


const InputBoxStyle = styled.input`
  font-size: calc(10px + 2vmin);
  border: 1px solid transparent;
  background-color: #f1f1f1;
  padding: 10px;
  
`;

const InputButtonStyle = styled.button`
   background-color:grey;
   font-size: calc(10px + 2vmin);
   `;

const DivLine = styled.div`
  height: 50px;
  border-bottom: 2px solid white;
  `;   


interface propsStruct {
  
}

interface listOfUsers {
   "account":string,
    "password": string
}

interface stateStruct {
  value:string;
  predictions:listOfUsers[];
  service:string;
  username:string;
  password:string;
  currentService:string;
}

const INPUT_TIMEOUT = 250; //ms - It's our input delay

class ElectronApp extends React.Component<propsStruct, stateStruct> {
    
  //public listOfUsers:string[] = [];
  public listOFUsersAndPasswords:listOfUsers[] = []; 

  constructor(props:propsStruct) {
      super(props);
      this.state = {
        value: '',
        predictions: [],
        service:'LightningApp',
        username:'',
        password:'',
        currentService:'LightningApp',
      };
      
      



      this.onChange = this.onChange.bind(this);
      const arrayOfServiceUsersDatails = findCredentials(this.state.currentService);
      console.log(arrayOfServiceUsersDatails);
      arrayOfServiceUsersDatails.then((result) => this.setListOfUserNames(result), ()=> console.log("No users found"));

    }
  
    timeout:any;
  
     
    onChange = (e: React.FormEvent<HTMLInputElement>) => {
      // clear timeout when input changes value
      clearTimeout(this.timeout);
      
      const value = (e.target as HTMLInputElement).value;
      
      let predictions:listOfUsers[] = [];
      
      console.log("The length of username string is ", value.length);

      if (value.length>0) {
        
        const regex = new RegExp(`^${value}`,'i');
        predictions = this.listOFUsersAndPasswords.sort().filter(v => regex.test(v.account));
      }

      console.log("After on change value = ", value, " and predictions = ", predictions , " and list of users = ", this.listOFUsersAndPasswords);
      this.setState({
        value, predictions
      });
      console.log("After state has been set value = ", this.state.value, " and predictions = ", this.state.predictions);
    }
  
    onServiceChange = (e: React.FormEvent<HTMLInputElement>) => {
      const service = (e.target as HTMLInputElement).value;
      this.setState({
        service
      });
    }
  
    onPasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
      const password = (e.target as HTMLInputElement).value;
      this.setState({
        password
      });
    }
  
    onUsernameChange = (e: React.FormEvent<HTMLInputElement>) => {
      const username = (e.target as HTMLInputElement).value;
      this.setState({
        username
      });
    }
  
    onCurrentServicesChange = (e: React.FormEvent<HTMLInputElement>) => {
      const currentService = (e.target as HTMLInputElement).value;
      this.setState({
        currentService
      });
      console.log("The current service is ", currentService);
      const arrayOfServiceUsersDatails = findCredentials(currentService);
      arrayOfServiceUsersDatails.then((result) => this.setListOfUserNames(result), ()=> console.log("No users found"));
  };

    setListOfUserNames(result:listOfUsers[]):void {
      
      this.listOFUsersAndPasswords = result;
      console.log("The list of users returned .... ", this.listOFUsersAndPasswords);
      
    }
  
    onButtonClick = (e:React.FormEvent<HTMLButtonElement>) => {
      console.log("Service = ", this.state.service,". Username = ", this.state.value,". Password = ", this.state.password,".");
      const result:Promise<void> =setPassword(this.state.service, this.state.value, this.state.password); 
      result.then(()=>{console.log("Success")}, ()=>{console.log("Failed")});
      const remote = require('electron').remote;
      let w = remote.getCurrentWindow();
      w.close();
    }
  
    predictionSelected(item:listOfUsers) {
      this.setState( {
        value:item.account,
        password: item.password,
        predictions:[]
      })
    }
    

    render() {
      return (
        <div className="App">
          <header className="App-header">
            <h1>KEY-TAR TEST</h1>
             
            <p> Enter Account Name  
              <div className="App-Component">  
                <div className="AutoCompleteText">
                    <InputBoxStyle value={this.state.value} onChange = {this.onChange} />
                      <ul>
                        {this.state.predictions.map((item) => <li onClick={() => this.predictionSelected(item)}>{item.account}</li>) }
                      </ul>  
                </div>
              </div>
            </p>
            <p>Enter Sercret Password <InputBoxStyle value={this.state.password} onChange = {this.onPasswordChange}></InputBoxStyle></p>
            <p><InputButtonStyle onClick = {this.onButtonClick} >Login</InputButtonStyle></p>  
          </header>
        </div> 
        
    );
    }
  
    
  
  
  
  }
  export default ElectronApp;
  