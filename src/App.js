import React, { Component } from 'react';
import {Container, Tab} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import LoginPage from './components/LoginPage';
import {client} from "./components/UserManager";
import AuthManager from "./components/AuthManager";


class App extends Component {

  state = {
    user: null,
    gxy_root: false,
  };

  checkPermission = (user) => {
    let gxy_root = !!user.roles.find(role => role === 'gxy_root');
    if(gxy_root) {
      this.setState({user, gxy_root});
    } else {
      alert("Access denied!");
      client.signoutRedirect();
    }
  };

  render() {

    const {gxy_root,user} = this.state;

    let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

    const panes = [
      { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
        render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
      { menuItem: { key: 'pending', icon: 'tasks', content: 'Pending', disabled: !gxy_root },
        render: () => <Tab.Pane attached={false} ><AuthManager user={user} /></Tab.Pane> },
    ];

    const wf_panes = panes.filter(p => !p.menuItem.disabled);

    return (
        <Container >
          <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={wf_panes} />
        </Container>
    );
  }
}

export default App;