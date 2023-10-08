import React, { Component } from 'react';
import {Segment, Tab} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import LoginPage from './components/LoginPage';
import {kc} from "./components/UserManager";
import PendingUsers from "./components/PendingUsers";
import VerifyUsers from "./components/VerifyUsers";
import SearchUsers from "./components/SearchUsers";
import FindUser from "./components/FindUser";
import NewUsers from "./components/NewUsers";
import LoginUsers from "./components/LoginUsers";
import VhUsers from "./components/VhUsers";


class App extends Component {

  state = {
    user: null,
    auth_admin: false,
    auth_root: false,
    vh_admin: false
  };

  checkPermission = (user) => {
    const auth_admin = kc.hasRealmRole("auth_admin");
    const auth_root = kc.hasRealmRole("auth_root");
    const vh_admin = auth_root || kc.hasRealmRole("vh_admin");
    if(auth_root || auth_admin || vh_admin) {
      this.setState({user, auth_admin, vh_admin});
    } else {
      alert("Access denied!");
      kc.logout();
    }
  };

  render() {

    const {vh_admin, auth_admin,user} = this.state;

    let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

    const panes = [
      { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
        render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
      { menuItem: { key: 'vh', icon: 'credit card outline', content: 'VH', disabled: !vh_admin },
        render: () => <Tab.Pane attached={false} ><VhUsers user={user} /></Tab.Pane> },
      { menuItem: { key: 'login', icon: 'chain', content: 'Login', disabled: !auth_admin },
        render: () => <Tab.Pane attached={false} ><LoginUsers user={user} /></Tab.Pane> },
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
        <Segment basic padded>
          <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={wf_panes} />
        </Segment>
    );
  }
}

export default App;
