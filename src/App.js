import React, { Component } from 'react';
import {Container, Tab} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import LoginPage from './components/LoginPage';
import {kc} from "./components/UserManager";
import PendingUsers from "./components/PendingUsers";
import VerifyUsers from "./components/VerifyUsers";
import SearchUsers from "./components/SearchUsers";
import FindUser from "./components/FindUser";
import NewUsers from "./components/NewUsers";


class App extends Component {

  state = {
    user: null,
    auth_admin: false,
    auth_root: false,
  };

  checkPermission = (user) => {
    const auth_admin = kc.hasRealmRole("auth_admin");
    const auth_root = kc.hasRealmRole("auth_root");
    if(auth_root || auth_admin) {
      this.setState({user, auth_admin, auth_root});
    } else {
      alert("Access denied!");
      kc.logout();
    }
  };

  render() {

    const {auth_admin,user} = this.state;

    let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

    const panes = [
      { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
        render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
      { menuItem: { key: 'find', icon: 'find', content: 'Find', disabled: !auth_admin },
        render: () => <Tab.Pane attached={false} ><FindUser user={user} /></Tab.Pane> },
      { menuItem: { key: 'users', icon: 'search', content: 'Search', disabled: !auth_admin },
        render: () => <Tab.Pane attached={false} ><SearchUsers user={user} /></Tab.Pane> },
      { menuItem: { key: 'new', icon: 'user plus', content: 'New', disabled: !auth_admin },
        render: () => <Tab.Pane attached={false} ><NewUsers user={user} /></Tab.Pane> },
      { menuItem: { key: 'pending', icon: 'tasks', content: 'Pending', disabled: !auth_admin },
        render: () => <Tab.Pane attached={false} ><PendingUsers user={user} /></Tab.Pane> },
      { menuItem: { key: 'verify', icon: 'users', content: 'Guests', disabled: !auth_admin },
        render: () => <Tab.Pane attached={false} ><VerifyUsers user={user} /></Tab.Pane> },
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